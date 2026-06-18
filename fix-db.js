require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`
      ALTER TABLE goats_test 
      ALTER COLUMN mark_wh TYPE varchar(255),
      ALTER COLUMN mark_wk TYPE varchar(255),
      ALTER COLUMN mark_og TYPE varchar(255),
      ALTER COLUMN mark_gg TYPE varchar(255),
      ALTER COLUMN mark_kd TYPE varchar(255),
      ALTER COLUMN mark_dev TYPE varchar(255),
      ALTER COLUMN mark_hsp TYPE varchar(255),
      ALTER COLUMN mark_chest TYPE varchar(255),
      ALTER COLUMN mark_krts TYPE varchar(255),
      ALTER COLUMN mark_kti TYPE varchar(255),
      ALTER COLUMN mark_hooves TYPE varchar(255),
      ALTER COLUMN mark_udder TYPE varchar(255),
      ALTER COLUMN mark_udder_f TYPE varchar(255),
      ALTER COLUMN mark_udder_b TYPE varchar(255),
      ALTER COLUMN mark_teats TYPE varchar(255),
      ALTER COLUMN mark_scrotum TYPE varchar(255);
    `);
    console.log("Columns altered to varchar successfully.");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
