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
      langBtn: "EN",
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
      langBtn: "PL",
    },
  };

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

    document.querySelector("h1").textContent = t.title;
    document.getElementById("searchQuery").placeholder = t.searchPlaceholder;
    document.getElementById("searchBtn").textContent = t.searchBtn;
    document.getElementById("manualTitle").placeholder = t.addPlaceholder;
    document.getElementById("addManualBtn").textContent = t.addBtn;
    document.getElementById("langToggle").textContent = t.langBtn;

    updateStats(); // refresh labels
    updateSearchResults(); // refresh add buttons in search results
  }

  // update stats section
  function updateStats(w = 0, u = 0) {
    const t = texts[languageManager.getCurrent()];
    document.getElementById("watchedCount").textContent = `${t.watched}: ${w}`;
    document.getElementById(
      "unwatchedCount"
    ).textContent = `${t.unwatched}: ${u}`;
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
    if (!query) return;

    const lang = languageManager.getCurrent() === "pl" ? "pl-PL" : "en-US";

    fetch(`/api/search?query=${encodeURIComponent(query)}&lang=${lang}`)
      .then((res) => res.json())
      .then((results) => {
        const resultsList = document.getElementById("searchResults");
        resultsList.innerHTML = "";

        results.forEach((movie) => {
          const li = document.createElement("li");
          li.className =
            "list-group-item d-flex justify-content-between align-items-center";
          li.textContent = movie.title;

          if (movie.release_date) {
            li.textContent += ` (${movie.release_date.substring(0, 4)})`;
          }

          const addBtn = document.createElement("button");
          addBtn.className = "btn btn-sm btn-primary";
          addBtn.textContent = texts[languageManager.getCurrent()].addBtn;

          addBtn.onclick = () => {
            fetch("/api/movies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: movie.title }),
            }).then(() => {
              loadMovies();
              resultsList.innerHTML = "";
            });
          };

          li.appendChild(addBtn);
          resultsList.appendChild(li);
        });
      });
  });

  // add movie manually
  document.getElementById("addManualBtn").addEventListener("click", () => {
    const title = document.getElementById("manualTitle").value.trim();
    if (!title) return;

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
        console.error("Error adding movie:", err);
      });
  });

  // render movies to the list
  function renderMovieList(movies) {
    const list = document.getElementById("movieList");
    list.innerHTML = "";

    let watchedCount = 0;

    movies.forEach((movie) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";

      const titleSpan = document.createElement("span");
      titleSpan.textContent = movie.title;

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

      const removeBtn = document.createElement("button");
      removeBtn.textContent = texts[languageManager.getCurrent()].removeBtn;
      removeBtn.className = "btn btn-sm btn-danger";
      removeBtn.onclick = () => {
        fetch(`/api/movies/${movie.id}`, {
          method: "DELETE",
        }).then(() => loadMovies());
      };

      if (checkbox.checked) {
        watchedCount++;
        titleSpan.style.textDecoration = "line-through";
      }

      li.appendChild(checkbox);
      li.appendChild(titleSpan);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });

    updateStats(watchedCount, movies.length - watchedCount);
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
