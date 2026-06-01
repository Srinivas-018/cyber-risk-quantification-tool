import requests
import time

url = "http://localhost:5000/describe"
for i in range(35):
    res = requests.get(url)
    print(f"Request {i+1}: {res.status_code}")
    if res.status_code == 429:
        print("Rate limit hit successfully!")
        break