import fs from 'fs';
import path from 'path';

// Persistent voice storage file
const VOICES_FILE = path.join(process.cwd(), 'voices.json');

// Load voices from file on startup
let voicePersonas = new Map();

function loadVoices() {
  try {
    if (fs.existsSync(VOICES_FILE)) {
      const data = fs.readFileSync(VOICES_FILE, 'utf8');
      const voices = JSON.parse(data);
      voicePersonas = new Map(Object.entries(voices));
      console.log(`✅ Loaded ${voicePersonas.size} voice personas from storage`);
    }
  } catch (error) {
    console.error('Error loading voices:', error);
    voicePersonas = new Map();
  }
}

function saveVoices() {
  try {
    const voices = Object.fromEntries(voicePersonas);
    fs.writeFileSync(VOICES_FILE, JSON.stringify(voices, null, 2));
    console.log(`💾 Saved ${voicePersonas.size} voice personas to storage`);
  } catch (error) {
    console.error('Error saving voices:', error);
  }
}

// Initialize on startup
loadVoices();

export function getVoiceId(personaName) {
  console.log(`[VOICE] Looking for voice for persona: "${personaName}"`);
  
  // Check for custom voices first
  if (voicePersonas.has(personaName)) {
    const voiceId = voicePersonas.get(personaName).voice_id;
    console.log(`[VOICE] Found custom voice: ${voiceId}`);
    return voiceId;
  }
  
  // Default persona voices - using standard ElevenLabs voices
  const defaultVoices = {
    'Shambhu': 'pNInz6obpgueM0WZtGIn',     // Adam (male)
    'Shreyas': 'yoZ06aMxZJJ28mfd3POQ',     // Sam (male) 
    'Shreya': '21m00Tcm4TlvDq8ikWAM'      // Rachel (female)
  };
  
  const defaultVoice = defaultVoices[personaName];
  if (defaultVoice) {
    console.log(`[VOICE] Using default voice for ${personaName}: ${defaultVoice}`);
    return defaultVoice;
  }
  
  console.log(`[VOICE] No voice found for "${personaName}", using fallback`);
  return "21m00Tcm4TlvDq8ikWAM";
}

export function setVoicePersona(name, data) {
  voicePersonas.set(name, data);
  saveVoices(); // Persist immediately
}

export function getAllVoices() {
  return Object.fromEntries(voicePersonas);
}

export function deleteVoice(name) {
  const deleted = voicePersonas.delete(name);
  if (deleted) {
    saveVoices();
  }
  return deleted;
}