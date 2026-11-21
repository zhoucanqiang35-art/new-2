const picker = document.querySelector('[data-language-picker]');
if (picker) {
  const toggle = picker.querySelector('summary');
  const languageLinks = picker.querySelectorAll('[data-language-link]');
  function preservePageState(link) {
    const destination = new URL(link.href);
    destination.search = window.location.search;
    destination.hash = window.location.hash;
    link.href = destination.href;
  }
  picker.addEventListener('toggle', () => {
    if (picker.open) languageLinks.forEach(preservePageState);
  });
  picker.addEventListener('click', (event) => {
    const link = event.target.closest('[data-language-link]');
    if (link) preservePageState(link);
  });
  picker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && picker.open) {
      picker.open = false;
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (picker.open && !picker.contains(event.target)) picker.open = false;
  });
}

const menu = document.querySelector('[data-local-menu]');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  document.querySelector('#site-navigation')?.toggleAttribute('data-open', !expanded);
});

const track = (name, data) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, { page_language: document.documentElement.lang, ...data });
  }
};

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.elements?.q?.value.trim()) track('search_submit', { search_destination: form.action });
});

document.addEventListener('click', (event) => {
  const anchor = event.target.closest?.('a[href]');
  if (!anchor) return;
  const url = new URL(anchor.href);
  const data = { link_url: url.href, link_text: anchor.textContent.trim().slice(0, 120) };
  if (url.hostname === 'findspreadsheet.com') {
    track('main_site_click', data);
  } else if (url.hostname === 'www.pikobuy.com' && url.pathname === '/product/detail') {
    track('product_card_click', data);
  } else if (url.origin === window.location.origin && /\/(guides|articles)\/[^/]/.test(url.pathname)) {
    track('article_open', data);
  }
});

const openOriginalGuide = () => {
  if (window.location.hash && window.location.hash !== '#main') {
    const original = document.querySelector('[data-original-guide]');
    if (original) original.open = true;
  }
};
openOriginalGuide();
window.addEventListener('hashchange', openOriginalGuide);
