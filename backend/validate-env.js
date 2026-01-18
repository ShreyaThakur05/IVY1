import "dotenv/config";

const requiredEnvVars = [
  'GROQ_API_KEY',
  'GEMINI_API_KEY', 
  'ELEVENLABS_API_KEY'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;

// Check required variables
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING (REQUIRED)`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: MISSING (OPTIONAL)`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Environment validation FAILED');
  console.log('Please add missing API keys to backend/.env file');
  process.exit(1);
} else {
  console.log('✅ Environment validation PASSED');
  console.log('All required API keys are present');
}