const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function trace() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    const res = await client.query(`SELECT * FROM animals WHERE id = 496`);
    console.log('Goat 496:', res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

trace();
