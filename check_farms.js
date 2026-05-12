const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp'
});

async function checkFarms() {
  const res = await pool.query("SELECT id, name FROM farms ORDER BY name");
  console.log("TOTAL FARMS IN DB:", res.rows.length);
  res.rows.forEach(f => {
    console.log(`ID: ${f.id}, NAME: "${f.name}"`);
  });
  await pool.end();
}

checkFarms().catch(err => {
    console.error(err);
    process.exit(1);
});
