const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function trace() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    const res = await client.query(`
      WITH RECURSIVE ancestry AS (
        SELECT id, name, id_mother, id_father, 0 as level, 'ME' as path FROM animals WHERE id = 508
        UNION ALL
        SELECT a.id, a.name, a.id_mother, a.id_father, anc.level + 1,
               CASE 
                 WHEN a.id = anc.id_mother THEN anc.path || 'M' 
                 WHEN a.id = anc.id_father THEN anc.path || 'F'
               END
        FROM animals a
        JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
        WHERE anc.level < 10
      )
      SELECT * FROM ancestry ORDER BY level ASC
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
