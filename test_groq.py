#!/usr/bin/env python3
"""
Quick test script to verify Groq API key is working
"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv("backend/.env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def test_groq_api():
    if not GROQ_API_KEY or GROQ_API_KEY == "your_new_groq_api_key_here":
        print("❌ GROQ_API_KEY not set or still using placeholder")
        print("Please update your backend/.env file with a valid Groq API key")
        return False
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": "Say hello in one word"}
        ],
        "max_tokens": 10,
    }
    
    try:
        print("🔄 Testing Groq API connection...")
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"✅ Groq API is working! Response: {content.strip()}")
            return True
        else:
            print(f"❌ Groq API error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Groq API call failed: {e}")
        return False

if __name__ == "__main__":
    test_groq_api()
