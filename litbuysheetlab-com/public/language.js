(() => {
  const picker = document.querySelector('#language');
  if (!picker) return;
  const supported = new Set([...picker.options].map(o => o.value));
  const originals = new WeakMap(), attributes = new WeakMap();
  const titles = new Map(), requests = new Map();
  let active = 'en', ui = {}, home = {}, messages = {}, revision = 0;
  let dictionaries;
  const storage = {
    get() { try { return localStorage.getItem('litbuyLang'); } catch { return 'en'; } },
    set(value) { try { localStorage.setItem('litbuyLang', value); } catch {} }
  };
  async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw Error(`Translation data unavailable: ${response.status}`);
    return response.json();
  }
  function loadDictionaries() {
    if (!dictionaries) dictionaries = Promise.all([
      json('/data/ui.json'), json('/data/home-ui.json'), json('/data/messages.json')
    ]).then(([u,h,m]) => { ui=u; home=h; messages=m; }).catch(error => {
      dictionaries = undefined;
      throw error;
    });
    return dictionaries;
  }
  function translated(source) {
    if (active === 'en') return source;
    if (messages[active]?.[source]) return messages[active][source];
    const page = source.match(/^Page (\d+) \/ (\d+)$/);
    if (page) return (messages[active]?.['Page {page} / {pages}'] || 'Page {page} / {pages}').replace('{page}',page[1]).replace('{pages}',page[2]);
    for (const label of ['Show product image','Product gallery photo']) {
      const prefix = label + ' ';
      if (source.startsWith(prefix) && /^\d+$/.test(source.slice(prefix.length))) return (messages[active]?.[label+' {number}'] || label+' {number}').replace('{number}', source.slice(prefix.length));
    }
    return source;
  }
  window.litbuyText = (source, values = {}) => translated(source).replace(/\{(\w+)\}/g, (match,key) => values[key] ?? match);
  window.litbuyHomeText = (key, fallback) => active === 'en' ? fallback : home[active]?.[key] || translated(fallback);
  const collect = (root, selector) => [...(root.matches?.(selector) ? [root] : []), ...(root.querySelectorAll?.(selector) || [])];
  function text(element, value) { if (element.textContent !== value) element.textContent = value; }
  function apply(root = document.body) {
    if (!root || !document.body.contains(root) && root !== document.body) return;
    document.documentElement.lang = active;
    document.documentElement.dir = active === 'ar' ? 'rtl' : 'ltr';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,option,.money,[data-product-title],[data-home-i18n],[data-home-category]')) continue;
      let record = originals.get(node);
      if (!record || node.nodeValue !== record.rendered) record = { source:node.nodeValue, rendered:node.nodeValue };
      const source = record.source.trim();
      const result = source ? record.source.replace(source, translated(source)) : record.source;
      if (node.nodeValue !== result) node.nodeValue = result;
      record.rendered = result; originals.set(node, record);
    }
    for (const element of collect(root, '[data-product-title]')) {
      element.dataset.originalTitle ||= element.textContent;
      text(element, active === 'en' ? element.dataset.originalTitle : titles.get(active)?.[element.dataset.productTitle] || element.dataset.originalTitle);
    }
    for (const element of collect(root, '[data-home-i18n],[data-home-category]')) {
      if (!element.hasAttribute('data-home-original')) element.dataset.homeOriginal = element.textContent;
      const source = element.dataset.homeOriginal;
      const value = element.hasAttribute('data-home-category') ? home[active]?.categoryNames?.[element.dataset.homeCategory] : home[active]?.[element.dataset.homeI18n];
      text(element, active === 'en' ? source : value || translated(source));
    }
    for (const element of collect(root, '[placeholder],[aria-label],[title],[alt],[data-home-aria]')) {
      let records = attributes.get(element);
      if (!records) { records = {}; attributes.set(element, records); }
      for (const name of ['placeholder','aria-label','title','alt']) {
        if (!element.hasAttribute(name)) continue;
        const current = element.getAttribute(name);
        let record = records[name];
        if (!record || current !== record.rendered) record = { source:current, rendered:current };
        const special = (name === 'aria-label' || name === 'title') && element.dataset.homeAria;
        const value = active !== 'en' && name === 'placeholder' && element.name === 'q' ? home[active]?.search_placeholder || ui[active]?.search_placeholder || translated(record.source) : active !== 'en' && special ? home[active]?.[special] || translated(record.source) : translated(record.source);
        if (current !== value) element.setAttribute(name, value);
        record.rendered = value; records[name] = record;
      }
    }
  }
  async function setLanguage(value) {
    const selected = supported.has(value) ? value : 'en';
    const version = ++revision;
    active = selected; picker.value = selected; storage.set(selected);
    apply();
    try {
      await loadDictionaries();
      if (selected !== 'en' && !titles.has(selected)) {
        if (!requests.has(selected)) requests.set(selected, json('/data/titles/' + encodeURIComponent(selected) + '.json').then(rows => titles.set(selected, rows)).finally(() => requests.delete(selected)));
        await requests.get(selected);
      }
    } catch (error) { console.warn('Some translations could not be loaded; showing available text.', error); }
    if (version !== revision) return;
    apply();
    window.dispatchEvent(new CustomEvent('litbuy:languagechange', {detail:selected}));
  }
  picker.addEventListener('change', () => setLanguage(picker.value));
  const pending = new Set(); let scheduled = false;
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') pending.add(record.target.parentElement);
      for (const node of record.addedNodes || []) pending.add(node.nodeType === 1 ? node : node.parentElement);
    }
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => { scheduled = false; const roots = [...pending]; pending.clear(); roots.forEach(apply); });
    }
  }).observe(document.body, {childList:true, subtree:true, characterData:true});
  setLanguage(storage.get() || 'en');
})();
