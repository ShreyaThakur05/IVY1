// Startup validation script
import "dotenv/config";

const requiredEnvVars = [
  'GROQ_API_KEY',
  'GEMINI_API_KEY', 
  'ELEVENLABS_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

console.log('🔍 Checking environment variables...');

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
console.log('🚀 Starting IVY backend...');