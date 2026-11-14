const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }

const app = express();
// Behind Vercel's proxy: use X-Forwarded-For so req.ip is the real client (rate limits per user, not global)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8055;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no definido en variables de entorno');
  process.exit(1);
}

const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Each Vercel instance keeps its own pool; Neon's pooler multiplexes behind it.
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    }
  : process.env.VERCEL_ENV
    ? null
    : { host: 'localhost', port: 1245, database: 'vetcloud', user: 'postgres', password: '' };

if (process.env.VERCEL_ENV && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL no definido en Vercel');
  process.exit(1);
}

const pool = new Pool(dbConfig);
pool.on('error', (err) => console.error('[pg pool]', err.message));

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => { if (req.body === undefined) req.body = {}; next(); });

const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {}

const upload = multer({ storage: multer.memoryStorage() });

function sanitizeColumns(allowed, body) {
  const safe = {};
  for (const key of Object.keys(body)) {
    if (allowed.includes(key)) {
      safe[key] = body[key];
    }
  }
  return safe;
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Logs the real cause of a 500 so it shows up in Vercel's function logs
function logError(req, err) {
  console.error(`[${req.method} ${req.path}]`, err && (err.stack || err.message || err), err && err.detail ? `detail: ${err.detail}` : '');
}

// Stored in Postgres so the limit is shared across Vercel serverless instances
async function rateLimit(key, maxAttempts, windowMs) {
  try {
    const result = await pool.query(
      `INSERT INTO rate_limits (key, count, reset_at)
       VALUES ($1, 1, NOW() + ($2 || ' milliseconds')::interval)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN rate_limits.reset_at < NOW() THEN 1 ELSE rate_limits.count + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN NOW() + ($2 || ' milliseconds')::interval ELSE rate_limits.reset_at END
       RETURNING count`,
      [key, String(windowMs)]
    );
    return result.rows[0].count <= maxAttempts;
  } catch (err) {
    console.error('[rateLimit]', err.message);
    return true; // never lock users out because the limiter itself failed
  }
}

// Accepts DD/MM/AAAA or AAAA-MM-DD; returns ISO date, null for empty, or undefined if invalid
// Datetime from the client (ISO string or Date-parsable). Returns ISO string,
// null for empty, or undefined if invalid.
function parseDateTimeInput(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getUTCFullYear();
  if (y < 1980 || y > 2100) return undefined;
  return d.toISOString();
}

// Number with optional range. Accepts numbers or numeric strings ("12.5" / "12,5").
// Returns the number, null for empty, or undefined if invalid/out of range.
function parseNumberInput(value, { min = -Infinity, max = Infinity, integer = false } = {}) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  if (integer && !Number.isInteger(n)) return undefined;
  return n;
}

// Validates fields of a body in place. rules: { field: { type: 'date'|'datetime'|'number'|'enum', ...opts, label } }
// Returns an error message (Spanish) or null. Only validates fields that are present.
function validateFields(body, rules) {
  for (const [field, rule] of Object.entries(rules)) {
    if (!(field in body)) continue;
    const v = body[field];
    let parsed;
    if (rule.type === 'date') parsed = parseDateInput(v, { allowFuture: !!rule.allowFuture });
    else if (rule.type === 'datetime') parsed = parseDateTimeInput(v);
    else if (rule.type === 'number') parsed = parseNumberInput(v, rule);
    else if (rule.type === 'enum') parsed = v === null || v === '' ? null : (rule.values.includes(v) ? v : undefined);
    if (parsed === undefined) return `${rule.label || field}: valor inválido`;
    if (parsed === null && rule.required) return `${rule.label || field} es obligatorio`;
    body[field] = parsed;
  }
  return null;
}

function parseDateInput(value, { allowFuture = false } = {}) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const str = String(value).trim();
  let y, m, d;
  let match = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (match) { d = +match[1]; m = +match[2]; y = +match[3]; }
  else if ((match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +match[1]; m = +match[2]; d = +match[3]; }
  else return undefined;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return undefined;
  if ((!allowFuture && date > new Date()) || y < 1980 || y > 2100) return undefined;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Columns a client may set on pets (create + update). JSON columns are stringified.
// The tutor's data lives in owners; pets.tutor_* are a copy the server keeps in sync (syncOwnerCopy)
const PET_OWNER_COPY = ['tutor_name', 'tutor_rut', 'phone', 'email', 'address'];
const PET_STATUSES = ['alive', 'deceased', 'transferred', 'inactive'];
const PET_COLUMNS = ['owner_id','species_other','registry_number','birth_date_estimated','alerts','deceased_at','name','tutor_rut','species','breed','birth_date','weight','color','photo','allergies','notes','tutor_name','phone','email','address','clinic_location','id_number','sex','temperament','habitat','habitat_other','food','food_frequency','water_consumption','urination','lives_with_other_animals','vaccines','deworming','flea_treatment','last_heat','surgeries','other_diseases','medications','reproductive_status','anamnesis','vital_signs','hallazgos_examen_fisico','motivo_consulta','entorno','areneros','status','receive_reminders','last_visit','pre_diagnostico','base_diseases','procedencia','procedencia_edad','retroviral_test'];
const PET_JSON_COLUMNS = ['allergies','temperament','vital_signs','base_diseases','alerts'];

// Validates and normalizes a pet payload. Returns { values } or { error }.
function normalizePet(body, { partial, allowOther = false }) {
  const safe = sanitizeColumns(PET_COLUMNS, body);
  for (const key of PET_OWNER_COPY) delete safe[key];
  if (safe.status !== undefined && !PET_STATUSES.includes(safe.status)) return { error: 'Estado inválido' };
  if (safe.owner_id !== undefined && safe.owner_id !== null && !isValidUUID(String(safe.owner_id))) return { error: 'Tutor inválido' };
  if (!partial || safe.name !== undefined) {
    if (!safe.name || !String(safe.name).trim()) return { error: 'El nombre es obligatorio' };
    safe.name = String(safe.name).trim();
  }
  // Vet Avalon attends dogs and cats. 'other' survives only on patients that already had it (allowOther)
  if (safe.species !== undefined && !['dog', 'cat', ...(allowOther ? ['other'] : [])].includes(safe.species)) return { error: 'Vet Avalon atiende perros y gatos: la especie debe ser perro o gato' };
  if (safe.species === 'other' && !String(safe.species_other || '').trim()) return { error: 'Indica la especie (por ejemplo, conejo o hurón)' };
  if (safe.species && safe.species !== 'other') safe.species_other = null;
  if (safe.tutor_rut !== undefined && safe.tutor_rut !== null && String(safe.tutor_rut).trim().length > 20) {
    return { error: 'RUT inválido' };
  }
  if (safe.deceased_at !== undefined && safe.deceased_at !== null) {
    const parsed = parseDateTimeInput(safe.deceased_at);
    if (parsed === undefined || new Date(parsed) > new Date(Date.now() + 86400000)) return { error: 'Fecha de fallecimiento inválida' };
    safe.deceased_at = parsed;
  }
  if (safe.birth_date !== undefined) {
    const parsed = parseDateInput(safe.birth_date);
    if (parsed === undefined) return { error: 'Fecha de nacimiento inválida (usa DD/MM/AAAA)' };
    safe.birth_date = parsed;
  }
  if (safe.weight !== undefined) {
    if (safe.weight === null || safe.weight === '') safe.weight = null;
    else {
      const w = parseFloat(String(safe.weight).replace(',', '.'));
      // Same range as the patient form and /vital-measurements
      if (!isFinite(w) || w < 0.05 || w > 150) return { error: 'El peso debe estar entre 0,05 y 150 kg' };
      safe.weight = w;
    }
  }
  for (const [key, val] of Object.entries(safe)) {
    if (typeof val === 'string' && val.trim() === '' && key !== 'name') safe[key] = null;
    if (PET_JSON_COLUMNS.includes(key) && val !== null && val !== undefined) safe[key] = JSON.stringify(val);
  }
  return { values: safe };
}

// SET clause for a PATCH: one placeholder per column ($1..$n), objects and arrays stored as JSON.
// `idx` is the next free placeholder, for the WHERE clause.
function buildSet(safe, aliasMap = {}) {
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(safe)) {
    fields.push(`${aliasMap[key] || key} = $${fields.length + 1}`);
    values.push(val !== null && typeof val === 'object' ? JSON.stringify(val) : val);
  }
  return { fields, values, idx: fields.length + 1 };
}

// LIKE pattern with user input: escape %, _ and \ so they match literally
function likeTerm(str) {
  return '%' + String(str).replace(/[\\%_]/g, (c) => '\\' + c) + '%';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const DISEASE_SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];
// Same keys as constants/diseaseMeta.ts
const DISEASE_CATEGORY_KEYS = ['infectious', 'parasitic', 'degenerative', 'oncological', 'nutritional', 'autoimmune', 'traumatic', 'congenital',
  'respiratory', 'gastrointestinal', 'dermatological', 'ocular', 'dental', 'endocrine', 'cardiovascular', 'neurological', 'musculoskeletal',
  'renal', 'reproductive', 'toxic', 'urological', 'hematologic', 'metabolic', 'environmental'];
const DISEASE_PROGNOSES = ['excellent', 'good', 'guarded', 'poor', 'grave', 'chronic'];
const DISEASE_LIFE_STAGES = ['puppy', 'kitten', 'adult', 'senior', 'all'];
function diseaseFieldError(d, partial) {
  if ((!partial || d.species !== undefined) && !['dog', 'cat', 'both'].includes(d.species)) return 'La especie debe ser perro, gato o ambos';
  if ((!partial || d.category !== undefined) && !DISEASE_CATEGORY_KEYS.includes(d.category)) return 'Categoría inválida';
  if ((!partial || d.severity !== undefined) && !DISEASE_SEVERITIES.includes(d.severity)) return 'La severidad debe ser leve, moderada, severa o crítica';
  if (d.prognosis != null && !DISEASE_PROGNOSES.includes(d.prognosis)) return 'Pronóstico inválido';
  if (d.life_stage != null && !DISEASE_LIFE_STAGES.includes(d.life_stage)) return 'Etapa de vida inválida';
  if (partial && d.name !== undefined && !String(d.name || '').trim()) return 'El nombre es obligatorio';
  return null;
}
const REMINDER_TYPES = ['vacuna', 'desparasitacion', 'control', 'post_operatorio', 'cita', 'otro'];

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// RUT and phone in one canonical form before saving and before searching (same as vc_canon_rut and
// vc_canon_phone in migration 019), so "12.345.678-k" and "12345678K" are the same tutor.
function canonRut(raw) {
  const clean = String(raw || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return null;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}
function validRut(canon) {
  const m = /^(\d{1,8})-([\dK])$/.exec(canon || '');
  if (!m) return false;
  let sum = 0;
  let mul = 2;
  for (let i = m[1].length - 1; i >= 0; i--) { sum += Number(m[1][i]) * mul; mul = mul === 7 ? 2 : mul + 1; }
  const r = 11 - (sum % 11);
  return (r === 11 ? '0' : r === 10 ? 'K' : String(r)) === m[2];
}
function canonPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.length === 9) return '+56' + d;
  if (d.length === 8) return '+569' + d;
  return '+' + d;
}

// Same rules as utils/password.ts on the client — keep both in sync
function passwordPolicyError(password) {
  if (typeof password !== 'string' || password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (password.length > 128) return 'La contraseña no puede superar 128 caracteres';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'La contraseña debe tener mayúsculas, minúsculas y números';
  }
  return null;
}

// Every foreign key taken from a request body must belong to the caller.
// Without this, a PATCH could re-point a record at another user's pet.
const OWNED_REFS = {
  pet_id: 'SELECT 1 FROM pets WHERE id::text = $1 AND user_id = $2',
  appointment_id: 'SELECT 1 FROM appointments WHERE id::text = $1 AND user_id = $2',
  follow_up_of: 'SELECT 1 FROM appointments WHERE id::text = $1 AND user_id = $2',
  clinical_record_id: 'SELECT 1 FROM clinical_records WHERE id::text = $1 AND user_id = $2',
  owner_id: 'SELECT 1 FROM owners WHERE id::text = $1 AND user_id = $2',
};
async function checkRefs(req) {
  const body = req.body || {};
  // Independent lookups: run them together instead of one round trip after another
  const checks = Object.entries(OWNED_REFS)
    .filter(([key]) => body[key] !== undefined && body[key] !== null && body[key] !== '')
    .map(async ([key, sql]) => {
      const r = await pool.query(sql, [String(body[key]), req.userId]);
      return r.rows.length ? null : `No tienes acceso a ese registro (${key})`;
    });
  if (body.disease_id) {
    checks.push(pool.query(
      'SELECT 1 FROM diseases WHERE id::text = $1 AND (organization_id IS NULL OR organization_id = $2)',
      [String(body.disease_id), req.organizationId || -1]
    ).then((r) => (r.rows.length ? null : 'No tienes acceso a esa enfermedad')));
  }
  return (await Promise.all(checks)).find(Boolean) || null;
}

// Route ids: UUIDs everywhere except the SERIAL catalogs (medications, surgeries).
// A malformed id is a 404, not a Postgres cast error surfacing as 500.
app.param(['id', 'petId', 'rxId'], (req, res, next, value) => {
  const numericCatalog = /^\/items\/(medications|surgeries)\//.test(req.path);
  const ok = numericCatalog ? /^\d+$/.test(value) : isValidUUID(value);
  if (!ok) return res.status(404).json({ error: 'No se encontró el registro' });
  next();
});

// ─── AUTH MIDDLEWARE ──────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.organizationId = decoded.organizationId || null;
    req.userRole = decoded.role || 'owner';
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// ─── AUTH ENDPOINTS ───────────────────────────────────────
// Version of the Términos / Política de privacidad texts (constants/legal.ts must carry the same value).
// Bump it whenever either text changes: new sign-ups record this version.
const LEGAL_VERSION = '2026-11-06';
// Closed alpha: with REQUIRE_INVITE=true the sign-up form only accepts accounts that bring an invite code.
const REQUIRE_INVITE = String(process.env.REQUIRE_INVITE || '').toLowerCase() === 'true';

app.get('/auth/registration-info', (req, res) => {
  res.json({ data: { invite_required: REQUIRE_INVITE, legal_version: LEGAL_VERSION } });
});
app.post('/auth/login', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!await rateLimit(`login:${clientIp}`, 5, 60000)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intente en 1 minuto.' });
    }
    const { identifier, password, rut } = req.body;
    const loginId = identifier || rut;
    if (!loginId || !password) return res.status(400).json({ error: 'Usuario/correo y contraseña requeridos' });

    // Detect if identifier is email (contains @) or username/rut
    let result;
    if (String(loginId).includes('@')) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [loginId]);
    } else {
      // Try username first, then fallback to RUT for backward compatibility
      result = await pool.query('SELECT * FROM users WHERE username = $1', [loginId]);
      if (!result.rows.length) {
        result = await pool.query('SELECT * FROM users WHERE rut = $1', [loginId]);
      }
    }

    if (!result.rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({
      data: {
        token,
        user: { id: user.id, rut: user.rut, username: user.username, name: user.name, email: user.email, role: user.role, organization_id: user.organization_id, theme_preference: user.theme_preference || 'light', color_palette: user.color_palette || null },
      },
    });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!await rateLimit(`register:${clientIp}`, 3, 300000)) {
      return res.status(429).json({ error: 'Demasiados registros. Intente en 5 minutos.' });
    }
    const { username, email, password, org_name, org_type, accepted_terms, accepted_privacy, legal_version, invite_code } = req.body;
    const inviteCode = String(invite_code || '').trim().toUpperCase();
    if (REQUIRE_INVITE && !inviteCode) {
      return res.status(400).json({ error: 'El registro es solo por invitación. Ingresa tu código de invitación.' });
    }

    // Validations
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Usuario, correo y contraseña requeridos' });
    }
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'El usuario debe tener entre 3 y 50 caracteres' });
    }
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return res.status(400).json({ error: 'El usuario solo puede contener letras, numeros, puntos y guiones bajos' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Formato de correo invalido' });
    }
    const policyError = passwordPolicyError(password);
    if (policyError) return res.status(400).json({ error: policyError });
    if (accepted_terms !== true || accepted_privacy !== true) {
      return res.status(400).json({ error: 'Debes aceptar los Términos y la Política de privacidad para crear la cuenta' });
    }
    if (legal_version !== LEGAL_VERSION) {
      return res.status(400).json({ error: 'Los Términos o la Política de privacidad cambiaron. Recarga la página y vuelve a intentarlo.' });
    }

    // Check uniqueness
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length) {
      return res.status(409).json({ error: 'El usuario o correo ya esta registrado' });
    }

    // Create org + user in a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Redeem the invite code first; the same transaction rolls the use back if anything below fails
      if (inviteCode) {
        const redeemed = await client.query(
          `UPDATE invite_codes SET uses = uses + 1
           WHERE code = $1 AND active AND (max_uses IS NULL OR uses < max_uses) AND (expires_at IS NULL OR expires_at > now())
           RETURNING code`,
          [inviteCode]
        );
        if (!redeemed.rows.length) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'El código de invitación no es válido, venció o ya se usó por completo' });
        }
      }

      // Create organization
      const orgName = org_name || `${username}'s Clinic`;
      const orgType = org_type === 'clinic' ? 'clinic' : 'solo';
      const orgResult = await client.query(
        'INSERT INTO organizations (name, org_type) VALUES ($1, $2) RETURNING id',
        [orgName, orgType]
      );
      const organizationId = orgResult.rows[0].id;

      // Create user
      const hash = bcrypt.hashSync(password, 10);
      const userResult = await client.query(
        'INSERT INTO users (username, email, password_hash, name, role, organization_id, invite_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, name, role, organization_id',
        [username, email, hash, username, 'owner', organizationId, inviteCode || null]
      );
      const user = userResult.rows[0];

      for (const document of ['terminos', 'privacidad']) {
        await client.query(
          'INSERT INTO legal_acceptances (user_id, document, version, ip) VALUES ($1, $2, $3, $4)',
          [user.id, document, LEGAL_VERSION, String(clientIp).slice(0, 64)]
        );
      }

      await client.query('COMMIT');

      const token = jwt.sign(
        { userId: user.id, organizationId: user.organization_id, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        data: {
          token,
          user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, organization_id: user.organization_id, rut: user.rut || null },
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El usuario o correo ya esta registrado' });
    }
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PASSWORD RESET ───────────────────────────────────────
// The link carries a random token; only its sha256 lives in the database (password_resets).
const RESET_TTL_MS = 60 * 60 * 1000;
const sha256 = (s) => require('crypto').createHash('sha256').update(String(s)).digest('hex');

app.post('/auth/forgot-password', async (req, res) => {
  // Same answer whether or not the email has an account: it must not reveal who is registered
  const generic = { data: { sent: true } };
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!await rateLimit(`forgot:${clientIp}`, 5, 900000)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta en 15 minutos.' });
    }
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ error: 'Ingresa un correo válido' });
    if (!await rateLimit(`forgot-email:${email}`, 3, 3600000)) return res.json(generic);

    const found = await pool.query('SELECT id, name FROM users WHERE lower(email) = $1', [email]);
    if (!found.rows.length) return res.json(generic);

    const base = process.env.APP_URL || (process.env.VERCEL ? null : 'http://localhost:8081');
    if (!base || !process.env.SMTP_EMAIL) {
      logError(req, new Error('Recuperación de contraseña sin APP_URL o SMTP_EMAIL configurados'));
      return res.json(generic);
    }

    const user = found.rows[0];
    const token = require('crypto').randomBytes(32).toString('base64url');
    await pool.query('UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [user.id]);
    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, sha256(token), new Date(Date.now() + RESET_TTL_MS)]
    );

    const link = `${base.replace(/\/$/, '')}/restablecer?token=${token}`;
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"Vet Avalon" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Restablece tu contraseña de Vet Avalon',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #141C33; background: #F5F2EA;">
  <div style="background: #0B1D3A; border-bottom: 3px solid #A8842A; color: #F3EFE4; padding: 22px 24px;">
    <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif;">Vet Avalon</h1>
  </div>
  <div style="background: #FFFDF8; padding: 24px; font-size: 15px; line-height: 1.6;">
    <p>Hola ${escapeHtml(user.name || '')},</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. El enlace vale 1 hora y se puede usar una sola vez.</p>
    <p style="text-align: center; margin: 28px 0;"><a href="${link}" style="background: #A8842A; color: #0B1D3A; padding: 12px 22px; text-decoration: none; font-weight: 600;">Elegir una contraseña nueva</a></p>
    <p style="font-size: 13px; color: #4E586F;">Si no fuiste tú, ignora este correo: tu contraseña no cambia.</p>
  </div>
</body></html>`,
    });
    res.json(generic);
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!await rateLimit(`reset:${clientIp}`, 10, 900000)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta en 15 minutos.' });
    }
    const { token, new_password } = req.body || {};
    if (!token || typeof token !== 'string') return res.status(400).json({ error: 'El enlace no es válido' });
    const policyError = passwordPolicyError(new_password);
    if (policyError) return res.status(400).json({ error: policyError });

    const hash = await bcrypt.hash(new_password, 10);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Claim the token in one statement so two requests cannot both use it
      const claimed = await client.query(
        'UPDATE password_resets SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING user_id',
        [sha256(token)]
      );
      if (!claimed.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'El enlace venció o ya fue usado. Pide uno nuevo.' });
      }
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, claimed.rows[0].user_id]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
    res.json({ data: { success: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, rut, username, name, email, role, organization_id, theme_preference, color_palette, created_at, smtp_email, clinic_name, veterinarian_name, clinic_phone, clinic_address, notification_email_reminders, notification_upcoming_appointments, notification_push, professional_rut, professional_title, professional_university, (signature_png IS NOT NULL) AS has_signature, (stamp_png IS NOT NULL) AS has_stamp FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = result.rows[0];
    res.json({ data: user });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { professional_rut, professional_title, professional_university, name, email, clinic_name, veterinarian_name, clinic_phone, clinic_address, smtp_email, theme_preference, color_palette, notification_email_reminders, notification_upcoming_appointments, notification_push } = req.body;
    if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.length > 100)) {
      return res.status(400).json({ error: 'El nombre es obligatorio (máx. 100 caracteres)' });
    }
    // The account email is used to log in and as reply-to on prescriptions: it can change, not disappear
    if (email !== undefined && !isEmail(email)) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio y debe ser válido' });
    }
    if (smtp_email !== undefined && smtp_email !== null && smtp_email !== '' && !isEmail(smtp_email)) {
      return res.status(400).json({ error: 'Correo SMTP inválido' });
    }
    for (const value of [clinic_name, veterinarian_name, clinic_phone, clinic_address]) {
      if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 200)) {
        return res.status(400).json({ error: 'Los datos de la clínica deben ser texto (máx. 200 caracteres)' });
      }
    }
    for (const value of [professional_title, professional_university]) {
      if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 120)) {
        return res.status(400).json({ error: 'El título y la universidad deben ser texto (máx. 120 caracteres)' });
      }
    }
    if (professional_rut !== undefined && professional_rut !== null && professional_rut !== '' && !validRut(canonRut(String(professional_rut)))) {
      return res.status(400).json({ error: 'El RUT del profesional no es válido' });
    }
    if (theme_preference !== undefined && !['light', 'dark'].includes(theme_preference)) {
      return res.status(400).json({ error: 'Tema inválido' });
    }
    for (const value of [notification_email_reminders, notification_upcoming_appointments, notification_push]) {
      if (value !== undefined && typeof value !== 'boolean') {
        return res.status(400).json({ error: 'Las preferencias de notificación deben ser verdadero o falso' });
      }
    }
    const fields = [];
    const values = [];
    let idx = 1;
    const text = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
    if (name !== undefined) { fields.push(`name = $${idx}`); values.push(name.trim()); idx++; }
    if (email !== undefined) { fields.push(`email = $${idx}`); values.push(text(email)); idx++; }
    if (clinic_name !== undefined) { fields.push(`clinic_name = $${idx}`); values.push(text(clinic_name)); idx++; }
    if (veterinarian_name !== undefined) { fields.push(`veterinarian_name = $${idx}`); values.push(text(veterinarian_name)); idx++; }
    if (clinic_phone !== undefined) { fields.push(`clinic_phone = $${idx}`); values.push(text(clinic_phone)); idx++; }
    if (clinic_address !== undefined) { fields.push(`clinic_address = $${idx}`); values.push(text(clinic_address)); idx++; }
    if (professional_rut !== undefined) { fields.push(`professional_rut = ${idx}`); values.push(text(professional_rut) ? canonRut(String(professional_rut)) : null); idx++; }
    if (professional_title !== undefined) { fields.push(`professional_title = ${idx}`); values.push(text(professional_title)); idx++; }
    if (professional_university !== undefined) { fields.push(`professional_university = ${idx}`); values.push(text(professional_university)); idx++; }
    if (smtp_email !== undefined) { fields.push(`smtp_email = ${idx}`); values.push(text(smtp_email)); idx++; }
    if (theme_preference !== undefined) { fields.push(`theme_preference = $${idx}`); values.push(theme_preference); idx++; }
    if (color_palette !== undefined) { fields.push(`color_palette = $${idx}`); values.push(color_palette); idx++; }
    if (notification_email_reminders !== undefined) { fields.push(`notification_email_reminders = $${idx}`); values.push(notification_email_reminders); idx++; }
    if (notification_upcoming_appointments !== undefined) { fields.push(`notification_upcoming_appointments = $${idx}`); values.push(notification_upcoming_appointments); idx++; }
    if (notification_push !== undefined) { fields.push(`notification_push = $${idx}`); values.push(notification_push); idx++; }
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, rut, name, email, role, theme_preference, color_palette, created_at, smtp_email, clinic_name, veterinarian_name, clinic_phone, clinic_address, notification_email_reminders, notification_upcoming_appointments, notification_push, professional_rut, professional_title, professional_university, (signature_png IS NOT NULL) AS has_signature, (stamp_png IS NOT NULL) AS has_stamp`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = result.rows[0];
    res.json({ data: user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado en otra cuenta' });
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── SIGNATURE AND STAMP IMAGES ───────────────────────────
// Private: only the owner reads them back, and the server embeds them in that account's PDFs.
const SIGNATURE_KINDS = { signature: 'signature_png', stamp: 'stamp_png' };
const SIGNATURE_MAX_BYTES = 300 * 1024;

function parseImageDataUrl(value) {
  const m = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(String(value || ''));
  if (!m) return { error: 'La imagen debe ser PNG o JPG' };
  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length > SIGNATURE_MAX_BYTES) return { error: 'La imagen es demasiado grande (máx. 300 KB)' };
  const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if ((m[1] === 'png' && !isPng) || (m[1] === 'jpeg' && !isJpg)) return { error: 'El archivo no es una imagen válida' };
  return { value: String(value) };
}

app.get('/auth/signature', authMiddleware, async (req, res) => {
  try {
    const column = SIGNATURE_KINDS[req.query.kind];
    if (!column) return res.status(400).json({ error: 'Indica si es la firma o el timbre' });
    const r = await pool.query('SELECT signature_png, stamp_png FROM users WHERE id = $1', [req.userId]);
    res.json({ data: { image: r.rows[0]?.[column] || null } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/auth/signature', authMiddleware, async (req, res) => {
  try {
    const column = SIGNATURE_KINDS[req.body?.kind];
    if (!column) return res.status(400).json({ error: 'Indica si es la firma o el timbre' });
    const parsed = parseImageDataUrl(req.body?.image);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    await pool.query(`UPDATE users SET ${column} = $1 WHERE id = $2`, [parsed.value, req.userId]);
    res.json({ data: { saved: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/auth/signature', authMiddleware, async (req, res) => {
  try {
    const column = SIGNATURE_KINDS[req.query.kind];
    if (!column) return res.status(400).json({ error: 'Indica si es la firma o el timbre' });
    await pool.query(`UPDATE users SET ${column} = NULL WHERE id = $1`, [req.userId]);
    res.json({ data: { deleted: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/auth/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Contraseña actual y nueva contraseña requeridas' });
    }
    const policyError = passwordPolicyError(new_password);
    if (policyError) return res.status(400).json({ error: policyError });
    if (!await rateLimit(`password:${req.userId}`, 5, 900000)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta en 15 minutos.' });
    }
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    // 400, not 401: the client treats any 401 as an expired session and logs out
    if (!valid) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    res.json({ data: { success: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── DISEASES ────────────────────────────────────────────
// Public routes read the org from the token when present (optional auth)
function optionalAuth(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return { organizationId: null, role: null };
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    return { organizationId: decoded.organizationId || null, role: decoded.role || null };
  } catch { return { organizationId: null, role: null }; }
}

// Global rows (organization_id NULL) only by admins; org rows only by that org
function diseaseWriteScope(req, startIdx) {
  if (req.userRole === 'admin') {
    return { clause: `(organization_id IS NULL OR organization_id = $${startIdx})`, params: [req.organizationId || -1] };
  }
  return { clause: `organization_id = $${startIdx}`, params: [req.organizationId || -1] };
}

app.get('/items/diseases', async (req, res) => {
  try {
    let query = 'SELECT *, references_list AS references FROM diseases';
    const params = [];
    const conditions = [];

    // Org filtering: show global diseases + org-specific diseases
    // Extract orgId from token if available (optional endpoint)
    const orgId = optionalAuth(req).organizationId;
    if (orgId) {
      conditions.push(`(organization_id IS NULL OR organization_id = $${params.length + 1})`);
      params.push(orgId);
    } else {
      conditions.push('(organization_id IS NULL)');
    }

    if (req.query.species && req.query.species !== 'all') {
      conditions.push(`(species = $${params.length + 1} OR species = 'both')`);
      params.push(req.query.species);
    }
    if (req.query.search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR scientific_name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${req.query.search}%`);
    }
    if (req.query.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(req.query.category);
    }
    if (req.query.severity) {
      conditions.push(`severity = $${params.length + 1}`);
      params.push(req.query.severity);
    }
    if (req.query.id) {
      conditions.push(`id = $${params.length + 1}`);
      params.push(req.query.id);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY chile_rank ASC NULLS LAST, prevalence_rank ASC NULLS LAST, name ASC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/diseases/:id', async (req, res) => {
  try {
    const orgId = optionalAuth(req).organizationId;
    const result = await pool.query(
      'SELECT *, references_list AS references FROM diseases WHERE id = $1 AND (organization_id IS NULL OR organization_id = $2)',
      [req.params.id, orgId || -1]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Enfermedad no encontrada' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/diseases', authMiddleware, async (req, res) => {
  try {
    const d = req.body || {};
    if (!d.name || !String(d.name).trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const fieldError = diseaseFieldError(d, false);
    if (fieldError) return res.status(400).json({ error: fieldError });
    if (!d.description || !String(d.description).trim()) return res.status(400).json({ error: 'La descripción es obligatoria' });
    if (!req.organizationId && req.userRole !== 'admin') return res.status(403).json({ error: 'Tu cuenta no tiene una clínica asociada' });
    const result = await pool.query(
      `WITH ins AS (INSERT INTO diseases (name, scientific_name, species, category, severity, description, pathophysiology, life_stage, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list, photo_url, organization_id, english_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *)
       SELECT *, references_list AS references FROM ins`,
      [String(d.name).trim(), d.scientific_name || null, d.species, d.category || null, d.severity || null, d.description || null,
       d.pathophysiology || null, d.life_stage || 'all',
       JSON.stringify(d.key_signs || []), JSON.stringify(d.diagnosis || {}), JSON.stringify(d.treatment || {}),
       JSON.stringify(d.prevention || []), d.prognosis || null, d.is_zoonotic === true, JSON.stringify(d.references || []), d.photo_url || null,
       req.organizationId || null, d.english_name ? String(d.english_name).trim() : null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/diseases/:id', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const fieldError = diseaseFieldError(d || {}, true);
    if (fieldError) return res.status(400).json({ error: fieldError });
    const allowed = ['name','scientific_name','english_name','species','category','severity','description','pathophysiology','key_signs','diagnosis','treatment','prevention','prognosis','is_zoonotic','references','references_list','photo_url','life_stage'];
    const safe = sanitizeColumns(allowed, d);
    const { fields, values, idx } = buildSet(safe, { references: 'references_list' });
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    const scope = diseaseWriteScope(req, idx + 1);
    values.push(...scope.params);
    const result = await pool.query(
      `WITH u AS (UPDATE diseases SET ${fields.join(', ')} WHERE id = $${idx} AND ${scope.clause} RETURNING *) SELECT *, references_list AS references FROM u`, values
    );
    // Global entries are admin-only (diseaseWriteScope): say so instead of a bare 404
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró la enfermedad o no tienes permiso para editarla (las fichas del catálogo general solo las edita un administrador)' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/diseases/:id', authMiddleware, async (req, res) => {
  try {
    const scope = diseaseWriteScope(req, 2);
    const result = await pool.query(`DELETE FROM diseases WHERE id = $1 AND ${scope.clause} RETURNING id`, [req.params.id, ...scope.params]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── MEDICATIONS ─────────────────────────────────────────
app.get('/items/medications', async (req, res) => {
  try {
    let query = 'SELECT * FROM medications';
    const params = [];
    const conditions = [];

    let orgId = null;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        orgId = decoded.organizationId || null;
      } catch {}
    }
    if (orgId) {
      conditions.push(`(organization_id IS NULL OR organization_id = $${params.length + 1})`);
      params.push(orgId);
    } else {
      conditions.push('(organization_id IS NULL)');
    }

    if (req.query.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(req.query.category);
    }
    if (req.query.especialidad) {
      conditions.push(`especialidad = $${params.length + 1}`);
      params.push(req.query.especialidad);
    }
    if (req.query.search) {
      conditions.push(`(nombre ILIKE $${params.length + 1} OR marca_comercial ILIKE $${params.length + 1} OR familia ILIKE $${params.length + 1})`);
      params.push(`%${req.query.search}%`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY nombre ASC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/medications', authMiddleware, async (req, res) => {
  try {
    const { category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, notas, dosis_min_mg_kg, dosis_max_mg_kg, concentracion_mg_ml, frecuencia_horas } = req.body;
    if (!category || !nombre) return res.status(400).json({ error: 'category y nombre son requeridos' });

    const orgResult = await pool.query('SELECT organization_id FROM users WHERE id = $1', [req.userId]);
    const organizationId = orgResult.rows[0]?.organization_id || null;

    const result = await pool.query(
      `INSERT INTO medications (organization_id, category, nombre, marca_comercial, presentacion, familia, funcion, dosis_perro, dosis_gato, via_administracion, efectos_adversos, notas, dosis_min_mg_kg, dosis_max_mg_kg, concentracion_mg_ml, frecuencia_horas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [organizationId, category, nombre, marca_comercial || null, presentacion || null, familia || null, funcion || null, dosis_perro || null, dosis_gato || null, via_administracion || null, efectos_adversos || null, notas || null, dosis_min_mg_kg || null, dosis_max_mg_kg || null, concentracion_mg_ml || null, frecuencia_horas || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── SURGERIES ──────────────────────────────────────────
app.get('/items/surgeries', async (req, res) => {
  try {
    // The list leaves out the guide (15–30 KB each); the detail route returns it
    let query = `SELECT id, organization_id, nombre_cirugia, indicaciones, tecnica_quirurgica, material_quirurgico, tipo_sutura, complicaciones_frecuentes, manejo_anestesico_sugerido, consideraciones_por_raza, consideraciones_comorbilidades, fuente, category, sort_order, created_at, guide IS NOT NULL AS has_guide, (guide->>'draft')::boolean AS guide_draft, guide->>'lede' AS guide_lede, guide->'meta' AS guide_meta FROM surgeries`;
    const params = [];
    const conditions = [];

    if (req.query.search) {
      conditions.push(`(nombre_cirugia ILIKE $${params.length + 1} OR indicaciones ILIKE $${params.length + 1} OR material_quirurgico ILIKE $${params.length + 1})`);
      params.push(`%${req.query.search}%`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY sort_order ASC NULLS LAST, nombre_cirugia ASC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/surgeries/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surgeries WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PETS ────────────────────────────────────────────────
// last_visit is derived from the clinical records: the stored column was only bumped when a record was
// created through the API, so the list said "Sin visitas / Inactivo" for patients with records.
const PET_SELECT = `SELECT p.*, GREATEST(p.last_visit, (SELECT MAX(cr.date) FROM clinical_records cr WHERE cr.pet_id = p.id)) AS last_visit,
    o.name AS owner_name, o.rut AS owner_rut, o.phone AS owner_phone, o.email AS owner_email,
    o.contact_revoked_at AS owner_contact_revoked_at, o.anonymized_at AS owner_anonymized_at
  FROM pets p LEFT JOIN owners o ON o.id = p.owner_id`;

// Copies the tutor's data onto their pets (read by PDFs, reminders and the agenda until migration 022)
async function syncOwnerCopy(ownerId) {
  await pool.query(
    `UPDATE pets p SET tutor_name = o.name, tutor_rut = o.rut, phone = o.phone, email = o.email, address = o.address
     FROM owners o WHERE o.id = $1 AND p.owner_id = o.id`, [ownerId]);
}

// Transition: the old patient form sends the tutor's fields with the pet instead of an owner_id.
// Finds the tutor by RUT or creates one (or updates the pet's current tutor) and returns its id;
// null when the body carries no tutor data. Goes away with the new Pacientes screens.
async function ownerFromLegacyBody(body, userId, organizationId, currentOwnerId) {
  const pick = (k) => (typeof body[k] === 'string' && body[k].trim() ? body[k].trim() : null);
  const name = pick('tutor_name');
  const rut = canonRut(pick('tutor_rut'));
  const fields = { name, rut: rut && validRut(rut) ? rut : null, phone: canonPhone(pick('phone')), email: isEmail(pick('email')) ? pick('email') : null, address: pick('address') };
  if (!Object.values(fields).some(Boolean)) return null;
  if (fields.rut) {
    const byRut = await pool.query('SELECT id FROM owners WHERE user_id = $1 AND rut = $2', [userId, fields.rut]);
    if (byRut.rows.length && byRut.rows[0].id !== currentOwnerId) {
      if (currentOwnerId) fields.rut = null; // that RUT belongs to another tutor: leave this one's alone
      else return byRut.rows[0].id;
    }
  }
  if (currentOwnerId) {
    const set = Object.entries(fields).filter(([k, v]) => ({ name: 'tutor_name', rut: 'tutor_rut' }[k] || k) in body && (v !== null || (k !== 'rut' && k !== 'name')));
    if (set.length) {
      await pool.query(
        `UPDATE owners SET ${set.map(([k], i) => `${k} = $${i + 1}`).join(', ')}, updated_at = NOW() WHERE id = $${set.length + 1} AND user_id = $${set.length + 2}`,
        [...set.map(([, v]) => v), currentOwnerId, userId]);
    }
    return currentOwnerId;
  }
  const r = await pool.query(
    `INSERT INTO owners (user_id, organization_id, name, rut, phone, email, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [userId, organizationId || null, fields.name || 'Tutor sin nombre', fields.rut, fields.phone, fields.email, fields.address]);
  return r.rows[0].id;
}

// A deceased, transferred or inactive pet, or a tutor who revoked contact, gets no more reminders
async function cancelPendingReminders(where, params) {
  await pool.query(`UPDATE reminders SET status = 'cancelled' WHERE status = 'pending' AND ${where}`, params);
}

// The visit is the only source of the weight; pets keep the latest as a cache (and in pets.weight for the PDFs)
async function refreshPetWeight(petId) {
  await pool.query(
    `UPDATE pets p SET current_weight_kg = s.kg, current_weight_at = s.at, weight = s.kg
     FROM (SELECT weight_kg AS kg, date AS at FROM clinical_records WHERE pet_id = $1 AND weight_kg IS NOT NULL
           ORDER BY date DESC LIMIT 1) s
     WHERE p.id = $1`, [petId]);
}

// ─── OWNERS (TUTORES) ────────────────────────────────────
const OWNER_COLUMNS = ['name', 'rut', 'phone', 'email', 'address', 'comuna', 'region', 'alt_contact_name', 'alt_contact_phone', 'preferred_contact', 'consent_communications_at', 'notes'];
function normalizeOwner(body, { partial }) {
  const safe = sanitizeColumns(OWNER_COLUMNS, body);
  if (!partial || safe.name !== undefined) {
    if (!String(safe.name || '').trim()) return { error: 'El nombre del tutor es obligatorio' };
    safe.name = String(safe.name).trim().slice(0, 200);
  }
  if (!partial || safe.rut !== undefined) {
    const rut = canonRut(safe.rut);
    if (!rut || !validRut(rut)) return { error: 'RUT inválido: revisa el número y el dígito verificador' };
    safe.rut = rut;
  }
  if (safe.phone !== undefined) safe.phone = canonPhone(safe.phone);
  if (safe.alt_contact_phone !== undefined) safe.alt_contact_phone = canonPhone(safe.alt_contact_phone);
  if (safe.email !== undefined) {
    const email = String(safe.email || '').trim().toLowerCase();
    if (email && !isEmail(email)) return { error: 'Correo inválido' };
    safe.email = email || null;
  }
  if (safe.preferred_contact !== undefined && safe.preferred_contact !== null && !['whatsapp', 'telefono', 'correo'].includes(safe.preferred_contact)) {
    return { error: 'Preferencia de contacto inválida' };
  }
  if (safe.consent_communications_at !== undefined) {
    safe.consent_communications_at = safe.consent_communications_at ? new Date().toISOString() : null;
  }
  for (const [key, val] of Object.entries(safe)) if (typeof val === 'string' && val.trim() === '') safe[key] = null;
  return { values: safe };
}
const OWNER_LIST_SELECT = `SELECT o.*,
    COALESCE(json_agg(json_build_object('id', p.id, 'name', p.name, 'species', p.species, 'status', p.status) ORDER BY p.name)
             FILTER (WHERE p.id IS NOT NULL), '[]') AS pets
  FROM owners o LEFT JOIN pets p ON p.owner_id = o.id`;

app.get('/items/owners', authMiddleware, async (req, res) => {
  try {
    const params = [req.userId];
    let where = 'o.user_id = $1';
    const q = String(req.query.q || '').trim();
    if (q) {
      const rut = canonRut(q);
      const phone = q.replace(/\D/g, '');
      params.push(likeTerm(q.toLowerCase()));
      const parts = [`LOWER(o.name) LIKE $${params.length}`, `EXISTS (SELECT 1 FROM pets px WHERE px.owner_id = o.id AND LOWER(px.name) LIKE $${params.length})`];
      if (rut && /\d{5,}/.test(q)) { params.push(rut); parts.push(`o.rut = $${params.length}`); }
      if (phone.length >= 6) { params.push('%' + phone); parts.push(`regexp_replace(o.phone, '\\D', '', 'g') LIKE $${params.length}`); }
      where += ` AND (${parts.join(' OR ')})`;
    }
    const result = await pool.query(`${OWNER_LIST_SELECT} WHERE ${where} GROUP BY o.id ORDER BY LOWER(o.name) LIMIT 200`, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Live duplicate check while typing a RUT
app.get('/items/owners/check', authMiddleware, async (req, res) => {
  try {
    const rut = canonRut(req.query.rut);
    if (!rut || !validRut(rut)) return res.json({ data: { valid: false, rut, owner: null } });
    const r = await pool.query('SELECT id, name FROM owners WHERE user_id = $1 AND rut = $2', [req.userId, rut]);
    res.json({ data: { valid: true, rut, owner: r.rows[0] || null } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/owners/:id', authMiddleware, async (req, res) => {
  try {
    const o = await pool.query('SELECT * FROM owners WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!o.rows.length) return res.status(404).json({ error: 'No se encontró el tutor' });
    const pets = await pool.query(`${PET_SELECT} WHERE p.owner_id = $1 AND p.user_id = $2 ORDER BY p.name`, [req.params.id, req.userId]);
    res.json({ data: { ...o.rows[0], pets: pets.rows } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/owners', authMiddleware, async (req, res) => {
  try {
    const { values: owner, error } = normalizeOwner(req.body || {}, { partial: false });
    if (error) return res.status(400).json({ error });
    const dup = await pool.query('SELECT id, name FROM owners WHERE user_id = $1 AND rut = $2', [req.userId, owner.rut]);
    if (dup.rows.length) return res.status(409).json({ error: `Ya existe un tutor con ese RUT (${dup.rows[0].name})`, existing_id: dup.rows[0].id });
    owner.user_id = req.userId;
    owner.organization_id = req.organizationId || null;
    const cols = Object.keys(owner);
    const result = await pool.query(
      `INSERT INTO owners (${cols.join(', ')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(', ')}) RETURNING *`,
      cols.map((c) => owner[c])
    );
    res.json({ data: { ...result.rows[0], pets: [] } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/owners/:id', authMiddleware, async (req, res) => {
  try {
    const { values: safe, error } = normalizeOwner(req.body || {}, { partial: true });
    if (error) return res.status(400).json({ error });
    if (safe.rut) {
      const dup = await pool.query('SELECT id, name FROM owners WHERE user_id = $1 AND rut = $2 AND id <> $3', [req.userId, safe.rut, req.params.id]);
      if (dup.rows.length) return res.status(409).json({ error: `Ya existe un tutor con ese RUT (${dup.rows[0].name})`, existing_id: dup.rows[0].id });
    }
    const { fields, values, idx } = buildSet(safe);
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.params.id, req.userId);
    const result = await pool.query(
      `UPDATE owners SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} AND user_id = $${idx + 1} AND anonymized_at IS NULL RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el tutor' });
    await syncOwnerCopy(req.params.id);
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Stop all communications to the tutor (their pets keep their records)
app.post('/items/owners/:id/revoke-contact', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('UPDATE owners SET contact_revoked_at = NOW(), consent_communications_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.userId]);
    if (!r.rows.length) return res.status(404).json({ error: 'No se encontró el tutor' });
    await pool.query('UPDATE pets SET receive_reminders = false WHERE owner_id = $1', [req.params.id]);
    await cancelPendingReminders('pet_id IN (SELECT id FROM pets WHERE owner_id = $1)', [req.params.id]);
    res.json({ data: r.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Data-protection request: the tutor's personal data is replaced by a placeholder. Clinical records and
// prescriptions are kept (they must be retained); nothing is hard-deleted.
app.post('/items/owners/:id/anonymize', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE owners SET name = 'Tutor anonimizado ' || left(id::text, 8), rut = NULL, phone = NULL, email = NULL, address = NULL,
         comuna = NULL, region = NULL, alt_contact_name = NULL, alt_contact_phone = NULL, notes = NULL,
         consent_communications_at = NULL, contact_revoked_at = COALESCE(contact_revoked_at, NOW()), anonymized_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`, [req.params.id, req.userId]);
    if (!r.rows.length) return res.status(404).json({ error: 'No se encontró el tutor' });
    await syncOwnerCopy(req.params.id);
    await pool.query('UPDATE pets SET receive_reminders = false WHERE owner_id = $1', [req.params.id]);
    await cancelPendingReminders('pet_id IN (SELECT id FROM pets WHERE owner_id = $1)', [req.params.id]);
    // tutor_email is NOT NULL: blank it instead
    await pool.query("UPDATE reminders SET tutor_email = '' WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = $1)", [req.params.id]);
    res.json({ data: r.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/pets', authMiddleware, async (req, res) => {
  try {
    const params = [req.userId];
    let where = 'p.user_id = $1';
    if (req.query.owner_id && isValidUUID(String(req.query.owner_id))) { params.push(req.query.owner_id); where += ' AND p.owner_id = $2'; }
    const result = await pool.query(`${PET_SELECT} WHERE ${where} ORDER BY p.name`, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`${PET_SELECT} WHERE p.id = $1 AND p.user_id = $2`, [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/pets', authMiddleware, async (req, res) => {
  try {
    const { values: pet, error } = normalizePet(req.body || {}, { partial: false });
    if (error) return res.status(400).json({ error });
    if (!pet.species) return res.status(400).json({ error: 'La especie debe ser perro, gato u otra' });
    if (!pet.owner_id) pet.owner_id = await ownerFromLegacyBody(req.body || {}, req.userId, req.organizationId, null);
    if (!pet.owner_id) return res.status(400).json({ error: 'Selecciona el tutor de la mascota' });
    const ownerRow = await pool.query('SELECT name, rut, phone, email, address FROM owners WHERE id = $1 AND user_id = $2', [pet.owner_id, req.userId]);
    if (!ownerRow.rows.length) return res.status(403).json({ error: 'No tienes acceso a ese tutor' });
    const o = ownerRow.rows[0];
    Object.assign(pet, { tutor_name: o.name, tutor_rut: o.rut, phone: o.phone, email: o.email, address: o.address });
    if (pet.weight) { pet.current_weight_kg = pet.weight; pet.current_weight_at = new Date().toISOString(); }
    delete pet.last_visit;
    pet.reproductive_status = pet.reproductive_status || 'intacto';
    pet.status = pet.status || 'alive';
    pet.allergies = pet.allergies || '[]';
    pet.temperament = pet.temperament || '[]';
    pet.user_id = req.userId;
    pet.organization_id = req.organizationId || null;
    const cols = Object.keys(pet);
    const result = await pool.query(
      `INSERT INTO pets (${cols.join(', ')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(', ')}) RETURNING *`,
      cols.map(c => pet[c])
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    let allowOther = false;
    if (req.body && req.body.species === 'other') {
      const cur = await pool.query('SELECT species FROM pets WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
      allowOther = cur.rows[0]?.species === 'other';
    }
    const { values: safe, error } = normalizePet(req.body || {}, { partial: true, allowOther });
    if (error) return res.status(400).json({ error });
    if (safe.owner_id) {
      const ok = await pool.query('SELECT 1 FROM owners WHERE id = $1 AND user_id = $2', [safe.owner_id, req.userId]);
      if (!ok.rows.length) return res.status(403).json({ error: 'No tienes acceso a ese tutor' });
    }
    if (!safe.owner_id && PET_OWNER_COPY.some((k) => k in (req.body || {}))) {
      const cur = await pool.query('SELECT owner_id FROM pets WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
      if (!cur.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
      const legacyOwner = await ownerFromLegacyBody(req.body, req.userId, req.organizationId, cur.rows[0].owner_id);
      if (legacyOwner) safe.owner_id = legacyOwner;
    }
    if (safe.status === 'deceased' && !safe.deceased_at) safe.deceased_at = new Date().toISOString();
    if (safe.status && safe.status !== 'deceased') safe.deceased_at = null;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE pets SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    if (safe.owner_id) await syncOwnerCopy(safe.owner_id);
    if (safe.status && safe.status !== 'alive') await cancelPendingReminders('pet_id = $1', [req.params.id]);
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── MEDICAL RECORDS ─────────────────────────────────────
app.get('/items/medical_records', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT mr.* FROM medical_records mr JOIN pets p ON p.id = mr.pet_id WHERE p.user_id = $1';
    const params = [req.userId];
    if (req.query.pet_id) {
      query += ' AND mr.pet_id = $2';
      params.push(req.query.pet_id);
    }
    query += ' ORDER BY mr.date DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/medical_records', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const r = req.body;
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [r.pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      `INSERT INTO medical_records (pet_id, disease_id, date, veterinarian, symptoms, diagnosis, treatment, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [r.pet_id, r.disease_id, r.date, r.veterinarian,
       JSON.stringify(r.symptoms || []), r.diagnosis, r.treatment, r.notes]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── NOTES ───────────────────────────────────────────────
app.get('/items/personal_notes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const NOTE_TITLE_MAX = 300;
const NOTE_CONTENT_MAX = 200000;
const NOTE_BLOCKS_MAX_BYTES = 1000000;

// Validates a note body. `partial` = PATCH (only the keys present are checked).
// Returns { error } or { note } with normalized values.
function normalizeNote(body, partial) {
  const note = {};
  const b = body || {};
  if (!partial || 'title' in b) {
    if (b.title != null && typeof b.title !== 'string') return { error: 'El título debe ser texto' };
    const title = (b.title || '').trim();
    if (title.length > NOTE_TITLE_MAX) return { error: `El título no puede superar ${NOTE_TITLE_MAX} caracteres` };
    note.title = title || 'Sin título';
  }
  if (!partial || 'content' in b) {
    if (b.content != null && typeof b.content !== 'string') return { error: 'El contenido debe ser texto' };
    const content = b.content || '';
    if (content.length > NOTE_CONTENT_MAX) return { error: 'La nota es demasiado larga' };
    note.content = content;
  }
  if (!partial || 'tags' in b) {
    const tags = b.tags == null ? [] : b.tags;
    if (!Array.isArray(tags) || tags.some(t => typeof t !== 'string')) return { error: 'Las etiquetas deben ser una lista de textos' };
    const clean = [...new Set(tags.map(t => t.trim()).filter(Boolean))];
    if (clean.length > 20 || clean.some(t => t.length > 40)) return { error: 'Máximo 20 etiquetas de hasta 40 caracteres' };
    note.tags = clean;
  }
  if ('blocks' in b) {
    const blocks = b.blocks;
    if (blocks !== null) {
      if (typeof blocks !== 'object' || Array.isArray(blocks) || blocks.type !== 'doc' || !Array.isArray(blocks.content)) {
        return { error: 'El documento de la nota no es válido' };
      }
      if (Buffer.byteLength(JSON.stringify(blocks)) > NOTE_BLOCKS_MAX_BYTES) return { error: 'La nota es demasiado larga' };
    }
    note.blocks = blocks;
  }
  for (const key of ['disease_id', 'pet_id']) {
    if (key in b) {
      if (b[key] != null && !isValidUUID(String(b[key]))) return { error: 'Referencia no válida' };
      note[key] = b[key] || null;
    }
  }
  return { note };
}

app.post('/items/personal_notes', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const { error, note: n } = normalizeNote(req.body, false);
    if (error) return res.status(400).json({ error });
    const result = await pool.query(
      `INSERT INTO personal_notes (title, content, tags, blocks, disease_id, pet_id, user_id, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [n.title, n.content, JSON.stringify(n.tags), n.blocks == null ? null : JSON.stringify(n.blocks),
       n.disease_id || null, n.pet_id || null, req.userId, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/personal_notes/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Identificador no válido' });
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const { error, note: safe } = normalizeNote(req.body, true);
    if (error) return res.status(400).json({ error });
    // Optional optimistic concurrency: the client sends the version it last saw
    const expected = req.body?.version;
    if (expected != null && !Number.isInteger(expected)) return res.status(400).json({ error: 'Versión no válida' });
    const { fields, values, idx } = buildSet(safe);
    fields.push(`updated_at = NOW()`, `version = version + 1`);
    values.push(req.params.id, req.userId);
    let where = `id = $${idx} AND user_id = $${idx + 1}`;
    if (expected != null) { values.push(expected); where += ` AND version = $${idx + 2}`; }
    const result = await pool.query(
      `UPDATE personal_notes SET ${fields.join(', ')} WHERE ${where} RETURNING *`, values
    );
    if (!result.rows.length) {
      if (expected != null) {
        const current = await pool.query('SELECT * FROM personal_notes WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
        if (current.rows.length) {
          return res.status(409).json({ error: 'La nota cambió en otra ventana. Se cargó la versión más reciente.', data: current.rows[0] });
        }
      }
      return res.status(404).json({ error: 'No se encontró el registro' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/personal_notes/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM personal_notes WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── FAVORITES ───────────────────────────────────────────
app.get('/items/favorites', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY added_at DESC', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/favorites', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const f = req.body;
    const result = await pool.query(
      `INSERT INTO favorites (disease_id, category, added_at, user_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [f.disease_id, f.category || 'frequently_used', f.added_at || new Date().toISOString(), req.userId]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/favorites/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── APPOINTMENTS ────────────────────────────────────────
app.get('/items/appointments', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM appointments WHERE user_id = $1';
    const params = [req.userId];
    if (req.query.start) {
      params.push(req.query.start);
      query += ` AND start_time >= $${params.length}`;
    }
    if (req.query.end) {
      params.push(req.query.end);
      query += ` AND start_time <= $${params.length}`;
    }
    query += ' ORDER BY start_time ASC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/appointments', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const a = req.body;
    if (!a.patient_name || !String(a.patient_name).trim()) return res.status(400).json({ error: 'El nombre del paciente es obligatorio' });
    const vErr = validateFields(a, {
      start_time: { type: 'datetime', required: true, label: 'Fecha de inicio' },
      end_time: { type: 'datetime', label: 'Fecha de término' },
      appointment_type: { type: 'enum', values: APPOINTMENT_TYPES, label: 'Tipo de cita' },
    });
    if (vErr || !a.start_time) return res.status(400).json({ error: vErr || 'Fecha de inicio válida es requerida' });
    if (a.end_time && new Date(a.end_time) <= new Date(a.start_time)) return res.status(400).json({ error: 'La hora de término debe ser posterior al inicio' });
    const result = await pool.query(
      `INSERT INTO appointments (user_id, patient_name, tutor_phone, start_time, end_time, appointment_type, description, organization_id, pet_id, follow_up_of, veterinarian)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.userId, a.patient_name, a.tutor_phone || null, a.start_time, a.end_time || null,
       a.appointment_type || 'consulta', a.description || null, req.organizationId || null,
       a.pet_id || null, a.follow_up_of || null, a.veterinarian || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const INVENTORY_RULES = {
  current_stock: { type: 'number', integer: true, min: 0, max: 1000000, label: 'Stock' },
  min_stock: { type: 'number', integer: true, min: 0, max: 1000000, label: 'Stock mínimo' },
  last_restocked: { type: 'datetime', label: 'Fecha de reposición' },
  expiration_date: { type: 'date', allowFuture: true, label: 'Fecha de vencimiento' },
};

const PRESCRIPTION_RULES = {
  format: { type: 'enum', values: ['standard', 'compact'], label: 'Formato' },
  status: { type: 'enum', values: ['active', 'cancelled', 'dispensed'], label: 'Estado de la receta' },
  issued_at: { type: 'datetime', label: 'Fecha de emisión' },
};

const HOSPITALIZATION_STATUSES = ['internado', 'cirugia', 'recuperacion', 'discharged'];
const LAB_STATUSES = ['pendiente', 'completado'];

const APPOINTMENT_TYPES = ['consulta', 'vacuna', 'examenes', 'cirugia', 'hospitalizacion', 'control', 'terreno'];

// Valid appointment status transitions
const APPOINTMENT_TRANSITIONS = {
  programada: ['confirmada', 'en_espera', 'cancelada', 'ausente'],
  confirmada: ['en_espera', 'cancelada', 'ausente'],
  pendiente: ['en_espera', 'cancelada', 'ausente'],
  en_espera: ['en_consulta', 'cancelada'],
  en_consulta: ['completada'],
  completada: ['programada'],
  cancelada: ['programada'],
  ausente: ['programada'],
};

function isValidTransition(from, to) {
  const allowed = APPOINTMENT_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

function getStatusTimestamps(newStatus, current) {
  const now = new Date().toISOString();
  const ts = {};
  if (newStatus === 'en_espera' && !current.checked_in_at) ts.checked_in_at = now;
  if (newStatus === 'en_consulta' && !current.started_at) ts.started_at = now;
  if (newStatus === 'completada' && !current.finished_at) ts.finished_at = now;
  return ts;
}

app.patch('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const a = req.body;
    // Lifecycle timestamps are derived from status transitions, never set by the client
    delete a.checked_in_at; delete a.started_at; delete a.finished_at;
    const vErr = validateFields(a, {
      start_time: { type: 'datetime', label: 'Fecha de inicio' },
      end_time: { type: 'datetime', label: 'Fecha de término' },
      appointment_type: { type: 'enum', values: APPOINTMENT_TYPES, label: 'Tipo de cita' },
    });
    if (vErr) return res.status(400).json({ error: vErr });
    if ('start_time' in a && !a.start_time) return res.status(400).json({ error: 'La fecha de inicio es obligatoria' });
    if ('status' in a && !a.status) return res.status(400).json({ error: 'Estado inválido' });

    // If changing status, validate transition
    if (a.status) {
      const currentResult = await pool.query(
        'SELECT status, pet_id, checked_in_at, started_at, finished_at FROM appointments WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );
      if (!currentResult.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
      const current = currentResult.rows[0];

      // Booked by phone without a chart is fine; receiving the patient is not
      if (['en_espera', 'en_consulta', 'completada'].includes(a.status) && !(a.pet_id || current.pet_id)) {
        return res.status(400).json({ error: 'Vincula la cita a un paciente (o regístralo) antes de recibirlo', code: 'PET_REQUIRED' });
      }
      if (!isValidTransition(current.status, a.status)) {
        return res.status(400).json({
          error: `Transición inválida: ${current.status} → ${a.status}`,
          valid_transitions: APPOINTMENT_TRANSITIONS[current.status] || [],
        });
      }

      // Auto-set timestamps
      const timestamps = getStatusTimestamps(a.status, current);
      for (const [key, val] of Object.entries(timestamps)) {
        a[key] = val;
      }
    }

    const allowed = ['patient_name','tutor_phone','start_time','end_time','appointment_type','description','veterinarian','status','pet_id','room','checked_in_at','started_at','finished_at'];
    const safe = sanitizeColumns(allowed, a);
    const { fields, values, idx } = buildSet(safe);
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── CLINICAL RECORDS ───────────────────────────────────
app.get('/items/clinical_records', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT cr.* FROM clinical_records cr JOIN pets p ON p.id = cr.pet_id WHERE p.user_id = $1';
    const params = [req.userId];
    if (req.query.pet_id) {
      params.push(req.query.pet_id);
      query += ` AND cr.pet_id = $${params.length}`;
    }
    if (req.query.record_type) {
      params.push(req.query.record_type);
      query += ` AND cr.record_type = $${params.length}`;
    }
    query += ' ORDER BY cr.date DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Vitals saved in details.exam: reject impossible values with a Spanish message
const EXAM_RANGES = { fc: [20, 300, 'FC'], fr: [4, 150, 'FR'], temp: [30, 45, 'T°'], tllc: [0, 10, 'TLLC'] };
function examDetailsError(details) {
  const v = details && details.exam && details.exam.vitals;
  if (!v) return null;
  for (const [k, [min, max, label]] of Object.entries(EXAM_RANGES)) {
    if (v[k] === undefined || v[k] === null || v[k] === '') continue;
    const n = Number(v[k]);
    if (!isFinite(n) || n < min || n > max) return `${label} fuera de rango (${min}–${max})`;
  }
  return null;
}

app.post('/items/clinical_records', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    if (!r.pet_id || !isValidUUID(r.pet_id)) return res.status(400).json({ error: 'Selecciona un paciente' });
    if (!r.record_type || !['consulta', 'vacuna', 'cirugia', 'control'].includes(r.record_type)) {
      return res.status(400).json({ error: 'El tipo de registro debe ser consulta, vacuna, cirugía o control' });
    }
    const vErr = validateFields(r, { date: { type: 'datetime', label: 'Fecha' } });
    if (vErr) return res.status(400).json({ error: vErr });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [r.pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const examErr = examDetailsError(r.details);
    if (examErr) return res.status(400).json({ error: examErr });
    const refError = await checkRefs({ ...req, body: { appointment_id: r.appointment_id } });
    if (refError) return res.status(403).json({ error: refError });
    const weightRaw = r.weight_kg ?? r.details?.weight;
    let weightKg = null;
    if (weightRaw !== undefined && weightRaw !== null && weightRaw !== '') {
      weightKg = parseFloat(String(weightRaw).replace(',', '.'));
      if (!isFinite(weightKg) || weightKg < 0.05 || weightKg > 150) return res.status(400).json({ error: 'El peso debe estar entre 0,05 y 150 kg' });
    }
    const result = await pool.query(
      `INSERT INTO clinical_records (pet_id, user_id, record_type, date, veterinarian, details, organization_id, weight_kg, appointment_id, is_initial)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [r.pet_id, req.userId, r.record_type || 'consulta', r.date || new Date().toISOString(),
       r.veterinarian || null, JSON.stringify(r.details || {}), req.organizationId || null,
       weightKg, r.appointment_id || null, r.is_initial === true]
    );
    if (weightKg !== null) await refreshPetWeight(r.pet_id).catch((err) => logError(req, err));
    // Auto-update pet's last_visit (non-fatal: the record is already saved)
    await pool.query(
      'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
      [r.date || new Date().toISOString(), r.pet_id]
    ).catch(err => logError(req, err));
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const r = req.body;
    const vErr = validateFields(r, {
      date: { type: 'datetime', label: 'Fecha' },
      record_type: { type: 'enum', values: ['consulta', 'vacuna', 'cirugia', 'control'], label: 'Tipo de registro' },
    });
    if (vErr) return res.status(400).json({ error: vErr });
    const examErr = examDetailsError(r.details);
    if (examErr) return res.status(400).json({ error: examErr });
    const allowed = ['pet_id','record_type','date','veterinarian','details','weight_kg','is_initial'];
    const safe = sanitizeColumns(allowed, r);
    if (safe.weight_kg !== undefined && safe.weight_kg !== null && safe.weight_kg !== '') {
      const w = parseFloat(String(safe.weight_kg).replace(',', '.'));
      if (!isFinite(w) || w < 0.05 || w > 150) return res.status(400).json({ error: 'El peso debe estar entre 0,05 y 150 kg' });
      safe.weight_kg = w;
    } else if (safe.weight_kg === '') safe.weight_kg = null;
    if ('details' in safe && safe.details == null) safe.details = {};
    const { fields, values, idx } = buildSet(safe);
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE clinical_records SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    if ('weight_kg' in safe || r.date) await refreshPetWeight(result.rows[0].pet_id).catch((err) => logError(req, err));
    // Auto-update pet's last_visit if date changed
    if (r.date) {
      const record = result.rows[0];
      await pool.query(
        'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
        [r.date, record.pet_id]
      ).catch(err => logError(req, err));
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clinical_records WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── INVENTORY ──────────────────────────────────────────
app.get('/items/inventory', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE user_id = $1 ORDER BY name', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/inventory/low-stock', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM inventory WHERE user_id = $1 AND current_stock <= min_stock ORDER BY name',
      [req.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/inventory', authMiddleware, async (req, res) => {
  try {
    const i = req.body;
    if (!i.name || !String(i.name).trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const vErr = validateFields(i, INVENTORY_RULES);
    if (vErr) return res.status(400).json({ error: vErr });
    const result = await pool.query(
      `INSERT INTO inventory (user_id, name, category, current_stock, min_stock, unit, last_restocked, expiration_date, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.userId, String(i.name).trim(), i.category || 'insumo', i.current_stock ?? 0, i.min_stock ?? 5,
       i.unit || 'unidades', i.last_restocked || null, i.expiration_date || null, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const i = req.body;
    const vErr = validateFields(i, INVENTORY_RULES);
    if (vErr) return res.status(400).json({ error: vErr });
    if ('name' in i && !String(i.name || '').trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const allowed = ['name','category','current_stock','min_stock','unit','last_restocked','expiration_date'];
    const safe = sanitizeColumns(allowed, i);
    const { fields, values, idx } = buildSet(safe);
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE inventory SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PRESCRIPTIONS ─────────────────────────────────────
app.get('/items/prescriptions', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT pr.* FROM prescriptions pr JOIN pets p ON p.id = pr.pet_id WHERE p.user_id = $1';
    const params = [req.userId];
    if (req.query.pet_id) {
      params.push(req.query.pet_id);
      query += ` AND pr.pet_id = $${params.length}`;
    }
    query += ' ORDER BY pr.issued_at DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT pr.* FROM prescriptions pr JOIN pets p ON p.id = pr.pet_id WHERE pr.id = $1 AND p.user_id = $2',
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/prescriptions', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const r = req.body;
    if (!r.pet_id) return res.status(400).json({ error: 'Selecciona un paciente' });
    if (!r.prescription_body || !String(r.prescription_body).trim()) return res.status(400).json({ error: 'El contenido de la receta es obligatorio' });
    const vErr = validateFields(r, PRESCRIPTION_RULES);
    if (vErr) return res.status(400).json({ error: vErr });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [r.pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      `INSERT INTO prescriptions (pet_id, user_id, clinical_record_id, veterinarian_name, clinic_branch, prescription_body, format, status, issued_at, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [r.pet_id, req.userId, r.clinical_record_id || null,
       r.veterinarian_name || null, r.clinic_branch || 'Casa Matriz',
       r.prescription_body, r.format || 'standard', r.status || 'active',
       r.issued_at || new Date().toISOString(), req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const r = req.body;
    const vErr = validateFields(r, PRESCRIPTION_RULES);
    if (vErr) return res.status(400).json({ error: vErr });
    if ('prescription_body' in r && !String(r.prescription_body || '').trim()) return res.status(400).json({ error: 'El contenido de la receta es obligatorio' });
    const allowed = ['pet_id','clinical_record_id','veterinarian_name','clinic_branch','prescription_body','format','status','issued_at'];
    const safe = sanitizeColumns(allowed, r);
    const { fields, values, idx } = buildSet(safe);
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM prescriptions WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PRESCRIPTION EMAIL ───────────────────────────────
app.post('/items/prescriptions/:id/email', authMiddleware, async (req, res) => {
  try {
    if (!await rateLimit(`email:${req.userId}`, 10, 3600000)) {
      return res.status(429).json({ error: 'Límite de emails alcanzado (máx 10 por hora)' });
    }
    const result = await pool.query(
      `SELECT pr.*, p.name AS pet_name, p.species, p.breed, p.weight, p.sex,
              p.tutor_name, p.tutor_rut, p.email AS tutor_email, p.phone AS tutor_phone,
              p.birth_date, p.reproductive_status
       FROM prescriptions pr
       JOIN pets p ON p.id = pr.pet_id
       WHERE pr.id = $1 AND pr.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Receta no encontrada' });

    const rx = result.rows[0];
    // The vet may send to another address (e.g. a family member): it's their own patient and the route is rate-limited
    const requestedTo = typeof req.body?.to === 'string' ? req.body.to.trim() : '';
    if (requestedTo && !isEmail(requestedTo)) return res.status(400).json({ error: 'Correo del destinatario inválido' });
    // Separate from rx.tutor_email: the PDF and the email body still show the tutor's own address
    const recipient = requestedTo || rx.tutor_email;
    if (!recipient) return res.status(400).json({ error: 'El tutor no tiene correo electrónico registrado' });
    // Addresses other than the tutor's are allowed (a family member), but a fresh trial account must not be
    // able to use the clinic mailer as a relay: a much tighter daily budget for them.
    const toOtherAddress = recipient.toLowerCase() !== String(rx.tutor_email || '').trim().toLowerCase();
    if (toOtherAddress && !await rateLimit(`email-other:${req.userId}`, 3, 86400000)) {
      return res.status(429).json({ error: 'Límite alcanzado: máximo 3 recetas al día a correos distintos del registrado para el tutor' });
    }

    const nodemailer = require('nodemailer');
    const { generatePrescriptionPdf } = require('./utils/generatePrescriptionPdf');

    const userResult = await pool.query(
      'SELECT email, clinic_name, veterinarian_name, clinic_phone, clinic_address, professional_rut, professional_title, professional_university, signature_png, stamp_png FROM users WHERE id = $1',
      [req.userId]
    );
    const userProfile = userResult.rows[0] || {};

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return res.status(400).json({ error: 'SMTP no configurado en el servidor' });
    }

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    });

    const speciesLabel = rx.species === 'dog' ? 'Canino' : 'Felino';
    const sexLabel = rx.sex === 'macho' ? 'Macho' : rx.sex === 'hembra' ? 'Hembra' : 'N/D';
    let age = 'N/D';
    if (rx.birth_date) {
      const bd = new Date(rx.birth_date);
      if (!isNaN(bd.getTime())) {
        const yrs = Math.floor((Date.now() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        age = `${yrs} año${yrs !== 1 ? 's' : ''}`;
      }
    }

    const vetEmail = userProfile.email || process.env.SMTP_EMAIL;

    const pdfBuffer = await generatePrescriptionPdf(
      { ...rx, veterinarian_name: rx.veterinarian_name || userProfile.veterinarian_name, vet_email: vetEmail },
      { name: rx.pet_name, species: rx.species, breed: rx.breed, weight: rx.weight, sex: rx.sex, birth_date: rx.birth_date, reproductive_status: rx.reproductive_status, tutor_name: rx.tutor_name, tutor_email: rx.tutor_email, tutor_phone: rx.tutor_phone, tutor_rut: rx.tutor_rut, id: rx.pet_id },
      { veterinarian_name: userProfile.veterinarian_name, clinic_name: userProfile.clinic_name, clinic_phone: userProfile.clinic_phone, clinic_address: userProfile.clinic_address, professional_rut: userProfile.professional_rut, professional_title: userProfile.professional_title, professional_university: userProfile.professional_university, signature_png: userProfile.signature_png, stamp_png: userProfile.stamp_png, vet_email: vetEmail }
    );


    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #141C33; background: #F5F2EA;">
  <div style="background: #0B1D3A; border-bottom: 3px solid #A8842A; color: #F3EFE4; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif;">${escapeHtml(userProfile.clinic_name || 'Vet Avalon')}</h1>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Receta veterinaria</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
      <div style="flex: 1; background: #F5F2EA; padding: 16px; border-radius: 8px; border-left: 4px solid #A8842A;">
        <h3 style="margin: 0 0 8px; color: #12264D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5;">Paciente</h3>
        <p style="margin: 0; font-size: 16px; font-weight: 700;">${escapeHtml(rx.pet_name)}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #4E586F;">${speciesLabel} — ${escapeHtml(rx.breed || 'N/D')}</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #4E586F;">Edad: ${age} | Sexo: ${sexLabel} | Peso: ${escapeHtml(rx.weight || 'N/D')} kg</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #4E586F;">Estado reproductivo: ${escapeHtml(rx.reproductive_status || 'N/D')}</p>
      </div>
      <div style="flex: 1; background: #F3E5F5; padding: 16px; border-radius: 8px; border-left: 4px solid #6741D9;">
        <h3 style="margin: 0 0 8px; color: #6741D9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5;">Propietario</h3>
        <p style="margin: 0; font-size: 16px; font-weight: 700;">${escapeHtml(rx.tutor_name || 'N/D')}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #4E586F;">${escapeHtml(rx.tutor_email)}</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #4E586F;">${escapeHtml(rx.tutor_phone || '')}</p>
      </div>
    </div>
    <div style="display: flex; gap: 16px; font-size: 13px; color: #4E586F; margin-bottom: 20px; padding: 12px; background: #FFFDF8; border-radius: 8px;">
      <span><strong>Sucursal:</strong> ${escapeHtml(rx.clinic_branch || userProfile.clinic_name || 'N/D')}</span>
      <span><strong>Prescriptor:</strong> ${escapeHtml(rx.veterinarian_name || userProfile.veterinarian_name || 'N/D')}</span>
      <span><strong>Fecha:</strong> ${new Date(rx.issued_at).toLocaleDateString('es-CL')}</span>
    </div>
    <div style="background: #FAFAFA; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h3 style="margin: 0 0 12px; color: #12264D; font-size: 14px; font-weight: 700;">Receta</h3>
      <div style="white-space: pre-wrap; line-height: 1.8; font-size: 14px;">${escapeHtml(rx.prescription_body).replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #999; background: #fff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 6px;">Para consultas, responda a este correo o escriba a <strong style="color: #12264D;">${escapeHtml(vetEmail)}</strong></p>
    <p style="margin: 0;">Documento electrónico generado por <strong style="color: #12264D;">Vet Avalon</strong></p>
  </div>
</body>
</html>`;

    const issuedDate = new Date(rx.issued_at).toLocaleDateString('es-CL');
    const attachments = pdfBuffer ? [{
      filename: `receta_${rx.pet_name.replace(/\s+/g, '_')}_${issuedDate.replace(/\//g, '-')}.pdf`,
      content: pdfBuffer,
    }] : [];

    await transporter.sendMail({
      from: `"Vet Avalon" <${process.env.SMTP_EMAIL}>`,
      to: recipient,
      replyTo: vetEmail,
      subject: `Receta veterinaria — ${rx.pet_name} — ${issuedDate}`,
      html: htmlBody,
      attachments,
    });

    res.json({ data: { success: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PRESCRIPTION PDF DOWNLOAD ──────────────────────────
app.get('/items/pets/:petId/prescriptions/:rxId/pdf', authMiddleware, async (req, res) => {
  try {
    const { petId, rxId } = req.params;
    if (!petId || !rxId) return res.status(400).json({ error: 'IDs requeridos' });

    const rxResult = await pool.query(
      'SELECT * FROM prescriptions WHERE id = $1 AND pet_id = $2 AND user_id = $3',
      [rxId, petId, req.userId]
    );
    if (!rxResult.rows.length) return res.status(404).json({ error: 'Receta no encontrada' });
    const rx = rxResult.rows[0];

    const petResult = await pool.query('SELECT * FROM pets WHERE id = $1 AND user_id = $2', [petId, req.userId]);
    if (!petResult.rows.length) return res.status(404).json({ error: 'Paciente no encontrado' });
    const pet = petResult.rows[0];

    const userResult = await pool.query(
      'SELECT email, clinic_name, veterinarian_name, clinic_phone, clinic_address, professional_rut, professional_title, professional_university, signature_png, stamp_png FROM users WHERE id = $1',
      [req.userId]
    );
    const userProfile = userResult.rows[0] || {};

    const { generatePrescriptionPdf } = require('./utils/generatePrescriptionPdf');
    const pdfBuffer = await generatePrescriptionPdf(
      { ...rx, veterinarian_name: rx.veterinarian_name || userProfile.veterinarian_name, vet_email: userProfile.email },
      { name: pet.name, species: pet.species, breed: pet.breed, weight: pet.weight, sex: pet.sex, birth_date: pet.birth_date, reproductive_status: pet.reproductive_status, tutor_name: pet.tutor_name, tutor_email: pet.email, tutor_phone: pet.phone, tutor_rut: pet.tutor_rut, id: pet.id },
      { veterinarian_name: userProfile.veterinarian_name, clinic_name: userProfile.clinic_name, clinic_phone: userProfile.clinic_phone, clinic_address: userProfile.clinic_address, professional_rut: userProfile.professional_rut, professional_title: userProfile.professional_title, professional_university: userProfile.professional_university, signature_png: userProfile.signature_png, stamp_png: userProfile.stamp_png, vet_email: userProfile.email }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.attachment(`receta_${String(pet.name || 'paciente').replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PATIENT FILE PDF ──────────────────────────────────
app.get('/items/pets/:id/file-pdf', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') return res.status(400).json({ error: 'ID requerido' });

    const petResult = await pool.query('SELECT * FROM pets WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (!petResult.rows.length) return res.status(404).json({ error: 'Paciente no encontrado' });
    const pet = petResult.rows[0];

    const recordsResult = await pool.query(
      'SELECT * FROM clinical_records WHERE pet_id = $1 AND user_id = $2 ORDER BY date DESC',
      [id, req.userId]
    );

    const userResult = await pool.query(
      'SELECT clinic_name, veterinarian_name, clinic_phone, clinic_address FROM users WHERE id = $1',
      [req.userId]
    );
    const userProfile = userResult.rows[0] || {};

    const { generatePatientFilePdf } = require('./utils/generatePatientFilePdf');
    const pdfBuffer = await generatePatientFilePdf(pet, recordsResult.rows, userProfile);

    res.setHeader('Content-Type', 'application/pdf');
    res.attachment(`ficha_${String(pet.name || 'paciente').replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── VISIT SUMMARY AND VACCINE CERTIFICATE ─────────────
async function clinicProfile(userId) {
  const r = await pool.query('SELECT email AS vet_email, clinic_name, veterinarian_name, clinic_phone, clinic_address, professional_rut, professional_title, professional_university, signature_png, stamp_png FROM users WHERE id = $1', [userId]);
  return r.rows[0] || {};
}
async function petWithOwner(petId, userId) {
  const r = await pool.query(
    `SELECT p.*, row_to_json(o) AS owner FROM pets p LEFT JOIN owners o ON o.id = p.owner_id WHERE p.id = $1 AND p.user_id = $2`, [petId, userId]);
  return r.rows[0] || null;
}

async function visitSummaryData(recordId, userId) {
  const rec = await pool.query('SELECT * FROM clinical_records WHERE id = $1 AND user_id = $2', [recordId, userId]);
  if (!rec.rows.length) return null;
  const record = rec.rows[0];
  const pet = await petWithOwner(record.pet_id, userId);
  if (!pet) return null;
  const [rx, doses, upcoming, clinic] = await Promise.all([
    pool.query('SELECT * FROM prescriptions WHERE clinical_record_id = $1 AND user_id = $2 ORDER BY issued_at', [recordId, userId]),
    pool.query('SELECT * FROM vaccinations WHERE clinical_record_id = $1 AND user_id = $2 ORDER BY applied_at', [recordId, userId]),
    pool.query(
      `SELECT start_time, appointment_type FROM appointments
       WHERE pet_id = $1 AND user_id = $2 AND start_time > GREATEST(NOW(), $3::timestamptz) AND status NOT IN ('cancelada', 'completada', 'ausente')
       ORDER BY start_time LIMIT 3`, [record.pet_id, userId, record.date]),
    clinicProfile(userId),
  ]);
  return { record, pet, owner: pet.owner, prescriptions: rx.rows, doses: doses.rows, upcoming: upcoming.rows, clinic };
}

const fileSafe = (s) => String(s || 'paciente').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_');

app.get('/items/clinical_records/:id/summary-pdf', authMiddleware, async (req, res) => {
  try {
    const data = await visitSummaryData(req.params.id, req.userId);
    if (!data) return res.status(404).json({ error: 'Atención no encontrada' });
    const { generateVisitSummaryPdf } = require('./utils/generateVisitSummaryPdf');
    const pdf = await generateVisitSummaryPdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.attachment(`resumen_${fileSafe(data.pet.name)}_${new Date(data.record.date).toISOString().slice(0, 10)}.pdf`);
    res.send(pdf);
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Only to the tutor's own address, and only while the tutor accepts communications
app.post('/items/clinical_records/:id/summary-email', authMiddleware, async (req, res) => {
  try {
    const data = await visitSummaryData(req.params.id, req.userId);
    if (!data) return res.status(404).json({ error: 'Atención no encontrada' });
    const owner = data.owner || {};
    if (owner.anonymized_at || owner.contact_revoked_at) return res.status(400).json({ error: 'El tutor revocó las comunicaciones de la clínica' });
    const to = owner.email || data.pet.email;
    if (!to || !isEmail(to)) return res.status(400).json({ error: 'El tutor no tiene correo registrado' });
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) return res.status(400).json({ error: 'SMTP no configurado en el servidor' });
    if (!await rateLimit(`summary-email:${req.userId}`, 60, 3600000)) return res.status(429).json({ error: 'Demasiados envíos en la última hora' });

    const { generateVisitSummaryPdf } = require('./utils/generateVisitSummaryPdf');
    const pdf = await generateVisitSummaryPdf(data);
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({ service: process.env.SMTP_SERVICE || 'gmail', auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD } });
    const clinicName = data.clinic.clinic_name || 'Vet Avalon';
    const when = new Date(data.record.date).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color: #141C33; background: #F5F2EA;">
  <div style="background: #0B1D3A; border-bottom: 3px solid #A8842A; color: #F3EFE4; padding: 22px 24px;">
    <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif;">${escapeHtml(clinicName)}</h1>
  </div>
  <div style="background: #FFFDF8; padding: 24px; font-size: 15px; line-height: 1.6;">
    <p style="margin: 0 0 12px;">Hola ${escapeHtml(owner.name || data.pet.tutor_name || '')}:</p>
    <p style="margin: 0 0 12px;">Adjuntamos el resumen de la atención de <strong>${escapeHtml(data.pet.name)}</strong> del ${when}, con las indicaciones y las próximas fechas.</p>
    <p style="margin: 0;">Si tiene dudas, responda este correo.</p>
  </div>
  <p style="text-align: center; font-size: 11px; color: #4E586F;">Enviado con Vet Avalon</p>
</body></html>`;
    await transporter.sendMail({
      from: `"${clinicName.replace(/"/g, '')}" <${process.env.SMTP_EMAIL}>`,
      to,
      replyTo: data.clinic.vet_email || process.env.SMTP_EMAIL,
      subject: `Resumen de la atención de ${data.pet.name} — ${when}`,
      html,
      attachments: [{ filename: `resumen_${fileSafe(data.pet.name)}.pdf`, content: pdf }],
    });
    res.json({ data: { success: true, to } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/pets/:id/vaccine-certificate', authMiddleware, async (req, res) => {
  try {
    const pet = await petWithOwner(req.params.id, req.userId);
    if (!pet) return res.status(404).json({ error: 'Paciente no encontrado' });
    const [vac, clinic] = await Promise.all([
      pool.query('SELECT * FROM vaccinations WHERE pet_id = $1 AND user_id = $2', [req.params.id, req.userId]),
      clinicProfile(req.userId),
    ]);
    const { generateVaccineCertificatePdf } = require('./utils/generateVaccineCertificatePdf');
    const pdf = await generateVaccineCertificatePdf({ pet, owner: pet.owner, vaccinations: vac.rows, clinic });
    res.setHeader('Content-Type', 'application/pdf');
    res.attachment(`certificado_vacunas_${fileSafe(pet.name)}.pdf`);
    res.send(pdf);
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── VET ASSISTANT ──────────────────────────────────────
app.post('/assistant', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Mensaje requerido' });

    // Load diseases from DB
    const diseasesResult = await pool.query('SELECT * FROM diseases WHERE organization_id IS NULL OR organization_id = $1', [req.organizationId || -1]);
    const diseases = diseasesResult.rows;

    // Inline vaccination protocols
    const vaccinations = {
      dog: [
        { name: 'DHPPi (Moquillo, Hepatitis, Parvovirus, Parainfluenza, Adenovirus)', schedule: [{ age: '6-8 semanas', dose: 1 }, { age: '10-12 semanas', dose: 2 }, { age: '14-16 semanas', dose: 3 }, { age: '12-16 meses', dose: 'Refuerzo' }, { age: 'Cada 1-3 años', dose: 'Refuerzo anual' }] },
        { name: 'Leptospirosis', schedule: [{ age: '12 semanas', dose: 1 }, { age: '16 semanas', dose: 2 }, { age: 'Anual', dose: 'Refuerzo' }] },
        { name: 'Rabia', schedule: [{ age: '12-16 semanas', dose: 1 }, { age: '12-16 meses', dose: 'Refuerzo' }, { age: 'Anual o trienal', dose: 'Refuerzo según legislación' }] },
        { name: 'Bordetella (Tos de las perreras)', schedule: [{ age: '8 semanas+', dose: '1 (si riesgo)' }, { age: 'Anual o semestral', dose: 'Refuerzo si necesidad' }] },
      ],
      cat: [
        { name: 'FVRCP (Rinotraqueítis, Calicivirus, Panleucopenia)', schedule: [{ age: '8-9 semanas', dose: 1 }, { age: '12 semanas', dose: 2 }, { age: '16 semanas', dose: 3 }, { age: '12-16 meses', dose: 'Refuerzo' }, { age: 'Cada 3 años', dose: 'Refuerzo' }] },
        { name: 'FeLV (Leucemia Felina)', schedule: [{ age: '8-9 semanas', dose: 1 }, { age: '12 semanas', dose: '2 (refuerzo)' }, { age: 'Anual', dose: 'Refuerzo si riesgo' }] },
        { name: 'Rabia', schedule: [{ age: '12-16 semanas', dose: 1 }, { age: '12-16 meses', dose: 'Refuerzo' }, { age: 'Anual o trienal', dose: 'Refuerzo según legislación' }] },
      ],
    };

    const { detectIntent, processAssistantMessage } = require('./utils/assistantEngine');
    const response = await processAssistantMessage(message.trim(), req.userId, pool, diseases, vaccinations);
    res.json({ data: response });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── REMINDERS ──────────────────────────────────────────
app.get('/items/reminders', authMiddleware, async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;
    let query = 'SELECT r.*, p.name AS pet_name, p.species, p.breed FROM reminders r JOIN pets p ON p.id = r.pet_id WHERE r.user_id = $1';
    const params = [req.userId];
    let idx = 2;
    if (status) { query += ` AND r.status = $${idx++}`; params.push(status); }
    if (type) { query += ` AND r.reminder_type = $${idx++}`; params.push(type); }
    if (upcoming === 'true') { query += ` AND r.scheduled_for >= NOW() AND r.status = 'pending'`; }
    query += ' ORDER BY r.scheduled_for ASC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/reminders/upcoming', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.name AS pet_name, p.species, p.breed
       FROM reminders r JOIN pets p ON p.id = r.pet_id
       WHERE r.user_id = $1 AND r.scheduled_for >= NOW() AND r.status = 'pending'
       ORDER BY r.scheduled_for ASC LIMIT 10`,
      [req.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/reminders', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const { pet_id, reminder_type, title, message, scheduled_for } = req.body || {};
    if (!pet_id || !reminder_type || !title || !message || !scheduled_for) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (!REMINDER_TYPES.includes(reminder_type)) return res.status(400).json({ error: 'Tipo de recordatorio inválido' });
    const when = new Date(scheduled_for);
    if (Number.isNaN(when.getTime())) return res.status(400).json({ error: 'Fecha del recordatorio inválida' });
    // The recipient always comes from the patient record, never from the request,
    // so the clinic's mailbox can't be used to email arbitrary addresses.
    const petCheck = await pool.query('SELECT email FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!petCheck.rows.length) return res.status(403).json({ error: 'No autorizado' });
    const tutorEmail = petCheck.rows[0].email;
    if (!isEmail(tutorEmail)) {
      return res.status(400).json({ error: 'El paciente no tiene un email de tutor válido' });
    }
    const result = await pool.query(
      `INSERT INTO reminders (user_id, pet_id, tutor_email, reminder_type, title, message, scheduled_for, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, pet_id, tutorEmail, reminder_type, String(title).slice(0, 200), String(message).slice(0, 2000), when.toISOString(), req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/reminders/auto-generate', authMiddleware, async (req, res) => {
  try {
    const { pet_id } = req.body;
    if (!pet_id) return res.status(400).json({ error: 'Selecciona un paciente' });
    const petCheck = await pool.query(
      'SELECT id, name, species, breed, birth_date, email, receive_reminders, status FROM pets WHERE id = $1 AND user_id = $2',
      [pet_id, req.userId]
    );
    if (!petCheck.rows.length) return res.status(403).json({ error: 'No autorizado' });
    const pet = petCheck.rows[0];
    if (pet.status !== 'alive') return res.status(400).json({ error: 'La mascota no está activa: no se generan recordatorios' });
    if (!pet.receive_reminders) return res.status(400).json({ error: 'El tutor no desea recibir recordatorios' });
    if (!pet.email) return res.status(400).json({ error: 'El tutor no tiene email registrado' });

    // Latest dose of each vaccine or deworming; a dose without a next date is due a year after it was applied
    const latest = await pool.query(
      `SELECT DISTINCT ON (kind, coalesce(plan_item, ''), lower(coalesce(product, '')))
              id, pet_id, kind, plan_item, product, clinical_record_id,
              to_char(coalesce(next_due_at, applied_at + interval '1 year'), 'YYYY-MM-DD') AS next_due_at
       FROM vaccinations WHERE pet_id = $1 AND user_id = $2
       ORDER BY kind, coalesce(plan_item, ''), lower(coalesce(product, '')), applied_at DESC, created_at DESC`,
      [pet_id, req.userId]
    );
    const today = new Date().toISOString().slice(0, 10);
    const reminders = [];
    for (const vac of latest.rows) {
      if (vac.next_due_at <= today) continue;
      const existing = await pool.query(
        `SELECT 1 FROM reminders WHERE vaccination_id = $1 AND status IN ('pending', 'sending', 'sent')`, [vac.id]);
      if (existing.rows.length) continue;
      const created = await scheduleVaccinationReminder(vac, req.userId, req.organizationId);
      if (created) reminders.push(created);
    }
    res.json({ data: reminders });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/reminders/:id', authMiddleware, async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM reminders WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!check.rows.length) return res.status(404).json({ error: 'Recordatorio no encontrado' });
    const vErr = validateFields(req.body, {
      status: { type: 'enum', values: ['pending', 'sent', 'cancelled'], label: 'Estado' },
      scheduled_for: { type: 'datetime', label: 'Fecha del recordatorio' },
    });
    if (vErr) return res.status(400).json({ error: vErr });
    const { status, scheduled_for } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;
    if (status) { updates.push(`status = $${idx++}`); params.push(status); }
    if (scheduled_for) { updates.push(`scheduled_for = $${idx++}`); params.push(scheduled_for); }
    if (status === 'sent') { updates.push(`sent_at = NOW()`); }
    if (!updates.length) return res.status(400).json({ error: 'Sin cambios' });
    params.push(req.params.id);
    params.push(req.userId);
    const result = await pool.query(`UPDATE reminders SET ${updates.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, params);
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/reminders/:id', authMiddleware, async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM reminders WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!check.rows.length) return res.status(404).json({ error: 'Recordatorio no encontrado' });
    await pool.query('DELETE FROM reminders WHERE id = $1', [req.params.id]);
    res.json({ data: { success: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/reminders/send-pending', authMiddleware, async (req, res) => {
  try {
    if (!await rateLimit(`email:${req.userId}`, 10, 3600000)) {
      return res.status(429).json({ error: 'Límite de emails alcanzado (máx 10 por hora)' });
    }
    const nodemailer = require('nodemailer');
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return res.status(400).json({ error: 'SMTP no configurado' });
    }
    // Claim at most 20 due reminders by flipping them to 'sending' first: a timeout
    // mid-batch can't resend the ones already delivered. While 'sending', sent_at holds
    // the claim time, so a batch cut off by a timeout is retried after 15 minutes.
    const result = await pool.query(
      `WITH due AS (
         SELECT r.id FROM reminders r
         JOIN pets pp ON pp.id = r.pet_id
         LEFT JOIN owners oo ON oo.id = pp.owner_id
         WHERE r.user_id = $1 AND r.scheduled_for <= NOW()
           AND pp.status = 'alive' AND oo.contact_revoked_at IS NULL AND oo.anonymized_at IS NULL
           AND (r.status = 'pending' OR (r.status = 'sending' AND r.sent_at < NOW() - INTERVAL '15 minutes'))
         ORDER BY r.scheduled_for LIMIT 20 FOR UPDATE SKIP LOCKED
       )
       UPDATE reminders r SET status = 'sending', sent_at = NOW() FROM due, pets p
       WHERE r.id = due.id AND p.id = r.pet_id
       RETURNING r.*, p.name AS pet_name, p.species, p.breed, p.email AS pet_email`,
      [req.userId]
    );
    if (!result.rows.length) return res.json({ data: { sent: 0 } });
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    });

    const userResult = await pool.query(
      'SELECT clinic_name, veterinarian_name, clinic_phone FROM users WHERE id = $1',
      [req.userId]
    );
    const userProfile = userResult.rows[0] || {};

    let sentCount = 0;
    for (const reminder of result.rows) {
      try {
        const speciesLabel = reminder.species === 'dog' ? 'Canino' : 'Felino';
        const htmlBody = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #141C33;">
  <div style="background: #0B1D3A; border-bottom: 3px solid #A8842A; color: #F3EFE4; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif;">${escapeHtml(userProfile.clinic_name || 'Vet Avalon')}</h1>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Recordatorio</p>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="background: #F5F2EA; padding: 16px; border-radius: 8px; border-left: 4px solid #A8842A; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px; color: #12264D; font-size: 12px; text-transform: uppercase;">Paciente</h3>
      <p style="margin: 0; font-size: 18px; font-weight: 700;">${escapeHtml(reminder.pet_name)}</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #4E586F;">${speciesLabel} — ${escapeHtml(reminder.breed || 'N/D')}</p>
    </div>
    <div style="background: #FAFAFA; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h3 style="margin: 0 0 8px; color: #141C33; font-size: 14px;">${escapeHtml(reminder.title)}</h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.6;">${escapeHtml(reminder.message)}</p>
      <p style="margin: 12px 0 0; font-size: 13px; color: #999;">Fecha: ${new Date(reminder.scheduled_for).toLocaleDateString('es-CL')}</p>
    </div>
  </div>
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #999; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0;">Para cancelar este recordatorio, responda a este correo.</p>
    <p style="margin: 4px 0 0;">Documento generado por <strong style="color: #12264D;">Vet Avalon</strong></p>
  </div>
</body></html>`;

        const to = reminder.pet_email;
        if (!isEmail(to)) {
          // Permanent: retrying would put it first in every batch and starve newer reminders
          await pool.query(`UPDATE reminders SET status = 'cancelled', sent_at = NULL WHERE id = $1`, [reminder.id]);
          continue;
        }
        await transporter.sendMail({
          from: `"Vet Avalon" <${process.env.SMTP_EMAIL}>`,
          to,
          subject: `Recordatorio: ${reminder.title}`,
          html: htmlBody,
        });
        await pool.query(`UPDATE reminders SET status = 'sent', sent_at = NOW() WHERE id = $1`, [reminder.id]);
        sentCount++;
      } catch (e) {
        console.error(`Failed to send reminder ${reminder.id}:`, e.message);
        await pool.query(`UPDATE reminders SET status = 'pending', sent_at = NULL WHERE id = $1`, [reminder.id]).catch(() => {});
      }
    }
    res.json({ data: { sent: sentCount } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── HOSPITALIZATIONS ──────────────────────────────────
app.get('/items/hospitalizations', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT h.*, p.name as pet_name, p.species, p.breed FROM hospitalizations h LEFT JOIN pets p ON h.pet_id = p.id WHERE h.user_id = $1';
    const params = [req.userId];
    if (status && status !== 'todos') {
      query += ' AND h.status = $2';
      params.push(status);
    }
    query += ' ORDER BY h.admission_date DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/hospitalizations', authMiddleware, async (req, res) => {
  try {
    const { pet_id, reason, status, veterinarian, notes } = req.body;
    if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'Selecciona un paciente' });
    if (!reason || !String(reason).trim()) return res.status(400).json({ error: 'El motivo es obligatorio' });
    if (status && !HOSPITALIZATION_STATUSES.includes(status)) return res.status(400).json({ error: 'Estado de hospitalización inválido' });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      'INSERT INTO hospitalizations (pet_id, user_id, reason, status, veterinarian, notes, organization_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [pet_id, req.userId, reason, status || 'internado', veterinarian || null, notes || null, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/hospitalizations/:id', authMiddleware, async (req, res) => {
  try {
    const allowed = ['discharge_date', 'status', 'veterinarian', 'notes', 'reason'];
    const safe = sanitizeColumns(allowed, req.body);
    const vErr = validateFields(safe, {
      status: { type: 'enum', values: HOSPITALIZATION_STATUSES, label: 'Estado' },
      discharge_date: { type: 'datetime', label: 'Fecha de alta' },
    });
    if (vErr) return res.status(400).json({ error: vErr });
    // Discharging stamps the date server-side unless one was given
    if (safe.status === 'discharged' && !safe.discharge_date) safe.discharge_date = new Date().toISOString();
    if (Object.keys(safe).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const sets = Object.keys(safe).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(safe), req.userId];
    const result = await pool.query(`UPDATE hospitalizations SET ${sets} WHERE id = $1 AND user_id = $${values.length} RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    if (safe.status === 'discharged') await createDischargeNotice(req, result.rows[0]);
    res.json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/hospitalizations/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM hospitalizations WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: { success: true } });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── HOSPITAL SHEET ────────────────────────────────────
// The treatment sheet of one hospitalization: rows (treatments) with a frequency, and what was done
// at each scheduled time (tasks). Scheduled times are computed by the client from start_at and
// frequency_hours; only what actually happened is stored (migration 035).
const HOSPITAL_TREATMENT_KINDS = ['medicacion', 'fluidos', 'constante', 'alimentacion', 'cuidado'];
const HOSPITAL_FREQUENCIES = [1, 2, 3, 4, 6, 8, 12, 24];

app.get('/items/hospitalizations/:id/sheet', authMiddleware, async (req, res) => {
  try {
    const h = await pool.query(
      `SELECT h.id, h.pet_id, h.admission_date, h.discharge_date, h.reason, h.status, h.veterinarian, h.notes,
              p.name AS pet_name, p.species, p.species_other, p.breed, p.birth_date, p.sex, p.allergies, p.alerts, p.current_weight_kg
       FROM hospitalizations h JOIN pets p ON p.id = h.pet_id
       WHERE h.id = $1 AND h.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (!h.rows.length) return res.status(404).json({ error: 'No se encontró la hospitalización' });
    const [treatments, tasks] = await Promise.all([
      pool.query('SELECT * FROM hospital_treatments WHERE hospitalization_id = $1 AND user_id = $2 ORDER BY sort_order, created_at', [req.params.id, req.userId]),
      pool.query(
        `SELECT t.* FROM hospital_tasks t JOIN hospital_treatments tr ON tr.id = t.treatment_id
         WHERE tr.hospitalization_id = $1 AND t.user_id = $2 ORDER BY t.scheduled_for`,
        [req.params.id, req.userId]
      ),
    ]);
    res.json({ data: { hospitalization: h.rows[0], treatments: treatments.rows, tasks: tasks.rows } });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/hospitalizations/:id/treatments', authMiddleware, async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Escribe el nombre del tratamiento' });
    if (name.length > 200) return res.status(400).json({ error: 'El nombre no puede superar 200 caracteres' });
    const kind = b.kind || 'medicacion';
    if (!HOSPITAL_TREATMENT_KINDS.includes(kind)) return res.status(400).json({ error: 'Tipo de tratamiento inválido' });
    const frequency = parseNumberInput(b.frequency_hours, { integer: true });
    if (frequency === undefined || (frequency !== null && !HOSPITAL_FREQUENCIES.includes(frequency))) {
      return res.status(400).json({ error: 'La frecuencia debe ser cada 1, 2, 3, 4, 6, 8, 12 o 24 horas' });
    }
    const startAt = parseDateTimeInput(b.start_at);
    if (startAt === undefined) return res.status(400).json({ error: 'Hora de inicio inválida' });
    const hosp = await pool.query('SELECT status FROM hospitalizations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!hosp.rows.length) return res.status(404).json({ error: 'No se encontró la hospitalización' });
    if (hosp.rows[0].status === 'discharged') return res.status(400).json({ error: 'El paciente ya fue dado de alta: la hoja está cerrada' });
    const result = await pool.query(
      `INSERT INTO hospital_treatments (hospitalization_id, user_id, organization_id, kind, name, instructions, unit, frequency_hours, start_at, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, now()),
               (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM hospital_treatments WHERE hospitalization_id = $1))
       RETURNING *`,
      [req.params.id, req.userId, req.organizationId || null, kind, name,
       String(b.instructions || '').trim().slice(0, 2000) || null, String(b.unit || '').trim().slice(0, 20) || null, frequency, startAt]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/hospital_treatments/:id', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name', 'instructions', 'unit', 'frequency_hours', 'discontinued_at'];
    const safe = sanitizeColumns(allowed, req.body);
    const vErr = validateFields(safe, {
      frequency_hours: { type: 'number', integer: true, min: 1, max: 24, label: 'Frecuencia' },
      discontinued_at: { type: 'datetime', label: 'Fecha de suspensión' },
    });
    if (vErr) return res.status(400).json({ error: vErr });
    if (safe.frequency_hours != null && !HOSPITAL_FREQUENCIES.includes(safe.frequency_hours)) {
      return res.status(400).json({ error: 'La frecuencia debe ser cada 1, 2, 3, 4, 6, 8, 12 o 24 horas' });
    }
    if (safe.name !== undefined) {
      safe.name = String(safe.name || '').trim();
      if (!safe.name || safe.name.length > 200) return res.status(400).json({ error: 'Nombre del tratamiento inválido' });
    }
    if (Object.keys(safe).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const { fields, values, idx } = buildSet(safe);
    const result = await pool.query(
      `UPDATE hospital_treatments SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
      [...values, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el tratamiento' });
    res.json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Records what happened at one scheduled time. Saving the same time again replaces the record.
app.post('/items/hospital_treatments/:id/tasks', authMiddleware, async (req, res) => {
  try {
    const b = req.body || {};
    const scheduledFor = parseDateTimeInput(b.scheduled_for);
    if (!scheduledFor) return res.status(400).json({ error: 'Horario inválido' });
    const status = b.status || 'done';
    if (!['done', 'skipped'].includes(status)) return res.status(400).json({ error: 'Estado inválido' });
    const owned = await pool.query('SELECT 1 FROM hospital_treatments WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!owned.rows.length) return res.status(404).json({ error: 'No se encontró el tratamiento' });
    const result = await pool.query(
      `INSERT INTO hospital_tasks (treatment_id, user_id, scheduled_for, status, value, notes, done_by)
       VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(NULLIF(veterinarian_name, ''), name) FROM users WHERE id = $2))
       ON CONFLICT (treatment_id, scheduled_for) DO UPDATE SET
         status = EXCLUDED.status, value = EXCLUDED.value, notes = EXCLUDED.notes, done_by = EXCLUDED.done_by, done_at = now()
       RETURNING *`,
      [req.params.id, req.userId, scheduledFor, status,
       String(b.value ?? '').trim().slice(0, 60) || null, String(b.notes || '').trim().slice(0, 2000) || null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/hospital_tasks/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM hospital_tasks WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── LAB EXAMS ─────────────────────────────────────────
app.get('/items/lab_exams', authMiddleware, async (req, res) => {
  try {
    const { status, pet_id } = req.query;
    let query = 'SELECT le.*, p.name as pet_name, p.species, p.breed FROM lab_exams le LEFT JOIN pets p ON le.pet_id = p.id WHERE le.user_id = $1';
    const params = [req.userId];
    if (status && status !== 'todos') {
      params.push(status);
      query += ` AND le.status = $${params.length}`;
    }
    if (pet_id) {
      if (!isValidUUID(pet_id)) return res.status(400).json({ error: 'Paciente inválido' });
      params.push(pet_id);
      query += ` AND le.pet_id = $${params.length}`;
    }
    query += ' ORDER BY le.date DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/lab_exams', authMiddleware, async (req, res) => {
  try {
    const { pet_id, exam_name, exam_type, status, result: examResult, veterinarian } = req.body;
    if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'Selecciona un paciente' });
    if (!exam_name || !String(exam_name).trim()) return res.status(400).json({ error: 'El nombre del examen es obligatorio' });
    if (status && !LAB_STATUSES.includes(status)) return res.status(400).json({ error: 'Estado de examen inválido' });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      'INSERT INTO lab_exams (pet_id, user_id, exam_name, exam_type, status, result, veterinarian, organization_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [pet_id, req.userId, exam_name, exam_type || null, status || 'pendiente', examResult || null, veterinarian || null, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/lab_exams/:id', authMiddleware, async (req, res) => {
  try {
    const allowed = ['exam_name', 'exam_type', 'status', 'result', 'veterinarian'];
    const safe = sanitizeColumns(allowed, req.body);
    const vErr = validateFields(safe, { status: { type: 'enum', values: LAB_STATUSES, label: 'Estado' } });
    if (vErr) return res.status(400).json({ error: vErr });
    if (safe.status === 'completado') {
      let result = 'result' in safe ? safe.result : null;
      if (!('result' in safe)) {
        const current = await pool.query('SELECT result FROM lab_exams WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
        result = current.rows[0]?.result;
      }
      if (!String(result || '').trim()) return res.status(400).json({ error: 'Ingresa el resultado para completar el examen' });
    }
    if (Object.keys(safe).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const sets = Object.keys(safe).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(safe), req.userId];
    const result = await pool.query(`UPDATE lab_exams SET ${sets} WHERE id = $1 AND user_id = $${values.length} RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// An exam order: one lab_exams row per ordered exam, sharing order_id (and the consultation that asked for them)
app.post('/items/lab_exam_orders', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { pet_id, clinical_record_id, veterinarian, exams } = req.body;
    if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'Selecciona un paciente' });
    if (!Array.isArray(exams) || !exams.length || exams.length > 30) return res.status(400).json({ error: 'Elige entre 1 y 30 exámenes' });
    const items = exams.map((e) => ({ name: String((e && e.exam_name) || '').trim().slice(0, 150), type: e && e.exam_type ? String(e.exam_type).slice(0, 50) : null }));
    if (items.some((i) => !i.name)) return res.status(400).json({ error: 'Cada examen necesita un nombre' });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    if (clinical_record_id) {
      if (!isValidUUID(clinical_record_id)) return res.status(400).json({ error: 'Consulta inválida' });
      const rec = await pool.query('SELECT id FROM clinical_records WHERE id = $1 AND pet_id = $2 AND user_id = $3', [clinical_record_id, pet_id, req.userId]);
      if (!rec.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa consulta' });
    }
    const orderId = require('crypto').randomUUID();
    await client.query('BEGIN');
    const rows = [];
    for (const i of items) {
      const r = await client.query(
        'INSERT INTO lab_exams (pet_id, user_id, exam_name, exam_type, status, veterinarian, organization_id, clinical_record_id, order_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [pet_id, req.userId, i.name, i.type, 'pendiente', veterinarian ? String(veterinarian).slice(0, 150) : null, req.organizationId || null, clinical_record_id || null, orderId]
      );
      rows.push(r.rows[0]);
    }
    await client.query('COMMIT');
    res.json({ data: { order_id: orderId, exams: rows } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

app.get('/items/lab_exam_orders/:orderId/pdf', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.orderId)) return res.status(400).json({ error: 'Orden inválida' });
    const ex = await pool.query('SELECT * FROM lab_exams WHERE order_id = $1 AND user_id = $2 ORDER BY id', [req.params.orderId, req.userId]);
    if (!ex.rows.length) return res.status(404).json({ error: 'Orden no encontrada' });
    const pet = await petWithOwner(ex.rows[0].pet_id, req.userId);
    if (!pet) return res.status(404).json({ error: 'Paciente no encontrado' });
    const { generateExamOrderPdf } = require('./utils/generateExamOrderPdf');
    const pdf = await generateExamOrderPdf({
      pet, owner: pet.owner, exams: ex.rows, clinic: await clinicProfile(req.userId),
      veterinarian: ex.rows[0].veterinarian, orderedAt: ex.rows[0].date || ex.rows[0].created_at || new Date(),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.attachment(`orden_examenes_${fileSafe(pet.name)}.pdf`);
    res.send(pdf);
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/lab_exams/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lab_exams WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: { success: true } });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── STATS ─────────────────────────────────────────────
// Day boundaries use the clinic's local time; UTC made evening data land on "tomorrow".
const CLINIC_TZ = 'America/Santiago';
const WEEKDAYS_ES = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

// ─── ACCOUNT DATA EXPORT ──────────────────────────────────
// Everything the account owns, in the caller's hands (portability, Ley 21.719). GET only, so it also works
// once an account is read-only. Never includes the password hash or other credentials.
const EXPORT_TABLES = {
  owners: 'Tutores',
  pets: 'Pacientes',
  clinical_records: 'Consultas',
  vaccinations: 'Vacunas',
  prescriptions: 'Recetas',
  appointments: 'Citas',
  lab_exams: 'Examenes',
  hospitalizations: 'Hospitalizaciones',
  vital_measurements: 'Signos vitales',
  inventory: 'Inventario',
  payments: 'Pagos',
  personal_notes: 'Notas',
  reminders: 'Recordatorios',
};
const EXPORT_SKIP_COLUMNS = new Set(['photo']); // inline images make CSV unusable; they stay in the JSON

function csvCell(v) {
  if (v === null || v === undefined) return '';
  let t = v instanceof Date ? v.toISOString() : typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Cells that start with = + - @ run as formulas in Excel/Sheets
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return /[",\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}
function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]).filter((c) => !EXPORT_SKIP_COLUMNS.has(c));
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n');
}

app.get('/account/export', authMiddleware, async (req, res) => {
  try {
    if (!await rateLimit(`export:${req.userId}`, 10, 600000)) {
      return res.status(429).json({ error: 'Demasiadas exportaciones. Intenta en unos minutos.' });
    }
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const table = String(req.query.table || '');
      if (!Object.prototype.hasOwnProperty.call(EXPORT_TABLES, table)) {
        return res.status(400).json({ error: 'Tabla no válida para exportar' });
      }
      const result = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at NULLS LAST`, [req.userId])
        .catch(() => pool.query(`SELECT * FROM ${table} WHERE user_id = $1`, [req.userId]));
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="vetavalon-${table}-${stamp}.csv"`);
      return res.send(toCsv(result.rows));
    }

    const data = { exported_at: new Date().toISOString(), format_version: 1 };
    const me = await pool.query(
      'SELECT id, username, name, email, clinic_name, veterinarian_name, clinic_phone, clinic_address, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    data.account = me.rows[0] || null;
    await Promise.all(Object.keys(EXPORT_TABLES).map(async (table) => {
      const r = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1`, [req.userId]);
      data[table] = r.rows;
    }));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="vetavalon-datos-${stamp}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const [pets, appointments, records, lowStock, hospitalized, lastVisits, recentRecords] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM pets WHERE user_id = $1', [req.userId]),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM appointments
         WHERE user_id = $1 AND status NOT IN ('cancelada', 'ausente')
           AND (start_time AT TIME ZONE $2)::date = (NOW() AT TIME ZONE $2)::date`,
        [req.userId, CLINIC_TZ]
      ),
      pool.query('SELECT COUNT(*)::int AS n FROM clinical_records WHERE user_id = $1', [req.userId]),
      pool.query('SELECT COUNT(*)::int AS n FROM inventory WHERE user_id = $1 AND current_stock <= min_stock', [req.userId]),
      pool.query("SELECT COUNT(*)::int AS n FROM hospitalizations WHERE user_id = $1 AND status <> 'discharged'", [req.userId]),
      // The dashboard used to download every clinical record (with its JSON details) just for these two
      pool.query('SELECT pet_id, MAX(date) AS last FROM clinical_records WHERE user_id = $1 AND pet_id IS NOT NULL GROUP BY pet_id', [req.userId]),
      pool.query(
        `SELECT id, pet_id, record_type, date, created_at FROM clinical_records
         WHERE user_id = $1 ORDER BY date DESC NULLS LAST, created_at DESC LIMIT 3`,
        [req.userId]
      ),
    ]);
    res.json({
      data: {
        totalPets: pets.rows[0].n,
        todayAppointments: appointments.rows[0].n,
        totalRecords: records.rows[0].n,
        lowStockAlerts: lowStock.rows[0].n,
        activeHospitalizations: hospitalized.rows[0].n,
        lastVisitByPet: Object.fromEntries(lastVisits.rows.map((r) => [r.pet_id, r.last])),
        recentRecords: recentRecords.rows,
      },
    });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Last 7 local days, oldest first, zero-filled, with the same window of the
// previous week so the client can show a real (signed) trend.
app.get('/stats/weekly', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `WITH days AS (
         SELECT generate_series((NOW() AT TIME ZONE $2)::date - 13, (NOW() AT TIME ZONE $2)::date, '1 day')::date AS day
       ), counts AS (
         SELECT (date AT TIME ZONE $2)::date AS day,
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE record_type = 'consulta')::int AS consultas,
                COUNT(*) FILTER (WHERE record_type = 'vacuna')::int AS vacunas
         FROM clinical_records
         WHERE user_id = $1 AND date >= NOW() - INTERVAL '15 days'
         GROUP BY 1
       )
       SELECT to_char(d.day, 'YYYY-MM-DD') AS date, EXTRACT(ISODOW FROM d.day)::int AS dow,
              COALESCE(c.total, 0) AS count, COALESCE(c.consultas, 0) AS consultas, COALESCE(c.vacunas, 0) AS vacunas
       FROM days d LEFT JOIN counts c ON c.day = d.day
       ORDER BY d.day`,
      [req.userId, CLINIC_TZ]
    );
    const rows = result.rows.map((r) => ({ ...r, day: WEEKDAYS_ES[r.dow - 1] }));
    const previous = rows.slice(0, 7);
    const current = rows.slice(7);
    const sum = (arr, k) => arr.reduce((acc, r) => acc + r[k], 0);
    res.json({
      data: {
        days: current,
        summary: {
          total: sum(current, 'count'), previousTotal: sum(previous, 'count'),
          consultas: sum(current, 'consultas'), previousConsultas: sum(previous, 'consultas'),
          vacunas: sum(current, 'vacunas'), previousVacunas: sum(previous, 'vacunas'),
        },
      },
    });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// How often each catalog disease was diagnosed by this vet in the last 12 months (consultations link
// diagnoses in details.diagnoses = [{id, name}]); feeds "Más vistas en tu clínica"
app.get('/stats/diagnoses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dx->>'id' AS disease_id, COUNT(*)::int AS count, MAX(cr.date) AS last_seen
       FROM clinical_records cr
       CROSS JOIN LATERAL jsonb_array_elements(
         CASE WHEN jsonb_typeof(cr.details->'diagnoses') = 'array' THEN cr.details->'diagnoses' ELSE '[]'::jsonb END) AS dx
       WHERE cr.user_id = $1 AND cr.date >= NOW() - INTERVAL '12 months' AND dx->>'id' IS NOT NULL
       GROUP BY 1 ORDER BY count DESC`,
      [req.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/stats/record-types', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT record_type, COUNT(*)::int AS count
       FROM clinical_records
       WHERE user_id = $1
       GROUP BY record_type`,
      [req.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── VITAL MEASUREMENTS ───────────────────────────────
app.get('/vital-measurements', authMiddleware, async (req, res) => {
  try {
    const { pet_id } = req.query;
    let query = 'SELECT vm.*, p.name as pet_name FROM vital_measurements vm LEFT JOIN pets p ON vm.pet_id = p.id WHERE vm.user_id = $1';
    const params = [req.userId];
    if (pet_id && isValidUUID(pet_id)) {
      query += ' AND vm.pet_id = $2';
      params.push(pet_id);
    }
    query += ' ORDER BY vm.recorded_at DESC LIMIT 200';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/vital-measurements', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const allowed = ['pet_id', 'weight', 'temperature', 'heart_rate', 'respiratory_rate', 'blood_pressure', 'spo2', 'mucous_membranes', 'hydration', 'body_condition', 'notes'];
    const data = sanitizeColumns(allowed, req.body);
    if (!data.pet_id || !isValidUUID(data.pet_id)) {
      return res.status(400).json({ error: 'Selecciona un paciente' });
    }
    const vErr = validateFields(data, {
      weight: { type: 'number', min: 0.05, max: 150, label: 'Peso' },
      temperature: { type: 'number', min: 30, max: 45, label: 'Temperatura' },
      heart_rate: { type: 'number', integer: true, min: 20, max: 350, label: 'Frecuencia cardíaca' },
      respiratory_rate: { type: 'number', integer: true, min: 4, max: 150, label: 'Frecuencia respiratoria' },
      spo2: { type: 'number', integer: true, min: 50, max: 100, label: 'SpO2' },
    });
    if (vErr) return res.status(400).json({ error: vErr });
    const result = await pool.query(
      'INSERT INTO vital_measurements (pet_id, user_id, organization_id, weight, temperature, heart_rate, respiratory_rate, blood_pressure, spo2, mucous_membranes, hydration, body_condition, notes, recorded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
      [data.pet_id, req.userId, req.organizationId, data.weight || null, data.temperature || null, data.heart_rate || null, data.respiratory_rate || null, data.blood_pressure || null, data.spo2 || null, data.mucous_membranes || null, data.hydration || null, data.body_condition || null, data.notes || null, req.userId]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PAYMENTS ─────────────────────────────────────────
app.get('/payments', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT py.*, p.name as pet_name FROM payments py LEFT JOIN pets p ON py.pet_id = p.id WHERE py.user_id = $1 ORDER BY py.paid_at DESC LIMIT 200',
      [req.userId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/payments', authMiddleware, async (req, res) => {
  try {
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    const allowed = ['appointment_id', 'pet_id', 'amount', 'method', 'description'];
    const data = sanitizeColumns(allowed, req.body);
    const amount = parseNumberInput(data.amount, { min: 1, max: 99999999 });
    if (amount === null || amount === undefined) {
      return res.status(400).json({ error: 'Ingresa un monto válido mayor a 0' });
    }
    data.amount = amount;
    const validMethods = ['efectivo', 'debito', 'credito', 'transferencia', 'otro'];
    if (data.method && !validMethods.includes(data.method)) {
      return res.status(400).json({ error: 'Medio de pago inválido' });
    }
    const result = await pool.query(
      'INSERT INTO payments (organization_id, user_id, appointment_id, pet_id, amount, method, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.organizationId, req.userId, data.appointment_id || null, data.pet_id || null, parseFloat(data.amount), data.method || 'efectivo', data.description || null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── REPORTS ──────────────────────────────────────────
app.get('/reports/summary', authMiddleware, async (req, res) => {
  try {

    const [patients, appointments, payments, records] = await Promise.all([
      pool.query('SELECT COUNT(*)::int as total FROM pets WHERE user_id = $1', [req.userId]),
      pool.query(`SELECT COUNT(*)::int as total, COUNT(CASE WHEN status = 'completada' THEN 1 END)::int as completed FROM appointments WHERE user_id = $1 AND start_time >= date_trunc('month', now())`, [req.userId]),
      pool.query('SELECT COALESCE(SUM(amount),0)::numeric as total, COUNT(*)::int as count FROM payments WHERE user_id = $1 AND paid_at >= date_trunc(\'month\', now())', [req.userId]),
      pool.query('SELECT COUNT(*)::int as total FROM clinical_records WHERE user_id = $1 AND created_at >= date_trunc(\'month\', now())', [req.userId]),
    ]);
    res.json({
      data: {
        patients: patients.rows[0].total,
        appointments: { total: appointments.rows[0].total, completed: appointments.rows[0].completed },
        revenue: { total: payments.rows[0].total, count: payments.rows[0].count },
        records: records.rows[0].total,
      },
    });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/reports/expiring-inventory', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory WHERE user_id = $1 AND expiration_date IS NOT NULL AND expiration_date <= now() + interval '30 days' ORDER BY expiration_date ASC LIMIT 50",
      [req.userId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    logError(req, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GLOBAL SEARCH ────────────────────────────────────
app.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.status(400).json({ error: 'Escribe al menos 2 caracteres para buscar' });
    }
    const term = likeTerm(q.toLowerCase());
    // Scoped to the caller's own patients; "phone" is exposed as tutor_phone for the client
    const rut = /\d{5,}/.test(q) ? canonRut(q) : null;
    const digits = q.replace(/\D/g, '');
    const phoneTerm = digits.length >= 6 ? '%' + digits : null;
    const [pets, owners] = await Promise.all([
      pool.query(
        `SELECT p.id, p.name, p.species, p.breed, p.owner_id, o.name AS tutor_name, o.phone AS tutor_phone FROM pets p
         LEFT JOIN owners o ON o.id = p.owner_id
         WHERE p.user_id = $2 AND (LOWER(p.name) LIKE $1 OR LOWER(p.breed) LIKE $1 OR LOWER(o.name) LIKE $1
           OR LOWER(COALESCE(p.id_number, '')) LIKE $1 OR o.rut = $3 OR regexp_replace(COALESCE(o.phone, ''), '\\D', '', 'g') LIKE $4)
         ORDER BY p.name LIMIT 20`,
        [term, req.userId, rut, phoneTerm]
      ),
      pool.query(
        `SELECT o.id, o.name AS tutor_name, o.phone AS tutor_phone, o.rut FROM owners o
         WHERE o.user_id = $2 AND (LOWER(o.name) LIKE $1 OR o.rut = $3 OR regexp_replace(COALESCE(o.phone, ''), '\\D', '', 'g') LIKE $4)
         ORDER BY o.name LIMIT 20`,
        [term, req.userId, rut, phoneTerm]
      ),
    ]);
    res.json({ data: { pets: pets.rows, owners: owners.rows } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── VACCINATIONS ────────────────────────────────────────
const VACCINATION_KINDS = ['vacuna', 'desparasitacion_interna', 'desparasitacion_externa'];
const VACCINE_PLAN_ITEMS = ['octuple_sextuple', 'kc', 'antirrabica', 'triple_felina', 'leucemia_felina', 'otra'];
const VACCINE_PLAN_LABELS = { octuple_sextuple: 'Óctuple/Séxtuple', kc: 'KC', antirrabica: 'Antirrábica', triple_felina: 'Triple Felina', leucemia_felina: 'Leucemia Felina' };
const VACCINATION_COLUMNS = ['pet_id', 'kind', 'plan_item', 'product', 'lot', 'applied_at', 'next_due_at', 'veterinarian', 'clinical_record_id', 'notes', 'date_estimated'];

function vaccinationFieldError(v, partial) {
  if ((!partial || v.kind !== undefined) && v.kind != null && !VACCINATION_KINDS.includes(v.kind)) return 'Tipo inválido';
  if (v.plan_item != null && !VACCINE_PLAN_ITEMS.includes(v.plan_item)) return 'Vacuna del plan inválida';
  for (const key of ['applied_at', 'next_due_at']) {
    if (v[key] === undefined) continue;
    const parsed = parseDateInput(v[key], { allowFuture: key === 'next_due_at' });
    if (parsed === undefined) return key === 'applied_at' ? 'Fecha de aplicación inválida' : 'Fecha de la próxima dosis inválida';
    v[key] = parsed;
  }
  if (v.date_estimated !== undefined) v.date_estimated = v.date_estimated === true;
  if ((!partial || v.applied_at !== undefined) && !v.applied_at) return 'La fecha de aplicación es obligatoria';
  if (v.applied_at && v.next_due_at && v.next_due_at <= v.applied_at) return 'La próxima dosis debe ser posterior a la aplicación';
  return null;
}

// Schedules the reminder 7 days before the next dose, only for a live pet whose tutor can be contacted
async function scheduleVaccinationReminder(vaccination, userId, organizationId) {
  await pool.query("DELETE FROM reminders WHERE vaccination_id = $1 AND status = 'pending'", [vaccination.id]);
  if (!vaccination.next_due_at) return null;
  const r = await pool.query(
    `SELECT p.name, p.email, p.receive_reminders, p.status, o.contact_revoked_at, o.anonymized_at
     FROM pets p LEFT JOIN owners o ON o.id = p.owner_id WHERE p.id = $1`, [vaccination.pet_id]);
  const pet = r.rows[0];
  if (!pet || pet.status !== 'alive' || !pet.receive_reminders || !pet.email || pet.contact_revoked_at || pet.anonymized_at) return null;
  const due = new Date(`${vaccination.next_due_at}T12:00:00-03:00`);
  const when = new Date(Math.max(due.getTime() - 7 * 86400000, Date.now()));
  const what = vaccination.kind === 'vacuna'
    ? (VACCINE_PLAN_LABELS[vaccination.plan_item] || vaccination.product || 'vacuna')
    : (vaccination.kind === 'desparasitacion_interna' ? 'desparasitación interna' : 'desparasitación externa');
  const dueText = due.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
  const inserted = await pool.query(
    `INSERT INTO reminders (user_id, pet_id, tutor_email, reminder_type, title, message, scheduled_for, related_record_id, organization_id, vaccination_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [userId, vaccination.pet_id, pet.email, vaccination.kind === 'vacuna' ? 'vacuna' : 'desparasitacion',
     `Próxima ${what} de ${pet.name}`,
     `${pet.name} tiene su próxima ${what} el ${dueText}. Agende su hora con anticipación.`,
     when.toISOString(), vaccination.clinical_record_id || null, organizationId || null, vaccination.id]
  );
  return inserted.rows[0];
}

app.get('/items/vaccinations', authMiddleware, async (req, res) => {
  try {
    const params = [req.userId];
    let where = 'v.user_id = $1';
    if (req.query.pet_id) {
      if (!isValidUUID(String(req.query.pet_id))) return res.json({ data: [] });
      params.push(req.query.pet_id);
      where += ` AND v.pet_id = $${params.length}`;
    }
    const result = await pool.query(`SELECT v.* FROM vaccinations v WHERE ${where} ORDER BY v.applied_at DESC, v.created_at DESC`, params);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Products the vet has typed before, most used first, for autocomplete
app.get('/items/vaccinations/products', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT plan_item, product, count(*)::int AS uses FROM vaccinations
       WHERE user_id = $1 AND product IS NOT NULL AND product <> ''
       GROUP BY plan_item, product ORDER BY uses DESC, product LIMIT 100`, [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/vaccinations', authMiddleware, async (req, res) => {
  try {
    const v = sanitizeColumns(VACCINATION_COLUMNS, req.body || {});
    if (!v.pet_id || !isValidUUID(String(v.pet_id))) return res.status(400).json({ error: 'Selecciona un paciente' });
    v.kind = v.kind || 'vacuna';
    const fieldError = vaccinationFieldError(v, false);
    if (fieldError) return res.status(400).json({ error: fieldError });
    const refError = await checkRefs({ ...req, body: v });
    if (refError) return res.status(403).json({ error: refError });
    for (const key of ['product', 'lot', 'veterinarian', 'notes']) if (typeof v[key] === 'string') v[key] = v[key].trim() || null;
    v.user_id = req.userId;
    v.organization_id = req.organizationId || null;
    const cols = Object.keys(v);
    const result = await pool.query(
      `INSERT INTO vaccinations (${cols.join(', ')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(', ')}) RETURNING *`,
      cols.map((c) => v[c])
    );
    const row = result.rows[0];
    await scheduleVaccinationReminder({ ...row, applied_at: v.applied_at, next_due_at: v.next_due_at }, req.userId, req.organizationId).catch((err) => logError(req, err));
    res.json({ data: row });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/vaccinations/:id', authMiddleware, async (req, res) => {
  try {
    const v = sanitizeColumns(VACCINATION_COLUMNS.filter((c) => c !== 'pet_id'), req.body || {});
    const fieldError = vaccinationFieldError(v, true);
    if (fieldError) return res.status(400).json({ error: fieldError });
    const refError = await checkRefs({ ...req, body: v });
    if (refError) return res.status(403).json({ error: refError });
    const { fields, values, idx } = buildSet(v);
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.params.id, req.userId);
    const result = await pool.query(
      `UPDATE vaccinations SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1}
       RETURNING *, to_char(applied_at, 'YYYY-MM-DD') AS applied_on, to_char(next_due_at, 'YYYY-MM-DD') AS next_due_on`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    const row = result.rows[0];
    if ('next_due_at' in v || 'plan_item' in v || 'product' in v) {
      await scheduleVaccinationReminder({ ...row, next_due_at: row.next_due_on }, req.userId, req.organizationId).catch((err) => logError(req, err));
    }
    res.json({ data: row });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/vaccinations/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vaccinations WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── CLINIC NOTICES AND AUTOMATION RULES ─────────────────
// A small inbox for the clinic, filled by rules the user can switch off. Derived notices (stock, vaccines)
// are created and removed by syncNotices from the current data; the discharge checklist is created
// by the hospitalization handler. A rule with no row in automation_rules is on.
const AUTOMATION_RULES = [
  { key: 'low_stock', title: 'Stock bajo', description: 'Avisa cuando un producto llega a su stock mínimo.' },
  { key: 'vaccines_overdue', title: 'Vacunas vencidas', description: 'Avisa cuando un paciente tiene vacunas o desparasitaciones con la fecha vencida.' },
  { key: 'discharge_checklist', title: 'Checklist de alta', description: 'Al dar de alta a un paciente hospitalizado, crea un checklist para cerrar el caso.' },
];
const DISCHARGE_CHECKLIST = ['Entregar las indicaciones de alta al tutor', 'Dar la receta y explicar la medicación', 'Agendar el control', 'Cobrar la hospitalización', 'Revisar que la ficha quede al día'];

async function disabledRules(userId) {
  const r = await pool.query('SELECT rule_key FROM automation_rules WHERE user_id = $1 AND enabled = false', [userId]);
  return new Set(r.rows.map((x) => x.rule_key));
}

async function syncNotices(userId, organizationId) {
  const off = await disabledRules(userId);
  const stockOff = off.has('low_stock');
  const vaccinesOff = off.has('vaccines_overdue');
  const overdue = `v.next_due_at < CURRENT_DATE AND p.status = 'alive'
    AND NOT EXISTS (SELECT 1 FROM vaccinations v2 WHERE v2.pet_id = v.pet_id AND v2.kind = v.kind
                      AND coalesce(v2.plan_item, '') = coalesce(v.plan_item, '') AND v2.applied_at > v.applied_at)`;
  if (!stockOff) {
    await pool.query(
      `INSERT INTO clinic_notices (user_id, organization_id, kind, title, body, link, dedupe_key)
       SELECT i.user_id, $2::int, 'low_stock', 'Stock bajo: ' || i.name,
              i.current_stock || ' ' || coalesce(i.unit, 'unidades') || ' (mínimo ' || i.min_stock || ')',
              '/(drawer)/inventario', 'stock:' || i.id
         FROM inventory i WHERE i.user_id = $1 AND i.current_stock <= i.min_stock
        ORDER BY i.current_stock LIMIT 50
       ON CONFLICT (user_id, dedupe_key) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body
         WHERE clinic_notices.status = 'open'`, [userId, organizationId]
    );
  }
  await pool.query(
    `DELETE FROM clinic_notices n WHERE n.user_id = $1 AND n.kind = 'low_stock'
        AND ($2::boolean OR NOT EXISTS (SELECT 1 FROM inventory i WHERE 'stock:' || i.id = n.dedupe_key AND i.user_id = $1 AND i.current_stock <= i.min_stock))`,
    [userId, stockOff]
  );
  if (!vaccinesOff) {
    await pool.query(
      `INSERT INTO clinic_notices (user_id, organization_id, kind, title, body, link, pet_id, dedupe_key)
       SELECT $1::uuid, $2::int, 'vaccines_overdue', 'Vacunas vencidas: ' || p.name,
              CASE WHEN count(*) = 1 THEN '1 dosis con la fecha vencida' ELSE count(*) || ' dosis con la fecha vencida' END,
              '/pet/' || p.id, p.id, 'vaccine:' || p.id
         FROM vaccinations v JOIN pets p ON p.id = v.pet_id
        WHERE v.user_id = $1 AND p.user_id = $1 AND ${overdue}
        GROUP BY p.id, p.name ORDER BY count(*) DESC LIMIT 50
       ON CONFLICT (user_id, dedupe_key) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body
         WHERE clinic_notices.status = 'open'`, [userId, organizationId]
    );
  }
  await pool.query(
    `DELETE FROM clinic_notices n WHERE n.user_id = $1 AND n.kind = 'vaccines_overdue'
        AND ($2::boolean OR NOT EXISTS (SELECT 1 FROM vaccinations v JOIN pets p ON p.id = v.pet_id
                                         WHERE 'vaccine:' || p.id = n.dedupe_key AND v.user_id = $1 AND ${overdue}))`,
    [userId, vaccinesOff]
  );
}

// Called when a hospitalization is discharged; never fails the discharge itself
async function createDischargeNotice(req, hospitalization) {
  try {
    if ((await disabledRules(req.userId)).has('discharge_checklist')) return;
    const pet = (await pool.query('SELECT name FROM pets WHERE id = $1 AND user_id = $2', [hospitalization.pet_id, req.userId])).rows[0];
    if (!pet) return;
    await pool.query(
      `INSERT INTO clinic_notices (user_id, organization_id, kind, title, body, link, pet_id, dedupe_key, checklist)
       VALUES ($1, $2, 'discharge_checklist', $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, dedupe_key) DO NOTHING`,
      [req.userId, req.organizationId || null, `Alta de ${pet.name}: cerrar el caso`, 'Pasos para dejar el alta completa.',
       `/pet/${hospitalization.pet_id}`, hospitalization.pet_id, `discharge:${hospitalization.id}`,
       JSON.stringify(DISCHARGE_CHECKLIST.map((text) => ({ text, done: false })))]
    );
  } catch (err) {
    logError(req, err);
  }
}

app.get('/items/notices', authMiddleware, async (req, res) => {
  try {
    await syncNotices(req.userId, req.organizationId || null);
    const result = await pool.query(
      `SELECT id, kind, title, body, link, pet_id, status, checklist, created_at, resolved_at
         FROM clinic_notices WHERE user_id = $1 AND status = 'open' ORDER BY created_at DESC LIMIT 100`, [req.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/notices/:id', authMiddleware, async (req, res) => {
  try {
    const { status, checklist } = req.body || {};
    const sets = [];
    const values = [];
    if (status !== undefined) {
      if (!['open', 'done', 'dismissed'].includes(status)) return res.status(400).json({ error: 'Estado no válido' });
      values.push(status);
      sets.push(`status = $${values.length}`, status === 'open' ? 'resolved_at = NULL' : 'resolved_at = NOW()');
    }
    if (checklist !== undefined) {
      const valid = Array.isArray(checklist) && checklist.length <= 20
        && checklist.every((c) => c && typeof c.text === 'string' && c.text.length > 0 && c.text.length <= 200 && typeof c.done === 'boolean');
      if (!valid) return res.status(400).json({ error: 'El checklist no es válido' });
      values.push(JSON.stringify(checklist.map((c) => ({ text: c.text, done: c.done }))));
      sets.push(`checklist = $${values.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: 'Sin cambios' });
    values.push(req.params.id, req.userId);
    const result = await pool.query(
      `UPDATE clinic_notices SET ${sets.join(', ')} WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING id, kind, title, body, link, pet_id, status, checklist, created_at, resolved_at`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/automation_rules', authMiddleware, async (req, res) => {
  try {
    const off = await disabledRules(req.userId);
    res.json({ data: AUTOMATION_RULES.map((r) => ({ ...r, enabled: !off.has(r.key) })) });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/automation_rules/:key', authMiddleware, async (req, res) => {
  try {
    const rule = AUTOMATION_RULES.find((r) => r.key === req.params.key);
    if (!rule) return res.status(404).json({ error: 'No se encontró la regla' });
    if (typeof (req.body || {}).enabled !== 'boolean') return res.status(400).json({ error: 'Indica si la regla está activa' });
    await pool.query(
      `INSERT INTO automation_rules (user_id, rule_key, enabled) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, rule_key) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()`,
      [req.userId, rule.key, req.body.enabled]
    );
    res.json({ data: { ...rule, enabled: req.body.enabled } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── ANAMNESIS FORM FOR THE TUTOR ────────────────────────
// The vet creates a link for a patient; the tutor answers at /f/<token> without an account;
// the vet reviews the answers and imports them into the consultation. The public routes expose
// only the pet's name, species, sex and the clinic name, and accept answers once.
const ANAMNESIS_TTL_DAYS = 14;
const ANAMNESIS_TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;
const ANAMNESIS_OPTIONS = {
  diet: ['Seco', 'Húmedo', 'Mixto', 'Casero', 'BARF'],
  housing: ['Casa', 'Depto', 'Parcela', 'Exteriores'],
  outdoor: ['Solo interior', 'Sale al exterior', 'Libre en la calle'],
  origin: ['Comprado', 'Adoptado', 'Rescatado', 'Regalado', 'Nacido en casa'],
  water: ['Normal', 'Aumentado', 'Disminuido'],
};
const ANAMNESIS_CHRONIC = ['Cardiopatía', 'Renal crónica', 'Diabetes', 'Epilepsia', 'Hipotiroidismo', 'Hipertiroidismo', 'Artrosis', 'Dermatitis atópica', 'Asma / bronquitis crónica', 'Obesidad'];
const ANAMNESIS_TEMPERAMENT = ['Dócil', 'Nervioso', 'Inquieto', 'Puede morder'];
const ANAMNESIS_VACCINE_ITEMS = ['octuple_sextuple', 'kc', 'antirrabica', 'triple_felina', 'leucemia_felina'];
const ANAMNESIS_TEXT_LIMITS = {
  dietDetail: 200, feedings: 100, companions: 300, litter: 200, chronicOther: 600, surgeries: 800,
  medications: 800, allergies: 400, lastHeat: 300, originAge: 100, retroviral: 200, dewormIn: 20, dewormOut: 20,
};

// Keeps only the known keys with the right shape. Returns { error } or { answers }.
function normalizeAnamnesisAnswers(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'Las respuestas no son válidas' };
  const answers = {};
  for (const [key, options] of Object.entries(ANAMNESIS_OPTIONS)) {
    const v = raw[key];
    if (v == null || v === '') { answers[key] = null; continue; }
    if (typeof v !== 'string' || !options.includes(v)) return { error: `Respuesta no válida (${key})` };
    answers[key] = v;
  }
  for (const [key, max] of Object.entries(ANAMNESIS_TEXT_LIMITS)) {
    const v = raw[key];
    if (v == null) { answers[key] = ''; continue; }
    if (typeof v !== 'string') return { error: `Respuesta no válida (${key})` };
    const text = v.trim();
    if (text.length > max) return { error: `La respuesta "${key}" supera ${max} caracteres` };
    answers[key] = text;
  }
  for (const [key, allowed] of [['chronic', ANAMNESIS_CHRONIC], ['temperament', ANAMNESIS_TEMPERAMENT]]) {
    const v = raw[key];
    if (v == null) { answers[key] = []; continue; }
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !allowed.includes(x))) return { error: `Respuesta no válida (${key})` };
    answers[key] = [...new Set(v)];
  }
  const dates = raw.vaccineDates;
  answers.vaccineDates = {};
  if (dates != null) {
    if (typeof dates !== 'object' || Array.isArray(dates)) return { error: 'Respuesta no válida (vaccineDates)' };
    for (const [item, value] of Object.entries(dates)) {
      if (!ANAMNESIS_VACCINE_ITEMS.includes(item) || typeof value !== 'string' || value.trim().length > 20) return { error: 'Respuesta no válida (vaccineDates)' };
      if (value.trim()) answers.vaccineDates[item] = value.trim();
    }
  }
  const empty = Object.values(answers).every((v) => v == null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && v !== null && !Array.isArray(v) && !Object.keys(v).length));
  if (empty) return { error: 'Responde al menos una pregunta' };
  return { answers };
}

// Public (no auth): the link is the credential, so every lookup is rate limited and answers are accepted once
async function loadPublicAnamnesis(req, res) {
  const token = req.params.token;
  if (!ANAMNESIS_TOKEN_RE.test(token)) { res.status(404).json({ error: 'Este enlace no es válido' }); return null; }
  const form = (await pool.query(
    `SELECT f.id, f.status, f.expires_at, p.name AS pet_name, p.species, p.sex, p.reproductive_status, u.clinic_name
       FROM anamnesis_forms f
       JOIN pets p ON p.id = f.pet_id
       JOIN users u ON u.id = f.user_id
      WHERE f.token = $1`, [token]
  )).rows[0];
  if (!form || form.status === 'cancelado') { res.status(404).json({ error: 'Este enlace no es válido' }); return null; }
  if (form.status !== 'pendiente') { res.status(409).json({ error: 'Ya recibimos las respuestas de este formulario. ¡Gracias!', code: 'ALREADY_ANSWERED' }); return null; }
  if (new Date(form.expires_at) < new Date()) { res.status(410).json({ error: 'Este enlace venció. Pide uno nuevo a la clínica.', code: 'EXPIRED' }); return null; }
  return form;
}

app.get('/public/anamnesis/:token', async (req, res) => {
  try {
    if (!await rateLimit(`anamnesis-view:${req.ip || 'unknown'}`, 60, 3600000)) return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta más tarde.' });
    const form = await loadPublicAnamnesis(req, res);
    if (!form) return;
    res.json({ data: { pet: { name: form.pet_name, species: form.species, sex: form.sex, reproductive_status: form.reproductive_status }, clinic_name: form.clinic_name || null, expires_at: form.expires_at } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/public/anamnesis/:token', async (req, res) => {
  try {
    const ip = req.ip || 'unknown';
    if (!ANAMNESIS_TOKEN_RE.test(req.params.token)) return res.status(404).json({ error: 'Este enlace no es válido' });
    if (!await rateLimit(`anamnesis-submit:${ip}`, 10, 3600000) || !await rateLimit(`anamnesis-token:${req.params.token}`, 10, 3600000)) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' });
    }
    const form = await loadPublicAnamnesis(req, res);
    if (!form) return;
    const { error, answers } = normalizeAnamnesisAnswers(req.body && req.body.answers);
    if (error) return res.status(400).json({ error });
    // The status condition makes a double submit (two tabs, a retry) land only once
    const saved = await pool.query(
      `UPDATE anamnesis_forms SET answers = $1, status = 'respondido', submitted_at = NOW()
        WHERE id = $2 AND status = 'pendiente' AND expires_at > NOW() RETURNING id`,
      [JSON.stringify(answers), form.id]
    );
    if (!saved.rows.length) return res.status(409).json({ error: 'Ya recibimos las respuestas de este formulario. ¡Gracias!', code: 'ALREADY_ANSWERED' });
    res.json({ data: { ok: true } });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Vet side. The token is returned so the link can be copied again; it expires and works once.
app.get('/items/anamnesis_forms', authMiddleware, async (req, res) => {
  try {
    const petId = String(req.query.pet_id || '');
    if (!isValidUUID(petId)) return res.status(400).json({ error: 'Falta el paciente' });
    const result = await pool.query(
      `SELECT id, pet_id, token, status, answers, expires_at, submitted_at, imported_at, created_at
         FROM anamnesis_forms WHERE pet_id = $1 AND user_id = $2 AND status <> 'cancelado'
        ORDER BY created_at DESC LIMIT 5`, [petId, req.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/anamnesis_forms', authMiddleware, async (req, res) => {
  try {
    const petId = String((req.body || {}).pet_id || '');
    if (!isValidUUID(petId)) return res.status(400).json({ error: 'Falta el paciente' });
    const refError = await checkRefs(req);
    if (refError) return res.status(403).json({ error: refError });
    if (!await rateLimit(`anamnesis-create:${req.userId}`, 30, 3600000)) return res.status(429).json({ error: 'Demasiados formularios creados. Intenta más tarde.' });
    // One open link per patient: a new one replaces the previous pending link
    await pool.query(`UPDATE anamnesis_forms SET status = 'cancelado' WHERE pet_id = $1 AND user_id = $2 AND status = 'pendiente'`, [petId, req.userId]);
    const token = require('crypto').randomBytes(24).toString('base64url');
    const result = await pool.query(
      `INSERT INTO anamnesis_forms (pet_id, user_id, organization_id, token, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + ($5 || ' days')::interval)
       RETURNING id, pet_id, token, status, answers, expires_at, submitted_at, imported_at, created_at`,
      [petId, req.userId, req.organizationId || null, token, String(ANAMNESIS_TTL_DAYS)]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/anamnesis_forms/:id/imported', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE anamnesis_forms SET status = 'importado', imported_at = NOW()
        WHERE id = $1 AND user_id = $2 AND status IN ('respondido', 'importado') RETURNING id, status, imported_at`,
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/anamnesis_forms/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE anamnesis_forms SET status = 'cancelado' WHERE id = $1 AND user_id = $2 AND status = 'pendiente' RETURNING id`,
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No se encontró el registro' });
    res.json({ data: null });
  } catch (err) {
    logError(req, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── FILE UPLOAD ─────────────────────────────────────────
// NOTE: Client should upload directly to Cloudinary via services/cloudinary.ts
// This endpoint is kept for backwards compatibility but returns an error
app.post('/files', authMiddleware, (req, res) => {
  res.status(501).json({ error: 'Use client-side Cloudinary upload instead (services/cloudinary.ts)' });
});

if (!process.env.VERCEL_ENV) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vet Avalon API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
