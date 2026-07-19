const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }

const app = express();
const PORT = process.env.PORT || 8055;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: 'localhost',
        port: 1245,
        database: 'vetcloud',
        user: 'postgres',
        password: '',
      }
);

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
} catch (e) {}

const upload = multer({ storage: multer.memoryStorage() });

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
    const result = await pool.query('SELECT * FROM diseases WHERE id = $1', [req.params.id]);
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
      `INSERT INTO diseases (name, scientific_name, species, category, severity, description, key_signs, diagnosis, treatment, prevention, prognosis, is_zoonotic, references_list)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
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
    for (const [key, val] of Object.entries(d)) {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE diseases SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
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
app.get('/items/pets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets ORDER BY name');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/items/pets/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pets WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items/pets', async (req, res) => {
  try {
    const p = req.body;
    const result = await pool.query(
      `INSERT INTO pets (name, species, breed, birth_date, weight, color, photo, allergies, notes, tutor_name, phone, email, address, clinic_location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [p.name, p.species, p.breed, p.birth_date, p.weight, p.color, p.photo,
       JSON.stringify(p.allergies || []), p.notes,
       p.tutor_name || null, p.phone || null, p.email || null, p.address || null, p.clinic_location || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/items/pets/:id', async (req, res) => {
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
    const result = await pool.query(
      `UPDATE pets SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/pets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pets WHERE id = $1', [req.params.id]);
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MEDICAL RECORDS ─────────────────────────────────────
app.get('/items/medical_records', async (req, res) => {
  try {
    let query = 'SELECT * FROM medical_records';
    const params = [];
    if (req.query.pet_id) {
      query += ' WHERE pet_id = $1';
      params.push(req.query.pet_id);
    }
    query += ' ORDER BY date DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items/medical_records', async (req, res) => {
  try {
    const r = req.body;
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
app.get('/items/personal_notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_notes ORDER BY updated_at DESC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items/personal_notes', async (req, res) => {
  try {
    const n = req.body;
    const result = await pool.query(
      `INSERT INTO personal_notes (title, content, tags, disease_id, pet_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [n.title, n.content, JSON.stringify(n.tags || []), n.disease_id, n.pet_id]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/items/personal_notes/:id', async (req, res) => {
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
    const result = await pool.query(
      `UPDATE personal_notes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/personal_notes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM personal_notes WHERE id = $1', [req.params.id]);
    res.json({ data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FAVORITES ───────────────────────────────────────────
app.get('/items/favorites', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites ORDER BY added_at DESC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items/favorites', async (req, res) => {
  try {
    const f = req.body;
    const result = await pool.query(
      `INSERT INTO favorites (disease_id, category, added_at) VALUES ($1,$2,$3) RETURNING *`,
      [f.disease_id, f.category || 'frequently_used', f.added_at || new Date().toISOString()]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/favorites/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE id = $1', [req.params.id]);
    res.json({ data: null });
  } catch (err) {
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
