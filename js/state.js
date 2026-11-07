// Page elements, the SVG layers, the map projection and the shared state.
const notice = document.getElementById('notice');
const mapBox = document.getElementById('map-box');
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const tip = document.getElementById('tip');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Map layers, bottom to top. `g` is the group that zooms.
const svg = d3.select('#map');
const g = svg.append('g');
const contextLayer = g.append('g');                            // neighbouring provinces and states
const ridingLayer = g.append('g');                             // Ontario's ridings
const photoLayer = g.append('g').attr('class', 'photo-layer');  // a small round photo for each photo in a riding

// Same Lambert Conformal Conic parameters as Elections Ontario's shapefile.
const projection = d3.geoConicConformal().rotate([84, 0]).parallels([44.5, 54.5]);
const path = d3.geoPath(projection);

let features = [];                 // riding GeoJSON features
let shapes = d3.select(null);      // the riding <path>s
const ridingById = new Map();      // riding number -> feature
const endorsementsByRiding = new Map();  // riding name -> the endorsements tied to it
let transform = d3.zoomIdentity;   // the map's current pan and zoom
let zoomTarget = null;             // the number of the riding the map was zoomed to; null once the viewer moves it
