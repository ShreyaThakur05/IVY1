#!/usr/bin/env python3
"""
Test script to verify voice cloning and interview flow
"""
import requests
import json
import time

BASE_URL = "http://localhost:8006"

def test_voice_clone():
    """Test voice cloning endpoint"""
    print("=== Testing Voice Clone ===")
    
    # Create a dummy audio file for testing
    dummy_audio = b"dummy audio content for testing" * 100  # Make it larger than 1000 bytes
    
    files = {
        'audio_file': ('test_voice.wav', dummy_audio, 'audio/wav')
    }
    
    data = {
        'user_id': 'test_user',
        'voice_name': 'Test Voice',
        'persona_id': 'test-persona-001'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/voice/clone", files=files, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_debug_voices():
    """Test debug voices endpoint"""
    print("\n=== Testing Debug Voices ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/debug/voices")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Stored voices: {json.dumps(data, indent=2)}")
        else:
            print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_interview_start():
    """Test interview start with custom voice"""
    print("\n=== Testing Interview Start ===")
    
    data = {
        'user_id': 'test_user',
        'persona_id': 'test-persona-001',
        'persona_name': 'Test Persona',
        'interview_topic': 'Software Engineering'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/interview/start", data=data)
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"Session-ID: {response.headers.get('X-Session-ID', 'N/A')}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("Testing IVY Voice Flow...")
    print("Make sure the backend is running on localhost:8006")
    
    # Test health endpoint first
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("[ERROR] Backend not running or not responding")
            return
        print("[OK] Backend is running")
    except:
        print("[ERROR] Cannot connect to backend")
        return
    
    # Run tests
    tests = [
        ("Voice Clone", test_voice_clone),
        ("Debug Voices", test_debug_voices),
        ("Interview Start", test_interview_start)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        result = test_func()
        results.append((test_name, result))
        print(f"{'[PASS]' if result else '[FAIL]'} {test_name}: {'PASSED' if result else 'FAILED'}")
    
    print(f"\n{'='*50}")
    print("SUMMARY:")
    for test_name, result in results:
        print(f"{'[PASS]' if result else '[FAIL]'} {test_name}")

if __name__ == "__main__":
    main()