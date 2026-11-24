import { copy } from './messages.mjs';
import { agents, currencies, currentShopping, changeShopping, agentUrl, formatPrice, savedIds, toggleSaved } from './shopping-data.mjs';

const menu = document.getElementById('shopping-menu');
const menus = [...document.querySelectorAll('[data-shopping-menu]')];
const savedCount = document.getElementById('saved-count');
const tracked = '[data-price-amount],[data-agent-item],[data-favorite]';

function updateNode(node) {
  const {agent, currency} = currentShopping();
  if (node.hasAttribute('data-price-amount')) {
    const text = formatPrice(node.dataset.priceAmount, currency, document.documentElement.lang);
    if (node.textContent !== text) node.textContent = text;
  }
  if (node.hasAttribute('data-agent-item')) {
    const href = agentUrl(agent, node.dataset.agentItem, node.dataset.sourcePath);
    if (node.href !== href) node.href = href;
    const text = node.querySelector('span[data-i18n]');
    const key = agent.id === 'hipobuy' ? 'buy' : 'viewOn';
    const args = key === 'viewOn' ? JSON.stringify([agent.name]) : '[]';
    if (text.dataset.i18n !== key || text.dataset.i18nArgs !== args) {
      text.dataset.i18n = key;
      text.dataset.i18nArgs = args;
      text.textContent = copy(key, ...(key === 'viewOn' ? [agent.name] : []));
      text.dispatchEvent(new CustomEvent('hipobuy:translate', {bubbles: true}));
    }
  }
  if (node.hasAttribute('data-favorite')) {
    const pressed = savedIds().has(node.dataset.favorite);
    const key = pressed ? 'removeSaved' : 'save';
    if (node.dataset.i18nLabel !== key) {
      node.setAttribute('aria-pressed', String(pressed));
      node.dataset.i18nLabel = key;
      node.setAttribute('aria-label', copy(key));
      node.dispatchEvent(new CustomEvent('hipobuy:translate', {bubbles: true}));
    }
  }
}

function updateTree(root) {
  if (root instanceof Element && root.matches(tracked)) updateNode(root);
  root.querySelectorAll?.(tracked).forEach(updateNode);
}
function updateHeader() {
  const {agent, currency, currencyMode} = currentShopping();
  document.getElementById('shopping-currency').textContent = currency;
  if (menu) {
    document.getElementById('shopping-agent').textContent = agent.name;
    const logo = document.getElementById('shopping-logo');
    if (agent.logo) logo.src = agent.logo;
    logo.hidden = !agent.logo;
    savedCount.textContent = String(savedIds().size);
    savedCount.hidden = savedIds().size === 0;
  }
  for (const option of document.querySelectorAll('[data-shop-agent],[data-shop-currency],[data-shop-auto]')) {
    const selected = option.hasAttribute('data-shop-auto') ? currencyMode === 'auto'
      : option.dataset.shopAgent === agent.id || option.dataset.shopCurrency === currencyMode;
    option.setAttribute('aria-pressed', String(selected));
  }
}

for (const panel of menus) {
  const summary = panel.querySelector('summary');
  panel.addEventListener('click', (event) => {
    const option = event.target.closest('[data-shop-agent],[data-shop-currency],[data-shop-auto]');
    if (!option) return;
    const agent = agents.find(({id}) => id === option.dataset.shopAgent);
    const currency = option.hasAttribute('data-shop-auto') ? 'auto' : currencies.find((code) => code === option.dataset.shopCurrency);
    changeShopping({agent, currency});
    updateHeader();
    updateTree(document);
    panel.open = false;
    summary.focus();
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.open) { panel.open = false; summary.focus(); }
  });
}

document.addEventListener('click', (event) => {
  for (const panel of menus) {
    if (panel.open && !panel.contains(event.target)) panel.open = false;
  }
  const button = event.target.closest('button[data-favorite]');
  if (!button) return;
  toggleSaved(button.dataset.favorite);
  updateHeader();
  updateTree(document);
  document.dispatchEvent(new Event('hipobuy:saved'));
});
document.addEventListener('hipobuy:language', () => {
  updateHeader();
  updateTree(document);
});
new MutationObserver((entries) => {
  for (const entry of entries) for (const node of entry.addedNodes) updateTree(node);
}).observe(document.body, {childList: true, subtree: true});
updateHeader();
updateTree(document);
