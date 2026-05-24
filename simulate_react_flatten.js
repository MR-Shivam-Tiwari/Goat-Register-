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
        WHERE anc.level < 5
      )
      SELECT * FROM ancestry ORDER BY level ASC
    `);

    const ids = treeRes.rows.map(r => r.id);
    const lactRes = await client.query(`
      SELECT L.*, A.name as goat_name 
      FROM goats_lact L 
      JOIN animals A ON L.id_goat = A.id 
      WHERE L.id_goat = ANY($1)
      ORDER BY L.lact_no ASC
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
        allLacts.push({
          id: l.id,
          id_goat: l.id_goat,
          goatName: r.name,
          relationLabel: `Pr: (${r.level})`,
          lact_no: l.lact_no,
          lact_days: l.lact_days,
          milk: l.milk,
          fat: l.fat,
          protein: l.protein,
          milk_day: l.milk_day,
          have_graph: l.have_graph
        });
      });
    });

    console.log('Total lactations:', allLacts.length);
    allLacts.forEach((l, idx) => {
      console.log(`${idx + 1} | ${l.relationLabel} ${l.goatName} | L${l.lact_no} | ${l.lact_days}d | ${l.milk}kg | ${l.fat}% | ${l.protein}% | ${l.milk_day} | ${l.have_graph}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
