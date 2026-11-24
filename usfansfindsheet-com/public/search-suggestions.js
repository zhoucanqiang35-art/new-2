(() => {
  const input = document.getElementById('global-search');
  const list = document.getElementById('search-suggestions');
  if (!input || !list) return;
  let timer, controller, requestId = 0;
  const suggestions = ['Sneakers','Hoodies','T-shirts','Jackets','Bags','Jerseys'];
  function close() { list.hidden = true; input.setAttribute('aria-expanded','false'); }
  function show(rows) {
    list.replaceChildren();
    for (const row of rows) {
      const link = document.createElement('a');
      const url = new URL('/search/',location.origin);
      url.searchParams.set('q',row.title);
      if (document.documentElement.lang !== 'en') url.searchParams.set('lang',document.documentElement.lang);
      link.href = url.pathname + url.search;
      if (row.image) { const image = document.createElement('img'); image.src = row.image; image.alt = ''; link.append(image); }
      const label = document.createElement('span'); label.textContent = row.title; link.append(label);
      if (row.total) { const note = document.createElement('small'); note.textContent = row.total; link.append(note); }
      list.append(link);
    }
    list.hidden = !rows.length;
    input.setAttribute('aria-expanded',String(rows.length > 0));
  }
  async function update() {
    const id = ++requestId;
    const query = input.value.trim();
    controller?.abort();
    if (!query) { show(suggestions.map(title => ({title}))); return; }
    controller = new AbortController();
    try {
      const r = await fetch('/api/search?q=' + encodeURIComponent(query), {signal:controller.signal});
      if (!r.ok) throw Error();
      const data = await r.json();
      if (id !== requestId) return;
      const titles = [...new Map(data.products.map(p => [p.title,p])).values()].slice(0,6);
      show(titles.length ? [{title:query},...titles] : [{title:query}]);
    } catch (error) { if (error.name !== 'AbortError' && id === requestId) show([{title:query}]); }
  }
  input.addEventListener('focus',update);
  input.addEventListener('input',() => { clearTimeout(timer); timer = setTimeout(update,180); });
  input.addEventListener('keydown',event => {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowDown') { event.preventDefault(); list.querySelector('a')?.focus(); }
  });
  list.addEventListener('keydown',event => {
    const links = [...list.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); links[(index + 1) % links.length]?.focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); if (index <= 0) input.focus(); else links[index - 1].focus(); }
    if (event.key === 'Escape') { close(); input.focus(); }
  });
  document.addEventListener('click',event => { if (!input.form.contains(event.target)) close(); });
})();
