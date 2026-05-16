const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://shivuser:shiv123@localhost:5435/nextapp"
});

async function test() {
  const rootId = 354;
  const result = await pool.query(
    `
      WITH RECURSIVE descendants_raw AS (
        SELECT id, name, sex, id_mother, id_father, 1 as level 
        FROM animals 
        WHERE id_mother = $1::int OR id_father = $1::int
        UNION ALL
        SELECT a.id, a.name, a.sex, a.id_mother, a.id_father, d.level + 1
        FROM animals a
        JOIN descendants_raw d ON (a.id_mother = d.id OR a.id_father = d.id)
        WHERE d.level < 10
      ),
      unique_descendants AS (
        SELECT DISTINCT ON (id) * FROM descendants_raw ORDER BY id, level DESC
      )
      SELECT ud.*
      FROM unique_descendants ud
      WHERE ud.name ILIKE '%ANFISA%' OR ud.name ILIKE '%PLUSHA%'
    `,
    [rootId],
  );
  console.log("Descendants found (DESC):", JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

test();
