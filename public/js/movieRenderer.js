import { parseMovieDates } from "./utils.js";
import { filterMovies, sortMovies } from "./filterUtils.js";
import { createTableHeader, createTableRow } from "./tableRenderer.js";
import { createMovieCard } from "./cardRenderer.js";
import { updateStats } from "./movieList.js";

// Render the full movie list (desktop table + mobile cards)
export function renderMovieList(
  movies,
  lang,
  languageManager,
  loadMovies,
  currentFilter,
  currentSort,
  lastLocalSearch
) {
  const list = document.getElementById("movieList");
  const cards = document.getElementById("movieCards");
  const table = document.querySelector("table");

  // Clear previous content
  list.innerHTML = "";
  cards.innerHTML = "";

  // Create and insert table header
  const oldThead = document.getElementById("movieTableHeader");
  if (oldThead) oldThead.remove();
  const newThead = createTableHeader(lang);
  table.insertBefore(newThead, table.firstChild);

  // Prepare data
  parseMovieDates(movies);
  const filtered = filterMovies(movies, currentFilter, lastLocalSearch);
  sortMovies(filtered, currentSort);

  // Add each movie to list
  filtered.forEach((movie) => {
    const tr = createTableRow(movie, lang, languageManager, loadMovies);
    const card = createMovieCard(movie, lang, languageManager, loadMovies);

    list.appendChild(tr);
    cards.appendChild(card);
  });

  // Update counters (Watched, Unwatched, Favorites, All)
  updateStats(
    movies.filter((m) => m.watched).length,
    movies.filter((m) => !m.watched).length,
    movies.filter((m) => m.favorite).length,
    movies.length,
    lang
  );
}
