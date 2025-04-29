import { openDeleteModal } from "./modalHandler.js";
import { texts } from "./language.js";
import { loadMovies } from "./movieList.js";
import { languageManager } from "./main.js";

// Create one table row (for desktop/table view)
export function createTableRow(movie, lang) {
  const tr = document.createElement("tr");

  // Movie poster (mini)
  const posterTd = document.createElement("td");
  const poster = document.createElement("img");
  poster.src = movie.poster
    ? `https://image.tmdb.org/t/p/w154${movie.poster}`
    : "/img/no-poster.png";
  poster.style.width = "80px";
  poster.style.borderRadius = "6px";
  poster.style.objectFit = "cover";
  posterTd.appendChild(poster);

  // Movie title (with year if available)
  const titleTd = document.createElement("td");
  titleTd.textContent = movie.release_year
    ? `${movie.title} (${movie.release_year})`
    : movie.title || "Brak tytułu";

  // Date when movie was added
  const dateTd = document.createElement("td");
  if (movie.added_at) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const localDate = new Date(movie.added_at + "Z");
    dateTd.textContent = localDate.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // TMDB link button
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

  // Note input (user notes)
  const noteTd = document.createElement("td");
  const note = document.createElement("textarea");
  note.className = "form-control form-control-sm fw-bold";
  note.placeholder = texts[lang].notePlaceholderMobile;
  note.value = movie.note || "";
  note.id = `note-desktop-${movie.id}`;
  note.name = `note-desktop-${movie.id}`;

  // Save note when user types or presses Enter
  note.addEventListener("change", () => saveNote());
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
    }).then(() => loadMovies(languageManager));
  }

  noteTd.appendChild(note);

  // Watched checkbox
  const watchedTd = document.createElement("td");
  const watchedCheckbox = document.createElement("input");
  watchedCheckbox.type = "checkbox";
  watchedCheckbox.className = "form-check-input";
  watchedCheckbox.checked = !!movie.watched;
  watchedCheckbox.id = `watched-desktop-${movie.id}`;
  watchedCheckbox.name = `watched-desktop-${movie.id}`;

  // Toggle watched state
  watchedCheckbox.addEventListener("change", () => {
    fetch(`/api/movies/${movie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: watchedCheckbox.checked }),
    }).then(() => loadMovies(languageManager)); // After saving, reload movies
  });
  watchedTd.appendChild(watchedCheckbox);

  // Favorite button (heart)
  const favoriteTd = document.createElement("td");
  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "btn btn-light btn-sm";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  favoriteBtn.style.background = "transparent";
  favoriteBtn.style.border = "none";
  favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d";
  favoriteBtn.id = `favorite-desktop-${movie.id}`;
  favoriteBtn.name = `favorite-desktop-${movie.id}`;

  // Toggle favorite status
  favoriteBtn.addEventListener("click", () => {
    fetch(`/api/movies/${movie.id}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !movie.favorite }),
    }).then(() => loadMovies(languageManager)); // After saving, reload movies
  });
  favoriteTd.appendChild(favoriteBtn);

  // Rating stars (1-5)
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

    // Save new rating when clicking star
    star.addEventListener("click", () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => loadMovies(languageManager)); // After saving, reload movies
    });
    ratingTd.appendChild(star);
  }

  // Delete button (opens confirm modal)
  const removeTd = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm";
  deleteBtn.innerHTML = "🗑️";
  deleteBtn.id = `delete-desktop-${movie.id}`;
  deleteBtn.name = `delete-desktop-${movie.id}`;
  deleteBtn.addEventListener("click", () => {
    openDeleteModal(movie.id); // Open confirm delete modal
  });
  removeTd.appendChild(deleteBtn);

  // Add all table cells to the row
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
