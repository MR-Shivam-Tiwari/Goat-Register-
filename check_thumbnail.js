const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    // Find Kamadhenu Thumbnail / Dyuymovochka
    const res = await client.query(`
      SELECT id, name, sex, id_mother, id_father FROM animals 
      WHERE name LIKE '%Thumbnail%' OR name LIKE '%Dyuymovochka%'
    `);
    console.log('--- Dyuymovochka / Thumbnail in DB ---');
    console.log(res.rows);

    if (res.rows.length > 0) {
      const id = res.rows[0].id;
      // Find her children
      const children = await client.query(`
        SELECT id, name, sex, id_mother, id_father FROM animals WHERE id_mother = $1 OR id_father = $1
      `, [id]);
      console.log('--- Children ---');
      console.log(children.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
