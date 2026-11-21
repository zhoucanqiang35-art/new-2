import {agents, currencies, refreshPrices, shoppingOptions, updateShopping} from './shopping.mjs';

export function setupShoppingMenu(menu) {
  const trigger = menu.querySelector('summary');
  function refresh() {
    const {agent, currency} = shoppingOptions();
    const selected = agents.find(({id}) => id === agent);
    menu.querySelector('[data-shopping-agent]').textContent = selected.name;
    menu.querySelector('[data-shopping-currency]').textContent = currency;
    menu.querySelector('[data-shopping-logo]').src = selected.logo;
    for (const option of menu.querySelectorAll('input')) {
      option.checked = option.value === (option.name === 'site-agent' ? agent : currency);
    }
  }
  menu.addEventListener('change', ({target}) => {
    if (!target.checked) return;
    if (target.name === 'site-agent' && agents.some(({id}) => id === target.value)) updateShopping({agent:target.value});
    if (target.name === 'site-currency' && currencies.includes(target.value)) updateShopping({currency:target.value});
  });
  document.addEventListener('click', ({target}) => {
    if (menu.open && !menu.contains(target)) menu.open = false;
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      trigger.focus();
    }
  });
  window.addEventListener('shopping-change', refresh);
  refresh();
}

export function setupCurrencyDisplay() {
  window.addEventListener('shopping-change', () => refreshPrices());
  refreshPrices();
}
