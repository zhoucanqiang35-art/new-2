"""Build static language dictionaries from public English site copy.
Model weights are build-only and are never included in the website bundle.
"""
from pathlib import Path
import os,json,re,time,concurrent.futures,threading
import ctranslate2,sentencepiece as spm
ROOT=Path(__file__).resolve().parents[1]
MODEL=os.environ['LOONGBUY_TRANSLATION_MODEL']
sp=spm.SentencePieceProcessor(model_file=str(Path(MODEL)/'sentencepiece.bpe.model'))
translator=ctranslate2.Translator(MODEL,device='cpu',compute_type='int8',inter_threads=2,intra_threads=4)
keys=json.loads((ROOT/'data/i18n/source.json').read_text());languages=json.loads((ROOT/'src/languages.json').read_text())
parts={};unique=set()
for key in keys:
 # Short sentence batches prevent sentence loss on long documentation paragraphs.
 chunks=re.split(r'(?<=[.!?])\s+(?=[A-Z“"\d])',key)
 parts[key]=chunks
 unique.update(chunks)
# Translate only unknown strings; keep the project's reviewed shared UI terminology.
lang_codes={'zh-CN':'zh'}
report={};lock=threading.Lock()
def model_input(text):
 text=re.sub('LoongBuy','Microsoft',text,flags=re.I);text=text.replace('FindSpreadsheet','Facebook')
 text=text.replace('CNY','RMB').replace('catalog export','catalog snapshot').replace('catalog Export','catalog snapshot')
 return ['__en__']+sp.encode(text,out_type=str)+['</s>']
def cleanup(s):
 s=s.replace('__en__','').strip();s=re.sub(r'Loong\s?buy|Loong\s+Buy','LoongBuy',s,flags=re.I)
 s=re.sub(r'Microsoft|微软|微軟|Майкрософт|Микрософт|مايكروسوفت|ميكروسوفت|מיקרוסופט|マイクロソフト|마이크로소프트|ไมโครซอฟท์|ไมโครซอฟต์|माइक्रोसॉफ्ट|माइक्रोसॉफ़्ट','LoongBuy',s,flags=re.I)
 s=re.sub(r'Facebook|脸书|臉書|脸谱网|فيسبوك|فيس بوك|פייסבוק|フェイスブック|페이스북|เฟซบุ๊ก|เฟสบุ๊ค|เฟซบุ๊ค|फेसबुक|Фейсбук','FindSpreadsheet',s,flags=re.I)
 s=s.replace('Find Spreadsheet','FindSpreadsheet')
 return s

def run(lang):
 code=lang['code'];path=ROOT/'public/i18n'/(code+'.json');d=json.loads(path.read_text())
 if code=='en':return code,len(d)
 for k in list(d):
  if ('LoongBuy' in k and 'LoongBuy' not in d[k]) or ('FindSpreadsheet' in k and 'FindSpreadsheet' not in d[k]):del d[k]
 missing=[k for k in keys if k not in d];segments=sorted({s for k in missing for s in parts[k]})
 # Proper names and all-numeric fragments do not need translation.
 need=sorted([s for s in segments if re.search('[A-Za-z]{2}',s)],key=lambda s:len(model_input(s)));translations={}
 start=time.time();target='__'+lang_codes.get(code,code)+'__'
 for offset in range(0,len(need),64):
  batch=need[offset:offset+64]
  output=translator.translate_batch([model_input(s) for s in batch],target_prefix=[[target] for _ in batch],beam_size=1,max_batch_size=64,max_decoding_length=192,no_repeat_ngram_size=4,repetition_penalty=1.02)
  for source,result in zip(batch,output):
   tokens=result.hypotheses[0];tokens=tokens[1:] if tokens and tokens[0].startswith('__') else tokens
   text=cleanup(sp.decode(tokens));translations[source]=text or source
  # Keep a reproducible checkpoint for long runs without exposing any credentials.
  if offset%128==0:
   with lock:print(code,offset,'/',len(need),'segments',round(time.time()-start,1),'s',flush=True)
 for key in missing:d[key]=' '.join(translations.get(s,s) for s in parts[key])
 path.write_text(json.dumps(d,ensure_ascii=False,indent=2))
 stat={'keys':len(d),'generated':len(missing),'seconds':round(time.time()-start,2),'unchanged':[k for k in missing if d[k]==k]}
 with lock:
  report[code]=stat
  (ROOT/'data/i18n/build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
  print('DONE',code,stat['keys'],'keys',stat['seconds'],'seconds',flush=True)
 return code,len(d)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(run,languages))
print('All 23 language packs built.',flush=True)
