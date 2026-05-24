const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function trace() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    const treeRes = await client.query(`
      WITH RECURSIVE ancestry AS (
        SELECT id, name, id_mother, id_father, 0 as level, 'ME' as path FROM animals WHERE id = 353
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

    const ids = treeRes.rows.map(r => r.id);
    const lactRes = await client.query(`
      SELECT L.*, A.name as goat_name 
      FROM goats_lact L 
      JOIN animals A ON L.id_goat = A.id 
      WHERE L.id_goat = ANY($1)
      ORDER BY id_goat, lact_no ASC
    `, [ids]);

    console.log('Lactations fetched:');
    lactRes.rows.forEach(l => {
      console.log(`${l.id} | ${l.goat_name} (ID: ${l.id_goat}) | L${l.lact_no} | ${l.lact_days}d | ${l.milk}kg | ${l.fat}% | ${l.protein}% | ${l.milk_day} | ${l.have_graph}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
