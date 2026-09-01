const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function test() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  
  const farmRes = await c.query("SELECT * FROM farms WHERE id = 8");
  console.log("Farm 8:", farmRes.rows);
  
  const animalsRes = await c.query("SELECT id, name, id_user, id_farm FROM animals WHERE id_farm = 8 LIMIT 5");
  console.log("Goats in Farm 8:", animalsRes.rows);
  
  await c.end();
}
test();
