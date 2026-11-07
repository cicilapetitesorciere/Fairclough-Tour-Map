// The ambient slideshow. Once the map has been left alone for a few seconds, a random photo on screen
// grows out of its circle into a card, its picture drifts slowly across, and it shrinks back; then
// another, and so on. About half the time it shows an endorsement's pull quote instead, growing out of
// the middle of the riding the endorser belongs to. Using the map puts it away. It stays off for anyone who prefers reduced motion.
const peek = document.getElementById('peek');
const peekImg = peek.querySelector('img');
const peekCaption = peek.querySelector('figcaption');
const peekQuote = peek.querySelector('.peek-quote');

let lastActive = performance.now();  // when the viewer last used the map
let shown = null;                    // the photo on show, or null
let lastShown = null;                // the photo shown most recently, so it isn't picked twice in a row
let quotes = null;                   // the endorsements the slideshow can show, built on first use
let showing = 0;                     // bumped to cancel a showing part-way through

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Nothing else going on: the page is visible, no window or search is open, and the map's been left alone.
const quiet = () => !document.hidden && !info.open && document.activeElement !== searchInput
  && performance.now() - lastActive > SLIDESHOW_IDLE_MS;

async function slideshow() {
  for (;;) {
    await wait(SLIDESHOW_GAP_MS);
    if (quiet()) await showRandomPhoto().catch(() => {});  // a cancelled animation ends a showing early
  }
}

// Picks a riding, bigger ones more often (see SLIDESHOW_SIZE_WEIGHT), then one of its photos. Otherwise
// it would be nearly always the crowded south, where most of the ridings and photos are.
function pickPhoto(choices) {
  const byRiding = d3.group(choices, d => d.riding);
  const ridings = [...byRiding.keys()];
  const weights = ridings.map(f => path.area(f) ** SLIDESHOW_SIZE_WEIGHT);
  let r = Math.random() * d3.sum(weights);
  const i = weights.findIndex(w => (r -= w) < 0);
  const pool = byRiding.get(ridings[i < 0 ? ridings.length - 1 : i]);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Every endorsement with a pull quote and a riding on the map, placed (like a photo) at its riding's middle.
function quoteItems() {
  quotes ??= [...endorsementsByRiding].flatMap(([name, list]) => {
    const riding = features.find(f => f.properties.name === name);
    return riding ? list.filter(e => e.excerpt).map(e => ({ riding, quote: e, dx: 0, dy: 0 })) : [];
  });
  for (const q of quotes) [q.x, q.y] = path.centroid(q.riding);
  return quotes;
}

async function showRandomPhoto() {
  const [w, h] = mapSize();
  const visible = items => items.filter(d => {
    const [x, y] = photoOnScreen(d);
    return x > 20 && x < w - 20 && y > 100 && y < h - 20;  // not under the search box
  });
  const photosOnScreen = visible(photos), quotesOnScreen = visible(quoteItems());
  const wantQuote = Math.random() < SLIDESHOW_QUOTE_CHANCE;
  const onScreen = (wantQuote && quotesOnScreen.length) || !photosOnScreen.length ? quotesOnScreen : photosOnScreen;
  if (!onScreen.length) return;
  const d = pickPhoto(onScreen.length > 1 ? onScreen.filter(d => d !== lastShown) : onScreen);
  lastShown = d;
  const me = ++showing;
  if (d.quote) {
    const card = endorsementCard(d.quote, false);
    peekQuote.replaceChildren(card);
    await card.querySelector('img')?.decode().catch(() => {});  // the portrait is ready before the card appears
  } else {
    peekImg.src = d.url;
    await peekImg.decode();
  }
  if (me !== showing || !quiet()) return;

  // A card centred on the photo's circle, kept inside the map, growing out of the circle. The last
  // card's finished animations still hold their end state, so they go first.
  peek.getAnimations({ subtree: true }).forEach(a => a.cancel());
  peekCaption.textContent = d.riding.properties.name;
  peek.classList.toggle('is-quote', !!d.quote);
  peekQuote.hidden = !d.quote;
  peek.hidden = false;
  const W = peek.offsetWidth, H = peek.offsetHeight;
  const [px, py] = photoOnScreen(d);
  const left = Math.min(Math.max(px - W / 2, 12), w - W - 12);
  const top = Math.min(Math.max(py - H / 2, 100), h - H - 12);
  Object.assign(peek.style, { left: `${left}px`, top: `${top}px`, transformOrigin: `${px - left}px ${py - top}px` });
  shown = d;

  const small = { transform: `scale(${(PHOTO_PX * photoScale()) / W})`, opacity: 0 };
  const big = { transform: 'scale(1)', opacity: 1 };
  const shift = Math.random() < 0.5 ? 6 : -6;
  if (!d.quote) peekImg.animate([{ transform: `scale(1.18) translateX(${-shift}%)` }, { transform: `scale(1.18) translateX(${shift}%)` }],
    { duration: SLIDESHOW_HOLD_MS + 1200, fill: 'both' });
  await peek.animate([small, big], { duration: 550, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'both' }).finished;
  await wait(SLIDESHOW_HOLD_MS);
  while (me === showing && peek.matches(':hover')) await wait(250);  // stays while the pointer is on it
  if (me !== showing) return;
  await peek.animate([big, small], { duration: 450, easing: 'ease-in', fill: 'both' }).finished;
  if (me !== showing) return;
  peek.hidden = true;
  shown = null;
}

// Puts the card away at once: the viewer is using the map, or the map has moved under it.
function dismissPeek() {
  showing++;
  if (!shown) return;
  shown = null;
  peek.getAnimations({ subtree: true }).forEach(a => a.cancel());
  peek.hidden = true;
}

// Clicking the card opens its riding.
peek.addEventListener('click', () => {
  const d = shown;
  dismissPeek();
  if (d) openRiding(d.riding);
});

// Pressing, scrolling or typing on the map puts the card away; moving the pointer only holds off the
// next one, so the viewer can still reach a card to click it.
const markActive = e => {
  lastActive = performance.now();
  if (!peek.contains(e.target)) dismissPeek();
};
for (const type of ['pointerdown', 'wheel', 'keydown']) mapBox.addEventListener(type, markActive, { passive: true });
mapBox.addEventListener('pointermove', () => { lastActive = performance.now(); }, { passive: true });
zoom.on('zoom.slideshow', dismissPeek);

if (!reduceMotion) slideshow();
