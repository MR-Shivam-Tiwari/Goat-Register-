const https = require('https');
https.get('https://docs.google.com/document/d/10xh3y2_jpF7en_Hf5yGWvMhU8bnrHj3ubrqzMP4PQRo/export?format=txt', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
