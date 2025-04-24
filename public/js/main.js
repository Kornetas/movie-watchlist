// main.js – main entry point that connects all modules

import { texts, LanguageManager } from "./language.js";
import { setupSearch } from "./search.js";
import { setupManualAdd } from "./manualAdd.js";
import {
  loadMovies,
  updateStats,
  setCurrentFilter,
  lastWatched,
  lastUnwatched,
  rerenderCachedMovies,
} from "./movieList.js";

// create the language manager
const languageManager = new LanguageManager();

// change all visible texts depending on language
function applyLanguage() {
  const lang = languageManager.getCurrent();
  const t = texts[lang];

  // update page titles and input placeholders
  document.title = t.title;
  document.getElementById("pageTitle").textContent = t.title;
  document.getElementById("mainHeading").textContent = t.title;
  document.getElementById("searchQuery").placeholder = t.searchPlaceholder;
  document.getElementById("searchBtn").textContent = t.searchBtn;
  document.getElementById("manualTitle").placeholder = t.addPlaceholder;
  document.getElementById("addManualBtn").textContent = t.addBtn;
  document.getElementById("langToggle").textContent = t.langBtn;
  document.getElementById("clearSearchBtn").textContent = t.clearBtn;

  // update stats section
  updateStats(lastWatched, lastUnwatched, lang);

  // update all "Remove" buttons currently visible
  const removeBtns = document.querySelectorAll("#movieList .btn-danger");
  removeBtns.forEach((btn) => {
    btn.textContent = texts[lang].removeBtn;
  });

  // rerender movie list from cache to update date format
  rerenderCachedMovies(languageManager);

  // if there any active search query rerun TMDB search in new language
  const currentQuery = document.getElementById("searchQuery").value.trim();
  if (currentQuery) {
    document.getElementById("searchBtn").click();
  }
}

// setup filtering logic (watched/unwatched/all)
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
}

// setup language toggle button
function setupLanguageSwitch() {
  document.getElementById("langToggle").addEventListener("click", () => {
    languageManager.toggle();
    applyLanguage();
  });
}

// run everything on page load
setupSearch(languageManager);
setupManualAdd(languageManager);
setupFilterButtons();
setupLanguageSwitch();
applyLanguage();
loadMovies(languageManager);
