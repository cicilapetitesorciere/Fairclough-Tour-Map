// The search box over the map: suggests ridings as you type, and opens the one you pick.
const searchInput = document.getElementById('search-input');
const searchList = document.getElementById('search-list');
const MAX_SUGGESTIONS = 8;

let suggestions = [];  // ridings currently listed
let active = -1;       // which suggestion is highlighted, or -1

// Lower-case, no accents, and dashes and punctuation as spaces: "Orleans" finds Orléans and
// "kenora rainy" finds Kenora—Rainy River.
const simplify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Ridings whose name contains every word typed, those starting with the query first.
function findRidings(query) {
  const q = simplify(query);
  if (!q) return [];
  const words = q.split(' ');
  return features
    .map(f => ({ f, name: simplify(f.properties.name) }))
    .filter(({ name }) => words.every(w => name.includes(w)))
    .sort((a, b) => (b.name.startsWith(q) - a.name.startsWith(q)) || a.f.properties.name.localeCompare(b.f.properties.name))
    .slice(0, MAX_SUGGESTIONS)
    .map(({ f }) => f);
}

function renderSuggestions() {
  searchList.replaceChildren(...suggestions.map((f, i) =>
    el('li', { role: 'option', id: 'search-opt-' + i, 'aria-selected': String(i === active) }, f.properties.name)));
  const open = suggestions.length > 0;
  searchList.hidden = !open;
  searchInput.setAttribute('aria-expanded', String(open));
  if (active >= 0) searchInput.setAttribute('aria-activedescendant', 'search-opt-' + active);
  else searchInput.removeAttribute('aria-activedescendant');
}

function closeSuggestions() {
  suggestions = [];
  active = -1;
  renderSuggestions();
}

function choose(f) {
  closeSuggestions();
  searchInput.value = '';
  searchInput.blur();
  openRiding(f);
}

searchInput.addEventListener('input', () => {
  suggestions = findRidings(searchInput.value);
  active = -1;
  renderSuggestions();
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!suggestions.length) return;
    e.preventDefault();
    const step = e.key === 'ArrowDown' ? 1 : -1;
    active = (active + step + suggestions.length) % suggestions.length;
    renderSuggestions();
  } else if (e.key === 'Enter') {
    const pick = suggestions[active >= 0 ? active : 0];
    if (pick) { e.preventDefault(); choose(pick); }
  } else if (e.key === 'Escape' && (suggestions.length || searchInput.value)) {
    e.stopPropagation();  // closes the list, without also zooming the map back out
    searchInput.value = '';
    closeSuggestions();
  }
});

// mousedown rather than click, so the pick lands before the box loses focus and closes the list.
searchList.addEventListener('mousedown', e => {
  e.preventDefault();
  const i = [...searchList.children].indexOf(e.target.closest('li'));
  if (i >= 0) choose(suggestions[i]);
});
searchInput.addEventListener('blur', closeSuggestions);
