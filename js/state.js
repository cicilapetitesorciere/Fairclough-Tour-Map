// Page elements, the SVG layers, the map projection and the shared state.
const feed = document.getElementById('feed');
const mapBox = document.getElementById('map-box');
const viewLabel = document.getElementById('view-label');
const backButton = document.getElementById('view-back');
const tip = document.getElementById('tip');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Map layers, bottom to top. `g` is the group that zooms.
const svg = d3.select('#map');
const g = svg.append('g');
const contextLayer = g.append('g');                            // neighbouring provinces and states
const ridingLayer = g.append('g');                             // Ontario's ridings
const labelLayer = g.append('g').attr('class', 'map-labels');  // names of neighbours, lakes and bays
const dotLayer = g.append('g');                                // a dot per visit, in ridings visited more than once

// Same Lambert Conformal Conic parameters as Elections Ontario's shapefile.
const projection = d3.geoConicConformal().rotate([84, 0]).parallels([44.5, 54.5]);
const path = d3.geoPath(projection);

let features = [];                 // riding GeoJSON features
let shapes = d3.select(null);      // the riding <path>s
const ridingById = new Map();      // riding number -> feature
const regionOf = new Map();        // riding number -> REGIONS key, for ridings in a close-up
const regionSize = new Map();      // REGIONS key -> number of ridings in it
const visitsByRiding = new Map();  // riding number -> [visit, ...] in date order
let dotVisits = [];                // visits that get their own dot
let view = 'all';                  // 'all', or a REGIONS key
