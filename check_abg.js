const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();
  const res = await client.query(`
    SELECT a.id, a.name, gd.code_abg, gd.code_ua 
    FROM animals a
    LEFT JOIN goats_data gd ON a.id = gd.id_goat
    WHERE a.id IN (344, 295, 281, 388)
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
