import json
import os

PATH = os.getcwd()
FILE = os.path.join(PATH, "basic_website_features.json")

with open(FILE) as jsonfile:
    parsed = json.load(jsonfile)

for idx, item in enumerate(parsed['Features']):
    print(f"{idx+1}. {item['title']}")
    print(f"  {item['body']}")
    for i in item['bullets']:
        print(f"\t- {i}")
    # if idx != len(parsed['Features']) - 1:
    print("")
