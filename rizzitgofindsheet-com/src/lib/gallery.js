const gallery = document.querySelector('[data-gallery]');
const main = gallery.querySelector('.main-photo');
const mainImage = main.querySelector('img');
const thumbnails = gallery.querySelector('[data-thumbnails]');
const imageName = mainImage.alt;
const path = encodeURIComponent(gallery.dataset.path);

fetch('/api/gallery?path=' + path).then(async (response) => {
  if (!response.ok) return;
  const { images } = await response.json();
  const photos = [...new Set([mainImage.src, ...images])];
  if (photos.length < 2) return;
  thumbnails.replaceChildren(...photos.map((src, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Show listing photo ' + (index + 1));
    button.setAttribute('aria-pressed', String(index === 0));
    const image = document.createElement('img');
    image.alt = '';
    image.src = src;
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => {
      thumbnails.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      mainImage.src = src;
      mainImage.alt = imageName + ' – listing photo ' + (index + 1);
      main.href = src;
    });
    return button;
  }));
}).catch(() => {});
