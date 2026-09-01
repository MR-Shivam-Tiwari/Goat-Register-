const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function test() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const userRes = await c.query("SELECT id, login, email, farms FROM users WHERE login = 'luda-divo@ukr.net' OR email = 'luda-divo@ukr.net'");
  console.log("User:", userRes.rows);
  if (userRes.rows.length > 0) {
    const user = userRes.rows[0];
    if (user.farms) {
      const farmIds = user.farms.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (farmIds.length > 0) {
        const farmRes = await c.query(`SELECT id, name FROM farms WHERE id = ANY($1::int[])`, [farmIds]);
        console.log("Farms:", farmRes.rows);
      } else {
        console.log("User has no valid farms in column.");
      }
    } else {
      console.log("User has no farms (null/empty).");
    }
  }
  await c.end();
}
test();
