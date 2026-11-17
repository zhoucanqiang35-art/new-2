(() => {
  const measurementId = 'G-SD9F4DN6ZJ';
  if (location.hostname !== 'usfansfindsheet.com' && location.hostname !== 'www.usfansfindsheet.com') return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  let referrer = '';
  if (document.referrer) {
    try { referrer = new URL(document.referrer).origin; } catch {}
  }
  gtag('js', new Date());
  gtag('config', measurementId, {
    page_location: location.origin + location.pathname,
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.append(tag);
})();
