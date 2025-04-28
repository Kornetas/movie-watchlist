import { texts } from "./language.js";
import { updateStats } from "./movieList.js";

// Parse dates from string to Date object
function parseMovieDates(movies) {
  movies.forEach((movie) => {
    if (typeof movie.added_at === "string") {
      movie.added_at = new Date(movie.added_at);
    }
  });
}

// Filter movies
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

// Sort movies
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

function createTableHeader(lang) {
  const thead = document.createElement("thead");
  thead.id = "movieTableHeader";

  const tr = document.createElement("tr");

  const headers = [
    texts[lang].headerPoster,
    texts[lang].headerTitle,
    texts[lang].headerDate,
    texts[lang].headerTmdb,
    texts[lang].headerNote,
    texts[lang].headerWatched,
    texts[lang].headerFavorite,
    texts[lang].headerRating,
    texts[lang].headerRemove,
  ];

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    tr.appendChild(th);
  });

  thead.appendChild(tr);
  return thead;
}

// --- RENDER MOVIE TABLE ROW (desktop) ---
function createTableRow(movie, lang, languageManager, loadMovies) {
  const tr = document.createElement("tr");

  // Miniaturka
  const posterTd = document.createElement("td");
  const poster = document.createElement("img");
  poster.src = movie.poster
    ? `https://image.tmdb.org/t/p/w154${movie.poster}`
    : "/img/no-poster.png";
  poster.style.width = "80px";
  poster.style.borderRadius = "6px";
  poster.style.objectFit = "cover";
  posterTd.appendChild(poster);

  // Tytuł
  // Tytuł + Rok
  const titleTd = document.createElement("td");
  titleTd.textContent = movie.release_year
    ? `${movie.title} (${movie.release_year})`
    : movie.title || "Brak tytułu";

  // Data
  const dateTd = document.createElement("td");
  if (movie.added_at) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const localDate = new Date(movie.added_at + "Z");
    dateTd.textContent = localDate.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // TMDB
  const tmdbTd = document.createElement("td");
  if (movie.tmdb_link) {
    const link = document.createElement("a");
    link.href = movie.tmdb_link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "btn btn-primary btn-sm";
    link.textContent = lang === "pl" ? "Zobacz" : "View";
    tmdbTd.appendChild(link);
  }

  // Notatka
  const noteTd = document.createElement("td");
  const note = document.createElement("textarea");
  note.id = `note-${movie.id}`;
  note.name = `note-${movie.id}`;

  note.className = "form-control form-control-sm fw";
  note.style.fontWeight = "600";
  note.style.color = "black";
  note.rows = 2;
  note.placeholder = lang === "pl" ? "Dodaj notatkę..." : "Add a note...";
  note.value = movie.note || "";

  // Nowe style ramki:
  note.style.borderWidth = "1px";
  note.style.borderColor = "#6c757d";
  note.style.borderStyle = "solid";
  note.style.borderRadius = "6px"; // (opcjonalnie: zaokrąglenie rogów)

  note.addEventListener("change", () => {
    saveNote();
  });

  note.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  });

  // Funkcja do zapisywania notatki
  function saveNote() {
    fetch(`/api/movies/${movie.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.value }),
    }).then(() => {
      loadMovies(languageManager); // odświeżenie listy po zapisaniu
    });
  }

  noteTd.appendChild(note);

  // Obejrzane (checkbox)
  const watchedTd = document.createElement("td");
  const watchedCheckbox = document.createElement("input");
  watchedCheckbox.type = "checkbox";
  watchedCheckbox.className = "form-check-input";
  watchedCheckbox.checked = !!movie.watched;
  watchedCheckbox.id = `watched-desktop-${movie.id}`;
  watchedCheckbox.name = `watched-desktop-${movie.id}`;
  watchedCheckbox.addEventListener("change", () => {
    fetch(`/api/movies/${movie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: watchedCheckbox.checked }),
    }).then(() => loadMovies(languageManager));
  });
  watchedTd.appendChild(watchedCheckbox);

  // Ulubione
  const favoriteTd = document.createElement("td");
  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "btn btn-light btn-sm";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  favoriteBtn.id = `favorite-desktop-${movie.id}`;
  favoriteBtn.name = `favorite-desktop-${movie.id}`;
  favoriteBtn.style.background = "transparent"; // brak tła
  favoriteBtn.style.border = "none"; // brak ramki
  favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d"; // kolor
  favoriteBtn.style.fontSize = "1.3rem"; // (tak jak masz wcześniej)

  favoriteBtn.addEventListener("click", () => {
    fetch(`/api/movies/${movie.id}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !movie.favorite }),
    }).then(() => {
      movie.favorite = !movie.favorite;
      favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
      favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d";
    });
  });
  favoriteTd.appendChild(favoriteBtn);

  // Ocena
  const ratingTd = document.createElement("td");
  ratingTd.style.whiteSpace = "nowrap";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = i <= movie.rating ? "⭐" : "☆";
    star.style.cursor = "pointer";
    star.style.fontSize = "1.1rem";
    star.style.padding = "0 2px";
    star.id = `star-desktop-${movie.id}-${i}`;
    star.name = `star-desktop-${movie.id}-${i}`;

    star.addEventListener("click", () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => {
        loadMovies(languageManager); // ⬅️ pełna aktualizacja całej listy
      });
    });

    ratingTd.appendChild(star);
  }

  // Usuń
  const removeTd = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm";

  // Na PC tylko ikona 🗑️
  deleteBtn.innerHTML = "🗑️";

  deleteBtn.addEventListener("click", () => {
    tr.classList.add("fade-out");
    setTimeout(() => {
      fetch(`/api/movies/${movie.id}`, {
        method: "DELETE",
      }).then(() => loadMovies(languageManager));
    }, 500);
  });

  removeTd.appendChild(deleteBtn);

  tr.append(
    posterTd,
    titleTd,
    dateTd,
    tmdbTd,
    noteTd,
    watchedTd,
    favoriteTd,
    ratingTd,
    removeTd
  );
  return tr;
}

// --- RENDER MOVIE CARD (mobile) ---
function createMovieCard(movie, lang, languageManager, loadMovies) {
  const card = document.createElement("div");
  card.className = "movie-card";

  // Miniaturka
  const poster = document.createElement("img");
  poster.src = movie.poster
    ? `https://image.tmdb.org/t/p/w300${movie.poster}`
    : "/img/no-poster.png";

  // Tytuł
  const title = document.createElement("h5");
  title.textContent = movie.release_year
    ? `${movie.title} (${movie.release_year})`
    : movie.title || "Brak tytułu";

  // Data
  const date = document.createElement("small");
  if (movie.added_at) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const localDate = new Date(movie.added_at + "Z");
    date.textContent = localDate.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
    date.style.fontWeight = "bold"; // pogrubiona godzina!
  }

  // TMDB Button
  const tmdbButton = document.createElement("a");
  if (movie.tmdb_link) {
    tmdbButton.href = movie.tmdb_link;
    tmdbButton.target = "_blank";
    tmdbButton.rel = "noopener noreferrer";
    tmdbButton.className = "btn btn-primary w-100";
    tmdbButton.textContent = lang === "pl" ? "Zobacz na TMDB" : "View on TMDB";
  }

  // Note
  const note = document.createElement("textarea");
  note.id = `note-mobile-${movie.id}`;
  note.name = `note-mobile-${movie.id}`;

  note.placeholder = lang === "pl" ? "Dodaj notatkę..." : "Add a note...";
  note.value = movie.note || "";
  note.className = "form-control form-control-sm";
  note.style.fontWeight = "600";
  note.style.color = "#212529";

  // Nowe style dla ładniejszej ramki:
  note.style.borderWidth = "1px";
  note.style.borderColor = "#6c757d";
  note.style.borderStyle = "solid";
  note.style.borderRadius = "6px"; // (opcjonalnie: zaokrąglenie)

  note.addEventListener("change", () => {
    fetch(`/api/movies/${movie.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.value }),
    }).then(() => {
      loadMovies(languageManager); // odświeżenie po zapisaniu notatki
    });
  });

  /// Watched Button (Mobile)
  const watchedBtn = document.createElement("button");
  watchedBtn.id = `watched-mobile-${movie.id}`;
  watchedBtn.name = `watched-mobile-${movie.id}`;

  watchedBtn.className = movie.watched
    ? "btn btn-success btn-sm mt-2 w-100"
    : "btn btn-outline-success btn-sm mt-2 w-100";
  watchedBtn.textContent = movie.watched
    ? lang === "pl"
      ? "✔️ Obejrzane"
      : "✔️ Watched"
    : lang === "pl"
    ? "❌ Obejrzane"
    : "❌ Watched";

  watchedBtn.addEventListener("click", () => {
    const newWatched = !movie.watched;
    fetch(`/api/movies/${movie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: newWatched }),
    }).then(() => {
      loadMovies(languageManager); // reload whole
    });
  });

  // Favorite Button
  const favoriteBtn = document.createElement("button");
  favoriteBtn.id = `favorite-mobile-${movie.id}`;
  favoriteBtn.name = `favorite-mobile-${movie.id}`;

  favoriteBtn.className = "btn btn-light btn-sm mt-2";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  favoriteBtn.style.fontSize = "1.8rem";
  favoriteBtn.style.background = "transparent"; // brak tła
  favoriteBtn.style.border = "none"; // brak ramki
  favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d"; // wyraźny kolor
  favoriteBtn.style.display = "block";
  favoriteBtn.style.margin = "0 auto"; // wyśrodkowane

  favoriteBtn.addEventListener("click", () => {
    fetch(`/api/movies/${movie.id}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !movie.favorite }),
    }).then(() => {
      // po kliknięciu zmień wygląd bez odświeżania:
      movie.favorite = !movie.favorite;
      favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
      favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d";
    });
  });

  // Rating Stars
  const ratingDiv = document.createElement("div");

  ratingDiv.className = "rating mt-2";
  ratingDiv.style.display = "flex";
  ratingDiv.style.justifyContent = "center"; // gwiazdki na środku
  ratingDiv.style.gap = "2px";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = i <= movie.rating ? "⭐" : "☆";
    star.style.cursor = "pointer";
    star.style.fontSize = "1.5rem"; // większe gwiazdki
    star.id = `star-mobile-${movie.id}-${i}`;
    star.name = `star-mobile-${movie.id}-${i}`;
    star.addEventListener("click", () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => loadMovies(languageManager));
    });
    ratingDiv.appendChild(star);
  }

  // Delete Button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm mt-2 w-100";
  deleteBtn.textContent = lang === "pl" ? "Usuń" : "Remove";
  deleteBtn.addEventListener("click", () => {
    card.classList.add("fade-out");
    setTimeout(() => {
      fetch(`/api/movies/${movie.id}`, {
        method: "DELETE",
      }).then(() => loadMovies(languageManager));
    }, 500);
  });

  // Append
  card.append(
    poster,
    title,
    date,
    tmdbButton,
    note,
    watchedBtn,
    favoriteBtn,
    ratingDiv,
    deleteBtn
  );
  return card;
}

// --- MAIN RENDER FUNCTION ---
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
  const cards = document.getElementById("movieCards");
  const table = document.querySelector("table");

  list.innerHTML = "";
  cards.innerHTML = "";

  // Wstawiamy nowe nagłówki
  const oldThead = document.getElementById("movieTableHeader");
  if (oldThead) oldThead.remove();
  const newThead = createTableHeader(lang);
  table.insertBefore(newThead, table.firstChild);

  parseMovieDates(movies);
  const filtered = filterMovies(movies, currentFilter, lastLocalSearch);
  sortMovies(filtered, currentSort);

  filtered.forEach((movie) => {
    const tr = createTableRow(movie, lang, languageManager, loadMovies);
    const card = createMovieCard(movie, lang, languageManager, loadMovies);

    list.appendChild(tr);
    cards.appendChild(card);
  });

  updateStats(
    movies.filter((m) => m.watched).length,
    movies.filter((m) => !m.watched).length,
    movies.filter((m) => m.favorite).length,
    movies.length,
    lang
  );
}
