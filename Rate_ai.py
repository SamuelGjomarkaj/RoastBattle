import google.generativeai as genai

# Replace this with your real API key
GOOGLE_API_KEY = "AIzaSyDbPcSEgZ81Crwgs0rUGDW_9fkbMgmF9p0"

# Configure the API
genai.configure(api_key=GOOGLE_API_KEY)

# Choose the Gemini Flash model (Lite version)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def rate_roast(roast):
    prompt = f"""
Roast: "{roast}"

Rate this roast using only four numbers from 1 to 10, in this order:
Cleverness, Burn Level, Originality, Funny.

Reply ONLY with four comma-separated numbers. No explanations.
"""

    # Generate the response
    response = model.generate_content(prompt)
    reply = response.text.strip()

    # Try to extract 4 numbers from the reply
    import re
    numbers = [int(n) for n in re.findall(r'\b\d+\b', reply)]

    if len(numbers) != 4:
        print("Unexpected response format:", reply)
        return None

    cleverness, burn, originality, funny = numbers

    # Weighted average: Burn Level counted twice
    weighted_sum = cleverness + burn * 2 + originality + funny
    average = round(weighted_sum / 5, 2)

    return {
        average
    }

# 🔥 Example use:
roast = ("You have a face that would make onions cry. ")
rating = rate_roast(roast)

if rating:
    print("Rating:")
    print(f"  Cleverness:        {rating['cleverness']}")
    print(f"  Burn Level:        {rating['burn']}")
    print(f"  Originality:       {rating['originality']}")
    print(f"  Funny:             {rating['funny']}")
    print(f"  Weighted Average:  {rating['weighted_average']}")
