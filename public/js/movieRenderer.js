import { texts } from "./language.js";
import { updateStats } from "./movieList.js";

// Convert 'added_at' from string to Date object for each movie
function parseMovieDates(movies) {
  movies.forEach((movie) => {
    if (typeof movie.added_at === "string") {
      movie.added_at = new Date(movie.added_at);
    }
  });
}

// Filter movies by current filter and search text
function filterMovies(movies, currentFilter, lastLocalSearch) {
  return movies.filter((movie) => {
    const matchesFilter =
      (currentFilter === "watched" && movie.watched) ||
      (currentFilter === "unwatched" && !movie.watched) ||
      (currentFilter === "favorite" && movie.favorite) ||
      currentFilter === "all";

    const searchText = (lastLocalSearch || "").toLowerCase();
    const title = movie.title || "";
    const titlePl = movie.title_pl || "";
    const titleEn = movie.title_en || "";

    const matchesSearch =
      !lastLocalSearch ||
      title.toLowerCase().includes(searchText) ||
      titlePl.toLowerCase().includes(searchText) ||
      titleEn.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });
}

// Sort movies based on current sorting method
function sortMovies(movies, currentSort) {
  if (currentSort) {
    movies.sort((a, b) => {
      if (currentSort === "az") return a.title.localeCompare(b.title);
      if (currentSort === "za") return b.title.localeCompare(a.title);
      if (currentSort === "newest")
        return new Date(b.added_at) - new Date(a.added_at);
      if (currentSort === "oldest")
        return new Date(a.added_at) - new Date(b.added_at);
      return 0;
    });
  }
}

function createMovieListItem(movie, lang, languageManager, loadMovies) {
  const li = document.createElement("li");
  li.className =
    "list-group-item d-flex flex-wrap align-items-center justify-content-between gap-3";

  // === Watched section ===
  const watchedContainer = document.createElement("div");
  watchedContainer.className = "d-flex align-items-center gap-1";
  watchedContainer.style.padding = "0.25rem 0.5rem";
  watchedContainer.style.borderRadius = "6px";
  watchedContainer.style.backgroundColor = "#fdf0d5";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "form-check-input";
  checkbox.checked = !!movie.watched;
  checkbox.name = `watched-${movie.id}`;
  checkbox.onchange = () => {
    fetch(`/api/movies/${movie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: checkbox.checked }),
    }).then(() => loadMovies(languageManager));
  };

  const watchedLabel = document.createElement("span");
  watchedLabel.className = "ms-1";
  watchedLabel.textContent = lang === "pl" ? "Obejrzane" : "Watched";

  watchedContainer.appendChild(checkbox);
  watchedContainer.appendChild(watchedLabel);

  // === Poster section ===
  const img = document.createElement("img");
  img.src = movie.poster
    ? `https://image.tmdb.org/t/p/w154${movie.poster}`
    : "/img/no-poster.png";
  img.alt = movie.title;
  img.className = "me-3";
  img.style.width = "120px";
  img.style.height = "180px";
  img.style.objectFit = "cover";
  img.style.borderRadius = "6px";
  img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  img.style.cursor = movie.tmdb_link ? "pointer" : "default";
  if (movie.tmdb_link) {
    img.onclick = () => {
      window.open(movie.tmdb_link, "_blank", "noopener");
    };
  }

  // === Title and date section ===
  const titleSection = document.createElement("div");
  titleSection.className = "d-flex flex-column";
  titleSection.style.maxWidth = "300px";
  titleSection.style.minWidth = "200px";
  titleSection.style.flex = "1";
  titleSection.style.wordBreak = "break-word";
  titleSection.style.whiteSpace = "normal";

  const titleText = document.createElement("div");
  titleText.textContent = movie.title || "Brak tytułu";
  titleText.style.fontWeight = "bold";
  titleText.style.wordBreak = "break-word";
  titleText.style.whiteSpace = "normal";

  const dateText = document.createElement("div");
  dateText.style.fontWeight = "bold";
  dateText.style.color = "#9a031e";
  dateText.style.fontSize = "1rem";
  dateText.style.marginTop = "4px";

  if (movie.added_at instanceof Date && !isNaN(movie.added_at)) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    dateText.textContent = movie.added_at.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  titleSection.appendChild(titleText);
  titleSection.appendChild(dateText);

  if (movie.tmdb_link) {
    const tmdbLink = document.createElement("a");
    tmdbLink.href = movie.tmdb_link;
    tmdbLink.target = "_blank";
    tmdbLink.rel = "noopener noreferrer";
    tmdbLink.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 0.4rem;">
        🌐 <strong>${lang === "pl" ? "Zobacz na TMDB" : "View on TMDB"}</strong>
      </span>
    `;

    tmdbLink.className = "btn btn-primary btn-sm mt-2";

    tmdbLink.style.fontSize = "0.75rem";
    tmdbLink.style.textTransform = "uppercase";
    tmdbLink.style.letterSpacing = "0.5px";
    tmdbLink.style.fontWeight = "600";
    tmdbLink.style.border = "none";
    tmdbLink.style.backgroundColor = "#0d6efd";
    tmdbLink.style.color = "white";
    tmdbLink.style.boxShadow = "0 2px 6px rgba(13, 110, 253, 0.4)";

    titleSection.appendChild(tmdbLink);
  }

  const favoriteRatingSection = document.createElement("div");
  favoriteRatingSection.className = "d-flex align-items-center gap-2";

  // === Favorite (heart) section ===
  const favoriteSection = document.createElement("div");
  favoriteSection.className =
    "d-flex justify-content-center align-items-center";
  favoriteSection.style.minWidth = "50px";

  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "favorite-btn";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  if (movie.favorite) {
    favoriteBtn.classList.add("active");
  }
  favoriteBtn.title = lang === "pl" ? "Ulubiony" : "Favorite";
  favoriteBtn.onclick = () => {
    fetch(`/api/movies/${movie.id}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !movie.favorite }),
    }).then(() => loadMovies(languageManager));
  };

  favoriteSection.appendChild(favoriteBtn);

  // === Rating (stars) section ===
  const ratingSection = document.createElement("div");
  ratingSection.className = "d-flex justify-content-center align-items-center";
  ratingSection.style.width = "140px";
  ratingSection.style.flexShrink = "0";
  ratingSection.style.textAlign = "center";

  const ratingContainer = document.createElement("div");
  ratingContainer.className = "rating d-flex justify-content-center gap-1";
  ratingContainer.style.width = "100px";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = i <= movie.rating ? "⭐" : "☆";
    star.style.cursor = "pointer";
    star.style.fontSize = "1.2rem";
    star.style.flex = "0 0 18px";
    star.onclick = () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => loadMovies(languageManager));
    };
    ratingContainer.appendChild(star);
  }

  ratingSection.appendChild(ratingContainer);

  // === Delete button ===
  const removeBtn = document.createElement("button");
  removeBtn.textContent = texts[languageManager.getCurrent()].removeBtn;
  removeBtn.className = "btn btn-sm btn-danger";
  removeBtn.onclick = () => {
    fetch(`/api/movies/${movie.id}`, {
      method: "DELETE",
    }).then(() => loadMovies(languageManager));
  };

  // === Note textarea ===
  const noteArea = document.createElement("textarea");
  noteArea.className = "form-control mt-2 fw-bold";
  noteArea.style.backgroundColor = "#fdf0d5";
  noteArea.rows = 2;
  noteArea.placeholder = lang === "pl" ? "Dodaj notatkę..." : "Add a note...";
  noteArea.name = `note-${movie.id}`;
  noteArea.value = movie.note || "";
  noteArea.addEventListener("change", () => {
    fetch(`/api/movies/${movie.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteArea.value }),
    }).then(() => console.log("Note updated"));
  });

  // if watched -> line-through title
  if (checkbox.checked) {
    titleText.style.textDecoration = "line-through";
  }

  // FINAL APPEND
  li.appendChild(watchedContainer);
  li.appendChild(img);
  li.appendChild(titleSection);
  li.appendChild(favoriteSection);
  li.appendChild(ratingSection);
  li.appendChild(removeBtn);
  li.appendChild(noteArea);

  return li;
}

// Main function
export function renderMovieList(
  movies,
  lang,
  languageManager,
  loadMovies,
  currentFilter,
  currentSort,
  lastLocalSearch
) {
  const list = document.getElementById("movieList");
  list.innerHTML = "";

  parseMovieDates(movies);
  const filteredMovies = filterMovies(movies, currentFilter, lastLocalSearch);
  sortMovies(filteredMovies, currentSort);

  filteredMovies.forEach((movie) => {
    const li = createMovieListItem(movie, lang, languageManager, loadMovies);
    list.appendChild(li);
  });

  const watchedCount = movies.filter((m) => m.watched).length;
  const unwatchedCount = movies.filter((m) => !m.watched).length;
  const favoriteCount = movies.filter((m) => m.favorite).length;
  const totalMovies = movies.length;

  updateStats(watchedCount, unwatchedCount, favoriteCount, totalMovies, lang);
}
