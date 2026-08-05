const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://shivuser:shiv123@localhost:5435/nextapp' });

async function run() {
  const user = (await pool.query("SELECT id, login, role, is_apk, farms FROM users WHERE login = 'ROVES'")).rows[0];
  const goat = (await pool.query("SELECT id, id_user, id_farm, manuf, name FROM animals a LEFT JOIN goats_data g ON a.id = g.id_goat WHERE a.id = 442")).rows[0];
  
  console.log("User:", user);
  console.log("Goat:", goat);
  
  let canViewGoatCard = false;
  if (user.id === goat.id_user) {
    canViewGoatCard = true;
  }
  
  if (!canViewGoatCard && user.farms) {
    const userFarmIds = user.farms.split(',').map(f => f.trim());
    console.log("userFarmIds:", userFarmIds, "goat.id_farm:", goat.id_farm);
    if (userFarmIds.includes(String(goat.id_farm))) {
      canViewGoatCard = true;
      console.log("Passed Current Owner Check");
    }
    
    if (!canViewGoatCard) {
      const userFarmsRes = await pool.query(`SELECT name FROM farms WHERE id = ANY(string_to_array($1, ',')::int[])`, [user.farms]);
      console.log("userFarms:", userFarmsRes.rows);
      for (const row of userFarmsRes.rows) {
          const farmName = row.name.toLowerCase().trim();
          if (farmName && farmName !== 'without farm' && farmName !== 'без фермы') {
            if (goat.manuf && goat.manuf.toLowerCase().includes(farmName)) {
              canViewGoatCard = true;
              console.log("Passed Breeder Check (manuf)");
              break;
            }
          }
      }
    }
  }
  
  console.log("canViewGoatCard final:", canViewGoatCard);
  process.exit();
}
run();
