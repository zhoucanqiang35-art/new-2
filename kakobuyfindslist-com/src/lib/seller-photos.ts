type SellerPhoto = {url: string; label: string};

export async function showSellerPhotos(item: string, gallery: Promise<string[]>) {
  const heading = document.querySelector<HTMLElement>("#seller-photo-title")!;
  const list = document.querySelector<HTMLElement>("#seller-photos")!;
  const status = document.querySelector<HTMLElement>("#seller-photo-status")!;
  const render = (photos: SellerPhoto[], fallback = false) => {
    heading.textContent = fallback ? "Catalog listing photos" : "Seller detail photos";
    list.replaceChildren(...photos.map(({url, label}, index) => {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      const image = new Image(102, 102);
      image.src = url;
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = label || "Product photo " + (index + 1);
      image.addEventListener("error", () => {
        entry.remove();
        if (list.childElementCount > 0) return;
        if (!fallback) void showFallback();
        else {
          list.hidden = true;
          status.textContent = "Product photos could not load.";
          status.hidden = false;
        }
      }, {once: true});
      link.append(image);
      if (label) {
        const caption = document.createElement("span");
        caption.textContent = label;
        caption.dir = "auto";
        caption.dataset.i18nIgnore = "";
        link.append(caption);
      }
      entry.append(link);
      return entry;
    }));
    list.hidden = false;
    status.hidden = true;
  };

  const showFallback = async () => {
    render((await gallery).map(url => ({url, label: ""})), true);
  };

  try {
    const response = await fetch("/api/seller-photos?id=" + encodeURIComponent(item), {
      signal: AbortSignal.timeout(8500),
    });
    if (response.ok) {
      const photos: SellerPhoto[] = await response.json();
      if (Array.isArray(photos) && photos.length) {
        render(photos);
        return;
      }
    }
  } catch {
    // The catalog gallery remains available if the original listing is unreachable.
  }
  await showFallback();
}
