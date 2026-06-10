const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();

  const id = '495';
  const locale = 'ru';

  const queryFn = async (sql, params) => {
    const res = await client.query(sql, params);
    return res;
  };

  const selections = (await queryFn("SELECT * FROM goats_cert WHERE id_goat = $1", [id])).rows[0] || {};

  const treeRes = await queryFn(
    `
      WITH RECURSIVE ancestry AS (
        SELECT id, name, sex, id_mother, id_father, 0 as level, '' as path FROM animals WHERE id = $1
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
      SELECT id, path FROM ancestry WHERE path != ''
    `,
    [id],
  );

  const pathIdMap = {};
  treeRes.rows.forEach((r) => (pathIdMap[r.path] = r.id));
  const allAncestorIds = treeRes.rows.map((r) => r.id);

  // getAncestorDetails
  const getAncestorDetails = async (ids) => {
    if (ids.length === 0) return [];
    const res = await queryFn(
      `
      SELECT 
        A.id, A.name, A.sex, A.id_mother, A.id_father,
        Di.date_born, Di.born_weight, Di.born_qty, Di.score as goat_score,
        Di.horns_type, Di.code_ua, Di.code_abg, Di.code_chip, Di.manuf, Di.owner,
        Di.blood_percent,
        B.name as breed_name, B.alias as breed_alias,
        S.name as studbook_name, S.alias as studbook_alias,
        T.score_total as test_score, T.class as test_class
      FROM animals A
      LEFT JOIN goats_data Di ON A.id = Di.id_goat
      LEFT JOIN breeds B      ON Di.id_breed = B.id
      LEFT JOIN stoodbook S   ON Di.id_stoodbook = S.id
      LEFT JOIN LATERAL (
         SELECT * FROM goats_test WHERE id_goat = A.id ORDER BY date_test DESC LIMIT 1
      ) T ON TRUE
      WHERE A.id IN (SELECT unnest($1::int[]))
    `,
      [ids],
    );
    return res.rows;
  };

  const ancestorDetails = await getAncestorDetails(allAncestorIds);
  const detailsMap = {};
  ancestorDetails.forEach((d) => {
    const path = Object.keys(pathIdMap).find((p) => pathIdMap[p] === d.id);
    if (path) detailsMap[path] = d;
  });

  const prefixes = [
    "m", "f", "mm", "fm", "mf", "ff", "mmm", "fmm", "mfm", "ffm", "mmf", "fmf", "mff", "fff"
  ];

  const allSelectedLactIds = [];
  prefixes.forEach((p) => {
    [1, 2, 3].forEach((j) => {
      const lid = selections[`id_${p}_row${j}`];
      if (lid && !isNaN(Number(lid))) allSelectedLactIds.push(Number(lid));
    });
  });

  const getAncestorLactations = async (ids) => {
    if (ids.length === 0) return [];
    const res = await queryFn(
      `SELECT gl.*, a.name as offspring_name 
         FROM goats_lact gl 
         JOIN animals a ON gl.id_goat = a.id 
         WHERE gl.id IN (SELECT unnest($1::int[]))`,
      [ids],
    );
    return res.rows;
  };

  const lacts = await getAncestorLactations(allSelectedLactIds);
  const lactMap = {};
  lacts.forEach((l) => (lactMap[l.id] = l));

  const getOffspringLactations = async (buckId) => {
    const res = await queryFn(
      `
          SELECT gl.*, a.name as offspring_name
          FROM goats_lact gl
          JOIN animals a ON gl.id_goat = a.id
          WHERE a.id_father = $1
          ORDER BY gl.milk DESC
          LIMIT 3
      `,
      [buckId],
    );
    return res.rows;
  };

  console.log("--- grand parents details ---");
  console.log("mm:", { id: detailsMap.mm?.id, name: detailsMap.mm?.name });
  console.log("mf:", { id: detailsMap.mf?.id, name: detailsMap.mf?.name, sex: detailsMap.mf?.sex });
  console.log("fm:", { id: detailsMap.fm?.id, name: detailsMap.fm?.name, sex: detailsMap.fm?.sex });
  console.log("ff:", { id: detailsMap.ff?.id, name: detailsMap.ff?.name, sex: detailsMap.ff?.sex });

  console.log("\n--- selections ---");
  console.log(selections);

  console.log("\n--- allSelectedLactIds ---");
  console.log(allSelectedLactIds);

  console.log("\n--- lactMap keys ---");
  console.log(Object.keys(lactMap));

  const testMiniLactRows = async (p, d) => {
    const dbPrefixMap = {
      mf: "fm",
      fm: "mf",
    };
    const dbPrefix = dbPrefixMap[p] || p;

    let rows = [1, 2, 3]
      .map((j) => {
        const lid = selections[`id_${dbPrefix}_row${j}`];
        return lactMap[lid];
      })
      .filter(Boolean);

    const isMale = d.sex === 1;
    const isFallback = rows.length === 0 && isMale && d.id;
    if (isFallback) {
      rows = await getOffspringLactations(d.id);
    }

    console.log(`\np=${p} (name=${d.name}, sex=${d.sex}, dbPrefix=${dbPrefix}):`);
    console.log(`  isFallback=${isFallback}`);
    console.log(`  rows count=${rows.length}`);
    rows.forEach(r => {
      console.log(`    Lact No: ${r.lact_no} | Days: ${r.lact_days} | Milk: ${r.milk} | Owner: ${r.offspring_name}`);
    });
  };

  await testMiniLactRows("mm", detailsMap.mm);
  await testMiniLactRows("mf", detailsMap.mf);
  await testMiniLactRows("fm", detailsMap.fm);
  await testMiniLactRows("ff", detailsMap.ff);

  await client.end();
}
run().catch(console.error);
