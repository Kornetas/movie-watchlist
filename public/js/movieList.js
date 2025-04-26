import { texts } from "./language.js";

export let currentFilter = "all"; // all | watched | unwatched | favorite
export let currentSort = "newest"; // newest | oldest | az | za
export let lastWatched = 0;
export let lastUnwatched = 0;
let lastLocalSearch = ""; // local search query

export function setCurrentFilter(value) {
  currentFilter = value;
}

export function setCurrentSort(value) {
  currentSort = value;
}

// update search term
export function setLocalSearch(value) {
  lastLocalSearch = value.toLowerCase();
}

// update stats in footer
export function updateStats(watched, unwatched, lang) {
  const t = texts[lang];

  document.getElementById("totalCount").textContent = `${t.total}: ${
    watched + unwatched
  }`;
  document.getElementById(
    "watchedCount"
  ).textContent = `${t.watched}: ${watched}`;
  document.getElementById(
    "unwatchedCount"
  ).textContent = `${t.unwatched}: ${unwatched}`;

  lastWatched = watched;
  lastUnwatched = unwatched;
}

export function renderMovieList(movies, lang, languageManager, loadMovies) {
  const list = document.getElementById("movieList");
  list.innerHTML = "";

  // Convert added_at string into Date object (important!)
  movies.forEach((movie) => {
    if (typeof movie.added_at === "string") {
      movie.added_at = new Date(movie.added_at);
    }
  });

  // Apply all filters and search together
  const filteredMovies = movies.filter((movie) => {
    const matchesFilter =
      (currentFilter === "watched" && movie.watched) ||
      (currentFilter === "unwatched" && !movie.watched) ||
      (currentFilter === "favorite" && movie.favorite) ||
      currentFilter === "all";

    const searchText = lastLocalSearch.toLowerCase();
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

  // Sort movies
  filteredMovies.sort((a, b) => {
    if (currentSort === "az") return a.title.localeCompare(b.title);
    if (currentSort === "za") return b.title.localeCompare(a.title);
    if (currentSort === "newest")
      return new Date(b.added_at) - new Date(a.added_at);
    if (currentSort === "oldest")
      return new Date(a.added_at) - new Date(b.added_at);
    return 0;
  });

  // Render movies
  let watchedCount = 0;

  filteredMovies.forEach((movie) => {
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

    // TMDB link click
    if (movie.tmdb_link) {
      img.style.cursor = "pointer";
      img.onclick = () => {
        window.open(movie.tmdb_link, "_blank", "noopener");
      };
    }

    // title + date
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
    } else {
      console.warn("Brak poprawnej daty dla filmu:", movie);
    }

    titleSpan.appendChild(titleText);
    titleSpan.appendChild(dateText);

    // Link to TMDB
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
      tmdbLink.onmouseover = () =>
        (tmdbLink.style.textDecoration = "underline");
      tmdbLink.onmouseout = () => (tmdbLink.style.textDecoration = "none");

      titleSpan.appendChild(tmdbLink);
    }

    // Checkbox watched
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input me-2";
    checkbox.checked = !!movie.watched;
    checkbox.name = `watched-${movie.id}`;
    checkbox.onchange = () => {
      fetch(`/api/movies/${movie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched: checkbox.checked }),
      }).then(() => loadMovies(languageManager));
    };

    // ❤️ Favorite button
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

    // ⭐ Rating stars
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

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = texts[languageManager.getCurrent()].removeBtn;
    removeBtn.className = "btn btn-sm btn-danger";
    removeBtn.onclick = () => {
      fetch(`/api/movies/${movie.id}`, {
        method: "DELETE",
      }).then(() => loadMovies(languageManager));
    };

    // Note textarea
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

    // Build list item
    if (checkbox.checked) {
      watchedCount++;
      titleText.style.textDecoration = "line-through";
    }

    li.appendChild(checkbox);
    li.appendChild(img);
    li.appendChild(titleSpan);
    li.appendChild(favoriteBtn);
    li.appendChild(ratingContainer);
    li.appendChild(removeBtn);
    li.appendChild(noteArea);
    list.appendChild(li);
  });

  // Update stats
  const totalUnwatched = movies.length - watchedCount;
  updateStats(watchedCount, totalUnwatched, lang);
}

// load movies from API or cache
export function loadMovies(languageManager) {
  if (!languageManager) {
    console.warn("Missing languageManager");
    return;
  }

  fetch("/api/movies")
    .then((res) => res.json())
    .then((movies) => {
      localStorage.setItem("cachedMovies", JSON.stringify(movies));
      renderMovieList(
        movies,
        languageManager.getCurrent(),
        languageManager,
        loadMovies
      );
    })
    .catch(() => {
      console.warn("Backend not available. Using cache.");
      const cached = localStorage.getItem("cachedMovies");
      if (cached) {
        const movies = JSON.parse(cached);
        renderMovieList(
          movies,
          languageManager.getCurrent(),
          languageManager,
          loadMovies
        );
      } else {
        console.error("No movie data available.");
      }
    });
}

// re-render cached movies (after language change)
export function rerenderCachedMovies(languageManager) {
  const cached = localStorage.getItem("cachedMovies");
  if (cached) {
    const movies = JSON.parse(cached);
    movies.forEach((movie) => {
      if (typeof movie.added_at === "string") {
        movie.added_at = new Date(movie.added_at);
      }
    });
    renderMovieList(
      movies,
      languageManager.getCurrent(),
      languageManager,
      loadMovies
    );
  }
}
