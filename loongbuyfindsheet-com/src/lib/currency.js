import currency from '../../public/currency.json';
export const usd=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)/currency.cnyPerUsd);
