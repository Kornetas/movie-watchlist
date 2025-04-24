// manualAdd.js – handles adding movies by typing title manually

import { texts } from "./language.js";
import { showMessage } from "./utils.js";
import { loadMovies } from "./movieList.js";

// setup logic for manual movie adding
export function setupManualAdd(languageManager) {
  const addBtn = document.getElementById("addManualBtn");
  const titleInput = document.getElementById("manualTitle");

  // click on "Add" button
  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    if (!title) {
      showMessage(texts[languageManager.getCurrent()].emptyManual, "warning");
      return;
    }

    fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }), // no poster here
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        loadMovies(languageManager);
        titleInput.value = "";
      })
      .catch((err) => {
        const t = texts[languageManager.getCurrent()];
        if (err.message === "409") {
          showMessage(t.duplicateMovie, "warning");
        } else {
          showMessage(t.errorAdd, "danger");
          console.error("Manual add error:", err);
        }
      });
  });

  // support Enter key to trigger add
  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addBtn.click();
    }
  });
}
