// manualAdd.js – handles adding movies by typing title manually

import { texts } from "./language.js";
import { showMessage } from "./utils.js";
import { loadMovies } from "./movieList.js";

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

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const lang = languageManager.getCurrent();
    if (!title) {
      showMessage(texts[lang].emptyManual, "warning");
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
        if (err.message === "409") {
          showMessage(texts[lang].duplicateMovie, "warning");
        } else {
          showMessage(texts[lang].errorAdd, "danger");
          console.error("Manual add error:", err);
        }
      });
  });

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addBtn.click();
    }
  });
}
