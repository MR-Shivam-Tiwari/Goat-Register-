const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function fix() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query("UPDATE users SET farms = '8' WHERE login = 'luda-divo@ukr.net'");
  console.log("Updated user 33 to have farm 8");
  await c.end();
}
fix();
