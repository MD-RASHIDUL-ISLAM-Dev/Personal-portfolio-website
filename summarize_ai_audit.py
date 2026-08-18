import json
from pathlib import Path

payload = json.loads(Path('ai-mobile-audit-v25.4.json').read_text())
for result in payload['results']:
    print(f"WIDTH {result['width']} scrollWidth={result['scrollWidth']} sectionHeight={result['section']['height']}")
    print(f"HEADER height={result['header']['height']} out={len(result['headerOut'])}")
    for item in result['cards']:
        card = item['card']
        print(f"CARD id={card['id'] or '-'} cls={card['cls']} top={card['top']} bottom={card['bottom']} h={card['height']} width={card['width']} overflowChildren={len(item['children'])}")
        for child in item['children']:
            print(f"  OUT {child['id'] or child['tag']} left={child['left']} right={child['right']} top={child['top']} bottom={child['bottom']} w={child['width']} h={child['height']} text={child['text'][:80]}")
        consent = [x for x in item['all'] if x['cls'].startswith('v25-consent')]
        for child in consent:
            print(f"  CONSENT cls={child['cls']} left={child['left']} right={child['right']} w={child['width']} h={child['height']} display={child['display']} text={child['text'][:80]}")
