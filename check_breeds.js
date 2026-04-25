const { query } = require('./lib/db');

async function check() {
  try {
    const result = await query('SELECT name, alias FROM breeds WHERE alias IS NOT NULL');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
