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
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// ─── AUTH ENDPOINTS ───────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  try {
    const { rut, password } = req.body;
    if (!rut || !password) return res.status(400).json({ error: 'RUT y contraseña requeridos' });
    const result = await pool.query('SELECT * FROM users WHERE rut = $1', [rut]);
    if (!result.rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ userId: user.id, rut: user.rut, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      data: {
        token,
        user: { id: user.id, rut: user.rut, name: user.name, email: user.email, role: user.role, theme_preference: user.theme_preference || 'light', color_palette: user.color_palette || null },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, rut, name, email, role, theme_preference, color_palette, created_at, smtp_email, clinic_name, veterinarian_name, clinic_phone, clinic_address FROM users WHERE id = $1', [req.userId]);
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
    const { name, email, clinic_name, veterinarian_name, clinic_phone, clinic_address, smtp_email, smtp_password, theme_preference, color_palette } = req.body;
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
    if (!fields.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, rut, name, email, role, theme_preference, color_palette, created_at, smtp_email, clinic_name, veterinarian_name, clinic_phone, clinic_address`,
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
    if (new_password.length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
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
    query += ' ORDER BY name';

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
      `WITH ins AS (INSERT INTO diseases (name, scientific_name, species, category, severity, description, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *)
       SELECT *, references_list AS references FROM ins`,
      [d.name, d.scientific_name, d.species, d.category, d.severity, d.description,
       JSON.stringify(d.key_signs), JSON.stringify(d.diagnosis), JSON.stringify(d.treatment),
       JSON.stringify(d.prevention), d.prognosis, d.is_zoonotic, JSON.stringify(d.references)]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/diseases/:id', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    const aliasMap = { references: 'references_list' };
    for (const [key, val] of Object.entries(d)) {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
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
    const result = await pool.query(
       `INSERT INTO pets (name, species, breed, birth_date, weight, color, photo, allergies, notes, tutor_name, phone, email, address, clinic_location, reproductive_status, status, anamnesis, user_id,
        id_number, sex, temperament, habitat, habitat_other, food, food_frequency, water_consumption, urination, lives_with_other_animals, vaccines, deworming, flea_treatment, last_heat, surgeries, other_diseases, medications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35) RETURNING *`,
       [p.name, p.species, p.breed, p.birth_date, p.weight, p.color, p.photo,
        JSON.stringify(p.allergies || []), p.notes,
        p.tutor_name || null, p.phone || null, p.email || null, p.address || null, p.clinic_location || null,
        p.reproductive_status || 'intacto', p.status || 'alive', p.anamnesis || null,
        req.userId,
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
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(p)) {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
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
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(n)) {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
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
    const result = await pool.query(
      `INSERT INTO appointments (user_id, patient_name, tutor_phone, start_time, end_time, appointment_type, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, a.patient_name, a.tutor_phone || null, a.start_time, a.end_time || null,
       a.appointment_type || 'consulta', a.description || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const a = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(a)) {
      if (key === 'id' || key === 'created_at' || key === 'user_id') continue;
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
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [r.pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      `INSERT INTO clinical_records (pet_id, user_id, record_type, date, veterinarian, details)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [r.pet_id, req.userId, r.record_type || 'consulta', r.date || new Date().toISOString(),
       r.veterinarian || null, JSON.stringify(r.details || {})]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(r)) {
      if (key === 'id' || key === 'created_at' || key === 'user_id' || key === 'pet_id') continue;
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
      `INSERT INTO inventory (user_id, name, category, current_stock, min_stock, unit, last_restocked)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, i.name, i.category || 'insumo', i.current_stock || 0, i.min_stock || 5,
       i.unit || 'unidades', i.last_restocked || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const i = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(i)) {
      if (key === 'id' || key === 'created_at' || key === 'user_id') continue;
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
      `INSERT INTO prescriptions (pet_id, user_id, clinical_record_id, veterinarian_name, clinic_branch, prescription_body, format, status, issued_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [r.pet_id, req.userId, r.clinical_record_id || null,
       r.veterinarian_name || null, r.clinic_branch || 'Casa Matriz',
       r.prescription_body, r.format || 'standard', r.status || 'active',
       r.issued_at || new Date().toISOString()]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(r)) {
      if (key === 'id' || key === 'created_at' || key === 'user_id' || key === 'pet_id') continue;
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
      <div style="white-space: pre-wrap; line-height: 1.8; font-size: 14px;">${rx.prescription_body.replace(/\n/g, '<br>')}</div>
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

// ─── CHATBOT ────────────────────────────────────────────
function processChatMessage(message) {
  const lower = message.toLowerCase().trim();

  if (/emergenc|urgen|sangr|no camina|vomit|convuls|no respir|inconscien|accidente|atropell|envenen|ahog/.test(lower)) {
    return { intent: 'emergencia', response: '⚠️ Esto parece una emergencia. Llame al número de emergencia de su clínica inmediatamente. Si no lo tiene, contacte a su veterinario de confianza.' };
  }
  if (/agendar|cita|consultar|reservar|turno|disponibilidad|horario.*cita|cuándo.*ver|cuando.*ver/.test(lower)) {
    return { intent: 'agendar', response: 'Puede agendar una cita llamando a la clínica o escribiendo "cita" con los datos de su mascota. ¿Para qué mascota es la cita y cuál es el motivo?' };
  }
  if (/horario|abren|cierran|a qué hora|hora.*atención|funcionan/.test(lower)) {
    return { intent: 'horario', response: 'Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 y sábados de 9:00 a 13:00. Para emergencias, contáctenos directamente.' };
  }
  if (/precio|costo|cuánto|tarifa|presupuesto|valor|cuanto.*cuesta/.test(lower)) {
    return { intent: 'precio', response: 'Los precios varían según el servicio y la condición del paciente. Le recomendamos llamar para obtener una cotización personalizada.' };
  }
  if (/vacuna|vacunación|vacun|refuerzo|antirrábica|moquillo/.test(lower)) {
    return { intent: 'vacuna', response: 'Las vacunas son esenciales para la salud de su mascota. Agende una cita para evaluar el esquema de vacunación según la edad y riesgo de su mascota.' };
  }
  if (/desparasit|parásit|lombriz|tenia|gusano/.test(lower)) {
    return { intent: 'desparasitacion', response: 'La desparasitación se recomienda cada 3 meses para mascotas adultas. Si es un cachorro, puede necesitar frecuencia mayor. Agende su cita.' };
  }
  if (/medicamento|receta|medicina|pastilla|inyección|antibiótico/.test(lower)) {
    return { intent: 'medicamento', response: 'Las recetas son emitidas por nuestros veterinarios tras una evaluación. Agende una consulta para que pueda ser evaluado y tratado correctamente.' };
  }
  if (/hola|buenos|buenas|hello|hi/.test(lower)) {
    return { intent: 'saludo', response: '¡Hola! Bienvenido a VetCloud. ¿En qué puedo ayudarle? Puede preguntar por horarios, citas, precios, vacunas o emergencias.' };
  }
  if (/gracias|agradezco|thank/.test(lower)) {
    return { intent: 'agradecimiento', response: '¡De nada! Estamos aquí para ayudarle. Si tiene otra pregunta, no dude en escribirnos.' };
  }
  return { intent: 'otro', response: 'No entendí su mensaje. Puede preguntar por: horarios, citas, precios, vacunas, desparasitación o emergencias.' };
}

// Public chat endpoint (no auth needed for pet owners)
app.post('/chat/conversations', async (req, res) => {
  try {
    const { tutor_name, tutor_phone, tutor_email, pet_name } = req.body;
    const result = await pool.query(
      `INSERT INTO chat_conversations (user_id, tutor_name, tutor_phone, tutor_email, pet_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [null, tutor_name || null, tutor_phone || null, tutor_email || null, pet_name || null]
    );
    const conv = result.rows[0];
    await pool.query(
      `INSERT INTO chat_messages (conversation_id, sender, message, intent) VALUES ($1, 'bot', $2, 'bienvenida')`,
      [conv.id, `¡Hola${tutor_name ? ' ' + tutor_name : ''}! Bienvenido a VetCloud. ¿En qué puedo ayudarle? Puede preguntar por horarios, citas, precios, vacunas o emergencias.`]
    );
    const messages = await pool.query('SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at', [conv.id]);
    res.json({ data: { ...conv, messages: messages.rows } });
  } catch (err) {
    console.error('Create chat error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/chat/conversations/:id/messages', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Mensaje requerido' });
    const conv = await pool.query('SELECT * FROM chat_conversations WHERE id = $1', [req.params.id]);
    if (!conv.rows.length) return res.status(404).json({ error: 'Conversación no encontrada' });

    await pool.query(
      `INSERT INTO chat_messages (conversation_id, sender, message) VALUES ($1, 'user', $2)`,
      [req.params.id, message.trim()]
    );

    const { intent, response } = processChatMessage(message);

    await pool.query(
      `INSERT INTO chat_messages (conversation_id, sender, message, intent) VALUES ($1, 'bot', $2, $3)`,
      [req.params.id, response, intent]
    );

    await pool.query(`UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1`, [req.params.id]);

    if (intent === 'emergencia') {
      await pool.query(`UPDATE chat_conversations SET status = 'pending' WHERE id = $1`, [req.params.id]);
    }

    const messages = await pool.query('SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at', [req.params.id]);
    res.json({ data: { messages: messages.rows, intent } });
  } catch (err) {
    console.error('Chat message error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Auth-required chat endpoints (for admin/vet)
app.get('/chat/conversations', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM chat_conversations WHERE user_id = $1';
    const params = [req.userId];
    if (status) { query += ' AND status = $2'; params.push(status); }
    query += ' ORDER BY updated_at DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error('List chat error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/chat/conversations/:id', authMiddleware, async (req, res) => {
  try {
    const conv = await pool.query('SELECT * FROM chat_conversations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!conv.rows.length) return res.status(404).json({ error: 'No encontrada' });
    const messages = await pool.query('SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at', [req.params.id]);
    res.json({ data: { ...conv.rows[0], messages: messages.rows } });
  } catch (err) {
    console.error('Get chat error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/chat/conversations/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE chat_conversations SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [status, req.params.id, req.userId]);
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('Update chat error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/chat/agent-reply', authMiddleware, async (req, res) => {
  try {
    const { conversation_id, message } = req.body;
    if (!conversation_id || !message?.trim()) return res.status(400).json({ error: 'Faltan campos' });
    await pool.query(
      `INSERT INTO chat_messages (conversation_id, sender, message) VALUES ($1, 'agent', $2)`,
      [conversation_id, message.trim()]
    );
    await pool.query(`UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1`, [conversation_id]);
    res.json({ data: { success: true } });
  } catch (err) {
    console.error('Agent reply error:', err);
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
      `INSERT INTO reminders (user_id, pet_id, tutor_email, reminder_type, title, message, scheduled_for)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, pet_id, tutor_email, reminder_type, title, message, scheduled_for]
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
            `INSERT INTO reminders (user_id, pet_id, tutor_email, reminder_type, title, message, scheduled_for, related_record_id)
             VALUES ($1, $2, $3, 'vacuna', $4, $5, $6, $7) RETURNING *`,
            [req.userId, pet_id, pet.email,
             `Refuerzo de ${vaccineName} — ${pet.name}`,
             `Es hora del refuerzo de ${vaccineName} para ${pet.name} (${pet.breed || 'N/D'}). Agende su cita.`,
             nextDate.toISOString(), rec.id]
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
      <h3 style="margin: 0 0 8px; color: #333; font-size: 14px;">${reminder.title}</h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.6;">${reminder.message}</p>
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

// ─── FILE UPLOAD ─────────────────────────────────────────
app.post('/files', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file upload' });
  res.json({
    data: {
      id: `${Date.now()}-${req.file.originalname}`,
      filename_disk: `${Date.now()}-${req.file.originalname}`,
      filename_download: req.file.originalname,
      type: req.file.mimetype,
      filesize: req.file.size,
    },
  });
});

// ─── ADMIN PANEL ───────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

if (!process.env.VERCEL_ENV) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VetCloud API running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
  });
}

module.exports = app;
