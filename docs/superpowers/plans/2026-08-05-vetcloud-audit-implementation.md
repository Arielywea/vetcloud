# VetCloud Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical security vulnerabilities and connect mock screens to real API, making VetCloud production-ready.

**Architecture:** Parallel tracks — Track A (security fixes in server.js) and Track B (new tables + API + frontend connections), converging in a final integration phase.

**Tech Stack:** Express.js, Neon PostgreSQL, Expo web, React Native Paper

## Global Constraints

- Neon DB: `postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`
- JWT_SECRET: `5c2206cf72a537b3bab9d497958b77d214f5f5786d5b0dd77222e9533ac80694`
- All DB queries must use parameterized queries (no string interpolation)
- All new tables need `user_id` FK for multi-tenant isolation
- Frontend uses `useDirectus.ts` hooks for API calls
- Design tokens in `constants/tokens.ts` (use `TEXT_ON_PRIMARY`, `alpha()`)

---

## Track A — Security (server.js)

### Task A1: SQL Injection Fix

**Files:**
- Modify: `server.js` (add helper + fix 7 PATCH endpoints)

**Interfaces:**
- Produces: `sanitizeColumns(allowed, body)` helper function

- [ ] **Step 1: Add sanitizeColumns helper at top of server.js (after imports)**

```javascript
function sanitizeColumns(allowed, body) {
  const safe = {};
  for (const key of Object.keys(body)) {
    if (allowed.includes(key)) {
      safe[key] = body[key];
    }
  }
  return safe;
}
```

- [ ] **Step 2: Fix PATCH /items/diseases/:id**

Replace the dynamic column loop with:
```javascript
const allowed = ['name','scientific_name','species','category','severity','description','pathophysiology','key_signs','diagnosis','treatment','prevention','prognosis','is_zoonotic','references_list','photo_url','life_stage'];
const d = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 3: Fix PATCH /items/pets/:id**

```javascript
const allowed = ['name','species','breed','birth_date','weight','color','photo','allergies','notes','tutor_name','phone','email','address','clinic_location','id_number','sex','temperament','habitat','habitat_other','food','food_frequency','water_consumption','urination','lives_with_other_animals','vaccines','deworming','flea_treatment','last_heat','surgeries','other_diseases','medications','reproductive_status','anamnesis','vital_signs','hallazgos_examen_fisico','motivo_consulta','entorno','areneros','status','receive_reminders','last_visit'];
const p = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 4: Fix PATCH /items/personal_notes/:id**

```javascript
const allowed = ['title','content','tags','disease_id','pet_id'];
const n = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 5: Fix PATCH /items/appointments/:id**

```javascript
const allowed = ['patient_name','tutor_phone','start_time','end_time','appointment_type','description','veterinarian','status','pet_id','room'];
const a = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 6: Fix PATCH /items/clinical_records/:id**

```javascript
const allowed = ['pet_id','record_type','date','veterinarian','details'];
const cr = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 7: Fix PATCH /items/inventory/:id**

```javascript
const allowed = ['name','category','current_stock','min_stock','unit','last_restocked'];
const inv = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 8: Fix PATCH /items/prescriptions/:id**

```javascript
const allowed = ['pet_id','clinical_record_id','veterinarian_name','clinic_branch','prescription_body','format','status','issued_at'];
const rx = sanitizeColumns(allowed, req.body);
```

- [ ] **Step 9: Commit**

```bash
git add server.js
git commit -m "fix(security): whitelist column names in all PATCH endpoints to prevent SQL injection"
```

---

### Task A2: User Scoping

**Files:**
- Modify: `server.js` (add user_id filter to ~15 SELECT queries)

- [ ] **Step 1: Fix GET /items/pets — add WHERE user_id = $1**

```javascript
const result = await pool.query('SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
```

- [ ] **Step 2: Fix GET /items/personal_notes**

```javascript
const result = await pool.query('SELECT * FROM personal_notes WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
```

- [ ] **Step 3: Fix GET /items/favorites**

```javascript
const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY added_at DESC', [req.userId]);
```

- [ ] **Step 4: Fix GET /items/appointments (and date-filtered variant)**

```javascript
// Without date filter
const result = await pool.query('SELECT * FROM appointments WHERE user_id = $1 ORDER BY start_time', [req.userId]);

// With date filter
const result = await pool.query('SELECT * FROM appointments WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3 ORDER BY start_time', [req.userId, start, end]);
```

- [ ] **Step 5: Fix GET /items/clinical_records**

```javascript
let query = 'SELECT * FROM clinical_records WHERE user_id = $1';
let params = [req.userId];
// ... add pet_id/record_type filters with $2, $3 etc.
```

- [ ] **Step 6: Fix GET /items/inventory**

```javascript
const result = await pool.query('SELECT * FROM inventory WHERE user_id = $1 ORDER BY name', [req.userId]);
```

- [ ] **Step 7: Fix GET /items/inventory/low-stock**

```javascript
const result = await pool.query('SELECT * FROM inventory WHERE user_id = $1 AND current_stock <= min_stock ORDER BY name', [req.userId]);
```

- [ ] **Step 8: Fix GET /items/prescriptions**

```javascript
let query = 'SELECT * FROM prescriptions WHERE user_id = $1';
let params = [req.userId];
```

- [ ] **Step 9: Fix GET /items/reminders (and variants)**

```javascript
const result = await pool.query('SELECT * FROM reminders WHERE user_id = $1 ORDER BY scheduled_for', [req.userId]);
// /upcoming variant:
const result = await pool.query('SELECT * FROM reminders WHERE user_id = $1 AND status = $2 AND scheduled_for >= NOW() ORDER BY scheduled_for LIMIT 10', [req.userId, 'pending']);
```

- [ ] **Step 10: Fix GET /items/medical_records**

```javascript
let query = 'SELECT * FROM medical_records WHERE pet_id = $1';
// Note: medical_records doesn't have user_id column, filter via pet ownership
// Alternative: JOIN with pets to verify ownership
```

- [ ] **Step 11: Commit**

```bash
git add server.js
git commit -m "fix(security): add user_id scoping to all SELECT queries for multi-tenant isolation"
```

---

### Task A3: Upload Fix (Cloudinary Migration)

**Files:**
- Modify: `server.js` (remove broken POST /files, add Cloudinary proxy endpoint)

- [ ] **Step 1: Remove or comment out the broken POST /files endpoint**

- [ ] **Step 2: Add Cloudinary upload proxy (if needed for server-side uploads)**

```javascript
app.post('/files/upload', authMiddleware, async (req, res) => {
  // Client should upload directly to Cloudinary via services/cloudinary.ts
  // This endpoint is a fallback for server-side uploads
  res.status(501).json({ error: 'Use client-side Cloudinary upload instead' });
});
```

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "fix(upload): remove broken file upload endpoint, use Cloudinary instead"
```

---

### Task A4: XSS in Emails

**Files:**
- Modify: `server.js` (add escapeHtml helper + apply to email templates)

- [ ] **Step 1: Add escapeHtml helper**

```javascript
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
```

- [ ] **Step 2: Apply to prescription email template**

Find `rx.prescription_body.replace(/\n/g, '<br>')` and replace with:
```javascript
escapeHtml(rx.prescription_body).replace(/\n/g, '<br>')
```

- [ ] **Step 3: Apply to reminder email templates**

Find all `reminder.message` or similar in email HTML and wrap with `escapeHtml()`.

- [ ] **Step 4: Commit**

```bash
git add server.js
git commit -m "fix(security): escape HTML in email templates to prevent XSS"
```

---

### Task A5: Input Validation

**Files:**
- Modify: `server.js` (add validation to POST/PATCH endpoints)

- [ ] **Step 1: Add UUID validation helper**

```javascript
function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
```

- [ ] **Step 2: Add validation to POST /items/pets**

```javascript
const { name, species } = req.body;
if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
if (species && !['dog', 'cat'].includes(species)) return res.status(400).json({ error: 'Species must be dog or cat' });
```

- [ ] **Step 3: Add validation to POST /items/appointments**

```javascript
const { patient_name, start_time } = req.body;
if (!patient_name || !patient_name.trim()) return res.status(400).json({ error: 'Patient name is required' });
if (!start_time || isNaN(Date.parse(start_time))) return res.status(400).json({ error: 'Valid start_time is required' });
```

- [ ] **Step 4: Add validation to POST /items/clinical_records**

```javascript
const { pet_id, record_type } = req.body;
if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'Valid pet_id is required' });
if (!record_type || !['consulta', 'vacuna', 'cirugia', 'control'].includes(record_type)) {
  return res.status(400).json({ error: 'record_type must be consulta, vacuna, cirugia, or control' });
}
```

- [ ] **Step 5: Add validation to route params (all :id routes)**

```javascript
// At the start of each route with :id
if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
```

- [ ] **Step 6: Commit**

```bash
git add server.js
git commit -m "feat(validation): add input validation to POST/PATCH endpoints"
```

---

### Task A6: Rate Limiting

**Files:**
- Modify: `server.js` (add in-memory rate limiter)

- [ ] **Step 1: Add rate limiter helper**

```javascript
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
```

- [ ] **Step 2: Apply to POST /auth/login**

```javascript
const clientIp = req.ip || req.connection.remoteAddress;
if (!rateLimit(`login:${clientIp}`, 5, 60000)) {
  return res.status(429).json({ error: 'Too many login attempts. Try again in 1 minute.' });
}
```

- [ ] **Step 3: Apply to email endpoints**

```javascript
if (!rateLimit(`email:${req.userId}`, 10, 3600000)) {
  return res.status(429).json({ error: 'Email rate limit exceeded. Max 10 per hour.' });
}
```

- [ ] **Step 4: Commit**

```bash
git add server.js
git commit -m "feat(security): add rate limiting to login and email endpoints"
```

---

## Track B — Functionality

### Task B1: Hospitalization Real

**Files:**
- Create: SQL migration for `hospitalizations` table
- Modify: `server.js` (add CRUD endpoints)
- Modify: `app/(drawer)/hospitalizacion.tsx` (connect to real API)
- Modify: `hooks/useDirectus.ts` (add useHospitalizations hook)

**Interfaces:**
- Produces: `useHospitalizations()` hook returning { data, loading, error, create, update, remove }

- [ ] **Step 1: Create SQL migration**

```sql
-- migrations/add-hospitalizations-table.sql
CREATE TABLE IF NOT EXISTS hospitalizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'internado' CHECK (status IN ('internado', 'cirugia', 'recuperacion', 'discharged')),
  veterinarian VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitalizations_user_id ON hospitalizations(user_id);
CREATE INDEX idx_hospitalizations_pet_id ON hospitalizations(pet_id);
CREATE INDEX idx_hospitalizations_status ON hospitalizations(status);
```

- [ ] **Step 2: Run migration against Neon DB**

```bash
psql "postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require" -f migrations/add-hospitalizations-table.sql
```

- [ ] **Step 3: Add CRUD endpoints to server.js**

```javascript
// GET /items/hospitalizations
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

// POST /items/hospitalizations
app.post('/items/hospitalizations', authMiddleware, async (req, res) => {
  try {
    const { pet_id, reason, status, veterinarian, notes } = req.body;
    if (!pet_id || !isValidUUID(pet_id)) return res.status(400).json({ error: 'Valid pet_id is required' });
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Reason is required' });
    const result = await pool.query(
      'INSERT INTO hospitalizations (pet_id, user_id, reason, status, veterinarian, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [pet_id, req.userId, reason, status || 'internado', veterinarian || null, notes || null]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating hospitalization:', error);
    res.status(500).json({ error: 'Failed to create hospitalization' });
  }
});

// PATCH /items/hospitalizations/:id
app.patch('/items/hospitalizations/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const allowed = ['discharge_date', 'status', 'veterinarian', 'notes', 'reason'];
    const h = sanitizeColumns(allowed, req.body);
    if (Object.keys(h).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    const sets = Object.keys(h).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(h)];
    const result = await pool.query(`UPDATE hospitalizations SET ${sets} WHERE id = $1 AND user_id = $${values.length + 1} RETURNING *`, [...values, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating hospitalization:', error);
    res.status(500).json({ error: 'Failed to update hospitalization' });
  }
});

// DELETE /items/hospitalizations/:id
app.delete('/items/hospitalizations/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    await pool.query('DELETE FROM hospitalizations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting hospitalization:', error);
    res.status(500).json({ error: 'Failed to delete hospitalization' });
  }
});
```

- [ ] **Step 4: Add useHospitalizations hook to hooks/useDirectus.ts**

```typescript
export function useHospitalizations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (status?: string) => {
    setLoading(true);
    try {
      const params = status && status !== 'todos' ? `?status=${status}` : '';
      const res = await api.get(`/items/hospitalizations${params}`);
      setData(res.data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (body: any) => {
    const res = await api.post('/items/hospitalizations', body);
    return res.data.data;
  };

  const update = async (id: string, body: any) => {
    const res = await api.patch(`/items/hospitalizations/${id}`, body);
    return res.data.data;
  };

  const remove = async (id: string) => {
    await api.delete(`/items/hospitalizations/${id}`);
  };

  return { data, loading, error, fetch, create, update, remove };
}
```

- [ ] **Step 5: Rewrite hospitalizacion.tsx to use real data**

Replace `MOCK_ADMISSIONS` with `useHospitalizations()` hook calls. Keep the same UI structure but drive it from real data.

- [ ] **Step 6: Commit**

```bash
git add migrations/add-hospitalizations-table.sql server.js hooks/useDirectus.ts app/(drawer)/hospitalizacion.tsx
git commit -m "feat(hospitalization): connect to real API with new hospitalizations table"
```

---

### Task B2: Lab Exams Real

**Files:**
- Create: SQL migration for `lab_exams` table
- Modify: `server.js` (add CRUD endpoints)
- Modify: `app/(drawer)/laboratorio.tsx` (connect to real API)
- Modify: `hooks/useDirectus.ts` (add useLabExams hook)

- [ ] **Step 1: Create SQL migration**

```sql
-- migrations/add-lab-exams-table.sql
CREATE TABLE IF NOT EXISTS lab_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completado')),
  result TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  veterinarian VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_exams_user_id ON lab_exams(user_id);
CREATE INDEX idx_lab_exams_pet_id ON lab_exams(pet_id);
CREATE INDEX idx_lab_exams_status ON lab_exams(status);
```

- [ ] **Step 2: Run migration**

```bash
psql "postgresql://neondb_owner:npg_THFGcfaW5M7h@ep-aged-river-ac7edlxd-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require" -f migrations/add-lab-exams-table.sql
```

- [ ] **Step 3: Add CRUD endpoints to server.js** (similar pattern to hospitalizations)

- [ ] **Step 4: Add useLabExams hook**

- [ ] **Step 5: Rewrite laboratorio.tsx to use real data**

- [ ] **Step 6: Commit**

```bash
git add migrations/add-lab-exams-table.sql server.js hooks/useDirectus.ts app/(drawer)/laboratorio.tsx
git commit -m "feat(lab): connect to real API with new lab_exams table"
```

---

### Task B3: Reports Real

**Files:**
- Modify: `server.js` (add stats endpoints)
- Modify: `app/(drawer)/reportes.tsx` (connect to real data)
- Modify: `app/(drawer)/index.tsx` (connect dashboard stats)

- [ ] **Step 1: Add GET /stats/dashboard endpoint**

```javascript
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
```

- [ ] **Step 2: Add GET /stats/weekly endpoint**

```javascript
app.get('/stats/weekly', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(date, 'Dy') as day, COUNT(*) as count
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
```

- [ ] **Step 3: Add GET /stats/record-types endpoint**

```javascript
app.get('/stats/record-types', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT record_type, COUNT(*) as count
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
```

- [ ] **Step 4: Update reportes.tsx to fetch from /stats/* endpoints**

Replace `MOCK_WEEKLY`, `MOCK_TOP_RECORDS`, and hardcoded stat values with API calls.

- [ ] **Step 5: Update index.tsx dashboard to use /stats/dashboard**

Replace hardcoded `statsData` with API data.

- [ ] **Step 6: Commit**

```bash
git add server.js app/(drawer)/reportes.tsx app/(drawer)/index.tsx
git commit -m "feat(reports): connect dashboard and reports to real API stats"
```

---

### Task B4: Hidden Screens

**Files:**
- Modify: `components/layout/Sidebar.tsx` (add nav items)
- Modify: `app/(drawer)/_layout.tsx` (add SCREEN_TITLES)

- [ ] **Step 1: Add Notes, Reminders to Sidebar.tsx navigation**

Add to the appropriate section (e.g., GESTION):
```tsx
{ label: 'Notas', icon: 'note-text', route: '/notes' },
{ label: 'Recordatorios', icon: 'bell', route: '/reminders' },
```

- [ ] **Step 2: Add to SCREEN_TITLES in _layout.tsx**

```tsx
notes: 'Notas Personales',
reminders: 'Recordatorios',
search: 'Buscar Enfermedades',
```

- [ ] **Step 3: Evaluate if search.tsx is redundant with CommandPalette**

If redundant, consider removing search.tsx or keeping it as an advanced search option.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx app/(drawer)/_layout.tsx
git commit -m "feat(nav): add Notes and Reminders to sidebar navigation"
```

---

## Phase Final — Integration and Polish

### Task F1: Schema/Type Sync

**Files:**
- Create: SQL migrations for missing columns
- Modify: `services/directus.ts` (fix type mismatches)

- [ ] **Step 1: Create migration for diseases.life_stage**

```sql
ALTER TABLE diseases ADD COLUMN IF NOT EXISTS life_stage VARCHAR(20) DEFAULT 'all';
```

- [ ] **Step 2: Create migration for appointments missing columns**

```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS veterinarian VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'programada';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_id UUID REFERENCES pets(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS room VARCHAR(100);
```

- [ ] **Step 3: Run migrations**

- [ ] **Step 4: Fix references_list vs references in directus.ts**

Ensure the TS interface matches the SQL column name.

- [ ] **Step 5: Commit**

```bash
git add migrations/ services/directus.ts
git commit -m "fix(schema): sync SQL columns with TypeScript interfaces"
```

---

### Task F2: Empty Catch Blocks

**Files:**
- Modify: `app/(drawer)/configuracion.tsx`
- Modify: `app/(drawer)/notes.tsx`

- [ ] **Step 1: Add error toast to configuracion.tsx catch blocks**

Replace empty `catch {}` with:
```typescript
catch (e: any) {
  console.error('Error:', e);
  // Show toast or alert with error message
  Alert.alert('Error', e.message || 'Ocurrió un error');
}
```

- [ ] **Step 2: Add error toast to notes.tsx catch blocks**

Same pattern.

- [ ] **Step 3: Commit**

```bash
git add app/(drawer)/configuracion.tsx app/(drawer)/notes.tsx
git commit -m "fix(error-handling): add user feedback to empty catch blocks"
```

---

### Task F3: Password Policy

**Files:**
- Modify: `server.js` (PATCH /auth/password validation)

- [ ] **Step 1: Add password validation**

```javascript
const { new_password } = req.body;
if (!new_password || new_password.length < 8) {
  return res.status(400).json({ error: 'Password must be at least 8 characters' });
}
if (!/[A-Z]/.test(new_password) || !/[a-z]/.test(new_password) || !/[0-9]/.test(new_password)) {
  return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and numbers' });
}
```

- [ ] **Step 2: Update frontend validation in configuracion.tsx**

Change minimum from 4 to 8 characters.

- [ ] **Step 3: Commit**

```bash
git add server.js app/(drawer)/configuracion.tsx
git commit -m "feat(security): enforce 8-character minimum password with complexity"
```

---

### Task F4: Pagination

**Files:**
- Modify: `server.js` (add pagination to list endpoints)
- Modify: `hooks/useDirectus.ts` (support pagination params)

- [ ] **Step 1: Add pagination helper**

```javascript
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
```

- [ ] **Step 2: Apply to GET /items/pets**

```javascript
const { page, limit, offset } = parsePagination(req.query);
const countResult = await pool.query('SELECT COUNT(*) FROM pets WHERE user_id = $1', [req.userId]);
const result = await pool.query('SELECT * FROM pets WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.userId, limit, offset]);
res.json({ data: result.rows, pagination: { page, limit, total: parseInt(countResult.rows[0].count) } });
```

- [ ] **Step 3: Apply to other main list endpoints**

- [ ] **Step 4: Commit**

```bash
git add server.js hooks/useDirectus.ts
git commit -m "feat(pagination): add page/limit support to list endpoints"
```

---

### Task F5: Admin Panel Auth

**Files:**
- Modify: `server.js` (protect /admin route)

- [ ] **Step 1: Add auth check to /admin**

```javascript
app.get('/admin', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    // Serve admin panel
    res.sendFile(path.join(__dirname, 'admin.html'));
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add server.js
git commit -m "fix(security): protect admin panel with JWT + role check"
```

---

## Execution Order

```
Phase 1 (Security - can run in parallel):
  A1 → A2 → A3 → A4 → A5 → A6

Phase 2 (Functionality - can run in parallel):
  B1 → B2 → B3 → B4

Phase 3 (Integration - sequential):
  F1 → F2 → F3 → F4 → F5
```

## Verification

After all tasks:
1. Run `npm run lint` and `npm run typecheck`
2. Test all endpoints with curl/httpie
3. Verify hospitalizacion, laboratorio, reportes show real data
4. Verify sidebar shows Notes and Reminders
5. Verify SQL injection fix (try sending malicious column names)
6. Verify user scoping (login as different users, verify data isolation)
