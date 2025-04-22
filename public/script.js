document.addEventListener("DOMContentLoaded", () => {
   // manage language settings
  class LanguageManager {
    constructor() {
      this.lang = localStorage.getItem("lang") || "pl";
    }

    toggle() {
        // switch between pl and eng
      this.lang = this.lang === "pl" ? "en" : "pl";
      localStorage.setItem("lang", this.lang);
      console.log("Language switched to:", this.lang);
    }

    getCurrent() {
      return this.lang;
    }
  }

  const languageManager = new LanguageManager();

  // when you click language button
  document.getElementById("langToggle").addEventListener("click", () => {
    languageManager.toggle();
  });

   // when you click search button
  document.getElementById("searchBtn").addEventListener("click", () => {
    const query = document.getElementById("searchQuery").value.trim();
    if (!query) return;
    console.log("Searching for:", query);
  });

    // when you click manual add
  document.getElementById("addManualBtn").addEventListener("click", () => {
    const title = document.getElementById("manualTitle").value.trim();
    if (!title) return;

    // send movie to backend
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
        // TODO: refresh movie list after adding
      })
      .catch((err) => {
        console.error("Error adding movie:", err);
      });
  });
});
