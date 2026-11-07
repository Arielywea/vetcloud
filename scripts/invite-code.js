// Crea, lista o desactiva códigos de invitación (migración 033). Escribe en la BD a la que apunte DATABASE_URL.
//   node scripts/invite-code.js create CODIGO [--label "Compañeros U"] [--max-uses 20] [--days 30] [--expires 2027-03-01]
//   node scripts/invite-code.js list
//   node scripts/invite-code.js disable CODIGO
const { Pool } = require('pg');
try { require('dotenv').config(); } catch (e) {}

const [cmd, codeArg, ...rest] = process.argv.slice(2);
const opt = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    if (cmd === 'create') {
      const code = String(codeArg || '').trim().toUpperCase();
      if (!/^[A-Z0-9_-]{4,40}$/.test(code)) throw new Error('El código debe tener 4 a 40 caracteres: letras, números, guion o guion bajo');
      const days = Number(opt('days') || 30);
      const maxUses = opt('max-uses') ? Number(opt('max-uses')) : null;
      const expires = opt('expires') || null;
      await pool.query(
        'INSERT INTO invite_codes (code, label, trial_days, max_uses, expires_at) VALUES ($1, $2, $3, $4, $5)',
        [code, opt('label') || null, days, maxUses, expires]
      );
      console.log(`Creado ${code}: prueba ${days} días, ${maxUses ?? 'sin límite de'} usos${expires ? `, vence ${expires}` : ''}`);
    } else if (cmd === 'list') {
      const r = await pool.query('SELECT code, label, uses, max_uses, trial_days, expires_at, active FROM invite_codes ORDER BY created_at');
      console.table(r.rows);
    } else if (cmd === 'disable') {
      const r = await pool.query('UPDATE invite_codes SET active = false WHERE code = $1 RETURNING code', [String(codeArg || '').toUpperCase()]);
      console.log(r.rows.length ? `Desactivado ${r.rows[0].code}` : 'No existe ese código');
    } else {
      console.log('Uso: create CODIGO [--label ..] [--max-uses N] [--days N] [--expires AAAA-MM-DD] | list | disable CODIGO');
    }
  } catch (e) {
    console.error(e.code === '23505' ? 'Ese código ya existe' : e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
