// The hover pop-up, and the highlight on a region.
const tipName = document.getElementById('tip-name');
const tipDetail = document.getElementById('tip-detail');

function showText(name, detail, x, y) {
  tipName.textContent = name;
  tipDetail.textContent = detail;
  tip.hidden = false;
  // Below-right of the pointer, flipping to the other side near the panel's edges.
  const [w, h] = mapSize();
  let left = x + 14, top = y + 14;
  if (left + tip.offsetWidth > w - 8) left = x - tip.offsetWidth - 14;
  if (top + tip.offsetHeight > h - 8) top = y - tip.offsetHeight - 14;
  tip.style.left = Math.max(8, left) + 'px';
  tip.style.top = Math.max(8, top) + 'px';
}

// In the full view, a riding in a region describes the whole region, which lights up as one block.
// Anywhere else it is the riding's own name.
function showTip(d, x, y) {
  const region = view === 'all' ? regionOf.get(d.properties.id) : undefined;
  lightRegion(region ?? null);
  if (region) showText(REGIONS[region].label, `Click to zoom in · ${regionSize.get(region)} ridings`, x, y);
  else showText(d.properties.name, '', x, y);
}

function hideTip() {
  tip.hidden = true;
  lightRegion(null);
}

let litRegion = null;
function lightRegion(key) {
  if (key === litRegion) return;
  litRegion = key;
  shapes.classed('region-hover', d => key !== null && regionOf.get(d.properties.id) === key);
}
