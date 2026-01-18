#!/usr/bin/env node
import "dotenv/config";

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: PASSED`);
      return { success: true, data };
    } else {
      console.log(`❌ ${name}: FAILED - ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting IVY Backend Tests\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`
    },
    {
      name: 'Debug Voices',
      url: `${BASE_URL}/api/debug/voices`
    },
    {
      name: 'Debug Sessions', 
      url: `${BASE_URL}/api/debug/sessions`
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url, test.options);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Backend is ready.');
  } else {
    console.log('⚠️  Some tests failed. Check backend configuration.');
  }
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runTests };