// search.js – handles TMDB movie search and result rendering

import { texts } from "./language.js";
import { showMessage } from "./utils.js";
import { loadMovies } from "./movieList.js";

// initialize search logic
export function setupSearch(languageManager) {
  const searchBtn = document.getElementById("searchBtn");
  const searchQuery = document.getElementById("searchQuery");
  const clearBtn = document.getElementById("clearSearchBtn");
  const resultsList = document.getElementById("searchResults");

  // search on button click
  searchBtn.addEventListener("click", () => {
    const query = searchQuery.value.trim();
    if (!query) {
      showMessage(texts[languageManager.getCurrent()].emptySearch, "warning");
      return;
    }

    const lang = languageManager.getCurrent() === "pl" ? "pl-PL" : "en-US";

    fetch(`/api/search?query=${encodeURIComponent(query)}&lang=${lang}`)
      .then((res) => res.json())
      .then((results) => {
        resultsList.innerHTML = "";

        results.forEach((movie) => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex align-items-center";

          // poster
          const img = document.createElement("img");
          img.src = movie.poster
            ? `https://image.tmdb.org/t/p/w154${movie.poster}`
            : "/img/no-poster.png";
          img.alt = movie.title;
          img.className = "me-3";
          img.style.width = "92px";
          img.style.height = "138px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "4px";

          // movie title
          const text = document.createElement("div");
          text.innerText = movie.release_date
            ? `${movie.title} (${movie.release_date.substring(0, 4)})`
            : movie.title;

          // add button
          const addBtn = document.createElement("button");
          addBtn.className = "btn btn-sm btn-primary ms-auto";
          addBtn.textContent = texts[languageManager.getCurrent()].addBtn;

          addBtn.onclick = () => {
            fetch("/api/movies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: movie.title,
                poster: movie.poster,
              }),
            })
              .then((res) => {
                if (!res.ok) throw new Error(res.status.toString());
                loadMovies(languageManager);
                resultsList.innerHTML = "";
                document.getElementById("searchQuery").value = "";
              })
              .catch((err) => {
                const t = texts[languageManager.getCurrent()];
                if (err.message === "409") {
                  showMessage(t.duplicateMovie, "warning");
                } else {
                  showMessage(t.errorAdd, "danger");
                  console.error("Error adding movie:", err);
                }
              });
          };

          li.appendChild(img);
          li.appendChild(text);
          li.appendChild(addBtn);
          resultsList.appendChild(li);
        });
      });
  });

  // search on Enter key
  searchQuery.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  // clear search results
  clearBtn.addEventListener("click", () => {
    searchQuery.value = "";
    resultsList.innerHTML = "";
    showMessage(texts[languageManager.getCurrent()].searchCleared, "info");
  });
}
