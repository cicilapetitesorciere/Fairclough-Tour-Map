// Draws the ridings, and handles pointer, click and keyboard input on the map.

// A visited riding jumps to its first visit when clicked. A riding visited more than once
// also has a dot per visit, to jump to the others.
const isVisited = d => visitsByRiding.has(d.properties.id);

function drawRidings() {
  shapes = ridingLayer.selectAll('path')
    .data(features)
    .join('path')
    .attr('class', d => {
      const id = d.properties.id;
      return ['riding', visitsByRiding.has(id) && 'visited', regionOf.has(id) && 'zoomable', isVisited(d) && 'clickable']
        .filter(Boolean).join(' ');
    })
    .attr('tabindex', d => isVisited(d) ? 0 : null)
    .attr('aria-label', d => d.properties.name + (visitsByRiding.has(d.properties.id) ? ', visited' : ''));
}

const isMapItem = target => target.matches('.riding, .visit-dot');

// A dot jumps to its visit. A riding in a close-up region zooms there from the full view;
// otherwise a visited riding jumps to its first visit.
function activate(target) {
  const d = target.__data__;
  if (target.classList.contains('visit-dot')) return scrollToVisit(d.i);
  const region = regionOf.get(d.properties.id);
  if (view === 'all' && region) setView(region);
  else if (isVisited(d)) scrollToVisit(visitsByRiding.get(d.properties.id)[0].i);
}

// The pop-up for whatever is under the pointer or has keyboard focus. Anywhere else hides it.
function showTipFor(target, x, y) {
  if (target.classList.contains('riding')) showTip(target.__data__, x, y);
  else if (target.classList.contains('visit-dot')) showVisitTip(target.__data__, x, y);
  else hideTip();
}

svg
  .on('pointermove', e => showTipFor(e.target, ...d3.pointer(e, mapBox)))
  .on('pointerleave', hideTip)
  .on('click', e => {
    if (isMapItem(e.target)) activate(e.target);
    else if (view !== 'all') setView('all');  // clicking empty water in a close-up zooms back out
  })
  .on('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && isMapItem(e.target)) {
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
