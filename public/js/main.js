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

import { setupConfirmDelete, updateModalLanguage } from "./modalHandler.js"; // 🆕 Import modal

// Create the language manager
export const languageManager = new LanguageManager();

// Apply current language to all visible elements
function applyLanguage() {
  const lang = languageManager.getCurrent();
  const t = texts[lang];

  // Update page titles and input placeholders
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

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.options[0].text = t.sortDefault;
  sortSelect.options[1].text = t.sortNewest;
  sortSelect.options[2].text = t.sortOldest;
  sortSelect.options[3].text = t.sortAZ;
  sortSelect.options[4].text = t.sortZA;

  // Update stats section
  updateStats(lastWatched, lastUnwatched, lastFavorites, lastTotalMovies, lang);

  // Update modal texts 🔥
  updateModalLanguage(lang);

  // Rerender movie list from cache to update date format
  rerenderCachedMovies(languageManager);

  // If any active TMDB search, rerun it
  const currentQuery = document.getElementById("searchQuery").value.trim();
  if (currentQuery) {
    document.getElementById("searchBtn").click();
  }
}

// Setup filtering logic (watched/unwatched/all)
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

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    setCurrentSort(e.target.value);
    loadMovies(languageManager);
  });
}

// Setup language toggle button
function setupLanguageSwitch() {
  document.getElementById("langToggle").addEventListener("click", () => {
    languageManager.toggle();
    applyLanguage();
  });

  const localSearch = document.getElementById("localSearch");
  if (localSearch) {
    localSearch.addEventListener("input", (e) => {
      setLocalSearch(e.target.value);
      loadMovies(languageManager);
    });
  }
}

// Run everything when page loads
setupSearch(languageManager);
setupManualAdd(languageManager);
setupFilterButtons();
setupLanguageSwitch();
setupConfirmDelete(loadMovies, languageManager); // 🆕 Setup confirm delete button logic
applyLanguage();
loadMovies(languageManager);
