const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:ft123shivam123@[2406:da1c:f42:ae08:70a6:9010:fbda:60e2]:5432/postgres',
});
async function test() {
  try {
    const res = await pool.query('SELECT current_database()');
    console.log('Connected to:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
test();
