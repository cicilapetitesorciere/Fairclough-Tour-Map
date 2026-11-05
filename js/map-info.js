// The window that opens in the middle of the screen when a riding is clicked.
const info = document.getElementById('info');
const infoName = document.getElementById('info-name');
const infoText = document.getElementById('info-text');
const infoPhotos = document.getElementById('info-photos');

let infoTimer;
let returnView = 'all';  // the view to zoom back out to when the window closes
function cancelPendingInfo() { clearTimeout(infoTimer); }

// Zooms in on a riding, then opens its window once the zoom has finished.
function openRiding(d) {
  if (typeof view !== 'number') returnView = view;
  const wait = view === d.properties.id || reduceMotion ? 0 : ZOOM_MS;
  setView(d.properties.id);
  infoTimer = setTimeout(() => showInfo(d), wait);
}

function showInfo(d) {
  const { name, description, photos } = d.properties;
  const urls = Array.isArray(photos) ? photos.filter(Boolean) : [];
  infoName.textContent = name;
  infoText.textContent = description || (urls.length ? '' : 'Nothing here yet.');
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

// Closing the window, by any route, zooms the map back out one level, to where it was before the riding.
info.addEventListener('close', () => {
  // The browser hands focus back to the riding that was clicked, which would leave its focus outline on.
  if (document.activeElement?.matches('.riding')) document.activeElement.blur();
  setView(returnView);
});
