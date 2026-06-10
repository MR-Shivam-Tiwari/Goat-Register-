const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();
  
  console.log("--- GOATS_CERT ROW FOR 464 ---");
  const certRes = await client.query("SELECT * FROM goats_cert WHERE id_goat = 464");
  console.log(JSON.stringify(certRes.rows, null, 2));

  console.log("--- ANCESTRY PATHS FOR 464 ---");
  const treeRes = await client.query(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, sex, id_mother, id_father, 0 as level, '' as path FROM animals WHERE id = 464
      UNION ALL
      SELECT a.id, a.name, a.sex, a.id_mother, a.id_father, anc.level + 1,
             CASE 
               WHEN a.id = anc.id_mother THEN anc.path || 'm' 
               WHEN a.id = anc.id_father THEN anc.path || 'f'
             END
      FROM animals a
      JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < 4
    )
    SELECT id, name, sex, path FROM ancestry WHERE path != ''
  `);
  console.log(JSON.stringify(treeRes.rows, null, 2));

  await client.end();
}
run().catch(console.error);
