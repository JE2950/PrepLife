import pathlib
src=pathlib.Path('src')
h=(src/'shell.html').read_text()
import glob
for tag,f in [('ENGINE',['engine.js']),('CONTENT',['content.js']+sorted(x[4:] for x in glob.glob('src/events/*.js'))),('UI',['ui.js']),('LIVE',['live.js'])]:
    js='\n'.join((src/x).read_text() for x in f)
    assert '</script' not in js
    h=h.replace('/*%s*/'%tag, js)
pathlib.Path('index.html').write_text(h)
ios=pathlib.Path('ios/PrepLife/Resources'); ios.mkdir(parents=True, exist_ok=True)
(ios/'index.html').write_text(h)
print('built', len(h)//1024, 'KB')
