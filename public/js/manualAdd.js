// manualAdd.js – handles adding movies by typing title manually
import { texts } from "./language.js";
import { showMessage } from "./utils.js";
import { loadMovies, getCachedMovies } from "./movieList.js";

// Normalize title and extract year
function normalizeTitleAndYear(title) {
  const yearMatch = title.match(/\((\d{4})\)$/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  const cleanTitle = yearMatch
    ? title.replace(/\s*\(\d{4}\)$/, "").trim()
    : title.trim();
  return { cleanTitle: cleanTitle.toLowerCase(), year };
}

// Check if movie already exists
function titleAlreadyExists(inputTitle, allMovies) {
  const input = normalizeTitleAndYear(inputTitle);

  return allMovies.some((movie) => {
    if (!movie.title) return false;
    const existing = normalizeTitleAndYear(movie.title);

    if (input.cleanTitle === existing.cleanTitle) {
      if (input.year && existing.year) {
        return input.year === existing.year; // Same title and year -> block
      }
      if (!input.year && !existing.year) {
        return true; // Same title without year -> block
      }
    }
    return false;
  });
}

export function setupManualAdd(languageManager) {
  const addBtn = document.getElementById("addManualBtn");
  const titleInput = document.getElementById("manualTitle");
  const clearManualBtn = document.getElementById("clearManualBtn");

  function clearManualInput() {
    titleInput.value = "";
    const lang = languageManager.getCurrent();
    showMessage(texts[lang].manualCleared, "info");
  }

  clearManualBtn.addEventListener("click", clearManualInput);

  addBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const lang = languageManager.getCurrent();
    if (!title) {
      showMessage(texts[lang].emptyManual, "warning");
      return;
    }

    const allMovies = await getCachedMovies();
    if (titleAlreadyExists(title, allMovies)) {
      showMessage(texts[lang].duplicateMovie, "warning");
      return;
    }

    fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        loadMovies(languageManager);
        titleInput.value = "";
      })
      .catch((err) => {
        showMessage(texts[lang].errorAdd, "danger");
        console.error("Manual add error:", err);
      });
  });

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addBtn.click();
    }
  });
}
