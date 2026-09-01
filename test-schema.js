const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function test() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const res = await c.query("SELECT id, login, farms FROM users WHERE farms LIKE '%8%' LIMIT 5");
  console.log("Users with farm 8:", res.rows);
  await c.end();
}
test();
