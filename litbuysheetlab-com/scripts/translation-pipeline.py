#!/usr/bin/env python3
"""Free, resumable translation. Never overwrite existing translations or product data."""
import argparse, collections, hashlib, html, json, pathlib, re, time, urllib.parse, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]; DATA=ROOT/'public/data'; REPORT=ROOT/'reports'
LANGS=['zh','de','fr','es','it','pt','nl','pl','sv','da','no','fi','cs','hu','ro','el','tr','uk','ru','ja','ko','ar','id']
def read(p,default=None):
 return json.loads(p.read_text()) if p.exists() else ({} if default is None else default)
def save(p,obj):
 p.parent.mkdir(parents=True,exist_ok=True); tmp=p.with_suffix(p.suffix+'.tmp');tmp.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');tmp.replace(p)
def valid(v):return isinstance(v,str) and bool(v.strip())
def digest():return hashlib.sha256((DATA/'products.json').read_bytes()).hexdigest()
def audit():
 ps=read(DATA/'products.json'); ids={p['id'] for p in ps}; home=read(DATA/'home-ui.json'); ui=read(DATA/'ui.json'); source=read(DATA/'translation-source.json'); messages=read(DATA/'messages.json'); stats={};pending=[]
 for lang in LANGS:
  d=read(DATA/f'titles/{lang}.json');missing=[p['id'] for p in ps if not valid(d.get(p['id']))]
  hmissing=[k for k,v in home['en'].items() if isinstance(v,str) and not valid(home.get(lang,{}).get(k))]
  umissing=[k for k in ui['en'] if not valid(ui.get(lang,{}).get(k))]
  cmissing=[k for k in home['en'].get('categoryNames',{}) if not valid(home.get(lang,{}).get('categoryNames',{}).get(k))]
  mmissing=[s for s in source if not valid(messages.get(lang,{}).get(s))]
  suspicious=[i for i,v in d.items() if isinstance(v,str) and ('…' in v or '\ufffd' in v or '<html' in v.lower())]
  unchanged=[p['id'] for p in ps if d.get(p['id'])==p['name']]
  stats[lang]={'titles_present':len(ids)-len(missing),'titles_missing':len(missing),'home_missing':len(hmissing),'ui_missing':len(umissing),'categories_missing':len(cmissing),'messages_missing':len(mmissing),'titles_needing_review':len(suspicious),'unchanged_title_review':len(unchanged),'unknown_title_ids':sorted(set(d)-ids)}
  pending.append({'language':lang,'title_ids':missing,'home_keys':hmissing,'ui_keys':umissing,'category_keys':cmissing,'messages':mmissing,'title_review_ids':suspicious,'unchanged_review_ids':unchanged})
 report={'products':len(ps),'unique_product_ids':len(ids),'languages':['en']+LANGS,'products_sha256':digest(),'missing_title_total':sum(x['titles_missing'] for x in stats.values()),'complete':all(not any(d[k] for k in ['titles_missing','home_missing','ui_missing','categories_missing','messages_missing']) for d in stats.values()),'languages_detail':stats,'quality_note':'Automated completeness and heuristic checks only; existing abbreviated and unchanged titles require human review.'}
 save(REPORT/'translation-audit.json',report);save(REPORT/'translation-pending.json',pending);print(json.dumps(report,ensure_ascii=False),flush=True);return report

def reuse():
 ps=read(DATA/'products.json'); provenance=read(REPORT/'translation-provenance.json',[]); count=0
 for lang in LANGS:
  path=DATA/f'titles/{lang}.json';d=read(path);by=collections.defaultdict(set)
  for p in ps:
   if valid(d.get(p['id'])):by[p['name']].add(d[p['id']])
  for p in ps:
   choices=by[p['name']]
   if not valid(d.get(p['id'])) and len(choices)==1:
    d[p['id']]=next(iter(choices));count+=1;provenance.append({'language':lang,'id':p['id'],'method':'exact-source-name-existing-translation'})
  save(path,d)
 save(REPORT/'translation-provenance.json',provenance);print('Reused titles:',count,flush=True)

def translate(args):
 ps=read(DATA/'products.json');before=digest(); home=read(DATA/'home-ui.json');ui=read(DATA/'ui.json');source=read(DATA/'translation-source.json');messages=read(DATA/'messages.json');cache=read(REPORT/'translation-cache.json'); log=read(REPORT/'translation-service-log.json',[]);calls=0;stopped=False
 def get(text,lang):
  nonlocal calls
  key=lang+'|'+text
  if valid(cache.get(key)):return cache[key]
  if calls>=args.max_requests:raise RuntimeError('Configured request limit reached; rerun the same command to resume.')
  if len(text.encode('utf-8'))>480:
   chunks=[];chunk=''
   for word in text.split():
    candidate=(chunk+' '+word).strip()
    if len(candidate.encode('utf-8'))>450:
     if not chunk:raise ValueError('Single word exceeds service byte limit; left pending.')
     chunks.append(chunk);chunk=word
    else:chunk=candidate
   if chunk:chunks.append(chunk)
   result=' '.join(get(chunk,lang) for chunk in chunks)
   cache[key]=result;save(REPORT/'translation-cache.json',cache);return result
  calls+=1
  q=urllib.parse.urlencode({'q':text,'langpair':'en|'+('nb' if lang=='no' else lang)})
  req=urllib.request.Request('https://api.mymemory.translated.net/get?'+q,headers={'User-Agent':'LitbuySheetLab-local-translation/1.0'})
  with urllib.request.urlopen(req,timeout=25) as r:body=json.load(r)
  if body.get('quotaFinished') or str(body.get('responseStatus'))!='200':raise RuntimeError('MyMemory: '+str(body.get('responseDetails') or body))
  result=html.unescape(str(body.get('responseData',{}).get('translatedText',''))).strip()
  if not result or result.casefold()==text.strip().casefold() or '<html' in result.lower() or 'MYMEMORY WARNING' in result.upper():raise ValueError('Empty, unchanged or invalid service response; left pending.')
  # Do not accept translations that lose numbers or template placeholders.
  if re.findall(r'\{\w+\}',text)!=re.findall(r'\{\w+\}',result) or sorted(re.findall(r'\d+',text))!=sorted(re.findall(r'\d+',result)):raise ValueError('Numbers/placeholders changed; left pending for review.')
  cache[key]=result;save(REPORT/'translation-cache.json',cache);time.sleep(args.delay);return result
 try:
  for lang in (args.languages.split(',') if args.languages else LANGS):
   if lang not in LANGS:raise RuntimeError('Unknown target language: '+lang)
   path=DATA/f'titles/{lang}.json';titles=read(path)
   jobs=[]
   for p in ps:
    if not valid(titles.get(p['id'])):jobs.append((path,titles,p['id'],p['name'],'title'))
   for k,v in home['en'].items():
    if isinstance(v,str) and not valid(home.setdefault(lang,{}).get(k)):jobs.append((DATA/'home-ui.json',home[lang],k,v,'home'))
   for k,v in ui['en'].items():
    if not valid(ui.setdefault(lang,{}).get(k)):jobs.append((DATA/'ui.json',ui[lang],k,v,'ui'))
   for k,v in home['en'].get('categoryNames',{}).items():
    if not valid(home.setdefault(lang,{}).setdefault('categoryNames',{}).get(k)):jobs.append((DATA/'home-ui.json',home[lang]['categoryNames'],k,v,'category'))
   for text in source:
    if not valid(messages.setdefault(lang,{}).get(text)):jobs.append((DATA/'messages.json',messages[lang],text,text,'message'))
   if args.ui_first:jobs.sort(key=lambda j:j[4]=='title')
   index=0
   while index<len(jobs):
    batch=[];size=0
    while index<len(jobs) and len(batch)<8:
     job=jobs[index];length=len(job[3].encode('utf-8'))+1
     if batch and size+length>450:break
     batch.append(job);size+=length;index+=1
    results=None
    if len(batch)>1 and all('\n' not in j[3] for j in batch):
     try:
      combined=get('\n'.join(j[3] for j in batch),lang);lines=combined.splitlines()
      if len(lines)==len(batch):
       results=lines
       for job,value in zip(batch,lines):
        if not value.strip() or value.casefold()==job[3].casefold() or sorted(re.findall(r'\d+',job[3]))!=sorted(re.findall(r'\d+',value)) or re.findall(r'\{\w+\}',job[3])!=re.findall(r'\{\w+\}',value):results=None;break
     except ValueError:pass
    for offset,(target,table,key,text,kind) in enumerate(batch):
     try:value=results[offset].strip() if results else get(text,lang)
     except ValueError as e:
      log.append({'language':lang,'kind':kind,'key':key,'error':str(e)});save(REPORT/'translation-service-log.json',log);continue
     cache[lang+'|'+text]=value;save(REPORT/'translation-cache.json',cache)
     table[key]=value
     save(target,home if target.name=='home-ui.json' else ui if target.name=='ui.json' else messages if target.name=='messages.json' else titles)
     log.append({'language':lang,'kind':kind,'key':key,'service':'MyMemory','status':'saved'});save(REPORT/'translation-service-log.json',log)
     print(lang,kind,key,'saved',flush=True)
 except (RuntimeError,urllib.error.URLError,TimeoutError,OSError,KeyboardInterrupt) as e:
  stopped=True
  log.append({'status':'stopped','reason':str(e),'requests_this_run':calls});save(REPORT/'translation-service-log.json',log);print('STOP:',e,flush=True)
 finally:
  assert digest()==before,'Product data changed unexpectedly!'
  audit()
 return not stopped
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('action',choices=['audit','reuse','translate']);p.add_argument('--max-requests',type=int,default=100);p.add_argument('--languages');p.add_argument('--delay',type=float,default=1.0);p.add_argument('--ui-first',action='store_true');p.add_argument('--strict',action='store_true');a=p.parse_args();REPORT.mkdir(exist_ok=True)
 if a.action=='audit':
  report=audit()
  if a.strict and not report['complete']:raise SystemExit(2)
 elif a.action=='reuse':reuse();audit()
 else:raise SystemExit(0 if translate(a) else 2)
