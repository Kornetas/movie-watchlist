document.addEventListener("DOMContentLoaded", () => {
  // translations for both languages
  const texts = {
    pl: {
      title: "Lista filmów",
      searchPlaceholder: "Szukaj filmu w TMDB",
      searchBtn: "Szukaj",
      addPlaceholder: "Dodaj film ręcznie",
      addBtn: "Dodaj",
      removeBtn: "Usuń",
      watched: "Obejrzane",
      unwatched: "Nieobejrzane",
      total: "Wszystkie filmy",
      langBtn: "EN",
      duplicateMovie: "Film o tej nazwie już jest na Twojej liście.",
      errorAdd: "Wystąpił błąd przy dodawaniu filmu.",
      searchCleared: "Wyszukiwanie zostało anulowane.",
      emptySearch: "Wpisz tytuł, aby wyszukać film.",
      emptyManual: "Wpisz tytuł, aby dodać film.",
      clearBtn: "Wyczyść",
    },
    en: {
      title: "Movie Watchlist",
      searchPlaceholder: "Search TMDB for a movie",
      searchBtn: "Search",
      addPlaceholder: "Add a movie manually",
      addBtn: "Add",
      removeBtn: "Remove",
      watched: "Watched",
      unwatched: "Unwatched",
      total: "All movies",
      langBtn: "PL",
      duplicateMovie: "A movie with this title is already on your list.",
      errorAdd: "Something went wrong while adding the movie.",
      searchCleared: "Search has been cleared.",
      emptySearch: "Enter a movie title to search.",
      emptyManual: "Enter a movie title to add.",
      clearBtn: "Clear",
    },
  };

  let lastWatched = 0;
  let lastUnwatched = 0;

  let currentFilter = "all"; // all | watched | unwatched

  function showMessage(text, type = "info", timeout = 3000) {
    const box = document.getElementById("messageBox");
    const content = document.getElementById("messageContent");

    content.className = `alert alert ${type}`;
    content.textContent = text;
    box.style.display = "block";

    setTimeout(() => {
      box.style.display = "none";
    }, timeout);
  }

  document.getElementById("manualTitle").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("addManualBtn").click();
    }
  });

  document.getElementById("searchQuery").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("searchBtn").click();
    }
  });

  document.getElementById("clearSearchBtn").addEventListener("click", () => {
    document.getElementById("searchQuery").value = "";
    document.getElementById("searchResults").innerHTML = "";
    showMessage(texts[languageManager.getCurrent()].searchCleared, "info");
  });

  document.getElementById("watchedCount").addEventListener("click", () => {
    currentFilter = "watched";
    loadMovies();
  });

  document.getElementById("unwatchedCount").addEventListener("click", () => {
    currentFilter = "unwatched";
    loadMovies();
  });

  document.getElementById("totalCount").addEventListener("click", () => {
    currentFilter = "all";
    loadMovies();
  });

  // manage language settings
  class LanguageManager {
    constructor() {
      this.lang = localStorage.getItem("lang") || "pl";
    }

    toggle() {
      this.lang = this.lang === "pl" ? "en" : "pl";
      localStorage.setItem("lang", this.lang);
      console.log("Language switched to:", this.lang);
    }

    getCurrent() {
      return this.lang;
    }
  }

  const languageManager = new LanguageManager();

  // switch language
  document.getElementById("langToggle").addEventListener("click", () => {
    languageManager.toggle();
    applyLanguage();
  });

  // update all visible texts on the page
  function applyLanguage() {
    const lang = languageManager.getCurrent();
    const t = texts[lang];

    const removeBtns = document.querySelectorAll("#movieList .btn-danger");
    removeBtns.forEach((btn) => {
      btn.textContent = texts[languageManager.getCurrent()].removeBtn;
    });

    document.getElementById("clearSearchBtn").textContent =
      texts[languageManager.getCurrent()].clearBtn;

    document.title = t.title;
    document.getElementById("pageTitle").textContent = t.title;

    document.querySelector("h1").textContent = t.title;
    document.getElementById("searchQuery").placeholder = t.searchPlaceholder;
    document.getElementById("searchBtn").textContent = t.searchBtn;
    document.getElementById("manualTitle").placeholder = t.addPlaceholder;
    document.getElementById("addManualBtn").textContent = t.addBtn;
    document.getElementById("langToggle").textContent = t.langBtn;

    updateSearchResults(); // refresh add buttons in search results
    updateStats(lastWatched, lastUnwatched);
    loadMovies();
  }

  // update stats section
  function updateStats(watched, unwatched) {
    const t = texts[languageManager.getCurrent()];
    document.getElementById("totalCount").textContent = `${t.total}: ${
      watched + unwatched
    }`;
    document.getElementById(
      "watchedCount"
    ).textContent = `${t.watched}: ${watched}`;
    document.getElementById(
      "unwatchedCount"
    ).textContent = `${t.unwatched}: ${unwatched}`;
  }

  // update TMDB search results add buttons
  function updateSearchResults() {
    const btns = document.querySelectorAll("#searchResults button");
    const label = texts[languageManager.getCurrent()].addBtn;
    btns.forEach((btn) => {
      btn.textContent = label;
    });
  }

  // search movies via TMDB
  document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchQuery").value.trim();
    if (!query) {
      showMessage(texts[languageManager.getCurrent()].emptySearch, "warning");
      return;
    }

    const lang = languageManager.getCurrent() === "pl" ? "pl-PL" : "en-US";

    fetch(`/api/search?query=${encodeURIComponent(query)}&lang=${lang}`)
      .then((res) => res.json())
      .then((results) => {
        const resultsList = document.getElementById("searchResults");
        resultsList.innerHTML = "";

        results.forEach((movie) => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex align-items-center";

          // poster thumbnail
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

          // title + year
          const text = document.createElement("div");
          text.innerText = movie.release_date
            ? `${movie.title} (${movie.release_date.substring(0, 4)})`
            : movie.title;

          // add button
          const addBtn = document.createElement("button");
          addBtn.className = "btn btn-sm btn-primary ms-auto";
          addBtn.textContent = texts[languageManager.getCurrent()].addBtn;

          addBtn.onclick = () => {
            fetch("/api/movies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: movie.title,
                poster: movie.poster,
              }),
            })
              .then((res) => {
                if (!res.ok) throw new Error(res.status.toString());
                loadMovies();
                resultsList.innerHTML = "";
              })
              .catch((err) => {
                const t = texts[languageManager.getCurrent()];
                if (err.message === "409") {
                  showMessage(t.duplicateMovie, "warning");
                } else {
                  showMessage(t.errorAdd, "danger");
                  console.error("Error adding movie:", err);
                }
              });
          };

          li.appendChild(img);
          li.appendChild(text);
          li.appendChild(addBtn);
          resultsList.appendChild(li);
        });
      });
  });

  // add movie manually
  document.getElementById("addManualBtn").addEventListener("click", () => {
    const title = document.getElementById("manualTitle").value.trim();
    if (!title) {
      showMessage(texts[languageManager.getCurrent()].emptyManual, "warning");
      return;
    }

    fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add movie");
        console.log("Movie added successfully:", title);
        loadMovies();
      })
      .catch((err) => {
        const t = texts[languageManager.getCurrent()];
        if (err.message === "409") {
          showMessage(t.duplicateMovie, "warning");
        } else {
          showMessage(t.errorAdd, "danger");
          console.error("Error adding movie:", err);
        }
      });
  });

  // render movies to the list
  function renderMovieList(movies) {
    const list = document.getElementById("movieList");
    list.innerHTML = "";

    const filteredMovies = movies.filter((movie) => {
      if (currentFilter === "watched") return movie.watched;
      if (currentFilter === "unwatched") return !movie.watched;
      return true;
    });

    let watchedCount = 0;

    filteredMovies.forEach((movie) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";

      // miniaturka (poster)
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

      // tytuł + data dodania
      const titleSpan = document.createElement("span");

      const titleText = document.createElement("div");
      titleText.textContent = movie.title;

      const dateText = document.createElement("small");
      dateText.className = "text-muted d-block";
      if (movie.added_at) {
        const date = new Date(movie.added_at);
        const locale =
          languageManager.getCurrent() === "pl" ? "pl-PL" : "en-US";
        dateText.textContent = date.toLocaleString(locale, {
          dateStyle: "short",
          timeStyle: "short",
        });
      }

      titleSpan.appendChild(titleText);
      titleSpan.appendChild(dateText);

      // checkbox: obejrzane?
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input me-2";
      checkbox.checked = !!movie.watched;

      checkbox.onchange = () => {
        fetch(`/api/movies/${movie.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: checkbox.checked }),
        }).then(() => loadMovies());
      };

      // przycisk "usuń"
      const removeBtn = document.createElement("button");
      removeBtn.textContent = texts[languageManager.getCurrent()].removeBtn;
      removeBtn.className = "btn btn-sm btn-danger";
      removeBtn.onclick = () => {
        fetch(`/api/movies/${movie.id}`, {
          method: "DELETE",
        }).then(() => loadMovies());
      };

      // styl dla obejrzanych
      if (checkbox.checked) {
        watchedCount++;
        titleText.style.textDecoration = "line-through";
      }

      li.appendChild(checkbox);
      li.appendChild(img);
      li.appendChild(titleSpan);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });

    // statystyki
    const totalWatched = movies.filter((m) => m.watched).length;
    const totalUnwatched = movies.length - totalWatched;
    updateStats(totalWatched, totalUnwatched);

    // zapamiętanie statystyk do odświeżenia po zmianie języka
    lastWatched = totalWatched;
    lastUnwatched = totalUnwatched;
  }

  // load from backend or from localStorage if offline
  function loadMovies() {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((movies) => {
        localStorage.setItem("cachedMovies", JSON.stringify(movies));
        renderMovieList(movies);
      })
      .catch(() => {
        console.warn("Backend not available. Using localStorage cache.");
        const cached = localStorage.getItem("cachedMovies");
        if (cached) {
          const movies = JSON.parse(cached);
          renderMovieList(movies);
        } else {
          console.error("No cached movie list found.");
        }
      });
  }

  // run on load
  loadMovies();
  applyLanguage();
});
