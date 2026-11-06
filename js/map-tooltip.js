// The hover pop-up: the name of the riding under the pointer.
const tipName = document.getElementById('tip-name');

function showTip(d, x, y) {
  tipName.textContent = d.properties.name;
  tip.hidden = false;
  // Below-right of the pointer, flipping to the other side near the panel's edges.
  const [w, h] = mapSize();
  let left = x + 14, top = y + 14;
  if (left + tip.offsetWidth > w - 8) left = x - tip.offsetWidth - 14;
  if (top + tip.offsetHeight > h - 8) top = y - tip.offsetHeight - 14;
  tip.style.left = Math.max(8, left) + 'px';
  tip.style.top = Math.max(8, top) + 'px';
}

function hideTip() {
  tip.hidden = true;
}
