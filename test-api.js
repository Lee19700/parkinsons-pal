const http = require('http');

setTimeout(async () => {
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/api/health', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve({ status: res.statusCode, body: data }); });
      });
      req.on('error', reject);
      req.setTimeout(5000);
    });
    
    console.log('\n✅ API WORKING!');
    console.log('Status:', response.status);
    console.log('Response:', response.body);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ API NOT RESPONDING');
    console.error('Error:', error.message);
    process.exit(1);
  }
}, 3000);

console.log('Testing http://localhost:3000/api/health...');
