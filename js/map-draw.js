// Draws the ridings, and handles pointer, click and keyboard input on the map.

function drawRidings() {
  shapes = ridingLayer.selectAll('path')
    .data(features)
    .join('path')
    .attr('class', d => regionOf.has(d.properties.id) ? 'riding zoomable' : 'riding')
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', d => d.properties.name);
}

const isRiding = target => target.matches('.riding');

// In the full view, a riding in a region zooms in on the whole region. Any other click zooms in
// on the riding and opens its window.
function activate(target) {
  const d = target.__data__;
  const region = regionOf.get(d.properties.id);
  if (view === 'all' && region) setView(region);
  else openRiding(d);
}

// The pop-up for the riding under the pointer or with keyboard focus. Anywhere else hides it.
function showTipFor(target, x, y) {
  if (isRiding(target)) showTip(target.__data__, x, y);
  else hideTip();
}

svg
  .on('pointermove', e => showTipFor(e.target, ...d3.pointer(e, mapBox)))
  .on('pointerleave', hideTip)
  .on('click', e => {
    if (isRiding(e.target)) activate(e.target);
    else if (view !== 'all') setView('all');  // clicking empty water when zoomed in zooms back out
  })
  .on('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && isRiding(e.target)) {
      e.preventDefault();
      activate(e.target);
    }
  });

// Keyboard focus shows the pop-up too; a mouse click also focuses, so only :focus-visible counts.
// These listen on the panel, not the SVG: in Chrome, an SVG element with focus listeners becomes
// focusable itself, so the whole map would take focus (and a focus ring) on every click.
mapBox.addEventListener('focusin', e => {
  if (!e.target.matches(':focus-visible')) return;
  const b = e.target.getBoundingClientRect(), s = mapBox.getBoundingClientRect();
  showTipFor(e.target, b.left - s.left + b.width / 2, b.top - s.top + b.height / 2);
});
mapBox.addEventListener('focusout', hideTip);
