const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const hash = bcrypt.hashSync('1245', 10);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await pool.query('DELETE FROM users');
  await pool.query(
    'INSERT INTO users (rut, name, password_hash, role) VALUES ($1,$2,$3,$4), ($5,$6,$7,$8)',
    ['21293992-7', 'Ariel', hash, 'admin', '21392885-6', 'Novia', hash, 'admin']
  );
  const r = await pool.query('SELECT rut, name, role FROM users');
  console.log('Users created:', JSON.stringify(r.rows));
  await pool.end();
})();
