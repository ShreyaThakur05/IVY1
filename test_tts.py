#!/usr/bin/env python3
"""
Direct test of ElevenLabs TTS functionality
"""
import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

def test_tts():
    """Test ElevenLabs TTS directly"""
    try:
        client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
        
        print("Testing TTS with eleven_turbo_v2_5...")
        audio_generator = client.generate(
            text="Hello, this is a test of the voice system.",
            voice="21m00Tcm4TlvDq8ikWAM",
            model="eleven_turbo_v2_5"
        )
        
        audio_bytes = b"".join(audio_generator)
        print(f"SUCCESS: Generated {len(audio_bytes)} bytes of audio")
        
        # Save to file for verification
        with open("tts_test.mp3", "wb") as f:
            f.write(audio_bytes)
        print("Audio saved to tts_test.mp3")
        
        return True
        
    except Exception as e:
        print(f"ERROR: TTS failed - {e}")
        return False

if __name__ == "__main__":
    test_tts()