import {element, external} from './browser.mjs';
import {purchaseUrl, sourceOrigin} from './catalog.mjs';

function listingImage(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value.startsWith('//') ? 'https:' + value : value);
    if (url.protocol !== 'https:') return '';
    if (url.hostname === 'si.geilicdn.com' && /^\/[A-Za-z0-9_-]{12,200}\.(?:jpe?g|png|webp)$/i.test(url.pathname)) {
      return '/api/listing-image?file=' + encodeURIComponent(url.pathname.slice(1));
    }
    return url.href;
  } catch {
    return '';
  }
}

export async function loadProductOptions(id) {
  const url = new URL('/api/Goods/getSkuData', sourceOrigin);
  url.searchParams.set('weidian_id', id);
  const response = await fetch(url, {credentials: 'omit', signal: AbortSignal.timeout(7000)});
  if (!response.ok) throw new Error('Listing options unavailable');
  const data = await response.json();
  if (String(data.weidian_id) !== id) throw new Error('Unexpected listing');
  const specs = data.specifications ?? {};
  const groups = (Array.isArray(specs.attrs) ? specs.attrs : []).map((group) => ({
    title: String(group.attr_title ?? '').trim(),
    options: (Array.isArray(group.attr_values) ? group.attr_values : []).flatMap((option) => {
      const name = String(option.attr_value ?? option.name ?? '').trim();
      const id = String(option.attr_id ?? option.id ?? '');
      return name && /^\d+$/.test(id) ? [{id, name, image: listingImage(option.img || option.image)}] : [];
    }),
  })).filter(({title, options}) => title && options.length);
  const skus = Object.values(specs.skus ?? {}).flatMap((sku) => {
    if (!sku || typeof sku.attr_ids !== 'string') return [];
    const ids = new Set(sku.attr_ids.split('-'));
    if (!groups.every(({options}) => options.some(({id}) => ids.has(id)))) return [];
    const amount = sku.price === '' || sku.price == null ? NaN : Number(sku.price);
    const stock = sku.stock === '' || sku.stock == null ? NaN : Number(sku.stock);
    return [{ids, amount: amount >= 0 ? amount : NaN, image: listingImage(sku.img), stock}];
  });
  const images = Array.isArray(data.images) ? data.images.map(listingImage).filter(Boolean) : [];
  return {groups, skus, images};
}

export function showProductOptions(target, data, id, onSelection) {
  if (!data?.groups.length) {
    target.replaceChildren(element('p', {className: 'listing-option-note'}, [
      external('Check styles and sizes on LoloBuy', purchaseUrl(id)),
    ]));
    return;
  }
  const {groups, skus} = data;
  const selected = groups.map(() => null);
  const buttons = groups.map(() => new Map());
  const labels = groups.map(() => element('span', {className: 'sku-selection', translate: false}));
  const optionNote = element('p', {className: 'listing-option-note'});
  const fields = groups.map((group, groupIndex) => {
    const imageGroup = group.options.some(({image}) => image);
    const tiles = group.options.map((option) => {
      const {id, name, image} = option;
      const content = element('span', {textContent: name, translate: false});
      if (image) content.className = 'sku-photo-label';
      const button = element('button', {type: 'button', className: 'sku-option'}, [
        ...(image ? [element('img', {src: image, alt: '', loading: 'lazy'})] : []),
        content,
      ]);
      if (image) {
        button.title = name;
        button.firstElementChild.addEventListener('error', () => {
          button.firstElementChild.remove();
          content.classList.remove('sku-photo-label');
          button.classList.add('sku-option-no-image');
        }, {once: true});
      }
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const previous = selected.map((item) => item?.id);
        selected[groupIndex] = option;
        const matching = skus.filter(({ids}) => ids.has(id));
        const compatible = matching.filter(({ids}) => previous.every((value, index) => index === groupIndex || !value || ids.has(value)));
        const sku = compatible.find(({stock}) => stock > 0) ?? compatible[0]
          ?? matching.find(({stock}) => stock > 0) ?? matching[0];
        if (sku) {
          groups.forEach(({options}, index) => {
            selected[index] = options.find(({id}) => sku.ids.has(id)) ?? null;
          });
        }
        for (const [index, values] of buttons.entries()) {
          for (const [id, tile] of values) tile.setAttribute('aria-pressed', String(selected[index]?.id === id));
          labels[index].textContent = selected[index]?.name ?? '';
        }
        optionNote.textContent = sku?.stock === 0 ? 'This option is listed as out of stock. Confirm on the purchase page.' : 'Confirm your selected options and stock on the purchase page.';
        onSelection(option.image || sku?.image || selected.find((item) => item?.image)?.image, sku?.amount);
      });
      buttons[groupIndex].set(id, button);
      return button;
    });
    const name = /^(?:colou?r|style)$/i.test(group.title) ? 'Styles' : /^sizes?$/i.test(group.title) ? 'Sizes' : group.title;
    return element('fieldset', {className: 'sku-group'}, [
      element('legend', {}, [element('span', {textContent: name}), labels[groupIndex]]),
      element('div', {className: imageGroup ? 'sku-image-options' : 'sku-text-options'}, tiles),
    ]);
  });
  optionNote.textContent = 'Confirm your selected options and stock on the purchase page.';
  optionNote.setAttribute('role', 'status');
  target.replaceChildren(...fields, optionNote);
}
