// What's drawn around the ridings: neighbouring land and place names.

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
