import re, sys, html, glob
from pathlib import Path
sys.path.insert(0,'.')
import build
SRC=Path(sys.argv[1]); OUT=Path(sys.argv[2])
def norm(s):
    s=html.unescape(s)
    s=re.sub(r'[*`_>#|]',' ',s)
    s=re.sub(r'\[([^\]]*)\]\([^)]*\)',r'\1',s)
    s=s.replace(' ',' ')
    s=re.sub(r'[“”]','"',s); s=re.sub(r"[‘’]","'",s)
    return re.sub(r'\s+',' ',s).strip().lower()
def page_text(p):
    t=p.read_text(encoding='utf-8')
    t=re.sub(r'<script.*?</script>','',t,flags=re.S)
    t=re.sub(r'<(textarea)[^>]*>.*?</\1>','',t,flags=re.S)
    t=re.sub(r'<[^>]+>',' ',t)
    return norm(t)
total_miss=0
for n in range(1,18):
    f=sorted((SRC/'Learner_Course').glob(f'NDIS_VA_Foundations_Module_{n}_*.md'))[0]
    src=build.clean_source(f.read_text(encoding='utf-8'),n)
    d=OUT/f'module-{n:02d}'
    out=' '.join(page_text(p) for p in [d/'index.html']+sorted(d.glob('lesson-*/index.html')))
    misses=[]
    for line in src.split('\n'):
        s=line.strip()
        if not s or re.fullmatch(r'[-|: ]+',s) or s in('---','```','```text') : continue
        s=re.sub(r'^\s*(\d+\.|[-*]|>)\s+','',s)
        s=re.sub(r'^\[[ xX]\]\s*','',s)
        s=re.sub(r'</?(details|summary)>','',s)
        if s.startswith('|'):
            cells=[c for c in s.strip('|').split('|') if c.strip()]
        else: cells=[s]
        for c in cells:
            c=norm(c)
            if len(c)<3: continue
            if c not in out: misses.append(c[:110])
    total_miss+=len(misses)
    print(f'M{n}: {len(misses)} unmatched')
    for m in misses[:40]: print('    -',m)
print('TOTAL',total_miss)
