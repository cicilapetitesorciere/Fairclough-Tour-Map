// File locations, and the fixed settings the map is built from.
const BOUNDARIES_FILE = 'ridings.geojson';
const CONTEXT_FILE = 'context.geojson';
const ENDORSEMENTS_FILE = 'endorsements/endorsements.json';

const ZOOM_MS = 650;   // length of the zoom animation
const MAX_ZOOM = 600;  // how far in the map zooms; the smallest city ridings need most of it
const PHOTO_PX = 44;   // diameter of a photo on the map once zoomed in; they start at about a third of this

// The ambient slideshow: how long the map must be left alone before it starts, how long each photo
// shows for, and the pause between photos.
const SLIDESHOW_IDLE_MS = 3000;
const SLIDESHOW_HOLD_MS = 3000;
const SLIDESHOW_GAP_MS = 300;
// How often the slideshow shows an endorsement's pull quote instead of a photo.
const SLIDESHOW_QUOTE_CHANCE = 0.25;
// Bigger ridings come up more often: a riding's chance grows with its area to this power. 1/3 gives the
// few huge northern ridings about 40% of the photos without any one riding taking over; 0 is all equal.
const SLIDESHOW_SIZE_WEIGHT = 1 / 3;
