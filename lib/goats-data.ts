import { query } from "./db";

export async function getGoatData(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.status, A.time_added, A.id_farm, A.id_mother, A.id_father,
        Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.born_weight, Di.born_qty,
        Di.horns_type, Di.have_gen, Di.gen_mat, Di.id_stoodbook,
        Di.code_ua, Di.code_abg, Di.code_farm, Di.code_chip, Di.code_int, Di.code_brand,
        Di.source, Di.special, Di.cert_serial, Di.cert_no,

        M.name  AS m_name,  M.id AS m_id,
        Dm.code_ua AS m_code_ua, Dm.code_abg AS m_code_abg,
        Dm.code_farm AS m_code_farm, Dm.code_chip AS m_code_chip,
        Dm.code_int AS m_code_int, Dm.code_brand AS m_code_brand,

        F.name  AS f_name,  F.id AS f_id,
        Df.code_ua AS f_code_ua, Df.code_abg AS f_code_abg,
        Df.code_farm AS f_code_farm, Df.code_chip AS f_code_chip,
        Df.code_int AS f_code_int, Df.code_brand AS f_code_brand,

        T.test_type, T.score_total, T.par_1, T.par_2, T.par_3, T.par_4,
        T.class AS cert_class, T.category,

        L.viewer, L.lact_no, L.lact_days, L.milk, L.fat, L.protein, L.milk_day, L.have_graph,

        Frm.name AS farm_name,
        B.name as breed_name, B.alias as breed_alias,
        S.name as studbook_name
      FROM animals A
      LEFT JOIN goats_data Di    ON A.id = Di.id_goat
      LEFT JOIN breeds B         ON Di.id_breed = B.id
      LEFT JOIN animals M        ON A.id_mother = M.id
      LEFT JOIN goats_data Dm    ON M.id = Dm.id_goat
      LEFT JOIN animals F        ON A.id_father = F.id
      LEFT JOIN goats_data Df    ON F.id = Df.id_goat
      LEFT JOIN goats_test T     ON A.id = T.id_goat
      LEFT JOIN goats_lact L     ON L.id = Di.id_lact_show
      LEFT JOIN farms Frm        ON A.id_farm = Frm.id
      LEFT JOIN stoodbook S      ON Di.id_stoodbook = S.id
      WHERE A.id = $1
  `,
    [id],
  );
  return result.rows[0];
}

export async function getOffspringDetailed(id: string) {
  const result = await query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.status, A.time_added, A.id_farm,
        Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.born_weight, Di.born_qty,
        Di.horns_type, Di.have_gen, Di.gen_mat, Di.id_stoodbook,
        Di.code_ua, Di.code_abg, Di.code_farm, Di.code_chip, Di.code_int, Di.code_brand,
        Di.source, Di.special, Di.cert_serial, Di.cert_no,

        M.name  AS m_name,  M.id AS m_id,
        Dm.code_ua AS m_code_ua, Dm.code_abg AS m_code_abg,

        F.name  AS f_name,  F.id AS f_id,
        Df.code_ua AS f_code_ua, Df.code_abg AS f_code_abg,

        T.test_type, T.score_total, T.par_1, T.par_2, T.par_3, T.par_4,
        T.class AS cert_class, T.category,

        L.viewer, L.lact_no, L.lact_days, L.milk, L.fat, L.protein, L.milk_day, L.have_graph,

        Frm.name AS farm_name,
        B.name as breed_name
      FROM animals A
      LEFT JOIN goats_data Di    ON A.id = Di.id_goat
      LEFT JOIN breeds B         ON Di.id_breed = B.id
      LEFT JOIN animals M        ON A.id_mother = M.id
      LEFT JOIN goats_data Dm    ON M.id = Dm.id_goat
      LEFT JOIN animals F        ON A.id_father = F.id
      LEFT JOIN goats_data Df    ON F.id = Df.id_goat
      LEFT JOIN goats_test T     ON A.id = T.id_goat
      LEFT JOIN goats_lact L     ON L.id = Di.id_lact_show
      LEFT JOIN farms Frm        ON A.id_farm = Frm.id
      WHERE (A.id_mother = $1 OR A.id_father = $1)
      ORDER BY A.time_added DESC
  `,
    [id],
  );
  return result.rows;
}

export async function getGallery(id: string) {
  const result = await query(
    "SELECT file FROM goats_pic WHERE id_goat = $1 ORDER BY time_added DESC",
    [id],
  );
  return result.rows;
}

export async function getLactation(id: string) {
  const result = await query(
    "SELECT * FROM goats_lact WHERE id_goat = $1 ORDER BY lact_no ASC",
    [id],
  );
  return result.rows;
}

export async function getAncestors(rootId: number | null, maxLevel: number = 4) {
  if (!rootId) return null;

  const res = await query(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, id_father, id_mother, sex, 0 as level 
      FROM animals 
      WHERE id = $1
      UNION ALL
      SELECT a.id, a.name, a.id_father, a.id_mother, a.sex, anc.level + 1
      FROM animals a
      JOIN ancestry anc ON (a.id = anc.id_mother OR a.id = anc.id_father)
      WHERE anc.level < $2
    )
    SELECT a.*, d.code_ua 
    FROM ancestry a
    LEFT JOIN goats_data d ON a.id = d.id_goat
  `, [rootId, maxLevel]);

  const rows = res.rows;
  const nodes = new Map();
  rows.forEach(r => nodes.set(r.id, r));

  function buildTree(id: number | null): any {
    if (!id || !nodes.has(id)) return null;
    const node = { ...nodes.get(id) };
    node.father = buildTree(node.id_father);
    node.mother = buildTree(node.id_mother);
    return node;
  }

  return buildTree(rootId);
}

export async function getOwnMilkProductivity(id: string) {
  const res = await query(
    `SELECT 
      id,
      par_0 as lact_no, 
      par_1 as lact_days, 
      par_2 as milk, 
      par_3 as fat, 
      par_4 as protein,
      par_5 as lactose,
      par_6 as peak_yield,
      par_7 as avg_yield,
      par_8 as density,
      par_9 as flow_rate,
      have_graph,
      source,
      time_added as added
    FROM goats_milk 
    WHERE id_goat = $1 
    ORDER BY par_0 ASC`,
    [id],
  );
  return res.rows;
}

export async function getExpertAssessment(id: string) {
  const res = await query(
    `SELECT * FROM goats_test WHERE id_goat = $1 ORDER BY date_test DESC`,
    [id],
  );
  return res.rows;
}

export async function getCertData(id: string) {
  const result = await query("SELECT * FROM goats_cert WHERE id_goat = $1", [
    id,
  ]);
  return result.rows[0] || {};
}

export async function getAncestorLactations(id: string, maxLevel: number = 4) {
  const treeRes = await query(
    `
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
      WHERE anc.level < $2
    )
    SELECT id, name, path FROM ancestry
  `,
    [id, maxLevel],
  );

  const ids = treeRes.rows.map((r: any) => r.id);
  if (ids.length === 0) return {};

  const lactRes = await query(
    `
    SELECT L.*, A.name as goat_name 
    FROM goats_lact L 
    JOIN animals A ON L.id_goat = A.id 
    WHERE L.id_goat = ANY($1)
    ORDER BY L.lact_no ASC
  `,
    [ids],
  );

  const groups: any = {};
  lactRes.rows.forEach((l: any) => {
    if (!groups[l.id_goat]) groups[l.id_goat] = [];
    groups[l.id_goat].push(l);
  });

  const pathMap: any = {};
  treeRes.rows.forEach((r: any) => {
    pathMap[r.path] = {
      id: r.id,
      name: r.name,
      lactations: groups[r.id] || [],
    };
  });

  return pathMap;
}
