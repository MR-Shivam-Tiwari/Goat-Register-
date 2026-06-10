const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();
  const res = await client.query(`
    SELECT gl.id as lact_id, gl.lact_no, gl.milk, gl.fat, gl.protein, a.id as goat_id, a.name 
    FROM goats_lact gl 
    JOIN animals a ON gl.id_goat = a.id 
    WHERE gl.milk IN (1306.3, 1247, 1231.2) 
       OR gl.milk::text LIKE '1306%' 
       OR gl.milk::text LIKE '1247%' 
       OR gl.milk::text LIKE '1231%'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
