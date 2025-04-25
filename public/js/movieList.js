import { texts } from "./language.js";

export let currentFilter = "all"; // all | watched | unwatched | favorite
export let currentSort = "newest"; // newest | oldest | az | za

export function setCurrentFilter(value) {
  currentFilter = value;
}

export function setCurrentSort(value) {
  currentSort = value;
}

// let currentFilter = "all"; // internal state
export let lastWatched = 0;
export let lastUnwatched = 0;

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

// // change current filter
// export function setCurrentFilter(value) {
//   currentFilter = value;
// }

// render all movie items
export function renderMovieList(movies, lang, languageManager, loadMovies) {
  const list = document.getElementById("movieList");
  list.innerHTML = "";

  const filteredMovies = movies.filter((movie) => {
    if (currentFilter === "watched") return movie.watched;
    if (currentFilter === "unwatched") return !movie.watched;
    if (currentFilter === "favorite") return movie.favorite;
    return true;
  });

  filteredMovies.sort((a, b) => {
    if (currentSort === "az") return a.title.localeCompare(b.title);
    if (currentSort === "za") return b.title.localeCompare(a.title);
    if (currentSort === "newest")
      return new Date(b.added_at) - new Date(a.added_at);
    if (currentSort === "oldest")
      return new Date(a.added_at) - new Date(b.added_at);
    return 0;
  });

  let watchedCount = 0;

  filteredMovies.forEach((movie) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    // poster image
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

    // title + date
    const titleSpan = document.createElement("span");
    const titleText = document.createElement("div");
    titleText.textContent = movie.title;

    const dateText = document.createElement("small");
    dateText.className = "text-muted d-block";
    if (movie.added_at) {
      const date =
        movie.added_at instanceof Date
          ? movie.added_at
          : new Date(movie.added_at);
      const locale = lang === "pl" ? "pl-PL" : "en-US";
      dateText.textContent = date.toLocaleString(locale, {
        dateStyle: "short",
        timeStyle: "short",
      });
    }

    titleSpan.appendChild(titleText);
    titleSpan.appendChild(dateText);

    // checkbox: watched
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

    // favorite button
    const favoriteBtn = document.createElement("button");
    favoriteBtn.className = "favorite-btn me-2";
    favoriteBtn.innerHTML = movie.favorite ? "⭐" : "☆";
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

    // remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = texts[languageManager.getCurrent()].removeBtn;
    removeBtn.className = "btn btn-sm btn-danger";
    removeBtn.onclick = () => {
      fetch(`/api/movies/${movie.id}`, {
        method: "DELETE",
      }).then(() => loadMovies(languageManager));
    };

    // style if watched
    if (checkbox.checked) {
      watchedCount++;
      titleText.style.textDecoration = "line-through";
    }

    // final layout
    li.appendChild(checkbox);
    li.appendChild(img);
    li.appendChild(titleSpan);
    li.appendChild(favoriteBtn);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });

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

export function rerenderCachedMovies(languageManager) {
  const cached = localStorage.getItem("cachedMovies");
  if (cached) {
    const movies = JSON.parse(cached);

    // convert string --> Date
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
