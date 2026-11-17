import json,subprocess,concurrent.futures,re,html,datetime
p='data/catalog-snapshot.json';d=json.load(open(p));cats=json.load(open('src/all-categories.json'));tasks=[(c,n) for c in cats for n in range(1,(c['count']+59)//60+1) if c['slug']+':'+str(n) not in d['pages']]
def run(t):
 c,n=t;path='/'+c['slug']+'/' if n==1 else '/'+c['slug']+'/list_'+str(c['id'])+'_'+str(n)+'/'
 s=subprocess.run(['curl','-fsSL','--max-time','25','--retry','1','https://findspreadsheet.com'+path],capture_output=True).stdout.decode(errors='replace')
 products=[]
 for m in re.findall(r'<button\b[^>]*data-cart-add[^>]*>',s):
  a={k:html.unescape(v) for k,v in re.findall(r'([\w-]+)="([^"]*)"',m)}
  if 'data-cart-id' in a:products.append(dict(id=a['data-cart-id'],title=a['data-cart-title'],image=a['data-cart-image'],source=a['data-cart-url']))
 pg=re.search(r'<div class="pagination">([\s\S]*?)</div>',s);pages=[dict(href=a,label=b) for a,b in re.findall(r'href="([^"]+)"[^>]*>([^<]+)<',pg[1] if pg else '')]
 return c['slug']+':'+str(n),dict(products=products,pages=pages)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,(k,v) in enumerate(pool.map(run,tasks)):
  if v['products']:d['pages'][k]=v
  else:print('FAILED',k,flush=True)
  if i%10==0:print(i,'of',len(tasks),flush=True)
json.dump(d,open(p,'w'));print('Total',len(d['pages']),'pages',sum(len(v['products']) for v in d['pages'].values()),'products')
