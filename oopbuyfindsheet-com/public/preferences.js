(() => {
  const pickers = [...document.querySelectorAll('.choice-picker')];
  for (const picker of pickers) {
    const select = picker.querySelector('select');
    const summary = picker.querySelector('summary');
    const buttons = [...picker.querySelectorAll('[data-choice]')];
    function sync() {
      summary.querySelector('span').textContent = select.selectedOptions[0]?.textContent || '';
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.choice === select.value));
      }
    }
    picker.addEventListener('toggle', () => {
      if (picker.open) {
        for (const other of pickers) if (other !== picker) other.open = false;
      }
    });
    picker.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !picker.open) return;
      event.preventDefault();
      picker.open = false;
      summary.focus();
    });
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        select.value = button.dataset.choice;
        select.dispatchEvent(new Event('change', {bubbles: true}));
        if (button.dataset.currency) {
          const currency = document.getElementById('currency');
          if (currency.value !== button.dataset.currency) {
            currency.value = button.dataset.currency;
            currency.dispatchEvent(new Event('change', {bubbles: true}));
          }
        }
        picker.open = false;
        summary.focus();
      });
    });
    window.addEventListener(select.id === 'language' ? 'oop-language' : 'oop-currency', sync);
    sync();
  }
  document.addEventListener('click', event => {
    for (const picker of pickers) if (!picker.contains(event.target)) picker.open = false;
  });
})();
