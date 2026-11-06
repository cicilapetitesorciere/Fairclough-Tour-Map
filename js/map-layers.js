// What's drawn around the ridings: the neighbouring provinces and states.

function drawContext(geo) {
  contextLayer.selectAll('path')
    .data(geo ? geo.features : [])
    .join('path')
    .attr('class', 'context-land');
}
