const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkBreeds() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM breeds LIMIT 5');
        console.log('BREEDS SAMPLE:', JSON.stringify(res.rows, null, 2));
        const columns = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'breeds'");
        console.log('COLUMNS:', columns.rows.map(r => r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkBreeds();
