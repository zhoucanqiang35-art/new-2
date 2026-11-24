(() => {
  const picker = document.getElementById('currency-picker');
  if (!picker) return;
  const languageCurrency = {en:'USD','zh-CN':'CNY',es:'EUR',fr:'EUR',de:'EUR',it:'EUR',pt:'EUR',nl:'EUR',pl:'PLN',ru:'RUB',uk:'UAH',tr:'TRY',ar:'SAR',he:'ILS',ja:'JPY',ko:'KRW',vi:'VND',th:'THB',id:'IDR',ms:'MYR',hi:'INR',sv:'SEK',ro:'RON'};
  const codes = [...new Set(['USD','CNY','GBP','CAD','AUD',...Object.values(languageCurrency)])];
  const panel = document.getElementById('currency-options');
  let data, selected = 'USD', timer, initialized = false, remembered = false;
  try { const saved = localStorage.getItem('usfans-currency'); remembered = !!saved; selected = saved || languageCurrency[document.documentElement.lang] || 'USD'; } catch {}
  if (!codes.includes(selected)) selected = 'USD';
  for (const code of codes) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = code; button.dataset.currency = code;
    button.addEventListener('click', () => setCurrency(code));
    panel.append(button);
  }
  function render() {
    const rate = data?.rates?.[selected];
    document.getElementById('current-currency').textContent = selected;
    panel.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.currency === selected)));
    if (!(rate > 0)) return;
    const locale = document.documentElement.lang || 'en';
    const formatter = new Intl.NumberFormat(locale, {style:'currency',currency:selected,currencyDisplay:'narrowSymbol',maximumFractionDigits:['JPY','KRW','VND','IDR'].includes(selected)?0:2});
    for (const el of document.querySelectorAll('[data-price-usd]')) {
      const usd = Number(el.dataset.priceUsd);
      if (!(usd > 0)) continue;
      const from = el.dataset.priceFrom === 'true' ? (window.siteI18n?.translate('From') || 'From') + ' ' : '';
      const label = from + (selected === 'USD' ? '' : '≈ ') + formatter.format(usd * rate) + ' ' + selected;
      if (el.textContent !== label) el.textContent = label;
      el.title = data.status === 'saved' ? 'Estimated conversion using saved exchange rates' : 'Estimated conversion. Final price is confirmed on the purchase platform.';
    }
  }
  function setCurrency(code) {
    if (!codes.includes(code)) return;
    selected = code;
    try { localStorage.setItem('usfans-currency', code); } catch {}
    render(); picker.open = false;
  }
  document.addEventListener('site-language-changed', event => {
    const code = !initialized && remembered ? selected : languageCurrency[event.detail.language] || 'USD';
    initialized = true; setCurrency(code);
  });
  document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') picker.open = false; });
  const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(render, 40); });
  observer.observe(document.body, {childList:true,subtree:true});
  fetch('/api/exchange-rates').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(value => { data = value; render(); }).catch(() => { selected = 'USD'; data = {rates:{USD:1},status:'unavailable'}; render(); });
  render();
})();
