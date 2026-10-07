// Turns the data files into the shared state.

// Indexes the ridings by number, and works out which close-up region each one belongs to.
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

// One visit per CSV row that has a riding number and a YYYY-MM-DD date, in date order.
function readVisits(text) {
  return d3.csvParse(text, (row, i) => {
    const riding = parseInt(row.riding_number, 10);
    const date = parseDate(row.date);
    if (!Number.isFinite(riding) || !date) return null;
    // The venue's last part is the town: "The Collective, 152 Main St. S., Kenora".
    const parts = (row.venue || '').split(',').map(s => s.trim()).filter(Boolean);
    const town = parts.length > 1 ? parts.pop() : '';
    const lat = parseFloat(row.lat), lon = parseFloat(row.lon);
    return {
      i,
      riding,
      date,
      dateKey: row.date.trim(),
      coords: Number.isFinite(lat) && Number.isFinite(lon) ? [lon, lat] : null,
      venue: parts.join(', '),
      town,
      // Optional columns: add any of these to the CSV and they appear on the card.
      title: (row.title || '').trim(),
      notes: (row.notes || '').trim(),
      photo: (row.photo || '').trim(),
      caption: (row.photo_caption || '').trim(),
    };
  }).sort((a, b) => a.date - b.date || a.i - b.i);
}

// Groups visits by riding, and picks the ones that get a dot: those in a riding visited more
// than once. Dots at the same spot fan out in a ring, so each learns its place in that stack.
function indexVisits(visits) {
  for (const v of visits) {
    if (!visitsByRiding.has(v.riding)) visitsByRiding.set(v.riding, []);
    visitsByRiding.get(v.riding).push(v);
  }
  dotVisits = visits.filter(v => ridingById.has(v.riding) && visitsByRiding.get(v.riding).length > 1);
  const spot = v => v.coords ? v.coords.map(c => c.toFixed(4)).join() : 'riding ' + v.riding;
  for (const stack of d3.group(dotVisits, spot).values()) {
    stack.forEach((v, n) => { v.stackIndex = n; v.stackSize = stack.length; });
  }
}
