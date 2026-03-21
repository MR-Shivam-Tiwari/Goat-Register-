require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const res = await pool.query('SELECT alias, name, id FROM breeds');
    console.log('All breeds in DB:');
    res.rows.forEach(r => {
        console.log(`- ID: ${r.id}, Alias: [${r.alias}], Name: ${r.name}`);
    });

    const saanen = await pool.query("SELECT * FROM breeds WHERE name LIKE '%Заанен%' OR alias LIKE '%ZAA%'");
    console.log('\nSearch result for "Заанен" or "ZAA":', saanen.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
