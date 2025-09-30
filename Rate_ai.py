import google.generativeai as genai
import random
import re

# Two Gemini API keys
API_KEYS = [
    "AIzaSyB7x3Th-3mYNygWC6FMrsqlXq8_GQq0hy0"
]

USAGE_LIMIT = 50
usage_counts = [0] * len(API_KEYS)
current_key_index = 0

MODEL_NAME = "gemini-2.5-flash-lite"  # cheaper and fully supported

# Configure Gemini with current API key
def configure_model(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(MODEL_NAME)

# Set up first model
model = configure_model(API_KEYS[current_key_index])

def switch_key_if_needed():
    global model, current_key_index
    if usage_counts[current_key_index] >= USAGE_LIMIT:
        current_key_index = (current_key_index + 1) % len(API_KEYS)
        model = configure_model(API_KEYS[current_key_index])
        print(f"🔄 Switched to API key #{current_key_index + 1}")

def rate_roast(roast):
    switch_key_if_needed()
    usage_counts[current_key_index] += 1

    prompt = f"""
Roast: "{roast}"

Rate this roast using only four numbers from 1 to 10, in this order:
Cleverness, Burn Level, Originality, Funny.

Reply ONLY with four comma-separated numbers. No explanations.
"""

    try:
        response = model.generate_content(prompt)
        reply = response.text.strip()
        numbers = [int(n) for n in re.findall(r'\b\d+\b', reply)]

        if len(numbers) != 4:
            print("Unexpected response format:", reply)
            return 5.0

        cleverness, burn, originality, funny = numbers
        weighted_sum = cleverness + burn * 2 + originality + funny
        average = round(weighted_sum / 5, 2)
        return average
    except Exception as e:
        return f"Error: {e}"

def generate_roast(target):
    switch_key_if_needed()
    usage_counts[current_key_index] += 1

    tones = ["savage", "funny", "clever", "brutal"]
    targets = [f"someone that said '{target}' to you so make a comeback", "a human", "a human", "a human"]

    tone = random.choice(tones)
    target_text = random.choice(targets)

    prompt = f"""
You are a {tone} roast master. Write one short, unique, and funny roast insult targeting {target_text} in a roasting contest.
Be creative. Don't start with "Oh honey". Make the style different every time.
Only return the roast itself. Avoid repeating previous ideas or lines.
Use clever wordplay or sarcasm.
"""

    try:
        response = model.generate_content(prompt)
        roast = response.text.strip().strip('"')
        return roast
    except Exception as e:
        return f"Error generating roast: {e}"

# 🔥 Example usage



