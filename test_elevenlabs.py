#!/usr/bin/env python3
"""
Test ElevenLabs voice cloning directly
"""
import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import time

load_dotenv()

def test_elevenlabs_direct():
    """Test ElevenLabs API directly"""
    print("=== Testing ElevenLabs Direct ===")
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        print("❌ No ElevenLabs API key found")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        client = ElevenLabs(api_key=api_key)
        
        # Test basic API connection
        voices = client.voices.get_all()
        print(f"✅ Connected to ElevenLabs. Available voices: {len(voices.voices)}")
        
        # Create a minimal WAV file for testing
        # This is a minimal valid WAV header + some audio data
        wav_header = b'RIFF\x24\x08\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x22\x56\x00\x00\x44\xac\x00\x00\x02\x00\x10\x00data\x00\x08\x00\x00'
        audio_data = b'\x00\x00' * 1000  # Simple audio data
        test_audio = wav_header + audio_data
        
        # Write test audio file
        test_file = f"test_voice_{int(time.time())}.wav"
        with open(test_file, "wb") as f:
            f.write(test_audio)
        
        print(f"✅ Created test audio file: {test_file} ({len(test_audio)} bytes)")
        
        # Try to clone voice
        try:
            voice = client.clone(
                name=f"Test Voice {int(time.time())}",
                description="Test voice for IVY application",
                files=[test_file]
            )
            print(f"✅ Voice cloned successfully! Voice ID: {voice.voice_id}")
            
            # Clean up
            os.remove(test_file)
            return True
            
        except Exception as clone_error:
            print(f"❌ Voice cloning failed: {clone_error}")
            os.remove(test_file)
            return False
            
    except Exception as e:
        print(f"❌ ElevenLabs connection failed: {e}")
        return False

def test_voice_generation():
    """Test voice generation with default voice"""
    print("\n=== Testing Voice Generation ===")
    
    try:
        client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
        
        # Test with default voice
        audio_generator = client.generate(
            text="Hello, this is a test of the voice generation system.",
            voice="21m00Tcm4TlvDq8ikWAM",  # Default voice
            model="eleven_monolingual_v1"
        )
        
        audio_bytes = b"".join(audio_generator)
        print(f"✅ Generated audio: {len(audio_bytes)} bytes")
        
        return len(audio_bytes) > 0
        
    except Exception as e:
        print(f"❌ Voice generation failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing ElevenLabs Integration...")
    
    # Test direct ElevenLabs functionality
    clone_success = test_elevenlabs_direct()
    gen_success = test_voice_generation()
    
    print(f"\n{'='*50}")
    print("RESULTS:")
    print(f"Voice Cloning: {'✅ WORKING' if clone_success else '❌ FAILED'}")
    print(f"Voice Generation: {'✅ WORKING' if gen_success else '❌ FAILED'}")
    
    if not clone_success:
        print("\n⚠️  Voice cloning failed. This could be due to:")
        print("   - Invalid API key")
        print("   - API quota exceeded")
        print("   - Audio format issues")
        print("   - Network connectivity")