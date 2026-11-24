import { getData, type Product } from './catalog';
const fields=[...document.querySelectorAll<HTMLInputElement>('input[name="q"]')];
if(fields.length){
 const list=document.createElement('datalist');list.id='product-search-suggestions';document.body.append(list);
 const common=['Running shoes','Hoodie','Jacket','T-shirt','Bag','Jersey','Pants','Accessories'];
 let products:Product[]=[];let pending:Promise<void>|undefined;
 function render(input:HTMLInputElement){const q=input.value.trim().toLowerCase();const values=q.length>1?products.filter(p=>p.name.toLowerCase().includes(q)||p.weidianId.includes(q)).slice(0,10).map(p=>/^\d+$/.test(q)?p.weidianId:p.name):common;list.replaceChildren(...values.map(value=>{const option=document.createElement('option');option.value=value;return option}));}
 function suggest(input:HTMLInputElement){render(input);pending??=getData<Product[]>('catalog.json').then(data=>{products=data;render(input)}).catch(()=>{});}
 for(const input of fields){input.setAttribute('list',list.id);input.setAttribute('autocomplete','off');input.addEventListener('focus',()=>suggest(input));input.addEventListener('input',()=>suggest(input));}
 suggest(fields[0]);
}
