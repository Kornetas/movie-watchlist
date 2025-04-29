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
  const list = document.getElementById("movieList"); // tbody for desktop
  const cards = document.getElementById("movieCards"); // div for mobile
  const table = document.querySelector("table"); // the main table

  // Clear old data before rendering new
  list.innerHTML = "";
  cards.innerHTML = "";

  // Create and insert table header
  const oldThead = document.getElementById("movieTableHeader");
  if (oldThead) oldThead.remove();
  const newThead = createTableHeader(lang);
  table.insertBefore(newThead, table.firstChild);

  // Prepare data: fix dates, filter, sort
  parseMovieDates(movies); // make sure dates are Date objects
  const filtered = filterMovies(movies, currentFilter, lastLocalSearch); // filter by watched/favorite/search
  sortMovies(filtered, currentSort); // sort by selected sort option

  // Add each movie to table and mobile cards
  filtered.forEach((movie) => {
    const tr = createTableRow(movie, lang, languageManager, loadMovies);
    const card = createMovieCard(movie, lang, languageManager, loadMovies);

    list.appendChild(tr); // add row to table
    cards.appendChild(card); // add card to mobile
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
