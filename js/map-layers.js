// What's drawn around the ridings: neighbouring land and place names, and the visit dots.

function drawContext(geo) {
  contextLayer.selectAll('path')
    .data(geo ? geo.features : [])
    .join('path')
    .attr('class', 'context-land');
  labelLayer.selectAll('text')
    .data(MAP_LABELS)
    .join('text')
    .attr('class', d => d.water ? 'map-label water' : 'map-label')
    .text(d => d.text);
}

// Place names keep their size on screen as the map zooms, and only show in the full view.
function positionLabels(animate, k) {
  const labels = labelLayer.selectAll('text')
    .attr('x', d => projection([d.lon, d.lat])[0])
    .attr('y', d => projection([d.lon, d.lat])[1]);
  animated(labels, animate).attr('font-size', LABEL_PX / k).attr('opacity', view === 'all' ? 1 : 0);
}

function drawDots() {
  dotLayer.selectAll('circle')
    .data(dotVisits)
    .join('circle')
    .attr('class', 'visit-dot')
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', v => `${fmtShort.format(v.date)}: ${v.title || v.town || v.venue}. Jump to this visit.`);
}

// Dots keep their size on screen as the map zooms. A visit without coordinates sits in the
// middle of its riding, and visits at the same spot fan out in a ring so each can be clicked.
function dotPosition(v, k) {
  const [x, y] = v.coords ? projection(v.coords) : path.centroid(ridingById.get(v.riding));
  if (v.stackSize < 2) return [x, y];
  const ring = DOT_R * 1.1 / (v.stackSize === 2 ? 1 : Math.sin(Math.PI / v.stackSize));
  const a = 2 * Math.PI * v.stackIndex / v.stackSize - Math.PI / 2;
  return [x + ring * Math.cos(a) / k, y + ring * Math.sin(a) / k];
}

function positionDots(animate, k) {
  animated(dotLayer.selectAll('circle'), animate)
    .attr('r', DOT_R / k)
    .attr('cx', v => dotPosition(v, k)[0])
    .attr('cy', v => dotPosition(v, k)[1]);
}
