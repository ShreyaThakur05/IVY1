import requests
import json

# Test if backend is running
try:
    response = requests.get("http://localhost:8001/docs")
    print("Backend is running on port 8001")
except:
    print("Backend is not running. Start it with: python main.py")

# Test TTS endpoint
try:
    data = {"text": "Hello, this is a test", "persona": "Shambhu"}
    response = requests.post("http://localhost:8001/api/tts", data=data)
    if response.status_code == 200:
        print("TTS endpoint working")
        with open("test_audio.mp3", "wb") as f:
            f.write(response.content)
        print("Audio file saved as test_audio.mp3")
    else:
        print(f"TTS failed: {response.status_code}")
except Exception as e:
    print(f"TTS test failed: {e}")