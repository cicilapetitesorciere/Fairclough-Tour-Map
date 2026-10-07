// Loads the data files and starts the page.
async function load() {
  const get = (url, read, init) => fetch(url, init).then(r => {
    if (!r.ok) throw new Error(url);
    return r[read]();
  });
  let geo, csv, contextGeo;
  try {
    [geo, csv, contextGeo] = await Promise.all([
      get(BOUNDARIES_FILE, 'json'),
      get(CSV_FILE, 'text', { cache: 'no-store' }),
      // The neighbouring provinces and states are decoration, so the page still works without them.
      get(CONTEXT_FILE, 'json').catch(() => null),
    ]);
  } catch {
    showNotice(
      `Couldn't load the tour data. If you opened this page straight from your computer, browsers block it from reading the CSV. In this folder, run `,
      el('code', {}, 'python3 -m http.server'),
      ` and open `, el('code', {}, 'http://localhost:8000/ontario-ridings.html'), `.`);
    return;
  }

  indexRidings(geo);
  const visits = readVisits(csv);
  indexVisits(visits);

  drawContext(contextGeo);
  drawRidings();
  drawDots();
  layout();

  if (visits.length) renderFeed(visits);
  else showNotice(`No visits in ${CSV_FILE} yet. Add rows with riding_number, date (YYYY-MM-DD) and venue.`);
}
load();
