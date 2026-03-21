require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1]);
    const res = await pool.query('SELECT alias, name FROM breeds WHERE alias = $1', ['ZAA']);
    console.log('Result for ZAA:', res.rows);
    
    const all = await pool.query('SELECT alias, name FROM breeds LIMIT 5');
    console.log('First 5 breeds:', all.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
