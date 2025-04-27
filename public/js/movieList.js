import { texts } from "./language.js";
import { renderMovieList } from "./movieRenderer.js";

export let currentFilter = "all"; // all | watched | unwatched | favorite
export let currentSort = "newest"; // newest | oldest | az | za
export let lastWatched = 0;
export let lastUnwatched = 0;
export let lastFavorites = 0;
export let lastTotalMovies = 0;
let lastLocalSearch = ""; // local search query

export function setCurrentFilter(value) {
  currentFilter = value;
}

export function setCurrentSort(value) {
  currentSort = value;
}

// update search term
export function setLocalSearch(value) {
  lastLocalSearch = value.toLowerCase();
}

// update stats in footer
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

// load movies from API or cache
export function loadMovies(languageManager) {
  if (!languageManager) {
    console.warn("Missing languageManager");
    return;
  }

  fetch("/api/movies")
    .then((res) => res.json())
    .then((movies) => {
      localStorage.setItem("cachedMovies", JSON.stringify(movies));
      renderMovieList(
        movies,
        languageManager.getCurrent(),
        languageManager,
        loadMovies,
        currentFilter,
        currentSort,
        lastLocalSearch || ""
      );
    })
    .catch(() => {
      console.warn("Backend not available. Using cache.");
      const cached = localStorage.getItem("cachedMovies");
      if (cached) {
        const movies = JSON.parse(cached);
        renderMovieList(
          movies,
          languageManager.getCurrent(),
          languageManager,
          loadMovies,
          currentFilter,
          currentSort,
          lastLocalSearch || ""
        );
      } else {
        console.error("No movie data available.");
      }
    });
}

// re-render cached movies (after language change)
export function rerenderCachedMovies(languageManager) {
  const cached = localStorage.getItem("cachedMovies");
  if (cached) {
    const movies = JSON.parse(cached);
    movies.forEach((movie) => {
      if (typeof movie.added_at === "string") {
        movie.added_at = new Date(movie.added_at);
      }
    });
    renderMovieList(
      movies,
      languageManager.getCurrent(),
      languageManager,
      loadMovies,
      currentFilter,
      currentSort,
      lastLocalSearch || ""
    );
  }
}
