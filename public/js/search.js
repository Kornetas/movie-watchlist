import { texts } from "./language.js";
import { loadMovies, getCachedMovies } from "./movieList.js";
import { showMessage } from "./utils.js";

function normalizeTitleAndYear(title) {
  const yearMatch = title.match(/\((\d{4})\)$/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  const cleanTitle = yearMatch
    ? title.replace(/\s*\(\d{4}\)$/, "").trim()
    : title.trim();
  return { cleanTitle: cleanTitle.toLowerCase(), year };
}

function titleAlreadyExists(inputTitle, allMovies) {
  const input = normalizeTitleAndYear(inputTitle);

  return allMovies.some((movie) => {
    if (!movie.title) return false;
    const existing = normalizeTitleAndYear(movie.title);

    if (input.cleanTitle === existing.cleanTitle) {
      if (input.year && existing.year) {
        return input.year === existing.year;
      }
      if (!input.year && !existing.year) {
        return true;
      }
    }
    return false;
  });
}

export function setupSearch(languageManager) {
  const searchQuery = document.getElementById("searchQuery");
  const resultsList = document.getElementById("searchResults");
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearSearchBtn");

  const performSearch = async () => {
    const query = searchQuery.value.trim();
    if (query.length < 2) {
      resultsList.innerHTML = "";
      return;
    }

    const lang = languageManager.getCurrent() === "pl" ? "pl-PL" : "en-US";

    fetch(`/api/search?query=${encodeURIComponent(query)}&lang=${lang}`)
      .then((res) => res.json())
      .then(async (results) => {
        resultsList.innerHTML = "";

        const allMovies = await getCachedMovies();

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
            const movieTitleWithYear = movie.release_date
              ? `${movie.title} (${movie.release_date.substring(0, 4)})`
              : movie.title;

            if (titleAlreadyExists(movieTitleWithYear, allMovies)) {
              showMessage(
                texts[languageManager.getCurrent()].duplicateMovie,
                "warning"
              );
              return;
            }

            const payload = {
              title: movieTitleWithYear,
              poster: movie.poster,
              tmdb_link: movie.id
                ? `https://www.themoviedb.org/movie/${movie.id}`
                : null,
              release_year: movie.release_date
                ? parseInt(movie.release_date.substring(0, 4))
                : null,
            };

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
                showMessage(
                  texts[languageManager.getCurrent()].errorAdd,
                  "danger"
                );
                console.error("Error adding movie:", err);
              });
          };

          li.appendChild(img);
          li.appendChild(text);
          li.appendChild(addBtn);
          resultsList.appendChild(li);
        });
      });
  };

  const debouncedSearch = debounce(performSearch, 300);
  searchQuery.addEventListener("input", debouncedSearch);

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

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
