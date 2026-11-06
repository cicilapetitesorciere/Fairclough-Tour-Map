// Draws the ridings, and handles pointer, click and keyboard input on the map. Clicking a riding zooms
// in on it and opens its window.

function drawRidings() {
  shapes = ridingLayer.selectAll('path')
    .data(features)
    .join('path')
    .attr('class', 'riding')
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', d => d.properties.name);
}

const isRiding = node => node.matches('.riding');

// The pop-up for the riding under the pointer or with keyboard focus. Anywhere else hides it.
function showTipFor(node, x, y) {
  if (isRiding(node)) showTip(node.__data__, x, y);
  else hideTip();
}

// Touch has no hover: dragging a finger across the map would flash pop-ups on every riding it passes.
svg
  .on('pointermove', e => { if (e.pointerType !== 'touch') showTipFor(e.target, ...d3.pointer(e, mapBox)); })
  .on('pointerleave', hideTip)
  .on('click', e => { if (isRiding(e.target)) openRiding(e.target.__data__); })
  .on('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && isRiding(e.target)) {
      e.preventDefault();
      openRiding(e.target.__data__);
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
