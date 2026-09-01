const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function test() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const res = await c.query("SELECT COUNT(*) FROM farms");
  console.log("Total farms:", res.rows[0].count);
  await c.end();
}
test();
