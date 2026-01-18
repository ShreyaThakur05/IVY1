#!/usr/bin/env node

// Simple test script to verify backend functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Testing IVY Backend...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
    
    // Test voices endpoint
    console.log('\n2. Testing voices endpoint...');
    const voicesResponse = await fetch(`${BASE_URL}/api/voices`);
    if (voicesResponse.ok) {
      console.log('✅ Voices endpoint working');
    } else {
      console.log('❌ Voices endpoint failed:', voicesResponse.status);
    }
    
    // Test debug voices
    console.log('\n3. Testing debug voices...');
    const debugResponse = await fetch(`${BASE_URL}/api/debug/voices`);
    const debugData = await debugResponse.json();
    console.log('✅ Debug voices:', Object.keys(debugData.voices).length, 'custom voices');
    
    console.log('\n🎉 Backend tests completed!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('\n💡 Make sure the backend is running: npm start');
  }
}

testBackend();