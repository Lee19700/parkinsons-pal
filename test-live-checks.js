#!/usr/bin/env node
/**
 * Parkinson's Pal - Live Readiness Test
 * Tests all critical endpoints and features
 * Run: node test-live-checks.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://parkipal.com'; // Change to your domain
const API_BASE = `${BASE_URL}/api`;

let testResults = [];
let testUser = {
  username: `testuser_${Date.now()}`,
  password: 'TestPassword123!',
  display_name: 'Test User'
};
let authToken = null;
let userId = null;

// Helper: Make HTTP/HTTPS requests
function makeRequest(url, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ParkipalLiveTest/1.0'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n📋 Testing: Health Check');
  try {
    const res = await makeRequest(`${API_BASE}/health`);
    const pass = res.status === 200 && res.body?.status === 'ok';
    testResults.push({
      test: '✅ Health Check',
      pass,
      details: pass ? 'API responding' : `Status: ${res.status}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ Health Check',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testRegistration() {
  console.log('📋 Testing: User Registration');
  try {
    const res = await makeRequest(`${API_BASE}/auth/register`, 'POST', testUser);
    const pass = res.status === 201 && res.body?.token;
    
    if (pass) {
      authToken = res.body.token;
      userId = res.body.user?.id;
    }
    
    testResults.push({
      test: '✅ User Registration',
      pass,
      details: pass ? `User created: ${testUser.username}` : `Status: ${res.status}, ${res.body?.error}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ User Registration',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testLogin() {
  console.log('📋 Testing: User Login');
  try {
    const res = await makeRequest(`${API_BASE}/auth/login`, 'POST', {
      username: testUser.username,
      password: testUser.password
    });
    
    const pass = res.status === 200 && res.body?.token;
    
    if (pass && !authToken) {
      authToken = res.body.token;
    }
    
    testResults.push({
      test: '✅ User Login',
      pass,
      details: pass ? 'Login successful' : `Status: ${res.status}, ${res.body?.error}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ User Login',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testAddMedication() {
  console.log('📋 Testing: Add Medication');
  if (!authToken) {
    testResults.push({
      test: '⏭️  Add Medication',
      pass: false,
      details: 'Skipped - no auth token'
    });
    return false;
  }
  
  try {
    const res = await makeRequest(`${API_BASE}/medications`, 'POST', {
      name: 'Levodopa',
      dosage: '500mg',
      times: 'Morning, Afternoon, Evening',
      stock: 30,
      notes: 'Test medication'
    }, authToken);
    
    const pass = res.status === 201 && res.body?.ok;
    testResults.push({
      test: '✅ Add Medication',
      pass,
      details: pass ? `Med ID: ${res.body.id}` : `Status: ${res.status}, ${res.body?.error}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ Add Medication',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testGetMedications() {
  console.log('📋 Testing: Get Medications');
  if (!authToken) {
    testResults.push({
      test: '⏭️  Get Medications',
      pass: false,
      details: 'Skipped - no auth token'
    });
    return false;
  }
  
  try {
    const res = await makeRequest(`${API_BASE}/medications`, 'GET', null, authToken);
    const pass = res.status === 200 && Array.isArray(res.body);
    testResults.push({
      test: '✅ Get Medications',
      pass,
      details: pass ? `Retrieved ${res.body.length} medications` : `Status: ${res.status}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ Get Medications',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testAddSymptom() {
  console.log('📋 Testing: Add Symptom');
  if (!authToken) {
    testResults.push({
      test: '⏭️  Add Symptom',
      pass: false,
      details: 'Skipped - no auth token'
    });
    return false;
  }
  
  try {
    const res = await makeRequest(`${API_BASE}/symptoms`, 'POST', {
      tremor: 5,
      bradykinesia: 3,
      rigidity: 4,
      gait: 2,
      dyskinesia: 1,
      sleep: 6,
      mood: 7,
      cognition: 8,
      notes: 'Test symptom entry',
      timestamp: new Date().toISOString()
    }, authToken);
    
    const pass = res.status === 201 && res.body?.ok;
    testResults.push({
      test: '✅ Add Symptom',
      pass,
      details: pass ? `Symptom ID: ${res.body.id}` : `Status: ${res.status}, ${res.body?.error}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ Add Symptom',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testGetSymptoms() {
  console.log('📋 Testing: Get Symptoms');
  if (!authToken) {
    testResults.push({
      test: '⏭️  Get Symptoms',
      pass: false,
      details: 'Skipped - no auth token'
    });
    return false;
  }
  
  try {
    const res = await makeRequest(`${API_BASE}/symptoms`, 'GET', null, authToken);
    const pass = res.status === 200 && Array.isArray(res.body);
    testResults.push({
      test: '✅ Get Symptoms',
      pass,
      details: pass ? `Retrieved ${res.body.length} symptoms` : `Status: ${res.status}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ Get Symptoms',
      pass: false,
      details: e.message
    });
    return false;
  }
}

async function testAddVital() {
  console.log('📋 Testing: Add Vital Signs');
  if (!authToken) {
    testResults.push({
      test: '⏭️  Add Vital',
      pass: false,
      details: 'Skipped - no auth token'
    });
    return false;
  }
  
  try {
    const res = await makeRequest(`${API_BASE}/vitals`, 'POST', {
      systolic: 120,
      diastolic: 80,
      heart_rate: 72,
      temperature: 98.6,
      oxygen: 95,
      respiratory_rate: 16,
      notes: 'Test vitals',
      timestamp: new Date().toISOString()
    }, authToken);
    
    const pass = res.status === 201 && res.body?.ok;
    testResults.push({
      test: '✅ Add Vital Signs',
      pass,
      details: pass ? `Vital ID: ${res.body.id}` : `Status: ${res.status}, ${res.body?.error}`
    });
    return pass;
  } catch (e) {
    testResults.push({
      test: '❌ Add Vital Signs',
      pass: false,
      details: e.message
    });
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Parkinson\'s Pal - Live Readiness Test Suite');
  console.log(`🌐 Testing: ${BASE_URL}`);
  console.log('=' .repeat(50));

  await testHealthCheck();
  await testRegistration();
  await testLogin();
  await testAddMedication();
  await testGetMedications();
  await testAddSymptom();
  await testGetSymptoms();
  await testAddVital();

  // Print results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('=' .repeat(50));

  testResults.forEach(result => {
    console.log(`\n${result.test}`);
    console.log(`   ${result.details}`);
  });

  const passed = testResults.filter(r => r.pass).length;
  const total = testResults.length;
  const passRate = Math.round((passed / total) * 100);

  console.log('\n' + '=' .repeat(50));
  console.log(`✅ PASSED: ${passed}/${total} (${passRate}%)`);
  console.log('=' .repeat(50));

  if (passRate === 100) {
    console.log('\n🎉 ALL TESTS PASSED! Site is ready to go live!\n');
    process.exit(0);
  } else if (passRate >= 80) {
    console.log('\n⚠️  Most tests passed. Fix the failures above.\n');
    process.exit(1);
  } else {
    console.log('\n❌ Multiple failures detected. Check configuration.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
