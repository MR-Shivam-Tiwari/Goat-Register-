require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkFarms() {
    try {
        const result = await pool.query('SELECT id, name, pic1 FROM farms ORDER BY id DESC LIMIT 10');
        console.log('Last 10 farms:');
        result.rows.forEach(f => {
            console.log(`ID: ${f.id} | Name: ${f.name} | Pic1: ${f.pic1}`);
        });
    } catch (err) {
        console.error('Error fetching farms:', err);
    } finally {
        await pool.end();
    }
}

checkFarms();
