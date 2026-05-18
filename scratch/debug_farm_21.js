require('dotenv').config({ path: './.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function extractPrefix(farmName, goats) {
  const farmFirstWord = farmName.trim().split(/[ \.\-\/]/)[0];

  if (goats.length === 0) return farmFirstWord;

  const words = goats
    .map((g) => g.name.trim().split(/[ \.\-\/]/)[0])
    .filter((w) => w && w.length > 2);

  if (words.length === 0) {
    return farmFirstWord.length > 2 ? farmFirstWord : "";
  }

  const counts = {};
  words.forEach((w) => {
    counts[w] = (counts[w] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [topPrefix, topCount] = sorted[0];

  if (topCount >= 3 || (topCount / words.length) >= 0.5) {
    return topPrefix;
  }

  return farmFirstWord.length > 2 ? farmFirstWord : topPrefix;
}

async function getDisplacedGoats(id, prefix) {
  if (!id || id === '0') return [];
  const result = await pool.query(`
    SELECT DISTINCT ON (A.id)
      A.id, A.name, A.sex, A.id_user, A.id_farm, B.name as breed_name, 
      Di.is_abg, Di.manuf, Di.owner, Di.date_born, Di.blood_percent,
      F.name as current_farm_name
    FROM animals A
    LEFT JOIN goats_move M ON A.id = M.id_goat
    LEFT JOIN goats_data Di ON A.id = Di.id_goat
    LEFT JOIN breeds B ON Di.id_breed = B.id
    LEFT JOIN farms F ON A.id_farm = F.id
    WHERE (
        (M.id_farm_of = $1::int AND A.id_farm != $1::int)
        OR 
        ($2 != '' AND LOWER(Di.manuf) LIKE LOWER($2) || '%')
      )
      AND A.id_farm != $1::int
      AND A.id_farm != 0
      AND A.is_reg = 1
    ORDER BY A.id, A.name ASC
  `, [id, prefix]);
  return result.rows;
}

async function main() {
  const farmRes = await pool.query("SELECT * FROM farms WHERE id = 21");
  const farm = farmRes.rows[0];

  const activeRes = await pool.query(`
    SELECT A.id, A.name, Di.manuf
    FROM animals A
    JOIN goats_data Di ON A.id = Di.id_goat
    WHERE A.id_farm = 21 AND A.is_reg = 1
  `);
  const activeGoats = activeRes.rows;

  const prefix = extractPrefix(farm.name, activeGoats);
  console.log("DETECTED PREFIX:", prefix);

  const displaced = await getDisplacedGoats(21, prefix);
  console.log("DISPLACED STOCK FOR FARM 21:", displaced);
}

main()
  .then(() => pool.end())
  .catch(console.error);
