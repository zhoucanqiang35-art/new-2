from html.parser import HTMLParser
from pathlib import Path
import json
class Extract(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True); self.stack=[]; self.out={}; self.advice={}; self.category={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs); key=a.get('data-i18n'); self.stack.append((tag,key,[]))
  for attr in ('placeholder','aria-label'):
   k=a.get('data-i18n-'+attr)
   if k and a.get(attr): self.out.setdefault(k,a[attr])
  if a.get('data-category-detail') and a.get('data-en'): self.out.setdefault('tip:'+a['data-category-detail'],a['data-en'])
  if a.get('data-category-advice') and a.get('data-en'): self.advice.setdefault(a['data-category-advice']+':'+a.get('data-advice-kind',''),a['data-en'])
  if a.get('data-en') and not a.get('data-category-detail') and not a.get('data-category-advice'): self.category.setdefault(a['data-en'],a['data-en'])
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_data(self,s):
  for _,key,text in self.stack:
   if key:text.append(s)
 def handle_endtag(self,tag):
  for n in range(len(self.stack)-1,-1,-1):
   if self.stack[n][0]==tag:
    _,key,text=self.stack.pop(n)
    if key and ''.join(text).strip():self.out.setdefault(key,' '.join(''.join(text).split()))
    break
p=Extract()
for file in Path('dist').rglob('*.html'):
 p.stack=[];p.feed(file.read_text())
for k,v in p.advice.items():p.out['advice:'+k]=v
for k,v in p.category.items():p.out['category:'+k]=v
out=[{'id':k,'name':v} for k,v in p.out.items()]
Path('translation-work').mkdir(exist_ok=True)
Path('translation-work/page-source-en.json').write_text(json.dumps(out,ensure_ascii=False))
print(len(out),'strings',len(p.advice),'advice',len(p.category),'category')
