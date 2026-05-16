const { query } = require("./lib/db");

async function test() {
  const rootId = 354;
  const targetName = 'HILDA';
  const res = await query("SELECT id, name, sex, id_mother, id_father FROM animals WHERE name ILIKE $1", [`%${targetName}%`]);
  console.log(`Found ${res.rows.length} animals matching ${targetName}`);
  
  for (const animal of res.rows) {
    console.log(`\nLineage for ${animal.name} (ID: ${animal.id}, Sex: ${animal.sex}):`);
    let current = animal;
    let path = [animal.name];
    let level = 0;
    while (current && current.id !== rootId && level < 10) {
      const parents = await query("SELECT id, name, id_mother, id_father FROM animals WHERE id = $1 OR id = $2", [current.id_mother, current.id_father]);
      if (parents.rows.length === 0) break;
      // Try to find a path to rootId
      let next = parents.rows.find(p => p.id === rootId);
      if (next) {
        path.push(next.name);
        console.log(`Path: ${path.reverse().join(' -> ')} (Level ${path.length - 1})`);
        break;
      }
      next = parents.rows[0]; // Just follow one for now
      path.push(next.name);
      current = next;
      level++;
    }
  }
  process.exit(0);
}

test();
