import { texts } from "./language.js";
import { showMessage } from "./utils.js";
import { loadMovies, getCachedMovies } from "./movieList.js";

// Normalize movie title and check for year in brackets like (2020)
function normalizeTitleAndYear(title) {
  const yearMatch = title.match(/\((\d{4})\)$/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  const cleanTitle = yearMatch
    ? title.replace(/\s*\(\d{4}\)$/, "").trim()
    : title.trim();
  return { cleanTitle: cleanTitle.toLowerCase(), year };
}

// Check if the movie already exists in the list
function titleAlreadyExists(inputTitle, allMovies) {
  const input = normalizeTitleAndYear(inputTitle);

  return allMovies.some((movie) => {
    if (!movie.title) return false;
    const existing = normalizeTitleAndYear(movie.title);

    // Same title and same year -> already exists
    if (input.cleanTitle === existing.cleanTitle) {
      if (input.year && existing.year) {
        return input.year === existing.year;
      }

      // Both titles don't have year, still same title -> exists
      if (!input.year && !existing.year) {
        return true;
      }
    }
    return false;
  });
}

// Setup logic for manually adding a movie (not from TMDB)
export function setupManualAdd(languageManager) {
  const addBtn = document.getElementById("addManualBtn");
  const titleInput = document.getElementById("manualTitle");
  const clearManualBtn = document.getElementById("clearManualBtn");

  // Clear input and show message
  function clearManualInput() {
    titleInput.value = "";
    const lang = languageManager.getCurrent();
    showMessage(texts[lang].manualCleared, "info");
  }

  // Clear button click
  clearManualBtn.addEventListener("click", clearManualInput);

  // Try to add the movie
  addBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const lang = languageManager.getCurrent();
    if (!title) {
      showMessage(texts[lang].emptyManual, "warning");
      return;
    }

    // Check duplicates
    const allMovies = await getCachedMovies();
    if (titleAlreadyExists(title, allMovies)) {
      showMessage(texts[lang].duplicateMovie, "warning");
      return;
    }

    // Send movie to backend
    fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        loadMovies(languageManager); // Reload after adding
        titleInput.value = "";
      })
      .catch((err) => {
        showMessage(texts[lang].errorAdd, "danger");
        console.error("Manual add error:", err);
      });
  });

  // Allow pressing Enter to add movie
  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addBtn.click();
    }
  });
}
