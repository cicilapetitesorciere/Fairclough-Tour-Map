// The window that opens in the middle of the screen when a riding is clicked.
const info = document.getElementById('info');
const infoName = document.getElementById('info-name');
const infoText = document.getElementById('info-text');
const infoPhotos = document.getElementById('info-photos');
const infoEndorsements = document.getElementById('info-endorsements');
const endorsementList = document.getElementById('endorsement-list');
infoEndorsements.setAttribute('aria-label', T.endorsements);

let infoTimer;
function cancelPendingInfo() { clearTimeout(infoTimer); }

// Zooms in on a riding, then opens its window once the zoom has finished.
function openRiding(d) {
  const id = d.properties.id;
  const there = zoomTarget === id;
  setView(id);
  infoTimer = setTimeout(() => showInfo(d), there || reduceMotion ? 0 : ZOOM_MS);
}

// A photo in the window. A spinner holds its place until it has loaded; one that fails to load is dropped.
function photoFrame(url, name) {
  const img = el('img', { src: url, alt: name, loading: 'lazy' });
  const frame = el('div', { class: 'info-photo is-loading' }, img);
  const loaded = () => frame.classList.remove('is-loading');
  img.addEventListener('load', loaded);
  img.addEventListener('error', () => frame.remove());
  if (img.complete && img.naturalWidth) loaded();  // already in the browser's cache
  return frame;
}

// One endorser: their photo, name and description, a short pull quote, and the full text behind a toggle.
function endorsementCard(e, withFull = true) {
  const portrait = e.thumb
    ? el('img', { class: 'endorsement-photo', src: `endorsements/${e.thumb}`, alt: '', loading: withFull ? 'lazy' : 'eager' })  // the slideshow's card waits for it, off the page
    : el('span', { class: 'endorsement-photo endorsement-initial', 'aria-hidden': 'true' }, e.name.replace(/^(Hon\.?|Dr\.?)\s+/i, '').charAt(0));
  const who = el('div', { class: 'endorsement-who' }, el('strong', {}, e.name));
  if (e.description) who.append(el('span', {}, e.description.replace(/ \| /g, ', ')));
  const body = el('div', { class: 'endorsement-body' }, who);
  if (e.excerpt) body.append(el('blockquote', {}, e.excerpt));
  if (withFull && e.endorsement) {
    const full = el('div', { class: 'endorsement-full' });
    full.append(...e.endorsement.split(/\n\n+/).map(p => el('p', {}, p)));
    body.append(el('details', {}, el('summary', {}, T.readMore), full));
  }
  return el('li', { class: 'endorsement' }, portrait, body);
}

function showInfo(d) {
  const { photos } = d.properties;
  const name = ridingName(d);
  const urls = Array.isArray(photos) ? photos.filter(Boolean) : [];
  infoName.textContent = name;
  const endorsed = endorsementsByRiding.get(d.properties.name) || [];
  infoText.textContent = d.properties.description || (urls.length || endorsed.length ? '' : T.empty);
  infoText.hidden = !infoText.textContent;
  infoPhotos.replaceChildren(...urls.map(url => photoFrame(url, name)));
  infoPhotos.hidden = !urls.length;
  endorsementList.replaceChildren(...endorsed.map(e => endorsementCard(e)));
  infoEndorsements.hidden = !endorsed.length;
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
