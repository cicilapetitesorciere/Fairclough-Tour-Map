// File locations, and the fixed settings and lists the map is built from.
const CSV_FILE = 'tour.csv';
const BOUNDARIES_FILE = 'ridings.geojson';
const CONTEXT_FILE = 'context.geojson';

const ZOOM_MS = 650;  // length of the zoom animation
const DOT_R = 6;      // visit dot radius on screen, whatever the zoom
const LABEL_PX = 11;  // place-name size on screen, whatever the zoom

// The map has a full view plus one close-up per region. A riding belongs to a close-up when
// its centre sits inside that region's box, and the close-up is framed to fit all of them.
const REGIONS = {
  horseshoe: { label: 'Golden Horseshoe', box: { west: -80.0, east: -78.8, south: 42.9, north: 44.1 } },  // Niagara to Durham
  ottawa:    { label: 'Ottawa', box: { west: -76.2, east: -75.4, south: 45.1, north: 45.5 } },
  waterloo:  { label: 'Waterloo Region & Guelph', box: { west: -80.7, east: -80.2, south: 43.25, north: 43.6 } },
  london:    { label: 'London', box: { west: -81.5, east: -81.0, south: 42.6, north: 43.15 } },
  windsor:   { label: 'Windsor–Essex', box: { west: -83.3, east: -82.6, south: 41.9, north: 42.45 } },
};

// Names around the edge of the map, centred on these points. They only show in the full view.
const MAP_LABELS = [
  { text: 'MANITOBA',      lon: -96.6, lat: 54.6 },
  { text: 'QUÉBEC',        lon: -77.6, lat: 49.3 },
  { text: 'MINNESOTA',     lon: -93.0, lat: 47.1 },
  { text: 'WISCONSIN',     lon: -89.6, lat: 45.0 },
  { text: 'MICHIGAN',      lon: -84.6, lat: 44.0 },
  { text: 'OHIO',          lon: -82.7, lat: 40.6 },
  { text: 'PENNSYLVANIA',  lon: -78.0, lat: 40.9 },
  { text: 'NEW YORK',      lon: -75.6, lat: 43.2 },
  { text: 'Hudson Bay',    lon: -81.8, lat: 57.5, water: true },
  { text: 'James Bay',     lon: -80.6, lat: 53.1, water: true },
  { text: 'Lake Superior', lon: -87.6, lat: 47.1, water: true },
  { text: 'Lake Huron',    lon: -82.4, lat: 45.0, water: true },
  { text: 'Lake Erie',     lon: -81.2, lat: 42.15, water: true },
  { text: 'Lake Ontario',  lon: -77.4, lat: 43.62, water: true },
];
