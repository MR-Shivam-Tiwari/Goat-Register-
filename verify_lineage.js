const { Client } = require('pg');

async function verify(goatId) {
  const client = new Client({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });
  await client.connect();

  const id = String(goatId);
  const q = async (sql, params) => (await client.query(sql, params)).rows;

  const selections = (await q("SELECT * FROM goats_cert WHERE id_goat = $1", [id]))[0] || {};

  const treeRes = await q(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, sex, id_mother, id_father, 0 as level, '' as path FROM animals WHERE id = $1
      UNION ALL
      SELECT a.id, a.name, a.sex, a.id_mother, a.id_father, anc.level + 1,
             CASE WHEN a.id = anc.id_mother THEN anc.path || 'm' WHEN a.id = anc.id_father THEN anc.path || 'f' END
      FROM animals a JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < 4
    )
    SELECT id, path FROM ancestry WHERE path != ''
  `, [id]);

  const pathIdMap = {};
  treeRes.forEach(r => pathIdMap[r.path] = r.id);

  const allAncestorIds = treeRes.map(r => r.id);

  const detailRows = await q(`
    SELECT A.id, A.name, A.sex FROM animals A
    WHERE A.id IN (SELECT unnest($1::int[]))
  `, [allAncestorIds]);
  
  const detailsMap = {};
  detailRows.forEach(d => {
    const path = Object.keys(pathIdMap).find(p => pathIdMap[p] === d.id);
    if (path) detailsMap[path] = d;
  });

  const dbPrefixMap = { mf: "fm", fm: "mf" };

  // allSelectedLactIds (same as in page.tsx)
  const prefixes = ["m","f","mm","fm","mf","ff","mmm","fmm","mfm","ffm","mmf","fmf","mff","fff"];
  const allSelectedLactIds = [];
  prefixes.forEach(p => {
    [1,2,3].forEach(j => {
      const lid = selections[`id_${p}_row${j}`];
      if (lid && !isNaN(Number(lid))) allSelectedLactIds.push(Number(lid));
    });
  });

  const lactRows = await q(`SELECT gl.*, a.name as offspring_name FROM goats_lact gl JOIN animals a ON gl.id_goat = a.id WHERE gl.id IN (SELECT unnest($1::int[]))`, [allSelectedLactIds.length > 0 ? allSelectedLactIds : [0]]);
  const lactMap = {};
  lactRows.forEach(l => lactMap[l.id] = l);

  const getOffspringLacts = async (buckId) => {
    return await q(`SELECT gl.*, a.name as offspring_name FROM goats_lact gl JOIN animals a ON gl.id_goat = a.id WHERE a.id_father = $1 ORDER BY gl.milk DESC LIMIT 3`, [buckId]);
  };

  const testMini = async (p, d) => {
    const dbPrefix = dbPrefixMap[p] || p;
    let rows = [1,2,3].map(j => lactMap[selections[`id_${dbPrefix}_row${j}`]]).filter(Boolean);
    const isMale = d?.sex === 1;
    if (rows.length === 0 && isMale && d?.id) {
      rows = await getOffspringLacts(d.id);
    }
    console.log(`  p=${p} (${d?.name || '??'}, sex=${d?.sex}): ${rows.length} rows`);
    rows.forEach(r => console.log(`    Lact ${r.lact_no}: ${r.lact_days} days, ${r.milk} kg (${r.offspring_name})`));
  };

  console.log(`\n===== Goat ${goatId} Certificate Verification =====`);
  console.log('Ancestors:');
  ['mm','mf','fm','ff'].forEach(p => {
    const d = detailsMap[p];
    console.log(`  ${p}: ${d?.name || '??'} (sex=${d?.sex})`);
  });

  console.log('\nDB selections (fm, mf rows):');
  console.log('  id_fm_row1:', selections.id_fm_row1, '| id_fm_row2:', selections.id_fm_row2, '| id_fm_row3:', selections.id_fm_row3);
  console.log('  id_mf_row1:', selections.id_mf_row1, '| id_mf_row2:', selections.id_mf_row2, '| id_mf_row3:', selections.id_mf_row3);

  console.log('\nGrandparent lactation data (renderMiniLactTableRows):');
  await testMini('mm', detailsMap['mm']);
  await testMini('mf', detailsMap['mf']);  // OM/Cheddar - should fallback to daughters
  await testMini('fm', detailsMap['fm']);  // MB/Beatris - should show selections
  await testMini('ff', detailsMap['ff']);

  // 3rd gen
  const ancestorLactsQ = await q(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, sex, id_mother, id_father, 0 as level, 'ME' as path FROM animals WHERE id = $1
      UNION ALL
      SELECT a.id, a.name, a.sex, a.id_mother, a.id_father, anc.level + 1,
             CASE WHEN a.id = anc.id_mother THEN anc.path || 'M' WHEN a.id = anc.id_father THEN anc.path || 'F' END
      FROM animals a JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < 5
    )
    SELECT id, name, sex, path FROM ancestry
  `, [id]);

  const lActIds2 = ancestorLactsQ.map(r => r.id);
  const allLacts = await q(`SELECT L.*, A.name as goat_name FROM goats_lact L JOIN animals A ON L.id_goat = A.id WHERE L.id_goat = ANY($1) ORDER BY L.id ASC`, [lActIds2]);
  const groups = {};
  allLacts.forEach(l => { if (!groups[l.id_goat]) groups[l.id_goat] = []; groups[l.id_goat].push(l); });
  const pathMapUpper = {};
  ancestorLactsQ.forEach(r => { pathMapUpper[r.path] = { id: r.id, name: r.name, sex: r.sex, lactations: groups[r.id] || [] }; });

  console.log('\n3rd Gen (correct order: mmm, mmf, mfm, mff, fmm, fmf, ffm, fff):');
  const dbFieldMap = { mmm:'mmm', fmm:'mmf', mfm:'mfm', ffm:'mff', mmf:'fmm', fmf:'fmf', mff:'ffm', fff:'fff' };
  const pathMapForGen = { mmm:'MEMMM', fmm:'MEFMM', mfm:'MEMFM', ffm:'MEFFM', mmf:'MEMMF', fmf:'MEFMF', mff:'MEMFF', fff:'MEFFF' };
  
  // Correct order: mmm, mmf, mfm, mff, fmm, fmf, ffm, fff
  for (const p of ['mmm','mmf','mfm','mff','fmm','fmf','ffm','fff']) {
    const dbPrefix = dbFieldMap[p];
    const savedVal = selections[`id_${dbPrefix}_row1`];
    const ancestorPath = pathMapForGen[p];
    const node = pathMapUpper[ancestorPath];
    const bestLact = node?.lactations?.[0];
    const display = savedVal ? `DB: ${savedVal}` : bestLact ? `Auto: ${bestLact.lact_no}\\${bestLact.lact_days}\\${bestLact.milk}` : 'Empty';
    console.log(`  ${p} (dbPrefix:${dbPrefix}, path:${ancestorPath}): ${node?.name || '??'} → ${display}`);
  }

  await client.end();
}

(async () => {
  await verify(495);
  await verify(464);
})().catch(console.error);
