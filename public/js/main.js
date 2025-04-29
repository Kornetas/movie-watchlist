import { texts, LanguageManager } from "./language.js";
import { setupSearch } from "./search.js";
import { setupManualAdd } from "./manualAdd.js";
import {
  loadMovies,
  updateStats,
  setCurrentFilter,
  setCurrentSort,
  setLocalSearch,
  lastWatched,
  lastUnwatched,
  lastFavorites,
  lastTotalMovies,
  rerenderCachedMovies,
} from "./movieList.js";

import { setupConfirmDelete, updateModalLanguage } from "./modalHandler.js";

// Create the language manager (saves language in localStorage)
export const languageManager = new LanguageManager();

// This sets all text in UI to current language (placeholders, buttons, etc.)
function applyLanguage() {
  const lang = languageManager.getCurrent();
  const t = texts[lang];

  // Change page title and placeholders
  document.title = t.title;
  document.getElementById("pageTitle").textContent = t.title;
  document.getElementById("searchQuery").placeholder = t.searchPlaceholder;
  document.getElementById("localSearch").placeholder = t.localSearchPlaceholder;
  document.getElementById("searchBtn").textContent = t.searchBtn;
  document.getElementById("manualTitle").placeholder = t.addPlaceholder;
  document.getElementById("addManualBtn").textContent = t.addBtn;
  document.getElementById("langToggle").textContent = t.langBtn;
  document.getElementById("clearSearchBtn").textContent = t.clearBtn;
  document.getElementById("favoriteFilter").textContent = t.favoriteFilter;
  document.getElementById("clearManualBtn").textContent = t.clearBtn;

  // Update sorting options
  const sortSelect = document.getElementById("sortSelect");
  sortSelect.options[0].text = t.sortDefault;
  sortSelect.options[1].text = t.sortNewest;
  sortSelect.options[2].text = t.sortOldest;
  sortSelect.options[3].text = t.sortAZ;
  sortSelect.options[4].text = t.sortZA;

  // Set counters (watched, favorites, etc.)
  updateStats(lastWatched, lastUnwatched, lastFavorites, lastTotalMovies, lang);

  // Update modal delete confirmation texts
  updateModalLanguage(lang);

  // Update date formatting and text in movie list
  rerenderCachedMovies(languageManager);

  // Rerun search if something is typed
  const currentQuery = document.getElementById("searchQuery").value.trim();
  if (currentQuery) {
    document.getElementById("searchBtn").click();
  }
}

// Add click listeners to filter buttons (watched, favorites, etc.)
function setupFilterButtons() {
  document.getElementById("watchedCount").addEventListener("click", () => {
    setCurrentFilter("watched");
    loadMovies(languageManager);
  });

  document.getElementById("unwatchedCount").addEventListener("click", () => {
    setCurrentFilter("unwatched");
    loadMovies(languageManager);
  });

  document.getElementById("totalCount").addEventListener("click", () => {
    setCurrentFilter("all");
    loadMovies(languageManager);
  });

  document.getElementById("favoriteFilter").addEventListener("click", () => {
    setCurrentFilter("favorite");
    loadMovies(languageManager);
  });

  // Change sort when user selects something
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    setCurrentSort(e.target.value);
    loadMovies(languageManager);
  });
}

// Setup language switcher and local search input
function setupLanguageSwitch() {
  document.getElementById("langToggle").addEventListener("click", () => {
    languageManager.toggle();
    applyLanguage();
  });

  // When typing in local search field, update the list
  const localSearch = document.getElementById("localSearch");
  if (localSearch) {
    localSearch.addEventListener("input", (e) => {
      setLocalSearch(e.target.value);
      loadMovies(languageManager);
    });
  }
}

// Start everything when the page loads
setupSearch(languageManager); // Setup TMDB search
setupManualAdd(languageManager); // Setup manual add
setupFilterButtons(); // Setup filters
setupLanguageSwitch(); // Setup language toggle
setupConfirmDelete(loadMovies, languageManager); // Setup modal delete confirm
applyLanguage(); // Set initial language
loadMovies(languageManager); // Load movie list
