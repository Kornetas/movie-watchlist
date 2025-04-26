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

// Create a single movie <li> element with poster, title, TMDB link, checkbox, favorite button, rating, delete button, and note
function createMovieListItem(movie, lang, languageManager, loadMovies) {
  const li = document.createElement("li");
  li.className =
    "list-group-item d-flex justify-content-between align-items-center";

  // Poster
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

  if (movie.tmdb_link) {
    img.style.cursor = "pointer";
    img.onclick = () => {
      window.open(movie.tmdb_link, "_blank", "noopener");
    };
  }

  // Title + data
  const titleSpan = document.createElement("div");
  titleSpan.className = "d-flex flex-column";

  const titleText = document.createElement("div");
  titleText.textContent = movie.title || "Brak tytułu";

  const dateText = document.createElement("small");
  dateText.className = "text-muted";

  if (movie.added_at instanceof Date && !isNaN(movie.added_at)) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    dateText.textContent = movie.added_at.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  titleSpan.appendChild(titleText);
  titleSpan.appendChild(dateText);

  if (movie.tmdb_link) {
    const tmdbLink = document.createElement("a");
    tmdbLink.href = movie.tmdb_link;
    tmdbLink.target = "_blank";
    tmdbLink.rel = "noopener noreferrer";
    tmdbLink.textContent = lang === "pl" ? "Zobacz na TMDB" : "View on TMDB";
    tmdbLink.style.fontSize = "0.8rem";
    tmdbLink.style.display = "block";
    tmdbLink.style.marginTop = "4px";
    tmdbLink.style.color = "#0d6efd";
    tmdbLink.style.textDecoration = "none";
    tmdbLink.onmouseover = () => (tmdbLink.style.textDecoration = "underline");
    tmdbLink.onmouseout = () => (tmdbLink.style.textDecoration = "none");

    titleSpan.appendChild(tmdbLink);
  }

  // Checkbox: viewed
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

  // Text label
  const watchedLabel = document.createElement("span");
  watchedLabel.className = "ms-1";
  watchedLabel.textContent = lang === "pl" ? "Obejrzane" : "Watched";

  // Wrapper for checkbox + label
  const watchedContainer = document.createElement("div");
  watchedContainer.className = "d-flex align-items-center gap-1";
  watchedContainer.style.padding = "0.25rem 0.5rem";
  watchedContainer.style.borderRadius = "6px";
  watchedContainer.style.backgroundColor = "rgba(3, 19, 235, 0.26)";

  watchedContainer.appendChild(checkbox);
  watchedContainer.appendChild(watchedLabel);

  // Heart button
  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "favorite-btn me-2";
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

  // Rating stars
  const ratingContainer = document.createElement("div");
  ratingContainer.className = "rating";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = i <= movie.rating ? "⭐" : "☆";
    star.style.cursor = "pointer";
    star.onclick = () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => loadMovies(languageManager));
    };
    ratingContainer.appendChild(star);
  }

  // Delete button
  const removeBtn = document.createElement("button");
  removeBtn.textContent = texts[languageManager.getCurrent()].removeBtn;
  removeBtn.className = "btn btn-sm btn-danger";
  removeBtn.onclick = () => {
    fetch(`/api/movies/${movie.id}`, {
      method: "DELETE",
    }).then(() => loadMovies(languageManager));
  };

  // Note
  const noteArea = document.createElement("textarea");
  noteArea.className = "form-control mt-2";
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

  // final layout
  if (checkbox.checked) {
    titleText.style.textDecoration = "line-through";
  }

  li.appendChild(watchedContainer);
  li.appendChild(img);
  li.appendChild(titleSpan);
  li.appendChild(favoriteBtn);
  li.appendChild(ratingContainer);
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

  const watchedCount = filteredMovies.filter((m) => m.watched).length;
  const unwatchedCount = filteredMovies.length - watchedCount;
  const totalMovies = movies.length;

  updateStats(watchedCount, unwatchedCount, lang, totalMovies);
}
