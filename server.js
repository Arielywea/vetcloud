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
const PORT = process.env.PORT || 8055;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no definido en variables de entorno');
  process.exit(1);
}

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : process.env.VERCEL_ENV
    ? null
    : { host: 'localhost', port: 1245, database: 'vetcloud', user: 'postgres', password: '' };

if (process.env.VERCEL_ENV && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL no definido en Vercel');
  process.exit(1);
}

const pool = new Pool(dbConfig);

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

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

const rateLimitStore = new Map();
function rateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  rateLimitStore.set(key, record);
  return record.count <= maxAttempts;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

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
app.post('/auth/login', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!rateLimit(`login:${clientIp}`, 5, 60000)) {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!rateLimit(`register:${clientIp}`, 3, 300000)) {
      return res.status(429).json({ error: 'Demasiados registros. Intente en 5 minutos.' });
    }
    const { username, email, password, org_name, org_type } = req.body;

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
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
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
        'INSERT INTO users (username, email, password_hash, name, role, organization_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, name, role, organization_id',
        [username, email, hash, username, 'owner', organizationId]
      );
      const user = userResult.rows[0];

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
    console.error('[REGISTER ERROR]', JSON.stringify({ message: err.message, code: err.code, detail: err.detail, stack: err.stack?.split('\n').slice(0,3) }));
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, rut, username, name, email, role, organization_id, theme_preference, color_palette, created_at, smtp_email, clinic_name, veterinarian_name, clinic_phone, clinic_address, notification_email_reminders, notification_upcoming_appointments, notification_push FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = result.rows[0];
    if (user.smtp_password) user.smtp_password = '••••••••';
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, clinic_name, veterinarian_name, clinic_phone, clinic_address, smtp_email, smtp_password, theme_preference, color_palette, notification_email_reminders, notification_upcoming_appointments, notification_push } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx}`); values.push(name); idx++; }
    if (email !== undefined) { fields.push(`email = $${idx}`); values.push(email); idx++; }
    if (clinic_name !== undefined) { fields.push(`clinic_name = $${idx}`); values.push(clinic_name); idx++; }
    if (veterinarian_name !== undefined) { fields.push(`veterinarian_name = $${idx}`); values.push(veterinarian_name); idx++; }
    if (clinic_phone !== undefined) { fields.push(`clinic_phone = $${idx}`); values.push(clinic_phone); idx++; }
    if (clinic_address !== undefined) { fields.push(`clinic_address = $${idx}`); values.push(clinic_address); idx++; }
    if (smtp_email !== undefined) { fields.push(`smtp_email = $${idx}`); values.push(smtp_email); idx++; }
    if (smtp_password !== undefined && smtp_password !== '••••••••') { fields.push(`smtp_password = $${idx}`); values.push(smtp_password); idx++; }
    if (theme_preference !== undefined) { fields.push(`theme_preference = $${idx}`); values.push(theme_preference); idx++; }
    if (color_palette !== undefined) { fields.push(`color_palette = $${idx}`); values.push(color_palette); idx++; }
    if (notification_email_reminders !== undefined) { fields.push(`notification_email_reminders = $${idx}`); values.push(notification_email_reminders); idx++; }
    if (notification_upcoming_appointments !== undefined) { fields.push(`notification_upcoming_appointments = $${idx}`); values.push(notification_upcoming_appointments); idx++; }
    if (notification_push !== undefined) { fields.push(`notification_push = $${idx}`); values.push(notification_push); idx++; }
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, rut, name, email, role, theme_preference, color_palette, created_at, smtp_email, clinic_name, veterinarian_name, clinic_phone, clinic_address, notification_email_reminders, notification_upcoming_appointments, notification_push`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = result.rows[0];
    if (user.smtp_password) user.smtp_password = '••••••••';
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/auth/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Contraseña actual y nueva contraseña requeridas' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }
    if (!/[A-Z]/.test(new_password) || !/[a-z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(400).json({ error: 'La contraseña debe contener mayúsculas, minúsculas y números' });
    }
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    res.json({ data: { success: true } });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── DISEASES ────────────────────────────────────────────
app.get('/items/diseases', async (req, res) => {
  try {
    let query = 'SELECT *, references_list AS references FROM diseases';
    const params = [];
    const conditions = [];

    // Org filtering: show global diseases + org-specific diseases
    // Extract orgId from token if available (optional endpoint)
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
    query += ' ORDER BY CASE WHEN species = \'both\' THEN 0 WHEN species = \'dog\' THEN 1 ELSE 2 END, prevalence_rank ASC NULLS LAST, name ASC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/diseases/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT *, references_list AS references FROM diseases WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/diseases', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const result = await pool.query(
      `WITH ins AS (INSERT INTO diseases (name, scientific_name, species, category, severity, description, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list, photo_url, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *)
       SELECT *, references_list AS references FROM ins`,
      [d.name, d.scientific_name, d.species, d.category, d.severity, d.description,
       JSON.stringify(d.key_signs), JSON.stringify(d.diagnosis), JSON.stringify(d.treatment),
       JSON.stringify(d.prevention), d.prognosis, d.is_zoonotic, JSON.stringify(d.references), d.photo_url || null,
       req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/diseases/:id', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const allowed = ['name','scientific_name','species','category','severity','description','pathophysiology','key_signs','diagnosis','treatment','prevention','prognosis','is_zoonotic','references_list','photo_url','life_stage'];
    const safe = sanitizeColumns(allowed, d);
    const aliasMap = { references: 'references_list' };
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const column = aliasMap[key] || key;
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${column} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    const result = await pool.query(
      `WITH u AS (UPDATE diseases SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *) SELECT *, references_list AS references FROM u`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/diseases/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM diseases WHERE id = $1', [req.params.id]);
    res.json({ data: null });
  } catch (err) {
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PETS ────────────────────────────────────────────────
app.get('/items/pets', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE user_id = $1 ORDER BY name', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/pets', authMiddleware, async (req, res) => {
  try {
    const p = req.body;
    if (!p.name || !String(p.name).trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (p.species && !['dog', 'cat'].includes(p.species)) return res.status(400).json({ error: 'La especie debe ser dog o cat' });
    const result = await pool.query(
       `INSERT INTO pets (name, species, breed, birth_date, weight, color, photo, allergies, notes, tutor_name, phone, email, address, clinic_location, reproductive_status, status, anamnesis, user_id, organization_id,
        id_number, sex, temperament, habitat, habitat_other, food, food_frequency, water_consumption, urination, lives_with_other_animals, vaccines, deworming, flea_treatment, last_heat, surgeries, other_diseases, medications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36) RETURNING *`,
       [p.name, p.species, p.breed, p.birth_date, p.weight, p.color, p.photo,
        JSON.stringify(p.allergies || []), p.notes,
        p.tutor_name || null, p.phone || null, p.email || null, p.address || null, p.clinic_location || null,
        p.reproductive_status || 'intacto', p.status || 'alive', p.anamnesis || null,
        req.userId, req.organizationId || null,
        p.id_number || null, p.sex || null, JSON.stringify(p.temperament || []),
        p.habitat || null, p.habitat_other || null,
        p.food || null, p.food_frequency || null, p.water_consumption || null, p.urination || null,
        p.lives_with_other_animals || null,
        p.vaccines || null, p.deworming || null, p.flea_treatment || null, p.last_heat || null,
        p.surgeries || null, p.other_diseases || null, p.medications || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const p = req.body;
    const allowed = ['name','species','breed','birth_date','weight','color','photo','allergies','notes','tutor_name','phone','email','address','clinic_location','id_number','sex','temperament','habitat','habitat_other','food','food_frequency','water_consumption','urination','lives_with_other_animals','vaccines','deworming','flea_treatment','last_heat','surgeries','other_diseases','medications','reproductive_status','anamnesis','vital_signs','hallazgos_examen_fisico','motivo_consulta','entorno','areneros','status','receive_reminders','last_visit','pre_diagnostico','base_diseases'];
    const safe = sanitizeColumns(allowed, p);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE pets SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/medical_records', authMiddleware, async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── NOTES ───────────────────────────────────────────────
app.get('/items/personal_notes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/personal_notes', authMiddleware, async (req, res) => {
  try {
    const n = req.body;
    const result = await pool.query(
      `INSERT INTO personal_notes (title, content, tags, disease_id, pet_id, user_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [n.title, n.content, JSON.stringify(n.tags || []), n.disease_id, n.pet_id, req.userId]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/personal_notes/:id', authMiddleware, async (req, res) => {
  try {
    const n = req.body;
    const allowed = ['title','content','tags','disease_id','pet_id'];
    const safe = sanitizeColumns(allowed, n);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE personal_notes SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/personal_notes/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM personal_notes WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── FAVORITES ───────────────────────────────────────────
app.get('/items/favorites', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY added_at DESC', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/favorites', authMiddleware, async (req, res) => {
  try {
    const f = req.body;
    const result = await pool.query(
      `INSERT INTO favorites (disease_id, category, added_at, user_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [f.disease_id, f.category || 'frequently_used', f.added_at || new Date().toISOString(), req.userId]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/favorites/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/appointments', authMiddleware, async (req, res) => {
  try {
    const a = req.body;
    if (!a.patient_name || !String(a.patient_name).trim()) return res.status(400).json({ error: 'El nombre del paciente es obligatorio' });
    if (!a.start_time || isNaN(Date.parse(a.start_time))) return res.status(400).json({ error: 'Fecha de inicio válida es requerida' });
    const result = await pool.query(
      `INSERT INTO appointments (user_id, patient_name, tutor_phone, start_time, end_time, appointment_type, description, organization_id, pet_id, follow_up_of, veterinarian)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.userId, a.patient_name, a.tutor_phone || null, a.start_time, a.end_time || null,
       a.appointment_type || 'consulta', a.description || null, req.organizationId || null,
       a.pet_id || null, a.follow_up_of || null, a.veterinarian || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
    const a = req.body;

    // If changing status, validate transition
    if (a.status) {
      const currentResult = await pool.query(
        'SELECT status, checked_in_at, started_at, finished_at FROM appointments WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );
      if (!currentResult.rows.length) return res.status(404).json({ error: 'Not found' });
      const current = currentResult.rows[0];

      if (!isValidTransition(current.status, a.status)) {
        return res.status(400).json({
          error: `Transicion invalida: ${current.status} -> ${a.status}`,
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
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/clinical_records', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    if (!r.pet_id || !isValidUUID(r.pet_id)) return res.status(400).json({ error: 'pet_id válido es requerido' });
    if (!r.record_type || !['consulta', 'vacuna', 'cirugia', 'control'].includes(r.record_type)) {
      return res.status(400).json({ error: 'record_type debe ser consulta, vacuna, cirugia o control' });
    }
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [r.pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      `INSERT INTO clinical_records (pet_id, user_id, record_type, date, veterinarian, details, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [r.pet_id, req.userId, r.record_type || 'consulta', r.date || new Date().toISOString(),
       r.veterinarian || null, JSON.stringify(r.details || {}), req.organizationId || null]
    );
    // Auto-update pet's last_visit
    await pool.query(
      'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
      [r.date || new Date().toISOString(), r.pet_id]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    const allowed = ['pet_id','record_type','date','veterinarian','details'];
    const safe = sanitizeColumns(allowed, r);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const valStr = key === 'details' ? JSON.stringify(val) : (typeof val === 'object' ? JSON.stringify(val) : val);
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE clinical_records SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    // Auto-update pet's last_visit if date changed
    if (r.date) {
      const record = result.rows[0];
      await pool.query(
        'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
        [r.date, record.pet_id]
      );
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clinical_records WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── INVENTORY ──────────────────────────────────────────
app.get('/items/inventory', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE user_id = $1 ORDER BY name', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/inventory', authMiddleware, async (req, res) => {
  try {
    const i = req.body;
    const result = await pool.query(
      `INSERT INTO inventory (user_id, name, category, current_stock, min_stock, unit, last_restocked, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.userId, i.name, i.category || 'insumo', i.current_stock || 0, i.min_stock || 5,
       i.unit || 'unidades', i.last_restocked || null, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const i = req.body;
    const allowed = ['name','category','current_stock','min_stock','unit','last_restocked'];
    const safe = sanitizeColumns(allowed, i);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE inventory SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT pr.* FROM prescriptions pr JOIN pets p ON p.id = pr.pet_id WHERE pr.id = $1 AND p.user_id = $2',
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/prescriptions', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    const allowed = ['pet_id','clinical_record_id','veterinarian_name','clinic_branch','prescription_body','format','status','issued_at'];
    const safe = sanitizeColumns(allowed, r);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(safe)) {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE prescriptions SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM prescriptions WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PRESCRIPTION EMAIL ───────────────────────────────
app.post('/items/prescriptions/:id/email', authMiddleware, async (req, res) => {
  try {
    if (!rateLimit(`email:${req.userId}`, 10, 3600000)) {
      return res.status(429).json({ error: 'Límite de emails alcanzado (máx 10 por hora)' });
    }
    const result = await pool.query(
      `SELECT pr.*, p.name AS pet_name, p.species, p.breed, p.weight, p.sex,
              p.tutor_name, p.email AS tutor_email, p.phone AS tutor_phone,
              p.birth_date, p.reproductive_status
       FROM prescriptions pr
       JOIN pets p ON p.id = pr.pet_id
       WHERE pr.id = $1 AND pr.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Receta no encontrada' });

    const rx = result.rows[0];
    if (!rx.tutor_email) return res.status(400).json({ error: 'El tutor no tiene correo electrónico registrado' });

    const nodemailer = require('nodemailer');
    const { generatePrescriptionPdf } = require('./utils/generatePrescriptionPdf');

    const userResult = await pool.query(
      'SELECT email, clinic_name, veterinarian_name, clinic_phone, clinic_address FROM users WHERE id = $1',
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
      { name: rx.pet_name, species: rx.species, breed: rx.breed, weight: rx.weight, sex: rx.sex, birth_date: rx.birth_date, reproductive_status: rx.reproductive_status, tutor_name: rx.tutor_name, tutor_email: rx.tutor_email, tutor_phone: rx.tutor_phone, id: rx.pet_id },
      { veterinarian_name: userProfile.veterinarian_name, clinic_name: userProfile.clinic_name, clinic_phone: userProfile.clinic_phone, vet_email: vetEmail }
    );

    const beagleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="48" height="48"><ellipse cx="18" cy="42" rx="14" ry="22" fill="#8D6E63"/><ellipse cx="70" cy="42" rx="14" ry="22" fill="#8D6E63"/><ellipse cx="44" cy="76" rx="18" ry="12" fill="#FFFFFF"/><circle cx="44" cy="44" r="28" fill="#FFFFFF"/><path d="M26 38Q30 18 44 16Q58 18 62 38Q56 30 44 28Q32 30 26 38Z" fill="#5D4037"/><circle cx="34" cy="44" r="6" fill="#FFFFFF"/><circle cx="35" cy="44" r="3.5" fill="#1A1A1A"/><circle cx="36" cy="42.5" r="1.2" fill="#FFF"/><circle cx="54" cy="44" r="6" fill="#FFFFFF"/><circle cx="53" cy="44" r="3.5" fill="#1A1A1A"/><circle cx="54" cy="42.5" r="1.2" fill="#FFF"/><path d="M44 52L40 48Q44 45 48 48Z" fill="#1A1A1A"/><path d="M40 50Q36 54 32 52" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M48 50Q52 54 56 52" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`;
    const beagleDataUri = `data:image/svg+xml,${encodeURIComponent(beagleSvg)}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333; background: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #FF8F00, #FFA726); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <img src="${beagleDataUri}" alt="VetCloud" width="48" height="48" style="margin-bottom: 8px;" />
    <h1 style="margin: 0; font-size: 24px; font-weight: 800;">VetCloud</h1>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Receta Veterinaria</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
      <div style="flex: 1; background: #FFF8E1; padding: 16px; border-radius: 8px; border-left: 4px solid #FF8F00;">
        <h3 style="margin: 0 0 8px; color: #FF8F00; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5;">Paciente</h3>
        <p style="margin: 0; font-size: 16px; font-weight: 700;">${rx.pet_name}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #666;">${speciesLabel} — ${rx.breed || 'N/D'}</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #666;">Edad: ${age} | Sexo: ${sexLabel} | Peso: ${rx.weight || 'N/D'} kg</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #666;">Estado reproductivo: ${rx.reproductive_status || 'N/D'}</p>
      </div>
      <div style="flex: 1; background: #F3E5F5; padding: 16px; border-radius: 8px; border-left: 4px solid #6741D9;">
        <h3 style="margin: 0 0 8px; color: #6741D9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5;">Propietario</h3>
        <p style="margin: 0; font-size: 16px; font-weight: 700;">${rx.tutor_name || 'N/D'}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #666;">${rx.tutor_email}</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #666;">${rx.tutor_phone || ''}</p>
      </div>
    </div>
    <div style="display: flex; gap: 16px; font-size: 13px; color: #666; margin-bottom: 20px; padding: 12px; background: #fafafa; border-radius: 8px;">
      <span><strong>Sucursal:</strong> ${rx.clinic_branch || userProfile.clinic_name || 'N/D'}</span>
      <span><strong>Prescriptor:</strong> ${rx.veterinarian_name || userProfile.veterinarian_name || 'N/D'}</span>
      <span><strong>Fecha:</strong> ${new Date(rx.issued_at).toLocaleDateString('es-CL')}</span>
    </div>
    <div style="background: #FAFAFA; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h3 style="margin: 0 0 12px; color: #FF8F00; font-size: 14px; font-weight: 700;">Receta</h3>
      <div style="white-space: pre-wrap; line-height: 1.8; font-size: 14px;">${escapeHtml(rx.prescription_body).replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #999; background: #fff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 6px;">Para consultas, responda a este correo o escriba a <strong style="color: #FF8F00;">${vetEmail}</strong></p>
    <p style="margin: 0;">Documento electrónico generado por <strong style="color: #FF8F00;">VetCloud</strong></p>
  </div>
</body>
</html>`;

    const issuedDate = new Date(rx.issued_at).toLocaleDateString('es-CL');
    const attachments = pdfBuffer ? [{
      filename: `receta_${rx.pet_name.replace(/\s+/g, '_')}_${issuedDate.replace(/\//g, '-')}.pdf`,
      content: pdfBuffer,
    }] : [];

    await transporter.sendMail({
      from: `"VetCloud" <${process.env.SMTP_EMAIL}>`,
      to: rx.tutor_email,
      subject: `Receta veterinaria — ${rx.pet_name} — ${issuedDate}`,
      html: htmlBody,
      attachments,
    });

    res.json({ data: { success: true } });
  } catch (err) {
    console.error('Email error:', err);
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
      'SELECT email, clinic_name, veterinarian_name, clinic_phone, clinic_address FROM users WHERE id = $1',
      [req.userId]
    );
    const userProfile = userResult.rows[0] || {};

    const { generatePrescriptionPdf } = require('./utils/generatePrescriptionPdf');
    const pdfBuffer = await generatePrescriptionPdf(
      { ...rx, veterinarian_name: rx.veterinarian_name || userProfile.veterinarian_name, vet_email: userProfile.email },
      { name: pet.name, species: pet.species, breed: pet.breed, weight: pet.weight, sex: pet.sex, birth_date: pet.birth_date, reproductive_status: pet.reproductive_status, tutor_name: pet.tutor_name, tutor_email: pet.tutor_email, tutor_phone: pet.tutor_phone, id: pet.id },
      { veterinarian_name: userProfile.veterinarian_name, clinic_name: userProfile.clinic_name, clinic_phone: userProfile.clinic_phone, vet_email: userProfile.email }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receta_${pet.name.replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Prescription PDF error:', err);
    res.status(500).json({ error: 'Error generando PDF' });
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
    res.setHeader('Content-Disposition', `attachment; filename=ficha_${pet.name.replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Patient file PDF error:', err);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

// ─── VET ASSISTANT ──────────────────────────────────────
app.post('/assistant', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Mensaje requerido' });

    // Load diseases from DB
    const diseasesResult = await pool.query('SELECT * FROM diseases');
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
    console.error('Assistant error:', err);
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
    console.error('List reminders error:', err);
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
    console.error('Upcoming reminders error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/reminders', authMiddleware, async (req, res) => {
  try {
    const { pet_id, tutor_email, reminder_type, title, message, scheduled_for } = req.body;
    if (!pet_id || !tutor_email || !reminder_type || !title || !message || !scheduled_for) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const petCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!petCheck.rows.length) return res.status(403).json({ error: 'No autorizado' });
    const result = await pool.query(
      `INSERT INTO reminders (user_id, pet_id, tutor_email, reminder_type, title, message, scheduled_for, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, pet_id, tutor_email, reminder_type, title, message, scheduled_for, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/reminders/auto-generate', authMiddleware, async (req, res) => {
  try {
    const { pet_id } = req.body;
    if (!pet_id) return res.status(400).json({ error: 'pet_id requerido' });
    const petCheck = await pool.query(
      'SELECT id, name, species, breed, birth_date, email, receive_reminders FROM pets WHERE id = $1 AND user_id = $2',
      [pet_id, req.userId]
    );
    if (!petCheck.rows.length) return res.status(403).json({ error: 'No autorizado' });
    const pet = petCheck.rows[0];
    if (!pet.receive_reminders) return res.status(400).json({ error: 'El tutor no desea recibir recordatorios' });
    if (!pet.email) return res.status(400).json({ error: 'El tutor no tiene email registrado' });

    const records = await pool.query(
      `SELECT * FROM clinical_records WHERE pet_id = $1 AND user_id = $2 AND record_type = 'vacuna'
       ORDER BY date DESC`,
      [pet_id, req.userId]
    );

    const reminders = [];
    for (const rec of records.rows) {
      const vaccineName = rec.details?.notes?.split('\n')[0] || 'Vacuna';
      const recDate = new Date(rec.date);
      const nextDate = new Date(recDate);
      nextDate.setMonth(nextDate.getMonth() + 12);

      if (nextDate > new Date()) {
        const existing = await pool.query(
          `SELECT id FROM reminders WHERE pet_id = $1 AND related_record_id = $2 AND status = 'pending'`,
          [pet_id, rec.id]
        );
        if (!existing.rows.length) {
          const r = await pool.query(
            `INSERT INTO reminders (user_id, pet_id, tutor_email, reminder_type, title, message, scheduled_for, related_record_id, organization_id)
             VALUES ($1, $2, $3, 'vacuna', $4, $5, $6, $7, $8) RETURNING *`,
            [req.userId, pet_id, pet.email,
             `Refuerzo de ${vaccineName} — ${pet.name}`,
             `Es hora del refuerzo de ${vaccineName} para ${pet.name} (${pet.breed || 'N/D'}). Agende su cita.`,
             nextDate.toISOString(), rec.id, req.organizationId || null]
          );
          reminders.push(r.rows[0]);
        }
      }
    }
    res.json({ data: reminders });
  } catch (err) {
    console.error('Auto-generate reminders error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/reminders/:id', authMiddleware, async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM reminders WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!check.rows.length) return res.status(404).json({ error: 'Recordatorio no encontrado' });
    const { status, scheduled_for } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;
    if (status) { updates.push(`status = $${idx++}`); params.push(status); }
    if (scheduled_for) { updates.push(`scheduled_for = $${idx++}`); params.push(scheduled_for); }
    if (status === 'sent') { updates.push(`sent_at = NOW()`); }
    if (!updates.length) return res.status(400).json({ error: 'Sin cambios' });
    params.push(req.params.id);
    const result = await pool.query(`UPDATE reminders SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Update reminder error:', err);
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
    console.error('Delete reminder error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/items/reminders/send-pending', authMiddleware, async (req, res) => {
  try {
    if (!rateLimit(`email:${req.userId}`, 10, 3600000)) {
      return res.status(429).json({ error: 'Límite de emails alcanzado (máx 10 por hora)' });
    }
    const result = await pool.query(
      `SELECT r.*, p.name AS pet_name, p.species, p.breed
       FROM reminders r JOIN pets p ON p.id = r.pet_id
       WHERE r.user_id = $1 AND r.status = 'pending' AND r.scheduled_for <= NOW()`,
      [req.userId]
    );
    if (!result.rows.length) return res.json({ data: { sent: 0 } });

    const nodemailer = require('nodemailer');
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return res.status(400).json({ error: 'SMTP no configurado' });
    }
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
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #FF8F00, #FFA726); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 22px;">🐶 VetCloud</h1>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Recordatorio</p>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="background: #FFF8E1; padding: 16px; border-radius: 8px; border-left: 4px solid #FF8F00; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px; color: #FF8F00; font-size: 12px; text-transform: uppercase;">Paciente</h3>
      <p style="margin: 0; font-size: 18px; font-weight: 700;">${reminder.pet_name}</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #666;">${speciesLabel} — ${reminder.breed || 'N/D'}</p>
    </div>
    <div style="background: #FAFAFA; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h3 style="margin: 0 0 8px; color: #333; font-size: 14px;">${escapeHtml(reminder.title)}</h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.6;">${escapeHtml(reminder.message)}</p>
      <p style="margin: 12px 0 0; font-size: 13px; color: #999;">Fecha: ${new Date(reminder.scheduled_for).toLocaleDateString('es-CL')}</p>
    </div>
  </div>
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #999; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0;">Para cancelar este recordatorio, responda a este correo.</p>
    <p style="margin: 4px 0 0;">Documento generado por <strong style="color: #FF8F00;">VetCloud</strong></p>
  </div>
</body></html>`;

        await transporter.sendMail({
          from: `"VetCloud" <${process.env.SMTP_EMAIL}>`,
          to: reminder.tutor_email,
          subject: `Recordatorio: ${reminder.title}`,
          html: htmlBody,
        });
        await pool.query(`UPDATE reminders SET status = 'sent', sent_at = NOW() WHERE id = $1`, [reminder.id]);
        sentCount++;
      } catch (e) {
        console.error(`Failed to send reminder ${reminder.id}:`, e.message);
      }
    }
    res.json({ data: { sent: sentCount } });
  } catch (err) {
    console.error('Send reminders error:', err);
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
    console.error('Error fetching hospitalizations:', error);
    res.status(500).json({ error: 'Failed to fetch hospitalizations' });
  }
});

app.post('/items/hospitalizations', authMiddleware, async (req, res) => {
  try {
    const { pet_id, reason, status, veterinarian, notes } = req.body;
    if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'pet_id válido es requerido' });
    if (!reason || !String(reason).trim()) return res.status(400).json({ error: 'El motivo es obligatorio' });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      'INSERT INTO hospitalizations (pet_id, user_id, reason, status, veterinarian, notes, organization_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [pet_id, req.userId, reason, status || 'internado', veterinarian || null, notes || null, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating hospitalization:', error);
    res.status(500).json({ error: 'Failed to create hospitalization' });
  }
});

app.patch('/items/hospitalizations/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const allowed = ['discharge_date', 'status', 'veterinarian', 'notes', 'reason'];
    const safe = sanitizeColumns(allowed, req.body);
    if (Object.keys(safe).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const sets = Object.keys(safe).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(safe), req.userId];
    const result = await pool.query(`UPDATE hospitalizations SET ${sets} WHERE id = $1 AND user_id = $${values.length} RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating hospitalization:', error);
    res.status(500).json({ error: 'Failed to update hospitalization' });
  }
});

app.delete('/items/hospitalizations/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const result = await pool.query('DELETE FROM hospitalizations WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting hospitalization:', error);
    res.status(500).json({ error: 'Failed to delete hospitalization' });
  }
});

// ─── LAB EXAMS ─────────────────────────────────────────
app.get('/items/lab_exams', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT le.*, p.name as pet_name, p.species, p.breed FROM lab_exams le LEFT JOIN pets p ON le.pet_id = p.id WHERE le.user_id = $1';
    const params = [req.userId];
    if (status && status !== 'todos') {
      query += ' AND le.status = $2';
      params.push(status);
    }
    query += ' ORDER BY le.date DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching lab exams:', error);
    res.status(500).json({ error: 'Failed to fetch lab exams' });
  }
});

app.post('/items/lab_exams', authMiddleware, async (req, res) => {
  try {
    const { pet_id, exam_name, exam_type, status, result: examResult, veterinarian } = req.body;
    if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'pet_id válido es requerido' });
    if (!exam_name || !String(exam_name).trim()) return res.status(400).json({ error: 'El nombre del examen es obligatorio' });
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      'INSERT INTO lab_exams (pet_id, user_id, exam_name, exam_type, status, result, veterinarian, organization_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [pet_id, req.userId, exam_name, exam_type || null, status || 'pendiente', examResult || null, veterinarian || null, req.organizationId || null]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating lab exam:', error);
    res.status(500).json({ error: 'Failed to create lab exam' });
  }
});

app.patch('/items/lab_exams/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const allowed = ['exam_name', 'exam_type', 'status', 'result', 'veterinarian'];
    const safe = sanitizeColumns(allowed, req.body);
    if (Object.keys(safe).length === 0) return res.status(400).json({ error: 'Sin cambios' });
    const sets = Object.keys(safe).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(safe), req.userId];
    const result = await pool.query(`UPDATE lab_exams SET ${sets} WHERE id = $1 AND user_id = $${values.length} RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating lab exam:', error);
    res.status(500).json({ error: 'Failed to update lab exam' });
  }
});

app.delete('/items/lab_exams/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
    const result = await pool.query('DELETE FROM lab_exams WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting lab exam:', error);
    res.status(500).json({ error: 'Failed to delete lab exam' });
  }
});

// ─── STATS ─────────────────────────────────────────────
app.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const [pets, appointments, records, lowStock] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM pets WHERE user_id = $1', [req.userId]),
      pool.query("SELECT COUNT(*) FROM appointments WHERE user_id = $1 AND start_time::date = CURRENT_DATE", [req.userId]),
      pool.query('SELECT COUNT(*) FROM clinical_records WHERE user_id = $1', [req.userId]),
      pool.query('SELECT COUNT(*) FROM inventory WHERE user_id = $1 AND current_stock <= min_stock', [req.userId])
    ]);
    res.json({
      data: {
        totalPets: parseInt(pets.rows[0].count),
        todayAppointments: parseInt(appointments.rows[0].count),
        totalRecords: parseInt(records.rows[0].count),
        lowStockAlerts: parseInt(lowStock.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/stats/weekly', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(date, 'Dy') as day, COUNT(*)::int as count
      FROM clinical_records
      WHERE user_id = $1 AND date >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(date, 'Dy'), EXTRACT(DOW FROM date)
      ORDER BY EXTRACT(DOW FROM date)
    `, [req.userId]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    res.status(500).json({ error: 'Failed to fetch weekly stats' });
  }
});

app.get('/stats/record-types', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT record_type, COUNT(*)::int as count
      FROM clinical_records
      WHERE user_id = $1
      GROUP BY record_type
    `, [req.userId]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching record types:', error);
    res.status(500).json({ error: 'Failed to fetch record types' });
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
    console.error('Error fetching vital measurements:', error);
    res.status(500).json({ error: 'Failed to fetch vital measurements' });
  }
});

app.post('/vital-measurements', authMiddleware, async (req, res) => {
  try {
    const allowed = ['pet_id', 'weight', 'temperature', 'heart_rate', 'respiratory_rate', 'blood_pressure', 'spo2', 'mucous_membranes', 'hydration', 'body_condition', 'notes'];
    const data = sanitizeColumns(allowed, req.body);
    if (!data.pet_id || !isValidUUID(data.pet_id)) {
      return res.status(400).json({ error: 'pet_id requerido y debe ser UUID valido' });
    }
    const result = await pool.query(
      'INSERT INTO vital_measurements (pet_id, user_id, organization_id, weight, temperature, heart_rate, respiratory_rate, blood_pressure, spo2, mucous_membranes, hydration, body_condition, notes, recorded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
      [data.pet_id, req.userId, req.organizationId, data.weight || null, data.temperature || null, data.heart_rate || null, data.respiratory_rate || null, data.blood_pressure || null, data.spo2 || null, data.mucous_membranes || null, data.hydration || null, data.body_condition || null, data.notes || null, req.userId]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating vital measurement:', error);
    res.status(500).json({ error: 'Failed to create vital measurement' });
  }
});

// ─── PAYMENTS ─────────────────────────────────────────
app.get('/payments', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT py.*, p.name as pet_name FROM payments py LEFT JOIN pets p ON py.pet_id = p.id WHERE py.organization_id = $1 ORDER BY py.paid_at DESC LIMIT 200',
      [req.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/payments', authMiddleware, async (req, res) => {
  try {
    const allowed = ['appointment_id', 'pet_id', 'amount', 'method', 'description'];
    const data = sanitizeColumns(allowed, req.body);
    if (!data.amount || isNaN(parseFloat(data.amount))) {
      return res.status(400).json({ error: 'amount requerido y debe ser numerico' });
    }
    const validMethods = ['efectivo', 'debito', 'credito', 'transferencia', 'otro'];
    if (data.method && !validMethods.includes(data.method)) {
      return res.status(400).json({ error: 'method invalido. Use: ' + validMethods.join(', ') });
    }
    const result = await pool.query(
      'INSERT INTO payments (organization_id, user_id, appointment_id, pet_id, amount, method, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.organizationId, req.userId, data.appointment_id || null, data.pet_id || null, parseFloat(data.amount), data.method || 'efectivo', data.description || null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// ─── REPORTS ──────────────────────────────────────────
app.get('/reports/summary', authMiddleware, async (req, res) => {
  try {
    const orgId = req.organizationId;
    const [patients, appointments, payments, records] = await Promise.all([
      pool.query('SELECT COUNT(*)::int as total FROM pets WHERE organization_id = $1', [orgId]),
      pool.query(`SELECT COUNT(*)::int as total, COUNT(CASE WHEN status = 'completada' THEN 1 END)::int as completed FROM appointments WHERE organization_id = $1 AND start_time >= date_trunc('month', now())`, [orgId]),
      pool.query('SELECT COALESCE(SUM(amount),0)::numeric as total, COUNT(*)::int as count FROM payments WHERE organization_id = $1 AND paid_at >= date_trunc(\'month\', now())', [orgId]),
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
    console.error('Error fetching report summary:', error);
    res.status(500).json({ error: 'Failed to fetch report summary' });
  }
});

app.get('/reports/expiring-inventory', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory WHERE organization_id = $1 AND expiration_date IS NOT NULL AND expiration_date <= now() + interval '30 days' ORDER BY expiration_date ASC LIMIT 50",
      [req.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching expiring inventory:', error);
    res.status(500).json({ error: 'Failed to fetch expiring inventory' });
  }
});

// ─── GLOBAL SEARCH ────────────────────────────────────
app.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query debe tener al menos 2 caracteres' });
    }
    const term = `%${q.trim().toLowerCase()}%`;
    const [pets, owners] = await Promise.all([
      pool.query(
        'SELECT id, name, species, breed, tutor_name, tutor_phone FROM pets WHERE LOWER(name) LIKE $1 OR LOWER(breed) LIKE $1 OR LOWER(tutor_name) LIKE $1 OR tutor_phone LIKE $1 LIMIT 20',
        [term]
      ),
      pool.query(
        'SELECT DISTINCT tutor_name, tutor_phone FROM pets WHERE LOWER(tutor_name) LIKE $1 OR tutor_phone LIKE $1 LIMIT 20',
        [term]
      ),
    ]);
    res.json({ data: { pets: pets.rows, owners: owners.rows } });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// ─── FILE UPLOAD ─────────────────────────────────────────
// NOTE: Client should upload directly to Cloudinary via services/cloudinary.ts
// This endpoint is kept for backwards compatibility but returns an error
app.post('/files', authMiddleware, (req, res) => {
  res.status(501).json({ error: 'Use client-side Cloudinary upload instead (services/cloudinary.ts)' });
});

// ─── ADMIN PANEL ───────────────────────────────────────
app.get('/admin', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    res.sendFile(path.join(__dirname, 'admin.html'));
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

if (!process.env.VERCEL_ENV) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VetCloud API running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
  });
}

module.exports = app;
