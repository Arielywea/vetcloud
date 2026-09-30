#!/usr/bin/env node
// Read-only drift check. Catches the two classes of bug that broke production:
//   1. server.js writes columns/tables that don't exist in the database
//      (e.g. pets.vital_signs before migration 016)
//   2. API route prefixes with no rewrite in vercel.json (e.g. /stats/*),
//      which Vercel answers with index.html instead of JSON
// Usage: node scripts/check-schema.js   (exit 1 if drift is found)
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

try { require('dotenv').config({ quiet: true }); } catch (e) {}

const root = path.join(__dirname, '..');
// SQL lives in server.js and the assistant; CHECK_SCHEMA_FILES overrides the list (used for testing)
const SQL_FILES = (process.env.CHECK_SCHEMA_FILES || 'server.js,utils/assistantEngine.js').split(',');
const server = SQL_FILES.map((f) => fs.readFileSync(path.resolve(root, f.trim()), 'utf8')).join('\n');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

const splitCols = (s) => s.split(',').map((c) => c.trim().replace(/["']/g, '')).filter(Boolean);
const expected = {}; // table -> Set(columns)
const add = (table, cols, source) => {
  expected[table] = expected[table] || new Map();
  for (const c of cols) if (/^[a-z_][a-z0-9_]*$/i.test(c)) expected[table].set(c, source);
};

// INSERT INTO table (a, b, c) — static column lists
for (const m of server.matchAll(/INSERT INTO (\w+)\s*\(([^)]*)\)/g)) {
  if (!m[2].includes('$')) add(m[1], splitCols(m[2]), 'INSERT');
}
// UPDATE table SET col = ... — literal assignments
for (const m of server.matchAll(/UPDATE (\w+) SET ([^`'$]*?)(?:WHERE|RETURNING|\$)/g)) {
  for (const a of m[2].matchAll(/(\w+)\s*=/g)) add(m[1], [a[1]], 'UPDATE');
}
// Whitelists that feed dynamic UPDATE/INSERT: `const allowed = [...]` followed by UPDATE <table>
for (const m of server.matchAll(/const allowed = \[([^\]]+)\][\s\S]*?UPDATE (\w+) SET/g)) {
  add(m[2], splitCols(m[1]), 'allowed[]');
}
// Request keys that server.js maps to a differently named column (aliasMap)
const ALIASES = { diseases: ['references'] };
for (const [table, keys] of Object.entries(ALIASES)) keys.forEach((k) => expected[table] && expected[table].delete(k));

const petCols = server.match(/const PET_COLUMNS = \[([^\]]+)\]/);
if (petCols) add('pets', splitCols(petCols[1]), 'PET_COLUMNS');

// Reads: inside each SQL string, resolve "FROM/JOIN table alias" and check
// "alias.column" references plus bare columns in single-table SELECT lists.
const SQL_WORDS = new Set(['as', 'on', 'where', 'left', 'right', 'inner', 'join', 'group', 'order', 'limit', 'set', 'and', 'or', 'using', 'returning', 'full', 'cross', 'lateral']);
for (const lit of server.matchAll(/(['`])((?:SELECT|WITH)\b[\s\S]*?)\1/g)) {
  const sql = lit[2].replace(/\$\{[^}]*\}/g, ' ');
  if (/\bWITH\b/i.test(sql)) continue; // CTE aliases would need real parsing
  const aliases = {};
  for (const m of sql.matchAll(/\b(?:FROM|JOIN)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi)) {
    const table = m[1];
    const alias = m[2] && !SQL_WORDS.has(m[2].toLowerCase()) ? m[2] : table;
    aliases[alias] = table;
  }
  for (const m of sql.matchAll(/\b(\w+)\.(\w+)\b/g)) {
    const table = aliases[m[1]];
    if (table && m[2] !== '*') add(table, [m[2]], 'SELECT');
  }
  const single = sql.match(/^SELECT\s+(?:DISTINCT\s+)?([\s\S]+?)\s+FROM\s+(\w+)(\s|$)/i);
  if (single && Object.keys(aliases).length === 1) {
    for (const part of single[1].split(',')) {
      const col = part.trim().split(/\s+/)[0];
      if (/^[a-z_][a-z0-9_]*$/i.test(col) && !/^(count|sum|coalesce|max|min|avg|distinct|case|to_char|extract|now)$/i.test(col)) add(single[2], [col], 'SELECT');
    }
  }
}

// Route prefixes vs vercel.json rewrites
const prefixes = new Set();
for (const m of server.matchAll(/app\.(?:get|post|patch|put|delete)\(\s*'\/([a-z0-9_-]+)/gi)) prefixes.add('/' + m[1]);
const sources = (vercel.rewrites || []).filter((r) => r.destination === '/api').map((r) => r.source);
const unrouted = [...prefixes].filter((p) => !sources.some((s) => s === p || s.startsWith(p + '/') || s.startsWith(p + '(')));

(async () => {
  let problems = 0;
  if (unrouted.length) {
    problems += unrouted.length;
    console.log('✗ Rutas de la API sin rewrite en vercel.json (Vercel devolverá index.html):');
    unrouted.forEach((p) => console.log('   ' + p + '/*'));
  } else {
    console.log('✓ Todas las rutas de la API tienen rewrite en vercel.json');
  }

  if (!process.env.DATABASE_URL) {
    console.log('… DATABASE_URL no definido: se omite la comparación con la base de datos');
    process.exit(problems ? 1 : 0);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const { rows } = await pool.query(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'"
    );
    const actual = {};
    for (const r of rows) (actual[r.table_name] = actual[r.table_name] || new Set()).add(r.column_name);

    for (const [table, cols] of Object.entries(expected)) {
      if (!actual[table]) {
        problems++;
        console.log(`✗ La tabla "${table}" no existe en la base de datos`);
        continue;
      }
      const missing = [...cols].filter(([c]) => !actual[table].has(c));
      if (missing.length) {
        problems += missing.length;
        console.log(`✗ ${table}: columnas usadas por server.js que no existen:`);
        missing.forEach(([c, src]) => console.log(`   ${c}  (${src})`));
      }
    }
    if (!problems) console.log(`✓ ${Object.keys(expected).length} tablas revisadas: todas las columnas existen`);
  } finally {
    await pool.end();
  }
  process.exit(problems ? 1 : 0);
})().catch((err) => {
  console.error('Error al revisar el esquema:', err.message);
  process.exit(2);
});
