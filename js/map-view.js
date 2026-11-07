// Moving around the map: drag to pan, scroll or pinch to zoom, the zoom buttons, and the animated
// zooms to the whole province or a riding.
function mapSize() {
  const r = mapBox.getBoundingClientRect();
  return [r.width, r.height];
}

const zoom = d3.zoom()
  .scaleExtent([1, MAX_ZOOM])
  .clickDistance(4)  // a click that wobbles a few pixels is still a click, not a drag
  .on('zoom', zoomed);
svg.call(zoom).on('dblclick.zoom', null);  // a double-click would also click the riding under it twice

// Fits Ontario to the panel, leaving a margin so the neighbouring provinces and states show.
// On a resize, whatever is in the middle of the map stays in the middle.
let size = null;
function layout() {
  if (!features.length) return;
  const [w, h] = mapSize();
  const middle = size && projection.invert(transform.invert([size[0] / 2, size[1] / 2]));
  size = [w, h];
  const mx = Math.max(16, w * 0.07);
  projection.fitExtent([[mx, 60], [w - mx, h - 52]], { type: 'FeatureCollection', features });
  shapes.attr('d', path);
  contextLayer.selectAll('path').attr('d', path);
  placePhotos();
  zoom.extent([[0, 0], [w, h]]).translateExtent([[0, 0], [w, h]]);
  if (zoomTarget !== null || !middle) return svg.call(zoom.transform, frame(zoomTarget));
  const [x, y] = projection(middle), k = transform.k;
  svg.call(zoom.transform, d3.zoomIdentity.translate(w / 2 - k * x, h / 2 - k * y).scale(k));
}
new ResizeObserver(layout).observe(mapBox);

// The zoom that fits a riding in the panel. 'all' (or null) is the whole province.
function frame(key) {
  if (key === 'all' || key === null) return d3.zoomIdentity;
  const [w, h] = size;
  const [[x0, y0], [x1, y1]] = path.bounds(ridingById.get(key));
  const k = Math.min(MAX_ZOOM, Math.max(1, 0.86 / Math.max((x1 - x0) / w, (y1 - y0) / h)));
  return d3.zoomIdentity.translate(w / 2 - k * (x0 + x1) / 2, h / 2 - k * (y0 + y1) / 2).scale(k);
}

function zoomed(e) {
  transform = e.transform;
  if (e.sourceEvent) zoomTarget = null;  // the viewer moved the map themselves
  g.attr('transform', transform);
  scalePhotos();
  const zoomedIn = transform.k > 1.001;
  zoomOutButton.disabled = !zoomedIn;
  zoomInButton.disabled = transform.k > MAX_ZOOM - 0.001;
  hideTip();
}

// Animated zoom to the whole province ('all') or a riding.
function setView(key) {
  cancelPendingInfo();
  zoomTarget = key === 'all' ? null : key;
  animated(svg, true).call(zoom.transform, frame(key));
}

function zoomBy(factor) {
  zoomTarget = null;
  animated(svg, true).call(zoom.scaleBy, factor);
}

zoomInButton.addEventListener('click', () => zoomBy(2));
zoomOutButton.addEventListener('click', () => zoomBy(0.5));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !info.open) setView('all'); });
