const response = await fetch('http://localhost:3001/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello test', persona_name: 'Shambhu' })
});

console.log('TTS Status:', response.status);
if (!response.ok) {
  const error = await response.text();
  console.log('TTS Error:', error);
} else {
  console.log('TTS Success: Audio received');
}