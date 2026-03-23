require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'animals'");
  console.log(res.rows.map(r => r.column_name).join(', '));
  process.exit();
}
check();
