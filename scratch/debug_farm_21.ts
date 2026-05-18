import { query } from "../lib/db";

async function main() {
  const farmRes = await query("SELECT * FROM farms WHERE id = 21");
  console.log("FARM 21:", farmRes.rows[0]);

  const prefixRes = await query(`
    SELECT DISTINCT Di.manuf
    FROM animals A
    JOIN goats_data Di ON A.id = Di.id_goat
    WHERE A.id_farm = 21
  `);
  console.log("ANIMAL MANUFS ON FARM 21:", prefixRes.rows);
}

main().catch(console.error);
