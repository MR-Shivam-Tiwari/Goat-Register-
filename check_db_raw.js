const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const result = await pool.query('SELECT name, alias FROM breeds WHERE alias IS NOT NULL');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

check();
