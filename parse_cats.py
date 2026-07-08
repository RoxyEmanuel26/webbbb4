import re

with open(r'C:\Users\Roxy Emanuel\.gemini\antigravity\brain\28acbfb6-da3c-42f2-9439-ac60ae1ed0ae\.system_generated\steps\865\content.md', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'<img src="(https://static[^>]+)" alt="([^"]+)">.*?<h2>([^<]+)</h2>', content, re.DOTALL)

cats = []
for url, alt, name in matches:
    if name.lower() != 'gay' and name.lower() != 'uncategorized':
        cats.append(f"  {{ name: '{name}', image: '{url}' }},")

result = 'const CATEGORIES = [\n' + '\n'.join(cats) + '\n];'
with open('scratch.txt', 'w', encoding='utf-8') as out:
    out.write(result)
print('Done!')
