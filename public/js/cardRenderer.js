import { openDeleteModal } from "./modalHandler.js";
import { texts } from "./language.js";
import { loadMovies } from "./movieList.js";
import { languageManager } from "./main.js";

// Create one movie card (used only on mobile)
export function createMovieCard(movie, lang) {
  const card = document.createElement("div");
  card.className = "movie-card";

  // Show movie poster or placeholder
  const poster = document.createElement("img");
  poster.src = movie.poster
    ? `https://image.tmdb.org/t/p/w300${movie.poster}`
    : "/img/no-poster.png";

  // Show title and year
  const title = document.createElement("h5");
  title.textContent = movie.release_year
    ? `${movie.title} (${movie.release_year})`
    : movie.title || "Brak tytułu";

  // Show when movie was added
  const date = document.createElement("small");
  if (movie.added_at) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const localDate = new Date(movie.added_at + "Z");
    date.textContent = localDate.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // Link to TMDB page
  const tmdbButton = document.createElement("a");
  if (movie.tmdb_link) {
    tmdbButton.href = movie.tmdb_link;
    tmdbButton.target = "_blank";
    tmdbButton.rel = "noopener noreferrer";
    tmdbButton.className = "btn btn-primary w-100";
    tmdbButton.textContent = lang === "pl" ? "Zobacz na TMDB" : "View on TMDB";
  }

  // Note input for user
  const note = document.createElement("textarea");
  note.className = "form-control form-control-sm";
  note.placeholder = texts[lang].notePlaceholderMobile;
  note.value = movie.note || "";
  note.id = `note-mobile-${movie.id}`;
  note.name = `note-mobile-${movie.id}`;

  // Save note when user types or presses Enter
  note.addEventListener("change", () => saveNote());
  note.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  });

  function saveNote() {
    // Update note in backend
    fetch(`/api/movies/${movie.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.value }),
    }).then(() => loadMovies(languageManager)); // Reload movies after saving
  }

  // Button to mark movie as watched / unwatched
  const watchedBtn = document.createElement("button");
  watchedBtn.className = movie.watched
    ? "btn btn-success btn-sm mt-2 w-100"
    : "btn btn-outline-success btn-sm mt-2 w-100";
  watchedBtn.textContent = movie.watched
    ? texts[lang].watchedMobileBtn
    : texts[lang].unwatchedMobileBtn;
  watchedBtn.id = `watched-mobile-${movie.id}`;
  watchedBtn.name = `watched-mobile-${movie.id}`;
  watchedBtn.addEventListener("click", () => {
    // Update watched status in backend
    fetch(`/api/movies/${movie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: !movie.watched }),
    }).then(() => loadMovies(languageManager)); // Reload after update
  });

  // Toggle favorite (heart)
  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "btn btn-light btn-sm mt-2";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  favoriteBtn.style.background = "transparent";
  favoriteBtn.style.border = "none";
  favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d";
  favoriteBtn.style.fontSize = "1.8rem";
  favoriteBtn.style.display = "block";
  favoriteBtn.style.margin = "0 auto";
  favoriteBtn.style.textAlign = "center";
  favoriteBtn.id = `favorite-mobile-${movie.id}`;
  favoriteBtn.name = `favorite-mobile-${movie.id}`;
  favoriteBtn.addEventListener("click", () => {
    // Toggle favorite in backend
    fetch(`/api/movies/${movie.id}/favorite`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !movie.favorite }),
    }).then(() => loadMovies(languageManager)); // Reload after change
  });

  // Rating stars 1 to 5
  const ratingDiv = document.createElement("div");
  ratingDiv.className = "rating mt-2";
  ratingDiv.style.display = "flex";
  ratingDiv.style.justifyContent = "center";
  ratingDiv.style.gap = "2px";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = i <= movie.rating ? "⭐" : "☆";
    star.style.cursor = "pointer";
    star.style.fontSize = "1.5rem";
    star.id = `star-mobile-${movie.id}-${i}`;
    star.name = `star-mobile-${movie.id}-${i}`;
    star.addEventListener("click", () => {
      // Update rating in backend
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => loadMovies(languageManager)); // Reload after rating
    });
    ratingDiv.appendChild(star);
  }

  // Delete button opens modal
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm mt-2 w-100";
  deleteBtn.textContent = texts[lang].removeBtnMobile;
  deleteBtn.id = `delete-mobile-${movie.id}`;
  deleteBtn.name = `delete-mobile-${movie.id}`;
  deleteBtn.addEventListener("click", () => {
    openDeleteModal(movie.id);
  });

  // Add everything into the card
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
