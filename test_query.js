const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'registry',
  password: 'password',
  port: 5432,
});
async function test() {
  const res = await pool.query(`
    SELECT A.name, M.time_added 
    FROM goats_move M 
    JOIN animals A ON M.id_goat = A.id 
    LIMIT 2
  `);
  console.log(res.rows);
  pool.end();
}
test();
