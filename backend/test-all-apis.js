import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:3001';

async function testAPI(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      body,
      headers
    });
    
    console.log(`${method} ${endpoint}: ${response.status}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ Success:', JSON.stringify(data, null, 2));
      } else {
        console.log('✅ Success: Non-JSON response');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    console.log('---');
  } catch (error) {
    console.log(`❌ Network Error for ${endpoint}:`, error.message);
    console.log('---');
  }
}

async function runTests() {
  console.log('🧪 Testing IVY Backend APIs\n');
  
  // 1. Health Check
  await testAPI('/health');
  
  // 2. Debug endpoints
  await testAPI('/api/debug/voices');
  await testAPI('/api/debug/sessions');
  
  // 3. Start Interview
  const formData = new FormData();
  formData.append('persona_name', 'Shambhu');
  formData.append('interview_topic', 'Software Engineer');
  
  console.log('Testing interview start...');
  const startResponse = await fetch(`${BASE_URL}/api/interview/start`, {
    method: 'POST',
    body: formData
  });
  
  console.log(`POST /api/interview/start: ${startResponse.status}`);
  
  if (startResponse.ok) {
    const startData = await startResponse.json();
    console.log('✅ Interview started:', startData);
    
    const sessionId = startData.session_id;
    
    // 4. Test TTS
    console.log('\\nTesting TTS...');
    await testAPI('/api/tts', 'POST', JSON.stringify({
      text: 'Hello, this is a test message.',
      persona_name: 'Shambhu'
    }), {
      'Content-Type': 'application/json'
    });
    
    // 5. Test Chat (would need audio file)
    console.log('\\nNote: Chat endpoint requires audio file - skipping for now');
    
  } else {
    const error = await startResponse.text();
    console.log('❌ Interview start failed:', error);
  }
  
  console.log('\\n🏁 Test completed!');
}

runTests().catch(console.error);