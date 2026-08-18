import json
with open('/home/ubuntu/workspace/portfolio-upgrade/v33-client-qa-v33.4.json', encoding='utf-8') as handle:
    data=json.load(handle)
for result in data['results']:
    if result['overflow']:
        print(result['width'])
        for item in result['overflow']:
            print(item)
