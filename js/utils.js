// Small helpers: building DOM nodes, and animating the map.
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

// A transition for zooming, or the plain selection when there's nothing to animate
// (a resize, or a viewer who prefers reduced motion).
function animated(selection, animate) {
  return animate && !reduceMotion ? selection.transition().duration(ZOOM_MS) : selection.interrupt();
}
