document.addEventListener("DOMContentLoaded", () => {
  // handle language settings
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

  // when you click language switcher
  document.getElementById("langToggle").addEventListener("click", () => {
    languageManager.toggle();
  });

  // when you click search button (TMDB search)
  document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchQuery").value.trim();
    if (!query) return;

    const lang = languageManager.getCurrent() === "pl" ? "pl-PL" : "en-US";

    // ask our backend to call TMDB with this query
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
          addBtn.textContent =
            languageManager.getCurrent() === "pl" ? "Dodaj" : "Add";

          addBtn.onclick = () => {
            fetch("/api/movies", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title: movie.title }),
            }).then(() => {
              loadMovies(); // refresh movie list
              resultsList.innerHTML = ""; // clear search results
            });
          };

          li.appendChild(addBtn);
          resultsList.appendChild(li);
        });
      });
  });

  // when you click manual add
  document.getElementById("addManualBtn").addEventListener("click", () => {
    const title = document.getElementById("manualTitle").value.trim();
    if (!title) return;

    fetch("/api/movies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add movie");
        console.log("Movie added successfully:", title);
        loadMovies(); // update the list
      })
      .catch((err) => {
        console.error("Error adding movie:", err);
      });
  });

  // load and render all movies from backend
  function loadMovies() {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((movies) => {
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

          // toggle watched status
          checkbox.onchange = () => {
            fetch(`/api/movies/${movie.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ watched: checkbox.checked }),
            }).then(() => loadMovies());
          };

          const removeBtn = document.createElement("button");
          removeBtn.textContent = "Usuń";
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

        document.getElementById("watchedCount").textContent =
          "Obejrzane: " + watchedCount;
        document.getElementById("unwatchedCount").textContent =
          "Nieobejrzane: " + (movies.length - watchedCount);
      });
  }

  // run it on page load
  loadMovies();
});
