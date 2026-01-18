#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testElevenLabs() {
  console.log('🧪 Testing ElevenLabs API...\n');
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ELEVENLABS_API_KEY not found in .env');
    return;
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  try {
    // Test 1: Get available voices
    console.log('\n1. Testing voices endpoint...');
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (voicesResponse.ok) {
      const voices = await voicesResponse.json();
      console.log(`✅ Found ${voices.voices.length} available voices`);
      console.log('Sample voices:', voices.voices.slice(0, 3).map(v => v.name));
    } else {
      console.log('❌ Voices API failed:', voicesResponse.status);
      const error = await voicesResponse.text();
      console.log('Error:', error);
    }
    
    // Test 2: Check quota
    console.log('\n2. Testing user info (quota)...');
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log('✅ User info retrieved');
      console.log('Character count:', user.subscription?.character_count || 'N/A');
      console.log('Character limit:', user.subscription?.character_limit || 'N/A');
    } else {
      console.log('❌ User API failed:', userResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testElevenLabs();