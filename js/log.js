// The schedule on the left: a card per visit under its day, and scrolling to a visit.
function renderFeed(visits) {
  feed.replaceChildren(...d3.groups(visits, v => v.dateKey).map(([, day]) =>
    el('section', { class: 'day' },
      el('h2', { class: 'day-head' }, dayHeading(day[0].date)),
      ...day.map(visitCard))));
}

function visitCard(v) {
  const riding = ridingById.get(v.riding)?.properties.name ?? 'Riding not found in boundaries';
  // The heading is the title if there is one, otherwise the town, so only a titled card repeats the town.
  const venue = v.title ? [v.venue, v.town].filter(Boolean).join(', ') : v.venue;
  return el('article', { class: 'entry', id: 'visit-' + v.i },
    el('h3', {}, v.title || v.town || riding),
    venue ? el('p', { class: 'venue' }, venue) : null,
    v.notes ? el('p', { class: 'notes' }, v.notes) : null,
    v.photo ? el('figure', {},
      el('img', { src: v.photo, alt: v.caption || `${v.title || v.town} visit`, loading: 'lazy' }),
      v.caption ? el('figcaption', {}, v.caption) : null) : null,
    el('p', { class: 'kicker' }, `Riding ${v.riding} · ${riding}`));
}

function showNotice(...content) {
  feed.replaceChildren(el('p', { class: 'notice', role: 'status' }, ...content));
}

// Scrolls a visit's card to the top and flashes it, so it's clear where the click landed.
function scrollToVisit(i) {
  const entry = document.getElementById('visit-' + i);
  if (!entry) return;
  entry.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  document.querySelectorAll('.entry.is-flash').forEach(e => e.classList.remove('is-flash'));
  entry.classList.add('is-flash');
  setTimeout(() => entry.classList.remove('is-flash'), 1800);
}
