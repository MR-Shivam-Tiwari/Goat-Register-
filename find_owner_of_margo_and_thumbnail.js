const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function trace() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    const res = await client.query(`
      SELECT DISTINCT A.id, A.name 
      FROM animals A
      JOIN animals M ON (A.id_mother = M.id OR A.id_father = M.id)
      WHERE M.id = 353 OR M.id = 476
    `);
    console.log('Direct children of Margo/Thumbnail:', res.rows);

    const candidates = await client.query(`
      SELECT id, name FROM animals WHERE id_mother = 476 OR id_father = 476
    `);
    console.log('Children of Thumbnail (476):', candidates.rows);

    const match = await client.query(`
      SELECT A.id, A.name, A.id_mother, A.id_father 
      FROM animals A 
      WHERE (id_mother = 378 AND id_father = 375) 
         OR (id_mother = 378 AND id_father = 374)
         OR id_mother = 476 OR id_father = 476
    `);
    console.log('Candidate matches:', match.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
