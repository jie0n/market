import os
import requests

API_KEY = os.getenv("SAFE_BROWSING_API_KEY")

def check_url_safety(url: str):
    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"

    body = {
        "client": {
            "clientId": "your-app-name",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [
                {"url": url}
            ]
        }
    }

    response = requests.post(endpoint, json=body)
    result = response.json()

    if "matches" in result:
        return False
    return True