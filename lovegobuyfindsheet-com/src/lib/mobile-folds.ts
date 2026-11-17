const narrow = matchMedia("(max-width: 640px)");
const panels = [...document.querySelectorAll<HTMLDetailsElement>("details[data-mobile-fold]")];

function revealTarget() {
  if (!location.hash) return;
  let id: string;
  try { id = decodeURIComponent(location.hash.slice(1)); }
  catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  for (let section = target.closest("details"); section; section = section.parentElement?.closest("details") ?? null) {
    section.open = true;
  }
}

function setDefaults() {
  for (const panel of panels) panel.open = !narrow.matches;
  revealTarget();
}

narrow.addEventListener("change", setDefaults);
addEventListener("hashchange", revealTarget);
setDefaults();
