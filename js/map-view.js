// The map's views: the whole province, or zoomed in on one region.
function mapSize() {
  const r = mapBox.getBoundingClientRect();
  return [r.width, r.height];
}

// Fits Ontario to the panel, leaving a margin so the neighbouring provinces and states show.
function layout() {
  if (!features.length) return;
  const [w, h] = mapSize();
  const mx = Math.max(16, w * 0.07);
  projection.fitExtent([[mx, 60], [w - mx, h - 52]], { type: 'FeatureCollection', features });
  shapes.attr('d', path);
  contextLayer.selectAll('path').attr('d', path);
  applyView(false);
}
new ResizeObserver(layout).observe(mapBox);

// The zoom and offset that frame the current view. A close-up fits all of its region's ridings.
function viewTransform() {
  if (view === 'all') return { x: 0, y: 0, k: 1 };
  const [w, h] = mapSize();
  const b = features.filter(f => regionOf.get(f.properties.id) === view).map(f => path.bounds(f));
  const x0 = d3.min(b, d => d[0][0]), y0 = d3.min(b, d => d[0][1]);
  const x1 = d3.max(b, d => d[1][0]), y1 = d3.max(b, d => d[1][1]);
  const k = Math.max(1, 0.86 / Math.max((x1 - x0) / w, (y1 - y0) / h));
  return { k, x: w / 2 - k * (x0 + x1) / 2, y: h / 2 - k * (y0 + y1) / 2 };
}

function setView(next, animate = true) {
  if (next === view) return;
  view = next;
  applyView(animate);
}

function applyView(animate) {
  const t = viewTransform();
  animated(g, animate).attr('transform', `translate(${t.x},${t.y}) scale(${t.k})`);
  positionLabels(animate, t.k);
  positionDots(animate, t.k);
  // The region name and the Back button only appear once zoomed in.
  const zoomed = view !== 'all';
  mapBox.dataset.view = view;
  viewLabel.hidden = !zoomed;
  backButton.hidden = !zoomed;
  if (zoomed) viewLabel.textContent = REGIONS[view].label;
  hideTip();
}

backButton.addEventListener('click', () => setView('all'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setView('all'); });
