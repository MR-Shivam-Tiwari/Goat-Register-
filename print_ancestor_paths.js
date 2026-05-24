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
        SELECT id, name, sex, id_mother, id_father, 0 as level, 'ME' as path FROM animals WHERE id = 508
        UNION ALL
        SELECT a.id, a.name, a.sex, a.id_mother, a.id_father, anc.level + 1,
               CASE 
                 WHEN a.id = anc.id_mother THEN anc.path || 'M' 
                 WHEN a.id = anc.id_father THEN anc.path || 'F'
               END
        FROM animals a
        JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
        WHERE anc.level < 10
      )
      SELECT * FROM ancestry 
      WHERE name IN ('Samia Zw Z', 'Jakarta H Dr 122 D', 'Jolante D')
      ORDER BY name, level ASC
    `);

    console.log('--- Ancestor Paths in Pedigree of 508 ---');
    res.rows.forEach(r => {
      console.log(`Name: ${r.name}, ID: ${r.id}, Level: ${r.level}, Path: ${r.path}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
