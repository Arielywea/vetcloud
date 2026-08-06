const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function generatePassword() {
  return crypto.randomBytes(12).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

(async () => {
  const pw1 = generatePassword();
  const pw2 = generatePassword();
  const hash1 = bcrypt.hashSync(pw1, 10);
  const hash2 = bcrypt.hashSync(pw2, 10);

  await pool.query('DELETE FROM users');
  await pool.query(
    'INSERT INTO users (rut, name, password_hash, role) VALUES ($1,$2,$3,$4), ($5,$6,$7,$8)',
    ['RUT_REDACTED_A', 'Ariel', hash1, 'admin', 'RUT_REDACTED_B', 'Paz Quintana', hash2, 'admin']
  );

  console.log('\n=== Usuarios creados ===');
  console.log(`Ariel        — RUT: RUT_REDACTED_A  Password: ${pw1}`);
  console.log(`Paz Quintana — RUT: RUT_REDACTED_B  Password: ${pw2}`);
  console.log('========================\n');

  await pool.end();
})();
