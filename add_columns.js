require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = `
  ALTER TABLE goats_test
  ADD COLUMN IF NOT EXISTS mark_wh integer,
  ADD COLUMN IF NOT EXISTS mark_wk integer,
  ADD COLUMN IF NOT EXISTS mark_og integer,
  ADD COLUMN IF NOT EXISTS mark_gg integer,
  ADD COLUMN IF NOT EXISTS mark_kd integer,
  ADD COLUMN IF NOT EXISTS mark_dev integer,
  ADD COLUMN IF NOT EXISTS mark_hsp integer,
  ADD COLUMN IF NOT EXISTS mark_chest integer,
  ADD COLUMN IF NOT EXISTS mark_krts integer,
  ADD COLUMN IF NOT EXISTS mark_kti integer,
  ADD COLUMN IF NOT EXISTS mark_hooves integer,
  ADD COLUMN IF NOT EXISTS mark_udder integer,
  ADD COLUMN IF NOT EXISTS mark_udder_f integer,
  ADD COLUMN IF NOT EXISTS mark_udder_b integer,
  ADD COLUMN IF NOT EXISTS mark_teats integer,
  ADD COLUMN IF NOT EXISTS mark_scrotum integer;
`;
pool.query(sql).then(res => {
  console.log("Columns added");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
