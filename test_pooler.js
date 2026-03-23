const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.opqdkkmlgzuhbujgiaaj:ft123shivam123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
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
