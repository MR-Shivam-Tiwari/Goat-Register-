const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function test() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'farms'");
  console.log(res.rows);
  
  const farmRes = await c.query("SELECT * FROM farms WHERE id = 8");
  console.log("Farm 8:", farmRes.rows);
  await c.end();
}
test();
