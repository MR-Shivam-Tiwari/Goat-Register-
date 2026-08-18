const http = require('http');

async function run() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'ROVES', password: '123456789' })
  });
  const cookies = loginRes.headers.get('set-cookie');
  const token = cookies.split(';')[0];
  
  const moveRes = await fetch('http://localhost:3000/catalog/move', {
    headers: { 'Cookie': token }
  });
  const html = await moveRes.text();
  
  const regex = /href="\/goats\//g;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    console.log('Match found at index ' + match.index);
    console.log(html.substring(match.index - 50, match.index + 50));
  }
  console.log(`Total links: ${count}`);
}

run().catch(console.error);
