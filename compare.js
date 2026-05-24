const oldRows = [
  { relation: 'Pr: (4)', name: 'Dora', lact: 0, milk: 0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 1, milk: 1381.6 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 2, milk: 1455.0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 3, milk: 1193.0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 3, milk: 648.7 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 1, milk: 674.0 },
  { relation: 'Pr: (5)', name: 'Bibbi', lact: 4, milk: 862.0 },
  { relation: 'Pr: (4)', name: 'Totoschka H Zw 122 Z', lact: 9, milk: 1117.1 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 5, milk: 792.0 },
  { relation: 'Pr: (5)', name: 'Bibbi', lact: 2, milk: 790.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1026.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 2, milk: 1231.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 3, milk: 1183.5 },
  { relation: 'Pr: (4)', name: 'Dora', lact: 1, milk: 900.0 },
  { relation: 'Pr: (4)', name: 'Dora', lact: 1, milk: 900.0 },
  { relation: 'Pr: (4)', name: 'Dora', lact: 2, milk: 992.0 },
  { relation: 'Pr: (4)', name: 'Dora', lact: 2, milk: 992.0 },
  { relation: 'Pr: (4)', name: 'Dora', lact: 3, milk: 1161.0 },
  { relation: 'Pr: (4)', name: 'Dora', lact: 3, milk: 1161.0 },
  { relation: 'Pr: (6)', name: 'Barbara H Zw 122 Z', lact: 4, milk: 862.0 },
  { relation: 'Pr: (8)', name: 'Jakarta H Dr 122 D', lact: 7, milk: 801.7 },
  { relation: 'Pr: (7)', name: 'Jolante D', lact: 1, milk: 2740.0 },
  { relation: 'Pr: (5)', name: 'Romy V', lact: 1, milk: 674.0 },
  { relation: 'Pr: (6)', name: 'Roswittchen D', lact: 1, milk: 674.0 },
  { relation: 'Pr: (4)', name: 'Totoschka H Zw 122 Z', lact: 2, milk: 1797.0 },
  { relation: 'Pr: (5)', name: 'Flora Z', lact: 3, milk: 572.3 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 1, milk: 821.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 2, milk: 2277.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1026.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 2, milk: 1231.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 3, milk: 1183.5 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 1, milk: 821.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 2, milk: 2277.0 },
  { relation: 'Pr: (10)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1026.0 },
  { relation: 'Pr: (10)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Margo', lact: 3, milk: 1050.2 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Margo', lact: 3, milk: 1050.2 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Margo', lact: 4, milk: 1146.0 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Thumbnail', lact: 1, milk: 609.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1231.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 2, milk: 1183.5 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 4, milk: 1306.3 }
];

const newRows = [
  { relation: 'Pr: (10)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (10)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (8)', name: 'Jakarta H Dr 122 D', lact: 7, milk: 801.7 },
  { relation: 'Pr: (7)', name: 'Jolante D', lact: 1, milk: 2740.0 },
  { relation: 'Pr: (7)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (7)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (6)', name: 'Roswittchen D', lact: 1, milk: 674.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 1, milk: 821.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 1, milk: 821.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 2, milk: 2277.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 2, milk: 2277.0 },
  { relation: 'Pr: (5)', name: 'Melanie D', lact: 5, milk: 792.0 },
  { relation: 'Pr: (5)', name: 'Romy V', lact: 1, milk: 674.0 },
  { relation: 'Pr: (5)', name: 'Jakarta H Dr 122 D', lact: 7, milk: 801.7 },
  { relation: 'Pr: (5)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (5)', name: 'Samia Zw Z', lact: 5, milk: 991.2 },
  { relation: 'Pr: (5)', name: 'Flora Z', lact: 3, milk: 572.3 },
  { relation: 'Pr: (5)', name: 'Barbara H Zw 122 Z', lact: 4, milk: 862.0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 1, milk: 1381.6 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 1, milk: 674.0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 2, milk: 1455.0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 3, milk: 1193.0 },
  { relation: 'Pr: (4)', name: 'Beatris', lact: 3, milk: 648.7 },
  { relation: 'Pr: (4)', name: 'Jolante D', lact: 1, milk: 2740.0 },
  { relation: 'Pr: (4)', name: 'Totoschka H Zw 122 Z', lact: 2, milk: 1797.0 },
  { relation: 'Pr: (4)', name: 'Totoschka H Zw 122 Z', lact: 9, milk: 1117.1 },
  { relation: 'Pr: (4)', name: 'Bibbi', lact: 2, milk: 790.0 },
  { relation: 'Pr: (4)', name: 'Bibbi', lact: 4, milk: 862.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1026.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1026.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1026.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 1, milk: 1231.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 2, milk: 1183.5 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 2, milk: 1231.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 2, milk: 1231.2 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 3, milk: 1183.5 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 3, milk: 1183.5 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Lika', lact: 4, milk: 1306.3 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 0, milk: 0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 1, milk: 900.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 1, milk: 900.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 2, milk: 992.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 2, milk: 992.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 3, milk: 1161.0 },
  { relation: 'Pr: (3)', name: 'Kamadhenu Dora', lact: 3, milk: 1161.0 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Margo', lact: 3, milk: 1050.2 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Margo', lact: 3, milk: 1050.2 },
  { relation: 'Pr: (2)', name: 'Kamadhenu Margo', lact: 4, milk: 1146.0 }
];

console.log('Old Rows Count:', oldRows.length);
console.log('New Rows Count:', newRows.length);

// Compare by name, relation level, lactation, and milk yield
const matchedNew = new Set();
const unmatchedOld = [];

for (const oldRow of oldRows) {
  let foundIdx = -1;
  for (let i = 0; i < newRows.length; i++) {
    if (matchedNew.has(i)) continue;
    const newRow = newRows[i];
    
    // Normalize names (some might have 'Kamadhenu ' prefix)
    const normOldName = oldRow.name.replace('Kamadhenu ', '').trim();
    const normNewName = newRow.name.replace('Kamadhenu ', '').trim();

    // Check if matching relation levels (sometimes they differ by 1 due to starting node differences)
    // and matching lact no and milk
    if (normOldName === normNewName && oldRow.lact === newRow.lact && Math.abs(oldRow.milk - newRow.milk) < 0.1) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx !== -1) {
    matchedNew.add(foundIdx);
  } else {
    unmatchedOld.push(oldRow);
  }
}

console.log('\n--- UNMATCHED OLD ROWS ---');
unmatchedOld.forEach(r => console.log(r));

console.log('\n--- UNMATCHED NEW ROWS ---');
newRows.forEach((r, i) => {
  if (!matchedNew.has(i)) {
    console.log(r);
  }
});
