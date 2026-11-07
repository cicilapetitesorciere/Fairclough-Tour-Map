// What's drawn around the ridings: the neighbouring provinces and states, and the photos.

function drawContext(geo) {
  contextLayer.selectAll('path')
    .data(geo ? geo.features : [])
    .join('path')
    .attr('class', 'context-land');
}

// A photo's small copy, `thumbs/` beside it: a few KB instead of the full image, which the browser would
// have to decode and redraw for every one of them as the map moves. Photos hosted elsewhere have none.
const thumbnail = url => /^(https?:)?\/\//.test(url) ? url : url.replace(/([^/]+)$/, 'thumbs/$1');

// A small round photo on the map for each photo in a riding. They don't scale with the map, and ignore
// the pointer, so hovering and clicking go to the riding underneath.
let photos = [];
function drawPhotos() {
  photos = features.flatMap(f => (f.properties.photos ?? []).filter(Boolean).map((url, i, all) => ({ riding: f, url, i, n: all.length })));
  const r = PHOTO_PX / 2;
  svg.append('defs').append('clipPath').attr('id', 'photo-clip').append('circle').attr('r', r);
  const photo = photoLayer.selectAll('g').data(photos).join('g').attr('class', 'photo').append('g');
  photo.append('circle').attr('r', r + 2);
  photo.append('image')
    .attr('href', d => thumbnail(d.url))
    .attr('x', -r).attr('y', -r).attr('width', PHOTO_PX).attr('height', PHOTO_PX)
    .attr('preserveAspectRatio', 'xMidYMid slice')
    .attr('clip-path', 'url(#photo-clip)');
}

// Photos sit near the middle of their riding; several in one riding fan out around it, in a ring.
// Exact positions don't matter, so a riding's centre is only roughly in the right place.
function placePhotos() {
  for (const d of photos) {
    [d.x, d.y] = path.centroid(d.riding);
    d.dx = d.dy = 0;
    if (d.n > 1) {
      const ring = PHOTO_PX * 0.6 / (d.n === 2 ? 1 : Math.sin(Math.PI / d.n));
      const a = 2 * Math.PI * d.i / d.n - Math.PI / 2;
      d.dx = ring * Math.cos(a);
      d.dy = ring * Math.sin(a);
    }
  }
  scalePhotos();
}

// Photos start small, so the crowded south isn't a pile, and grow to full size as you zoom in.
const photoScale = () => Math.min(1, 0.3 + 0.25 * Math.log2(transform.k));
function scalePhotos() {
  const size = photoScale() / transform.k;
  photoLayer.selectAll('.photo').attr('transform', d => `translate(${d.x},${d.y}) scale(${size})`)
    .select('g').attr('transform', d => `translate(${d.dx},${d.dy})`);
}

// Where a photo's circle is on screen, relative to the map panel.
function photoOnScreen(d) {
  const s = photoScale();
  return [transform.x + transform.k * d.x + s * d.dx, transform.y + transform.k * d.y + s * d.dy];
}
