// Loads the data files and starts the page.
async function load() {
  const getJSON = url => fetch(url).then(r => {
    if (!r.ok) throw new Error(url);
    return r.json();
  });
  let geo, contextGeo, endorsements;
  try {
    [geo, contextGeo, endorsements] = await Promise.all([
      getJSON(BOUNDARIES_FILE),
      // The neighbouring provinces and states are decoration, so the page still works without them.
      getJSON(CONTEXT_FILE).catch(() => null),
      // Endorsements are an extra too: without them the windows just have no endorsements section.
      getJSON(ENDORSEMENTS_FILE).catch(() => []),
    ]);
  } catch {
    notice.replaceChildren(
      `Couldn't load the map data. If you opened this page straight from your computer, browsers block it from reading the files. In this folder, run `,
      el('code', {}, 'python3 -m http.server'),
      ` and open `, el('code', {}, 'http://localhost:8000/'), `.`);
    notice.hidden = false;
    return;
  }

  indexRidings(geo);
  indexEndorsements(endorsements);
  drawContext(contextGeo);
  drawRidings();
  drawPhotos();
  layout();
}

// Indexes the ridings by number.
function indexRidings(geo) {
  features = geo.features;
  for (const f of features) ridingById.set(f.properties.id, f);
}

// Groups the endorsements by the riding they belong to (one with no matching riding on the map is never shown).
function indexEndorsements(list) {
  for (const e of list) {
    if (!e.riding) continue;
    if (!endorsementsByRiding.has(e.riding)) endorsementsByRiding.set(e.riding, []);
    endorsementsByRiding.get(e.riding).push(e);
  }
}

load();
