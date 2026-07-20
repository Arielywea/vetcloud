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
const JWT_SECRET = process.env.JWT_SECRET || 'vetcloud-secret-2026';

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : process.env.VERCEL_ENV
      ? { connectionString: 'postgresql://neondb_owner:npg_3C7BEuHeRvPO@ep-aged-river-ac7edlxd.sa-east-1.aws.neon.tech/neondb?sslmode=require', ssl: { rejectUnauthorized: false } }
      : {
          host: 'localhost',
          port: 1245,
          database: 'vetcloud',
          user: 'postgres',
          password: '',
        }
);

app.get('/debug/db', (req, res) => {
  const url = process.env.DATABASE_URL || 'NOT SET';
  const masked = url.length > 5 ? url.replace(/:[^:@]+@/, ':***@') : url;
  const allKeys = Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('NEON') || k.includes('VERCEL'));
  res.json({
    databaseUrl: masked,
    hasUrl: !!process.env.DATABASE_URL,
    urlLength: url.length,
    vercelEnv: process.env.VERCEL_ENV || 'not set',
    relevantKeys: allKeys,
  });
});

app.use(cors());
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
        user: { id: user.id, rut: user.rut, name: user.name, email: user.email, role: user.role, theme_preference: user.theme_preference || 'light' },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, rut, name, email, role, theme_preference, created_at FROM users WHERE id = $1', [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.get('/items/diseases/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT *, references_list AS references FROM diseases WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items/diseases', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

app.patch('/items/diseases/:id', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/diseases/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM diseases WHERE id = $1', [req.params.id]);
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PETS ────────────────────────────────────────────────
app.get('/items/pets', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE user_id = $1 ORDER BY name', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/pets/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ─── NOTES ───────────────────────────────────────────────
app.get('/items/personal_notes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/personal_notes/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM personal_notes WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FAVORITES ───────────────────────────────────────────
app.get('/items/favorites', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY added_at DESC', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/favorites/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.get('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clinical_records WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INVENTORY ──────────────────────────────────────────
app.get('/items/inventory', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE user_id = $1 ORDER BY name', [req.userId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/inventory/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/prescriptions/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM prescriptions WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
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

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333; background: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #FF8F00, #FFA726); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
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
      <span><strong>Sucursal:</strong> ${rx.clinic_branch || 'Casa Matriz'}</span>
      <span><strong>Prescriptor:</strong> ${rx.veterinarian_name || 'N/D'}</span>
      <span><strong>Fecha:</strong> ${new Date(rx.issued_at).toLocaleDateString('es-CL')}</span>
    </div>
    <div style="background: #FAFAFA; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h3 style="margin: 0 0 12px; color: #FF8F00; font-size: 14px; font-weight: 700;">Receta</h3>
      <div style="white-space: pre-wrap; line-height: 1.8; font-size: 14px;">${rx.prescription_body.replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div style="text-align: center; padding: 16px; font-size: 11px; color: #999; background: #fff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
    Este es un documento electrónico generado por <strong style="color: #FF8F00;">VetCloud</strong>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"VetCloud" <${process.env.SMTP_EMAIL}>`,
      to: rx.tutor_email,
      subject: `Receta veterinaria — ${rx.pet_name} — ${new Date(rx.issued_at).toLocaleDateString('es-CL')}`,
      html: htmlBody,
    });

    res.json({ data: { success: true } });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── FILE UPLOAD ─────────────────────────────────────────
app.post('/files', upload.single('file'), (req, res) => {
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
