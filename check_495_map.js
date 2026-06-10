const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();
  
  const treeRes = await client.query(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, id_mother, id_father, 0 as level, '' as path FROM animals WHERE id = 495
      UNION ALL
      SELECT a.id, a.name, a.id_mother, a.id_father, anc.level + 1,
             CASE 
               WHEN a.id = anc.id_mother THEN anc.path || 'm' 
               WHEN a.id = anc.id_father THEN anc.path || 'f'
             END
      FROM animals a
      JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < 4
    )
    SELECT id, name, path FROM ancestry WHERE path != ''
  `);

  const pathIdMap = {};
  treeRes.rows.forEach((r) => (pathIdMap[r.path] = r.id));

  console.log("--- pathIdMap ---");
  console.log(pathIdMap);

  console.log("--- Details Mapping ---");
  const detailsMap = {};
  treeRes.rows.forEach((d) => {
    // Look at how page.tsx maps it:
    const path = Object.keys(pathIdMap).find((p) => pathIdMap[p] === d.id);
    if (path) {
      detailsMap[path] = { id: d.id, name: d.name };
    }
  });
  console.log(detailsMap);

  await client.end();
}
run().catch(console.error);
