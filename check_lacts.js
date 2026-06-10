const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();
  const res = await client.query(`
    SELECT gl.id as lact_id, gl.lact_no, gl.milk, a.id as goat_id, a.name 
    FROM goats_lact gl 
    JOIN animals a ON gl.id_goat = a.id 
    WHERE gl.id IN (123, 124, 125, 170, 172, 201)
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
