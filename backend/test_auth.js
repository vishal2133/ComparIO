const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const testEmail = `test${Date.now()}@example.com`;

async function main() {
  console.log('Using test email:', testEmail);
  
  console.log('\n--- REGISTER ---');
  const reg = await post('/api/auth/register', { name: 'Test User', email: testEmail, password: 'test123' });
  console.log(JSON.stringify(reg, null, 2));

  if (reg.success) {
    console.log('\n--- LOGIN (same credentials) ---');
    const log = await post('/api/auth/login', { email: testEmail, password: 'test123' });
    console.log(JSON.stringify(log, null, 2));
    
    console.log('\n--- TOKEN received:', log.token ? 'YES ✅' : 'NO ❌');
  }
}

main().catch(console.error);
