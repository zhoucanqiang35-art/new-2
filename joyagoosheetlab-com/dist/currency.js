(()=>{
'use strict';
const byLanguage = {
  en:'USD', de:'EUR', fr:'EUR', es:'EUR', it:'EUR', pt:'EUR', nl:'EUR', pl:'PLN',
  sv:'SEK', zh:'CNY', fi:'EUR', da:'DKK', nb:'NOK', cs:'CZK', hu:'HUF', ro:'RON',
  el:'EUR', tr:'TRY', uk:'UAH', ar:'AED', ja:'JPY', ko:'KRW', ru:'RUB', id:'IDR'
};
const codes = [...new Set([...Object.values(byLanguage), 'GBP', 'CAD', 'AUD', 'CHF'])];
const names={en:'Currency',de:'Währung',fr:'Devise',es:'Moneda',it:'Valuta',pt:'Moeda',nl:'Valuta',pl:'Waluta',sv:'Valuta',zh:'货币'};
const notes={en:'Estimated prices; exchange rates updated',de:'Geschätzte Preise; Wechselkurse aktualisiert',fr:'Prix estimés ; taux de change mis à jour',es:'Precios estimados; tipos de cambio actualizados',it:'Prezzi stimati; tassi di cambio aggiornati',pt:'Preços estimados; câmbio atualizado',nl:'Geschatte prijzen; wisselkoersen bijgewerkt',pl:'Ceny szacunkowe; kursy zaktualizowane',sv:'Uppskattade priser; valutakurser uppdaterade',zh:'价格仅供参考；汇率更新日期'};
const fallback={en:'Exchange rates unavailable; showing USD estimates.',de:'Wechselkurse nicht verfügbar; USD-Schätzungen werden angezeigt.',fr:'Taux indisponibles ; estimations en USD affichées.',es:'Tipos no disponibles; se muestran estimaciones en USD.',it:'Tassi non disponibili; stime in USD.',pt:'Câmbio indisponível; estimativas em USD.',nl:'Wisselkoersen niet beschikbaar; USD-schattingen.',pl:'Kursy niedostępne; ceny szacunkowe w USD.',sv:'Valutakurser saknas; uppskattade USD-priser visas.',zh:'汇率暂不可用，显示美元估价。'};
const extraCurrencyTexts={"fi":["Valuutta","Arvioidut hinnat; valuuttakurssien päivämäärä","Valuuttakursseja ei ole saatavilla; näytetään USD-arviot."],"da":["Valuta","Anslåede priser; valutakurser opdateret","Valutakurser er utilgængelige; USD-estimater vises."],"nb":["Valuta","Anslåtte priser; valutakurser oppdatert","Valutakurser er utilgjengelige; USD-estimater vises."],"cs":["Měna","Odhadované ceny; kurz aktualizován","Kurzy nejsou dostupné; zobrazují se odhady v USD."],"sk":["Mena","Odhadované ceny; kurz aktualizovaný","Kurzy nie sú dostupné; zobrazujú sa odhady v USD."],"hu":["Pénznem","Becsült árak; árfolyamok frissítve","Az árfolyamok nem érhetők el; becsült USD-árak láthatók."],"ro":["Monedă","Prețuri estimate; cursuri actualizate","Cursurile nu sunt disponibile; se afișează estimări în USD."],"el":["Νόμισμα","Εκτιμώμενες τιμές· ενημέρωση ισοτιμιών","Οι ισοτιμίες δεν είναι διαθέσιμες· εμφανίζονται εκτιμήσεις σε USD."],"tr":["Para birimi","Tahmini fiyatlar; döviz kurları güncellendi","Kurlar kullanılamıyor; tahmini USD fiyatları gösteriliyor."],"uk":["Валюта","Орієнтовні ціни; курси оновлено","Курси недоступні; показано орієнтовні ціни в USD."],"ar":["العملة","أسعار تقديرية؛ تاريخ تحديث أسعار الصرف","أسعار الصرف غير متاحة؛ تُعرض تقديرات بالدولار الأمريكي."],"ja":["通貨","参考価格・為替レート更新日","為替レートを取得できないため、米ドルの参考価格を表示しています。"],"ko":["통화","예상 가격; 환율 업데이트 날짜","환율을 사용할 수 없어 미국 달러 예상 가격을 표시합니다."],"vi":["Tiền tệ","Giá ước tính; tỷ giá được cập nhật","Không có tỷ giá; đang hiển thị giá ước tính bằng USD."]};
Object.assign(extraCurrencyTexts, {
 ru:['Валюта', 'Ориентировочные цены · Дата курса', 'Курсы недоступны. Цены отображаются в долларах США.'],
 id:['Mata uang', 'Estimasi harga · Tanggal kurs', 'Kurs tidak tersedia. Harga ditampilkan dalam USD.']
});
for(const [code,text] of Object.entries(extraCurrencyTexts)){names[code]=text[0];notes[code]=text[1];fallback[code]=text[2]}
const language = document.querySelector('select.language');
if (!language) return;

const lang = () => language.value || 'en';
const currency = document.createElement('select');
currency.className = 'currency';
currency.setAttribute('aria-label', names[lang()] || names.en);
for (const code of codes) currency.add(new Option(code, code));
language.after(currency);

function createPicker(select, label) {
  select.hidden = true;
  const picker = document.createElement('details');
  picker.className = 'preference-picker notranslate';
  picker.translate = false;
  const toggle = document.createElement('summary');
  const panel = document.createElement('div');
  panel.className = 'preference-panel';
  const grid = document.createElement('div');
  grid.className = 'preference-grid';
  panel.append(grid);
  const tiles = Array.from(select.options, option => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.textContent = option.textContent.replace(' · partial', '');
    if (tile.textContent !== option.textContent) tile.setAttribute('aria-label', option.textContent);
    tile.dir = 'auto';
    tile.addEventListener('click', () => {
      select.value = option.value;
      select.dispatchEvent(new Event('change'));
      picker.open = false;
      toggle.focus();
    });
    grid.append(tile);
    return [option, tile];
  });
  picker.append(toggle, panel);
  select.after(picker);
  picker.addEventListener('toggle', () => {
    if (picker.open) panel.querySelector('[aria-pressed="true"]')?.scrollIntoView({block:'nearest'});
  });
  document.addEventListener('click', event => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  picker.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !picker.open) return;
    event.preventDefault();
    picker.open = false;
    toggle.focus();
  });
  return () => {
    const chosen = select.selectedOptions[0]?.textContent || '';
    const title = chosen.replace(' · partial', '');
    if (toggle.textContent !== title) toggle.textContent = title;
    toggle.setAttribute('aria-label', `${label()}: ${chosen}`);
    for (const [option, tile] of tiles) {
      tile.disabled = option.disabled;
      tile.setAttribute('aria-pressed', String(option.selected));
    }
  };
}

const languageLabel = {en:'Language', de:'Sprache', fr:'Langue', es:'Idioma', it:'Lingua',
  pt:'Idioma', nl:'Taal', pl:'Język', sv:'Språk', zh:'语言', fi:'Kieli', da:'Sprog',
  nb:'Språk', cs:'Jazyk', hu:'Nyelv', ro:'Limbă', el:'Γλώσσα', tr:'Dil',
  uk:'Мова', ar:'اللغة', ja:'言語', ko:'언어', ru:'Язык', id:'Bahasa'};
const updateLanguage = createPicker(language, () => languageLabel[lang()] || languageLabel.en);
const updateCurrency = createPicker(currency, () => names[lang()] || names.en);
const status = document.createElement('p');
status.className = 'currency-status notranslate';
status.translate = false;
status.setAttribute('role', 'status');
currency.nextElementSibling.querySelector('.preference-panel').append(status);

// Frankfurter CNY reference rates captured on 2026-11-25 for offline conversion.
let rates = {"CNY":1, "AED":0.55113, "AUD":0.22625, "CAD":0.21499, "CHF":0.12595, "CZK":3.3479, "DKK":1.0242, "EUR":0.13705, "GBP":0.11465, "HUF":50.793, "IDR":2736.89, "JPY":23.901, "KRW":201.71, "NOK":1.4707, "PLN":0.61097, "RON":0.73226, "RUB":12.3074, "SEK":1.5378, "TRY":7.5961, "UAH":6.784, "USD":0.15007};
let date = '2026-11-25';
let selected = byLanguage[lang()] || 'USD';
try {
  const cache = JSON.parse(localStorage.getItem('joyagoo-fx-v2') || 'null');
  if (cache?.rates && cache.date >= date && Date.now() - cache.saved < 7 * 864e5) {
    rates = cache.rates;
    date = cache.date;
  }
  const saved = localStorage.getItem('joyagoo-currency');
  if (codes.includes(saved)) selected = saved;
} catch {}

function format(value) {
  if (value == null || String(value).trim() === '' || !Number.isFinite(Number(value))) return 'Price unavailable';
  const code = rates[selected] ? selected : 'USD';
  const currencyLocale = lang() === 'zh' ? 'zh-CN' : lang();
  const amount = new Intl.NumberFormat(currencyLocale, {
    style:'currency', currency:code, currencyDisplay:'code'
  }).format(Number(value) * rates[code]);
  return amount;
}

function sync() {
  currency.value = selected;
  for (const option of currency.options) option.disabled = !rates[option.value];
  updateLanguage();
  updateCurrency();
  const note = date && rates[selected]
    ? `${notes[lang()] || notes.en}: ${date}`
    : rates[selected] && selected === 'CNY' ? '' : fallback[lang()] || fallback.en;
  if (status.textContent !== note) status.textContent = note;
  status.hidden = !note;
  document.querySelectorAll('[data-cny-price]').forEach(element => {
    const next = format(element.dataset.cnyPrice);
    if (element.textContent !== next) element.textContent = next;
  });
}

function selectCurrency(code) {
  selected = code;
  try { localStorage.setItem('joyagoo-currency', selected); } catch {}
  sync();
}

window.joyCurrency = {format, update:sync};
currency.addEventListener('change', () => selectCurrency(currency.value));
language.addEventListener('change', () => selectCurrency(byLanguage[lang()] || 'USD'));
new MutationObserver(records => {
  const hasNewPrices = records.some(record => [...record.addedNodes].some(node =>
    node.nodeType === 1 && (node.matches('[data-cny-price]') || node.querySelector('[data-cny-price]'))
  ));
  if (hasNewPrices) sync();
}).observe(document.body, {childList:true, subtree:true});
sync();

const query = new URLSearchParams({base:'CNY', quotes:codes.filter(code => code !== 'CNY').join(',')});
fetch('https://api.frankfurter.dev/v2/rates?' + query, {
  credentials:'omit',
  signal:AbortSignal.timeout(8000)
}).then(response => {
  if (!response.ok) throw Error('Exchange rates unavailable');
  return response.json();
}).then(quotes => {
  const next = {CNY:1};
  for (const item of quotes) {
    if (item.base === 'CNY' && codes.includes(item.quote) && Number.isFinite(item.rate) && item.rate > 0) {
      next[item.quote] = item.rate;
    }
  }
  if (!next.USD) return;
  const oldest = quotes.map(item => item.date).filter(Boolean).sort()[0];
  if (!oldest || oldest < date) return;
  rates = next;
  date = oldest;
  try { localStorage.setItem('joyagoo-fx-v2', JSON.stringify({rates,date,saved:Date.now()})); } catch {}
  sync();
}).catch(() => {});
})();
