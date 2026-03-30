const { Client } = require('pg');

async function testConnection(port) {
  const client = new Client({
    connectionString: `postgresql://shivuser:shiv123@localhost:${port}/nextapp`,
  });
  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected to port ${port}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: Port ${port} - ${err.message}`);
    return false;
  }
}

async function run() {
  const ports = [5432, 5433, 5434, 5435, 5436];
  for (const port of ports) {
    await testConnection(port);
  }
}

run();
