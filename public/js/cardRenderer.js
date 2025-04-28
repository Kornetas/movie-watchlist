// Create movie card for mobile view
export function createMovieCard(movie, lang, languageManager, loadMovies) {
  const card = document.createElement("div");
  card.className = "movie-card";

  // Poster
  const poster = document.createElement("img");
  poster.src = movie.poster
    ? `https://image.tmdb.org/t/p/w300${movie.poster}`
    : "/img/no-poster.png";

  // Title
  const title = document.createElement("h5");
  title.textContent = movie.release_year
    ? `${movie.title} (${movie.release_year})`
    : movie.title || "No title";

  // Date
  const date = document.createElement("small");
  if (movie.added_at) {
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const localDate = new Date(movie.added_at + "Z");
    date.textContent = localDate.toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
    date.style.fontWeight = "bold";
  }

  // TMDB button
  const tmdbButton = document.createElement("a");
  if (movie.tmdb_link) {
    tmdbButton.href = movie.tmdb_link;
    tmdbButton.target = "_blank";
    tmdbButton.rel = "noopener noreferrer";
    tmdbButton.className = "btn btn-primary w-100";
    tmdbButton.textContent = lang === "pl" ? "Zobacz na TMDB" : "View on TMDB";
  }

  // Note textarea
  const note = document.createElement("textarea");
  note.id = `note-mobile-${movie.id}`;
  note.name = `note-mobile-${movie.id}`;
  note.className = "form-control form-control-sm";
  note.placeholder = lang === "pl" ? "Add note..." : "Add note...";
  note.value = movie.note || "";
  note.style.fontWeight = "600";
  note.style.color = "#212529";
  note.style.borderWidth = "1px";
  note.style.borderColor = "#6c757d";
  note.style.borderStyle = "solid";
  note.style.borderRadius = "6px";

  note.addEventListener("change", () => {
    fetch(`/api/movies/${movie.id}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note.value }),
    }).then(() => {
      loadMovies(languageManager);
    });
  });

  // Watched button
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
      loadMovies(languageManager);
    });
  });

  // Favorite button
  const favoriteBtn = document.createElement("button");
  favoriteBtn.id = `favorite-mobile-${movie.id}`;
  favoriteBtn.name = `favorite-mobile-${movie.id}`;
  favoriteBtn.className = "btn btn-light btn-sm mt-2";
  favoriteBtn.innerHTML = movie.favorite ? "❤️" : "🤍";
  favoriteBtn.style.fontSize = "1.8rem";
  favoriteBtn.style.background = "transparent";
  favoriteBtn.style.border = "none";
  favoriteBtn.style.color = movie.favorite ? "#dc3545" : "#6c757d";
  favoriteBtn.style.display = "block";
  favoriteBtn.style.margin = "0 auto";

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

  // Rating stars
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

    star.addEventListener("click", () => {
      fetch(`/api/movies/${movie.id}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: i }),
      }).then(() => {
        loadMovies(languageManager);
      });
    });

    ratingDiv.appendChild(star);
  }

  // Delete button
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

  // Add everything to the card
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
