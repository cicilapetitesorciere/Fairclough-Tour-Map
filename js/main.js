// Loads the data files and starts the page.
async function load() {
  const getJSON = url => fetch(url).then(r => {
    if (!r.ok) throw new Error(url);
    return r.json();
  });
  let geo, contextGeo;
  try {
    [geo, contextGeo] = await Promise.all([
      getJSON(BOUNDARIES_FILE),
      // The neighbouring provinces and states are decoration, so the page still works without them.
      getJSON(CONTEXT_FILE).catch(() => null),
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
  drawContext(contextGeo);
  drawRidings();
  layout();
}

// Indexes the ridings by number, and works out which region each one belongs to.
function indexRidings(geo) {
  features = geo.features;
  for (const f of features) {
    const id = f.properties.id;
    ridingById.set(id, f);
    const [lon, lat] = d3.geoCentroid(f);
    const region = Object.keys(REGIONS).find(key => {
      const { west, east, south, north } = REGIONS[key].box;
      return lon >= west && lon <= east && lat >= south && lat <= north;
    });
    if (region) {
      regionOf.set(id, region);
      regionSize.set(region, (regionSize.get(region) ?? 0) + 1);
    }
  }
}

load();
