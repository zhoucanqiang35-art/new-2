const hosts=new Set(['si.geilicdn.com','img.geilicdn.com','findspreadsheet.com']);
export function safeImage(value){try{const u=new URL(value,'https://weidian.com');return u.protocol==='https:'&&hosts.has(u.hostname)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function normalizeOptions(data,id){
 if(String(data?.weidian_id)!==String(id)||!Array.isArray(data.specifications?.attrs))throw Error('Item specifications do not match');
 const groups=data.specifications.attrs.flatMap(g=>{const name=String(g.attr_title||'').trim().slice(0,100);const options=(g.attr_values||[]).flatMap(o=>{const label=String(o.attr_value||'').trim().slice(0,180);return label?[{id:String(o.attr_id),label,image:safeImage(o.img)}]:[];});return name&&options.length?[{name,options}]:[];});
 const skus=Object.values(data.specifications.skus||{}).map(s=>({ids:String(s.attr_ids||'').split('-'),price:Number(s.price),stock:Number(s.stock),image:safeImage(s.img)})).filter(s=>s.ids.length===groups.length&&Number.isFinite(s.price));
 return {item:String(id),groups,skus,images:[...new Set((data.images||[]).map(safeImage).filter(Boolean))],retrievedAt:new Date().toISOString()};
}
