const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('Connecting to:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

test();
