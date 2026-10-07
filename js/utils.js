// Small helpers: dates, DOM nodes, and animating the map.
const fmtShort = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' });
const fmtWeekday = new Intl.DateTimeFormat('en-CA', { weekday: 'long' });
const fmtMonth = new Intl.DateTimeFormat('en-CA', { month: 'long' });

// "Monday, September 7th"
function dayHeading(d) {
  const n = d.getDate();
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
  return `${fmtWeekday.format(d)}, ${fmtMonth.format(d)} ${n}${suffix}`;
}

// Reads YYYY-MM-DD as a local date, or returns null.
function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || '').trim());
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) if (c != null) node.append(c);
  return node;
}

// A transition for zooming, or the plain selection when there's nothing to animate
// (a resize, or a viewer who prefers reduced motion).
function animated(selection, animate) {
  return animate && !reduceMotion ? selection.transition().duration(ZOOM_MS) : selection.interrupt();
}
