const { query } = require("./lib/db");

async function test() {
  const rootId = 354;
  const result = await query(
    `
      WITH RECURSIVE descendants_raw AS (
        SELECT id, name, sex, id_mother, id_father, 1 as level 
        FROM animals 
        WHERE id_mother = $1::int OR id_father = $1::int
        UNION ALL
        SELECT a.id, a.name, a.sex, a.id_mother, a.id_father, d.level + 1
        FROM animals a
        JOIN descendants_raw d ON (a.id_mother = d.id OR a.id_father = d.id)
        WHERE d.level < 4
      ),
      unique_descendants AS (
        SELECT DISTINCT ON (id) * FROM descendants_raw ORDER BY id, level ASC
      )
      SELECT ud.*, gd.date_born 
      FROM unique_descendants ud
      LEFT JOIN goats_data gd ON ud.id = gd.id_goat
      WHERE ud.level = 4
      ORDER BY gd.date_born ASC, ud.name ASC
    `,
    [rootId],
  );
  console.log("Level 4 Descendants:", JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

test();
