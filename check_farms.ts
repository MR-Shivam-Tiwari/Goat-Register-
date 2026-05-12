import { query } from "./lib/db";

async function checkFarms() {
  const res = await query("SELECT id, name FROM farms ORDER BY name");
  console.log("TOTAL FARMS IN DB:", res.rows.length);
  console.log("FARMS:", JSON.stringify(res.rows, null, 2));
}

checkFarms().catch(console.error);
