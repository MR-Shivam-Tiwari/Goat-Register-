const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://shivuser:shiv123@localhost:5435/nextapp"
});

async function test() {
  const rootId = 354;
  const result = await pool.query(
    `
      SELECT 
        A.name, A.sex, A.id AS id, A.status, A.is_reg
      FROM animals A
      WHERE (A.id_mother = $1 OR A.id_father = $1)
    `,
    [rootId],
  );
  console.log("Direct Descendants:", JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

test();
