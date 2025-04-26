import { texts } from "./language.js";
import { showMessage } from "./utils.js";
import { loadMovies } from "./movieList.js";

// utility function: debounce
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// main function
export function setupSearch(languageManager) {
  const searchQuery = document.getElementById("searchQuery");
  const resultsList = document.getElementById("searchResults");
  const clearBtn = document.getElementById("clearSearchBtn");

  const performSearch = () => {
    const query = searchQuery.value.trim();
    if (query.length < 2) {
      resultsList.innerHTML = "";
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

          const text = document.createElement("div");
          text.innerText = movie.release_date
            ? `${movie.title} (${movie.release_date.substring(0, 4)})`
            : movie.title;

          const addBtn = document.createElement("button");
          addBtn.className = "btn btn-sm btn-primary ms-auto";
          addBtn.textContent = texts[languageManager.getCurrent()].addBtn;

          addBtn.onclick = () => {
            const payload = {
              title: movie.title,
              poster: movie.poster,
              tmdb_link: movie.id
                ? `https://www.themoviedb.org/movie/${movie.id}`
                : null,
            };

            console.log("🎥 Movie object:", movie);

            fetch("/api/movies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
              .then((res) => {
                if (!res.ok) throw new Error(res.status.toString());
                loadMovies(languageManager);
                resultsList.innerHTML = "";
                searchQuery.value = "";
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
  };

  // debounce applied here:
  const debouncedSearch = debounce(performSearch, 300);

  // real time search on input
  searchQuery.addEventListener("input", debouncedSearch);

  // Click on search button, also triggers search
  searchBtn.addEventListener("click", () => {
    const query = searchQuery.value.trim();
    if (!query) {
      showMessage(texts[languageManager.getCurrent()].emptySearch, "warning");
      return;
    }
    performSearch();
  });

  clearBtn.addEventListener("click", () => {
    searchQuery.value = "";
    resultsList.innerHTML = "";
    showMessage(texts[languageManager.getCurrent()].searchCleared, "info");
  });
}
