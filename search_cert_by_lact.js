const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();
  const res = await client.query("SELECT * FROM goats_cert WHERE id_m_row1 IN (227, 237, 220) OR id_fm_row1 IN (227, 237, 220) OR id_mf_row1 IN (227, 237, 220) OR id_ff_row1 IN (227, 237, 220) OR id_m_row2 IN (227, 237, 220) OR id_fm_row2 IN (227, 237, 220) OR id_mf_row2 IN (227, 237, 220) OR id_ff_row2 IN (227, 237, 220)");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
