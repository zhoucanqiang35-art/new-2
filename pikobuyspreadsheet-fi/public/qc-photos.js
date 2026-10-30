(() => {
  const panel = document.getElementById('qc-photos');
  if (!panel) return;
  const id = panel.dataset.itemId, status = document.getElementById('qc-status'), gallery = document.getElementById('qc-gallery');
  const lang = new URLSearchParams(location.search).get('lang') || 'en';
  const messages = {
    en: ['Checking QC photos…','No QC photos are currently available for this item.','QC photos are being prepared. Please check again later.','QC photos are temporarily unavailable. Please try again later.','QC photo'],
    de: ['QC-Fotos werden geprüft…','Für diesen Artikel sind derzeit keine QC-Fotos verfügbar.','QC-Fotos werden vorbereitet. Bitte später erneut prüfen.','QC-Fotos sind vorübergehend nicht verfügbar. Bitte später erneut versuchen.','QC-Foto'],
    fr: ['Recherche des photos QC…','Aucune photo QC disponible pour cet article actuellement.','Les photos QC sont en préparation. Revenez plus tard.','Photos QC temporairement indisponibles. Réessayez plus tard.','Photo QC'],
    es: ['Buscando fotos QC…','No hay fotos QC disponibles para este artículo actualmente.','Las fotos QC se están preparando. Vuelve más tarde.','Fotos QC temporalmente no disponibles. Inténtalo más tarde.','Foto QC'],
    it: ['Ricerca foto QC…','Al momento non ci sono foto QC per questo articolo.','Le foto QC sono in preparazione. Controlla più tardi.','Foto QC temporaneamente non disponibili. Riprova più tardi.','Foto QC'],
    pt: ['Procurando fotos QC…','Não há fotos QC disponíveis para este produto no momento.','As fotos QC estão em preparação. Volte mais tarde.','Fotos QC temporariamente indisponíveis. Tente mais tarde.','Foto QC'],
    nl: ['QC-foto’s zoeken…','Voor dit artikel zijn momenteel geen QC-foto’s beschikbaar.','QC-foto’s worden voorbereid. Kijk later opnieuw.','QC-foto’s zijn tijdelijk niet beschikbaar. Probeer later opnieuw.','QC-foto'],
    pl: ['Sprawdzanie zdjęć QC…','Obecnie brak zdjęć QC dla tego produktu.','Zdjęcia QC są przygotowywane. Sprawdź później.','Zdjęcia QC są tymczasowo niedostępne. Spróbuj później.','Zdjęcie QC'],
    sv: ['Söker efter QC-bilder…','Det finns inga QC-bilder för denna vara just nu.','QC-bilder förbereds. Kontrollera igen senare.','QC-bilder är tillfälligt otillgängliga. Försök igen senare.','QC-bild']
  };
  const m = messages[lang] || messages.en;
  status.textContent = m[0];
  if (!/^\d{5,20}$/.test(id)) { status.textContent = m[1]; return; }
  fetch('/api/qc?item=' + encodeURIComponent(id)).then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
    if (data.status !== 'ready' || !Array.isArray(data.images) || !data.images.length) { status.textContent = data.status === 'none' ? m[1] : data.status === 'pending' ? m[2] : m[3]; return; }
    status.textContent = '';
    data.images.forEach((photo, i) => {
      let url; try { url = new URL(photo.display, location.origin); } catch { return; }
      if (url.protocol !== 'https:') return;
      const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const media = document.createElement(photo.isVideo ? 'video' : 'img'); media.src = url.href;
      if (photo.isVideo) { media.controls = true; media.playsInline = true; media.muted = true; } else { media.loading = 'lazy'; media.alt = m[4] + ' ' + (i + 1); }
      link.appendChild(media);
      if (photo.skuLabel) { const label = document.createElement('span'); label.textContent = photo.skuLabel; link.appendChild(label); }
      gallery.appendChild(link);
    });
    if (!gallery.children.length) status.textContent = m[3];
  }).catch(() => { status.textContent = m[3]; });
})();
