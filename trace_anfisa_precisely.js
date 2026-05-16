const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://shivuser:shiv123@localhost:5435/nextapp"
});

async function test() {
  const rootId = 354;
  const targetId = 438; // Anfisa
  
  let currentId = targetId;
  let path = [];
  
  while (currentId && currentId !== rootId) {
    const res = await pool.query("SELECT id, name, id_mother, id_father FROM animals WHERE id = $1", [currentId]);
    if (res.rows.length === 0) break;
    const animal = res.rows[0];
    path.push(animal.name);
    
    // Check if either parent is rootId
    if (animal.id_mother === rootId || animal.id_father === rootId) {
      const rootRes = await pool.query("SELECT name FROM animals WHERE id = $1", [rootId]);
      path.push(rootRes.rows[0].name);
      break;
    }
    
    // Otherwise follow one parent (mother preferred for tracing)
    currentId = animal.id_mother || animal.id_father;
  }
  
  console.log("Trace:", path.reverse().join(' -> '));
  process.exit(0);
}

test();
