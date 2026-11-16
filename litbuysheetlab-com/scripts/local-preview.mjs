import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try {
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=resolve(root,'.'+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden');}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
const check=process.argv.includes('--check');
server.listen(check?0:Number(process.env.PORT||4321),'0.0.0.0',async()=>{
 const url='http://127.0.0.1:'+server.address().port;
 console.log('Local preview: '+url);
 if(check){
  try {
   for(const path of ['/','/categories/','/faq/','/guide/','/products/','/product/?id=9018','/image-search/','/seo/','/language.js','/app.js','/data/products.json','/data/home-ui.json','/data/ui.json','/data/messages.json']){
    const response=await fetch(url+path);if(response.status!==200)throw Error(path+': '+response.status);await response.arrayBuffer();
   }
   console.log('PASS: 8 pages and 6 assets return HTTP 200.');
  }catch(error){console.error(error);process.exitCode=1;}finally{server.close();}
 }
});
