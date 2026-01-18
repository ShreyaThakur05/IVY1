#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import tempfile

load_dotenv()

def test_voice_cloning():
    """Test ElevenLabs voice cloning with a real audio file"""
    try:
        client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
        
        # Create a minimal valid WAV file
        wav_data = (
            b'RIFF\x24\x08\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00'
            b'\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x08\x00\x00'
            + b'\x00\x00' * 1000
        )
        
        # Write to temp file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            f.write(wav_data)
            temp_file = f.name
        
        print(f"Created temp file: {temp_file} ({len(wav_data)} bytes)")
        
        # Try to clone
        print("Attempting voice cloning...")
        voice = client.clone(
            name="Test Voice Clone",
            description="Test voice for debugging",
            files=[temp_file]
        )
        
        print(f"SUCCESS: Voice cloned with ID: {voice.voice_id}")
        
        # Test the voice
        print("Testing cloned voice...")
        audio_gen = client.generate(
            text="Hello, this is your cloned voice speaking.",
            voice=voice.voice_id,
            model="eleven_turbo_v2_5"
        )
        
        audio_bytes = b"".join(audio_gen)
        print(f"SUCCESS: Generated {len(audio_bytes)} bytes with cloned voice")
        
        # Clean up
        os.unlink(temp_file)
        
        return voice.voice_id
        
    except Exception as e:
        print(f"ERROR: {e}")
        if 'temp_file' in locals():
            try:
                os.unlink(temp_file)
            except:
                pass
        return None

if __name__ == "__main__":
    print("Testing ElevenLabs voice cloning...")
    voice_id = test_voice_cloning()
    if voice_id:
        print(f"Voice cloning works! Voice ID: {voice_id}")
    else:
        print("Voice cloning failed!")