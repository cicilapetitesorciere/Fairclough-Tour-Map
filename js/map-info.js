// The window that opens in the middle of the screen when a riding is clicked.
const info = document.getElementById('info');
const infoName = document.getElementById('info-name');
const infoText = document.getElementById('info-text');
const infoPhotos = document.getElementById('info-photos');

let infoTimer;
function cancelPendingInfo() { clearTimeout(infoTimer); }

// Zooms in on a riding, then opens its window once the zoom has finished.
function openRiding(d) {
  const id = d.properties.id;
  const there = zoomTarget === id;
  setView(id);
  infoTimer = setTimeout(() => showInfo(d), there || reduceMotion ? 0 : ZOOM_MS);
}

function showInfo(d) {
  const { photos } = d.properties;
  const name = ridingName(d);
  const urls = Array.isArray(photos) ? photos.filter(Boolean) : [];
  infoName.textContent = name;
  infoText.textContent = d.properties.description || (urls.length ? '' : T.empty);
  infoText.hidden = !infoText.textContent;
  infoPhotos.replaceChildren(...urls.map(url =>
    el('a', { href: url, target: '_blank', rel: 'noopener' },
      el('img', { src: url, alt: name, loading: 'lazy' }))));
  infoPhotos.hidden = !urls.length;
  hideTip();
  info.showModal();
  info.scrollTop = 0;
}

document.getElementById('info-close').addEventListener('click', () => info.close());
// A click on the dimmed area around the window (the dialog itself, not its contents) closes it.
info.addEventListener('click', e => { if (e.target === info) info.close(); });

// Closing the window leaves the map where it is.
info.addEventListener('close', () => {
  // The browser hands focus back to the riding that was clicked, which would leave its focus outline on.
  if (document.activeElement?.matches('.riding')) document.activeElement.blur();
  zoomTarget = null;  // so a resize keeps the middle of the map rather than re-fitting the riding
});
