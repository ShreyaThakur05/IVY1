#!/usr/bin/env node

// Environment check script
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('🔍 Checking IVY Environment Configuration...\n');

const requiredEnvVars = [
  'GROQ_API_KEY',
  'GEMINI_API_KEY', 
  'ELEVENLABS_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

let allGood = true;

console.log('Backend Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  }
});

console.log('\nFrontend Environment Variables:');
const frontendEnvPath = path.join(process.cwd(), '..', '.env.local');
if (fs.existsSync(frontendEnvPath)) {
  console.log('✅ .env.local file exists');
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  if (frontendEnv.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL found');
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL missing');
    allGood = false;
  }
  if (frontendEnv.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY found');
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY missing');
    allGood = false;
  }
} else {
  console.log('❌ .env.local file missing in root directory');
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 All environment variables are configured!');
  console.log('✅ Ready to start IVY application');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('💡 Please check your .env files and add missing keys');
}
console.log('='.repeat(50));