import { texts } from "./language.js";

// Create the table header for movies
export function createTableHeader(lang) {
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

// Create one table row for desktop view
export function createTableRow(movie, lang, languageManager, loadMovies) {
  const tr = document.createElement("tr");

  // Poster cell
  const posterTd = document.createElement("td");
  const poster = document.createElement("img");
  poster.src = movie.poster
    ? `https://image.tmdb.org/t/p/w154${movie.poster}`
    : "/img/no-poster.png";
  poster.style.width = "80px";
  poster.style.borderRadius = "6px";
  poster.style.objectFit = "cover";
  posterTd.appendChild(poster);

  // Title cell
  const titleTd = document.createElement("td");
  titleTd.textContent = movie.release_year
    ? `${movie.title} (${movie.release_year})`
    : movie.title || "No title";

  // Date cell
  const dateTd = document.createElement("td");
  if (movie.added_at) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const localDate = new Date(movie.added_at + "Z");
    dateTd.textContent = localDate.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // TMDB button
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

  // Note textarea
  const noteTd = document.createElement("td");
  const note = document.createElement("textarea");
  note.id = `note-${movie.id}`;
  note.name = `note-${movie.id}`;
  note.className = "form-control form-control-sm fw";
  note.style.fontWeight = "600";
  note.style.color = "black";
  note.rows = 2;
  note.placeholder = lang === "pl" ? "Add note..." : "Add note...";
  note.value = movie.note || "";

  note.style.borderWidth = "1px";
  note.style.borderColor = "#6c757d";
  note.style.borderStyle = "solid";
  note.style.borderRadius = "6px";

  note.addEventListener("change", () => {
    saveNote();
  });

  note.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  });

  function saveNote() {
    fetch(`/api/movies/${movie.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.value }),
    }).then(() => {
      loadMovies(languageManager);
    });
  }

  noteTd.appendChild(note);

  // Watched checkbox
  const watchedTd = document.createElement("td");
  const watchedCheckbox = document.createElement("input");
  watchedCheckbox.type = "checkbox";
  watchedCheckbox.className = "form-check-input";
  watchedCheckbox.checked = !!movie.watched;
  watchedCheckbox.addEventListener("change", () => {
    fetch(`/api/movies/${movie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: watchedCheckbox.checked }),
    }).then(() => loadMovies(languageManager));
  });
  watchedTd.appendChild(watchedCheckbox);

  // Favorite button
  const favoriteTd = document.createElement("td");
  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "btn btn-light btn-sm";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  favoriteBtn.style.background = "transparent";
  favoriteBtn.style.border = "none";
  favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d";
  favoriteBtn.style.fontSize = "1.3rem";

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

  // Rating stars
  const ratingTd = document.createElement("td");
  ratingTd.style.whiteSpace = "nowrap";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = i <= movie.rating ? "⭐" : "☆";
    star.style.cursor = "pointer";
    star.style.fontSize = "1.1rem";
    star.style.padding = "0 2px";

    star.addEventListener("click", () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => {
        loadMovies(languageManager);
      });
    });

    ratingTd.appendChild(star);
  }

  // Delete button
  const removeTd = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm";
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
