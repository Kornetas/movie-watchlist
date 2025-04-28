import { texts } from "./language.js";
import { createTableRow } from "./tableRenderer.js";
import { createMovieCard } from "./cardRenderer.js";

export let currentFilter = "all"; // all | watched | unwatched | favorite
export let currentSort = "newest"; // newest | oldest | az | za
export let lastWatched = 0;
export let lastUnwatched = 0;
export let lastFavorites = 0;
export let lastTotalMovies = 0;
let lastLocalSearch = "";

let cachedMovies = [];

// Set current filter
export function setCurrentFilter(value) {
  currentFilter = value;
}

// Set current sort
export function setCurrentSort(value) {
  currentSort = value;
}

// Update local search query
export function setLocalSearch(value) {
  lastLocalSearch = value.toLowerCase();
}

// Update the stats counters
export function updateStats(watched, unwatched, favorites, totalMovies, lang) {
  const t = texts[lang];

  lastWatched = watched;
  lastUnwatched = unwatched;
  lastFavorites = favorites;
  lastTotalMovies = totalMovies;

  document.getElementById(
    "totalCount"
  ).textContent = `${t.total}: ${totalMovies}`;
  document.getElementById(
    "watchedCount"
  ).textContent = `${t.watched}: ${watched}`;
  document.getElementById(
    "unwatchedCount"
  ).textContent = `${t.unwatched}: ${unwatched}`;
  document.getElementById(
    "favoriteFilter"
  ).textContent = `${t.favoriteFilter} ${favorites}`;
}

// Load movies from API or from localStorage
export function loadMovies(languageManager) {
  if (!languageManager) {
    console.warn("Missing languageManager");
    return;
  }

  fetch("/api/movies")
    .then((res) => res.json())
    .then((movies) => {
      cachedMovies = movies;
      localStorage.setItem("cachedMovies", JSON.stringify(movies));
      renderMovies(movies, languageManager);
    })
    .catch(() => {
      console.warn("Backend not available. Using cache.");
      const cached = localStorage.getItem("cachedMovies");
      if (cached) {
        const movies = JSON.parse(cached);
        cachedMovies = movies;
        renderMovies(movies, languageManager);
      } else {
        console.error("No movie data available.");
      }
    });
}

// Re-render cached movies (when language is changed)
export function rerenderCachedMovies(languageManager) {
  const cached = localStorage.getItem("cachedMovies");
  if (cached) {
    const movies = JSON.parse(cached);
    movies.forEach((movie) => {
      if (typeof movie.added_at === "string") {
        movie.added_at = new Date(movie.added_at);
      }
    });
    cachedMovies = movies;
    renderMovies(movies, languageManager);
  }
}

// Render movies to table or mobile cards
function renderMovies(movies, languageManager) {
  const lang = languageManager.getCurrent();
  const table = document.querySelector("table");
  const movieList = document.getElementById("movieList");
  const movieCards = document.getElementById("movieCards");

  movieList.innerHTML = "";
  movieCards.innerHTML = "";

  // Update table header
  const oldThead = document.getElementById("movieTableHeader");
  if (oldThead) oldThead.remove();
  const newThead = document.createElement("thead");
  newThead.id = "movieTableHeader";
  const headerRow = document.createElement("tr");

  const headers = [
    texts[lang].headerPoster,
    texts[lang].headerTitle,
    texts[lang].headerDate,
    texts[lang].headerTmdb,
    texts[lang].headerNote,
    texts[lang].headerWatched,
    texts[lang].headerFavorite,
    texts[lang].headerRating,
    texts[lang].headerRemove,
  ];

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  newThead.appendChild(headerRow);
  table.insertBefore(newThead, table.firstChild);

  // Apply filters
  let filtered = movies.filter((movie) => {
    const matchesFilter =
      (currentFilter === "watched" && movie.watched) ||
      (currentFilter === "unwatched" && !movie.watched) ||
      (currentFilter === "favorite" && movie.favorite) ||
      currentFilter === "all";

    const search = lastLocalSearch || "";
    const title =
      (movie.title || "") + (movie.title_pl || "") + (movie.title_en || "");
    const matchesSearch = title.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  // Apply sorting
  if (currentSort === "newest") {
    filtered.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
  } else if (currentSort === "oldest") {
    filtered.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));
  } else if (currentSort === "az") {
    filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (currentSort === "za") {
    filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  }

  // Render each movie
  filtered.forEach((movie) => {
    const tr = createTableRow(movie, lang);
    const card = createMovieCard(movie, lang);
    movieList.appendChild(tr);
    movieCards.appendChild(card);
  });

  // Update stats
  updateStats(
    movies.filter((m) => m.watched).length,
    movies.filter((m) => !m.watched).length,
    movies.filter((m) => m.favorite).length,
    movies.length,
    lang
  );
}

// Return cached movies
export function getCachedMovies() {
  return cachedMovies;
}
