// The hover pop-up, and the highlight on a close-up region.
const tipLabel = document.getElementById('tip-label');
const tipName = document.getElementById('tip-name');
const tipDetail = document.getElementById('tip-detail');

function showText({ label, name, detail, visited = false }, x, y) {
  tipLabel.textContent = label;
  tipName.textContent = name;
  tipDetail.textContent = detail;
  tipDetail.classList.toggle('visited', visited);
  tip.hidden = false;
  // Below-right of the pointer, flipping to the other side near the panel's edges.
  const [w, h] = mapSize();
  let left = x + 14, top = y + 14;
  if (left + tip.offsetWidth > w - 8) left = x - tip.offsetWidth - 14;
  if (top + tip.offsetHeight > h - 8) top = y - tip.offsetHeight - 14;
  tip.style.left = Math.max(8, left) + 'px';
  tip.style.top = Math.max(8, top) + 'px';
}

// A riding's pop-up. In the full view, a riding in a close-up region describes the region
// instead, and the whole region lights up.
function showTip(d, x, y) {
  const id = d.properties.id;
  const region = view === 'all' ? regionOf.get(id) : undefined;
  lightRegion(region ?? null);
  if (region) {
    showText({ label: 'Click to zoom in', name: REGIONS[region].label, detail: `${regionSize.get(region)} ridings` }, x, y);
    return;
  }
  const visits = visitsByRiding.get(id);
  const dates = visits && [...new Set(visits.map(v => fmtShort.format(v.date)))].join(' · ');
  showText({ label: 'Riding ' + id, name: d.properties.name, detail: visits ? 'Visited ' + dates : 'No visit recorded', visited: !!visits }, x, y);
}

function showVisitTip(v, x, y) {
  const riding = ridingById.get(v.riding)?.properties.name ?? 'Riding ' + v.riding;
  showText({ label: `${fmtShort.format(v.date)} · ${riding}`, name: v.title || v.town || v.venue, detail: [v.venue, v.town].filter(Boolean).join(', ') }, x, y);
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
