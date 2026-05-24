const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function trace() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    const res = await client.query(`SELECT id, name FROM animals`);
    
    for (const goat of res.rows) {
      const treeRes = await client.query(`
        WITH RECURSIVE ancestry AS (
          SELECT id, name, id_mother, id_father, 0 as level, 'ME' as path FROM animals WHERE id = $1
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
        SELECT * FROM ancestry
      `, [goat.id]);

      const ids = treeRes.rows.map(r => r.id);
      if (ids.length === 0) continue;

      const lactRes = await client.query(`
        SELECT L.*, A.name as goat_name 
        FROM goats_lact L 
        JOIN animals A ON L.id_goat = A.id 
        WHERE L.id_goat = ANY($1)
      `, [ids]);

      const groups = {};
      lactRes.rows.forEach(l => {
        if (!groups[l.id_goat]) groups[l.id_goat] = [];
        groups[l.id_goat].push(l);
      });

      const allLacts = [];
      treeRes.rows.forEach(r => {
        const lactations = groups[r.id] || [];
        lactations.forEach(l => {
          allLacts.push(l);
        });
      });

      if (allLacts.length === 43) {
        console.log(`EXACT 43 ROWS MATCH: Goat ID ${goat.id}, Name: ${goat.name}`);
        // Let's print the first 5 records to verify
        console.log('Sample records:');
        allLacts.slice(0, 5).forEach((l, i) => {
          console.log(`  ${i+1} | ${l.viewer} | L${l.lact_no} | ${l.milk}kg`);
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
