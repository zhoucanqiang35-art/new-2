import { copy } from './messages.mjs';
import { agents, currencies, currentShopping, changeShopping, agentUrl, formatPrice, savedIds, toggleSaved } from './shopping-data.mjs';

const menu = document.getElementById('shopping-menu');
const summary = menu?.querySelector('summary');
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
  if (!menu) return;
  const {agent, currency} = currentShopping();
  document.getElementById('shopping-agent').textContent = agent.name;
  document.getElementById('shopping-currency').textContent = currency;
  const logo = document.getElementById('shopping-logo');
  if (agent.logo) logo.src = agent.logo;
  logo.hidden = !agent.logo;
  for (const option of menu.querySelectorAll('[data-shop-agent],[data-shop-currency]')) {
    option.setAttribute('aria-pressed', String(option.dataset.shopAgent === agent.id || option.dataset.shopCurrency === currency));
  }
  savedCount.textContent = String(savedIds().size);
  savedCount.hidden = savedIds().size === 0;
}

menu?.addEventListener('click', (event) => {
  const option = event.target.closest('[data-shop-agent],[data-shop-currency]');
  if (!option) return;
  const agent = agents.find(({id}) => id === option.dataset.shopAgent);
  const currency = currencies.find((code) => code === option.dataset.shopCurrency);
  changeShopping({agent, currency});
  updateHeader();
  updateTree(document);
});
document.addEventListener('click', (event) => {
  if (menu?.open && !menu.contains(event.target)) menu.open = false;
  const button = event.target.closest('button[data-favorite]');
  if (!button) return;
  toggleSaved(button.dataset.favorite);
  updateHeader();
  updateTree(document);
  document.dispatchEvent(new Event('hipobuy:saved'));
});
menu?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
});
document.addEventListener('hipobuy:language', () => updateTree(document));
new MutationObserver((entries) => {
  for (const entry of entries) for (const node of entry.addedNodes) updateTree(node);
}).observe(document.body, {childList: true, subtree: true});
updateHeader();
updateTree(document);
