import { getData, type Product } from './catalog';
import {searchTerms,searchText,itemFromInput} from './search-query.mjs';
import {productName} from './product-names';
const fields=[...document.querySelectorAll<HTMLInputElement>('input[name="q"]')];
if(fields.length){
 const list=document.createElement('datalist');list.id='product-search-suggestions';document.body.append(list);
 const common=['Running shoes','Hoodie','Jacket','T-shirt','Bag','Jersey','Pants','Accessories'];
 let products:Product[]=[];let pending:Promise<void>|undefined;
 function render(input:HTMLInputElement){
  const q=input.value.trim(),terms=searchTerms(q),id=itemFromInput(q);
  const matches=products.filter(p=>terms.every((t:string)=>searchText(p.name+' '+productName(p.weidianId,p.name)+' '+p.weidianId).includes(t)));
  const values=q.length>1?matches.map(p=>id||/^\d+$/.test(q)?p.weidianId:productName(p.weidianId,p.name)):common;
  list.replaceChildren(...[...new Set(values)].slice(0,10).map(value=>{const option=document.createElement('option');option.value=value;return option}));
 }
 function suggest(input:HTMLInputElement){render(input);pending??=getData<Product[]>('catalog.json').then(data=>{products=data;render(input)}).catch(()=>{});}
 for(const input of fields){input.setAttribute('list',list.id);input.setAttribute('autocomplete','off');input.addEventListener('focus',()=>suggest(input));input.addEventListener('input',()=>suggest(input));}
 suggest(fields[0]);
}
