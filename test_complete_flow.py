#!/usr/bin/env python3
"""
Complete test of voice cloning and usage flow
"""
import requests
import json
import time

BASE_URL = "http://localhost:8006"

def create_test_audio():
    """Create a proper WAV file for testing"""
    # Minimal valid WAV file (1 second of silence at 44.1kHz, 16-bit mono)
    wav_header = (
        b'RIFF'
        b'\x24\x08\x00\x00'  # File size - 8
        b'WAVE'
        b'fmt '
        b'\x10\x00\x00\x00'  # fmt chunk size
        b'\x01\x00'          # PCM format
        b'\x01\x00'          # Mono
        b'\x44\xac\x00\x00'  # Sample rate (44100)
        b'\x88\x58\x01\x00'  # Byte rate
        b'\x02\x00'          # Block align
        b'\x10\x00'          # Bits per sample
        b'data'
        b'\x00\x08\x00\x00'  # Data chunk size
    )
    
    # Add some actual audio data (silence)
    audio_data = b'\x00\x00' * 1000  # 1000 samples of silence
    
    return wav_header + audio_data

def test_complete_flow():
    """Test the complete voice cloning and usage flow"""
    print("=== COMPLETE VOICE FLOW TEST ===")
    
    # Step 1: Create test audio
    test_audio = create_test_audio()
    print(f"[OK] Created test audio: {len(test_audio)} bytes")
    
    # Step 2: Clone voice
    persona_id = f"test-persona-{int(time.time())}"
    voice_name = f"TestVoice-{int(time.time())}"
    
    files = {
        'audio_file': ('test_voice.wav', test_audio, 'audio/wav')
    }
    
    data = {
        'user_id': 'test_user',
        'voice_name': voice_name,
        'persona_id': persona_id
    }
    
    print(f"\\n--- Cloning voice for persona: {persona_id} ---")
    response = requests.post(f"{BASE_URL}/api/voice/clone", files=files, data=data)
    
    if response.status_code != 200:
        print(f"[FAIL] Voice cloning failed: {response.text}")
        return False
    
    clone_result = response.json()
    voice_id = clone_result.get('voice_id')
    print(f"[OK] Voice cloned successfully: {voice_id}")
    
    # Step 3: Verify voice is stored
    print(f"\\n--- Verifying voice storage ---")
    response = requests.get(f"{BASE_URL}/api/debug/voice/{persona_id}")
    
    if response.status_code != 200:
        print(f"[FAIL] Voice verification failed: {response.text}")
        return False
    
    verify_result = response.json()
    if not verify_result.get('found'):
        print(f"[FAIL] Voice not found in storage")
        return False
    
    stored_voice_id = verify_result['voice_data']['voice_id']
    print(f"[OK] Voice found in storage: {stored_voice_id}")
    
    if stored_voice_id != voice_id:
        print(f"[FAIL] Voice ID mismatch: expected {voice_id}, got {stored_voice_id}")
        return False
    
    # Step 4: Test interview start with custom voice
    print(f"\\n--- Testing interview start ---")
    interview_data = {
        'user_id': 'test_user',
        'persona_id': persona_id,
        'persona_name': 'Test Interviewer',
        'interview_topic': 'Software Engineering'
    }
    
    response = requests.post(f"{BASE_URL}/api/interview/start", data=interview_data)
    
    if response.status_code != 200:
        print(f"[FAIL] Interview start failed: {response.text}")
        return False
    
    content_type = response.headers.get('content-type', '')
    session_id = response.headers.get('X-Session-ID')
    
    print(f"[OK] Interview started successfully")
    print(f"  Content-Type: {content_type}")
    print(f"  Session-ID: {session_id}")
    
    # Step 5: Test chat with custom voice
    print(f"\\n--- Testing chat with custom voice ---")
    
    # Create test audio for chat
    chat_audio = create_test_audio()
    
    chat_files = {
        'audio_file': ('user_audio.wav', chat_audio, 'audio/wav')
    }
    
    chat_data = {
        'session_id': session_id or 'test_session',
        'persona_id': persona_id,
        'persona_name': 'Test Interviewer',
        'user_id': 'test_user',
        'interview_topic': 'Software Engineering'
    }
    
    response = requests.post(f"{BASE_URL}/api/chat", files=chat_files, data=chat_data)
    
    if response.status_code != 200:
        print(f"[FAIL] Chat failed: {response.text}")
        return False
    
    chat_content_type = response.headers.get('content-type', '')
    print(f"[OK] Chat completed successfully")
    print(f"  Content-Type: {chat_content_type}")
    
    if 'audio' in chat_content_type:
        audio_size = len(response.content)
        print(f"  Audio response size: {audio_size} bytes")
        
        if audio_size > 1000:
            print(f"[SUCCESS] Custom voice audio generated successfully!")
            return True
        else:
            print(f"[FAIL] Audio too small, might be using fallback")
            return False
    else:
        print(f"[WARN] Text-only response (TTS might have failed)")
        return False

def main():
    print("Testing Complete Voice Cloning Flow...")
    
    # Test backend connection
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("[FAIL] Backend not responding")
            return
        print("[OK] Backend is running")
    except:
        print("[FAIL] Cannot connect to backend")
        return
    
    # Run complete flow test
    success = test_complete_flow()
    
    print(f"\\n{'='*60}")
    if success:
        print("[SUCCESS] COMPLETE FLOW TEST: SUCCESS!")
        print("   Your uploaded voice should now be used as the interviewer")
    else:
        print("[FAIL] COMPLETE FLOW TEST: FAILED")
        print("   Check the backend logs for detailed error information")

if __name__ == "__main__":
    main()