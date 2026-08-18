from bs4 import BeautifulSoup
from pathlib import Path
import re
html=Path('/home/ubuntu/workspace/portfolio-upgrade/index.html').read_text()
soup=BeautifulSoup(html,'html.parser')
for node in soup(['script','style','svg','title','meta','noscript']):
    node.decompose()
seen=[]
for t in soup.body.find_all(string=True):
    value=' '.join(str(t).split())
    if not value or value in seen: continue
    seen.append(value)
    print(value)
print(f'UNIQUE_TEXT_NODES={len(seen)}')
