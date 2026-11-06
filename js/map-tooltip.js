// The hover pop-up: the name of the riding under the pointer, and how many
// photos it has — otherwise there is no way to tell a riding with a gallery
// from one that still says "Nothing here yet".
const tipName = document.getElementById('tip-name');
const tipPhotos = document.getElementById('tip-photos');

function showTip(d, x, y) {
  tipName.textContent = ridingName(d);
  const count = (d.properties.photos || []).filter(Boolean).length;
  tipPhotos.textContent = count ? T.photos(count) : '';
  tipPhotos.hidden = !count;
  tip.hidden = false;
  // Below-right of the pointer, flipping to the other side near the panel's edges.
  const [w, h] = mapSize();
  let left = x + 14, top = y + 14;
  if (left + tip.offsetWidth > w - 8) left = x - tip.offsetWidth - 14;
  if (top + tip.offsetHeight > h - 8) top = y - tip.offsetHeight - 14;
  tip.style.left = Math.max(8, left) + 'px';
  tip.style.top = Math.max(8, top) + 'px';
}

function hideTip() {
  tip.hidden = true;
}
