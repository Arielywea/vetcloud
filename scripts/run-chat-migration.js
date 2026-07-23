require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('scripts/add-chat-tables.sql', 'utf8');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query(sql)
  .then(() => { console.log('Migration OK'); pool.end(); })
  .catch(e => { console.error('Error:', e.message); pool.end(); });
