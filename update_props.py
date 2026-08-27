import re
target = r'src\app\video\[...slug]\VideoPlayerClient.jsx'
src = open(target, encoding='utf-8').read()

src = src.replace('({ id, initialTitle, seoDescription, aiDescription })', '({ id, initialTitle, seoDescription, aiDescription, aiCleanedTags })')

kws_logic = '''
      const kws = String(data.keywords || '')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 2 && k.length < 25 && k.split(/\s+/).length <= 2 && !FORBIDDEN_REGEX.test(k));
      setKeywords(kws);'''

new_logic = '''
      let finalKws = [];
      if (aiCleanedTags && aiCleanedTags.length > 0) {
        finalKws = aiCleanedTags;
      } else {
        finalKws = String(data.keywords || '')
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 2 && k.length < 25 && k.split(/\\s+/).length <= 2 && !FORBIDDEN_REGEX.test(k));
      }
      setKeywords(finalKws);'''

src = src.replace(kws_logic, new_logic)

src = src.replace("relUrl.searchParams.append('query', kws.slice(0, 3).join(' ') || 'all');",
                  "relUrl.searchParams.append('query', finalKws.slice(0, 3).join(' ') || 'all');")

open(target, 'w', encoding='utf-8').write(src)
print('Done')
