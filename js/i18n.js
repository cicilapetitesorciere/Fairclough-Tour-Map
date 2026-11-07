// The map in English or French. `?lang=fr` wins, then the document's own lang.
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "fr" || q === "en") return q;
  return (document.documentElement.lang || "").toLowerCase().startsWith("fr") ? "fr" : "en";
})();
const IS_FR = LANG === "fr";

const T = IS_FR ? {
  title: "Journal de tournée de Lee Fairclough",
  searchPlaceholder: "Trouvez votre circonscription…",
  searchLabel: "Trouvez votre circonscription",
  mapLabel: "Carte des circonscriptions provinciales de l'Ontario",
  zoomIn: "Zoom avant",
  zoomOut: "Zoom arrière",
  close: "Fermer",
  empty: "Rien ici pour le moment.",
  photos: n => (n === 1 ? "1 photo" : `${n} photos`),
  endorsements: "Appuis",
  readMore: "Lire l'appui complet",
} : {
  title: "Lee Fairclough Tour Log",
  searchPlaceholder: "Find your riding…",
  searchLabel: "Find your riding",
  mapLabel: "Map of Ontario's provincial ridings",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  close: "Close",
  empty: "Nothing here yet.",
  photos: n => (n === 1 ? "1 photo" : `${n} photos`),
  endorsements: "Endorsements",
  readMore: "Read the full endorsement",
};

// The riding's name in the current language.
const ridingName = f => (IS_FR && f.properties.name_fr) || f.properties.name;

// The static text in index.html.
document.title = T.title;
const searchInputEl = document.getElementById("search-input");
searchInputEl.placeholder = T.searchPlaceholder;
searchInputEl.setAttribute("aria-label", T.searchLabel);
document.getElementById("map").setAttribute("aria-label", T.mapLabel);
document.getElementById("zoom-in").setAttribute("aria-label", T.zoomIn);
document.getElementById("zoom-out").setAttribute("aria-label", T.zoomOut);
document.getElementById("info-close").setAttribute("aria-label", T.close);
