import fs from 'node:fs';import assert from 'node:assert/strict';
import {normalizeExchangeRates} from '../server/exchange-rates.mjs';
import {convertedAmount,moneyLabel,currencyCodes} from '../public/currency-core.js';
const snapshot=JSON.parse(fs.readFileSync('data/exchange-rates.json'));
assert.equal(snapshot.rates.USD,1);assert.equal(currencyCodes.length,8);
const rows=currencyCodes.map(currencyCode=>({currencyCode,exchangeRate:currencyCode==='USD'?.2:currencyCode==='CNY'?1:currencyCode==='EUR'?.18:.3,updateTime:'2026-11-16 00:00:00'}));
const data=normalizeExchangeRates(rows,'2026-11-16T00:00:00Z');
assert.ok(Math.abs(data.rates.EUR-.9)<1e-10);assert.equal(data.rates.CNY,5);
assert.ok(Math.abs(convertedAmount(10,null,'EUR',data)-9)<1e-10);
assert.equal(convertedAmount(10,null,'CNY',data),50);
assert.equal(convertedAmount(3.342,20,'CNY',data),20); // retained CNY source amount, no stale USD conversion.
assert.ok(Math.abs(convertedAmount(3.342,20,'EUR',data)-3.6)<1e-10);
assert.equal(convertedAmount(10,null,'USD',data),10); // switching back uses original value, never a converted amount.
assert.equal(convertedAmount(10,null,'JPY',data),null);
assert.throws(()=>normalizeExchangeRates(rows.filter(r=>r.currencyCode!=='USD')));
for(const currency of currencyCodes){const amount=convertedAmount(10,null,currency,snapshot);assert.ok(amount>0);assert.ok(moneyLabel(amount,currency,'zh-CN').includes(currency));}
console.log('PASS: 8 currency rates, USD normalization, official USD basis, current CNY source basis, round trips, missing-rate rejection.');
