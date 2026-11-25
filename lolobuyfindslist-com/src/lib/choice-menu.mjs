function openMenus() {
  return document.querySelectorAll('details.choice-menu[open]');
}

document.addEventListener('toggle', (event) => {
  const menu = event.target;
  if (!(menu instanceof HTMLDetailsElement) || !menu.open || !menu.matches('.choice-menu')) return;
  for (const other of openMenus()) {
    if (other !== menu) other.open = false;
  }
}, true);

document.addEventListener('click', (event) => {
  for (const menu of openMenus()) {
    if (!menu.contains(event.target)) menu.open = false;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  for (const menu of openMenus()) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
});
