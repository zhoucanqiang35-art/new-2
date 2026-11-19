import { catalogAgents, defaultCatalogAgent } from './agents';
import rates from '../../public/data/rates.json';
import type { Product } from './catalog';
if (!document.body.classList.contains('browse-catalog')) {
 const menu=document.querySelector<HTMLDetailsElement>('#market-options');
 const saved=document.querySelector<HTMLButtonElement>('#saved-only');if(saved){saved.hidden=false;saved.addEventListener('click',()=>{location.href='/browse/?saved=1'});}
 if(menu){
 const read=(key:string,fallback:string)=>{try{return localStorage.getItem('sugargoo-browse-'+key)||fallback}catch{return fallback}};
 const save=(key:string,value:string)=>{try{localStorage.setItem('sugargoo-browse-'+key,value)}catch{}};
 function update(){
 const agent=catalogAgents.find(a=>a.label===read('agent','Sugargoo'))||defaultCatalogAgent;
 const selected=read('currency','USD'); const currency=Object.hasOwn(rates.rates,selected)?selected:'USD';
 menu!.querySelector('#market-agent')!.textContent=agent.label;
 menu!.querySelector('#market-currency')!.textContent=currency;
 const logo=menu!.querySelector<HTMLImageElement>('#market-logo')!;logo.hidden=!agent.logo;if(agent.logo)logo.src=agent.logo;
 for(const b of menu!.querySelectorAll<HTMLElement>('[data-agent]'))b.setAttribute('aria-pressed',String(b.dataset.agent===agent.label));
 for(const b of menu!.querySelectorAll<HTMLElement>('[data-currency]'))b.setAttribute('aria-pressed',String(b.dataset.currency===currency));
 for(const link of document.querySelectorAll<HTMLAnchorElement>('[data-agent-purchase-id]')){link.href=agent.url({weidianId:link.dataset.agentPurchaseId!,sourcePath:link.dataset.sourceUrl!} as Product);link.textContent='Buy on '+agent.label;}
 }
 for(const b of menu.querySelectorAll<HTMLElement>('[data-agent]'))b.addEventListener('click',()=>{save('agent',b.dataset.agent!);document.dispatchEvent(new Event('catalog-agent-changed'));});
 for(const b of menu.querySelectorAll<HTMLElement>('[data-currency]'))b.addEventListener('click',()=>{save('currency',b.dataset.currency!);update();document.dispatchEvent(new Event('catalog-currency-changed'));});
 document.addEventListener('catalog-agent-changed',update);
 window.addEventListener('storage',e=>{if(e.key?.startsWith('sugargoo-browse-'))update()});
 document.addEventListener('click',e=>{if(e.target instanceof Node&&!menu.contains(e.target))menu.open=false;});
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary')?.focus();}});
 update();
 }
}
