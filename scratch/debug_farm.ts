import { query } from "../lib/db";

async function check() {
  const djassy = await query("SELECT id, name FROM farms WHERE name ILIKE '%DJASSY%'");
  console.log("DJASSY FARMS:", djassy.rows);
  
  const id11 = await query("SELECT id, name FROM farms WHERE id = 11");
  console.log("ID 11:", id11.rows);

  const id27 = await query("SELECT id, name FROM farms WHERE id = 27");
  console.log("ID 27:", id27.rows);
}

check().catch(console.error);
