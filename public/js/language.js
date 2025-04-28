// all texts in both languages
export const texts = {
  pl: {
    title: "Lista Filmów",
    searchPlaceholder: "Szukaj filmu w TMDB",
    searchBtn: "Szukaj",
    addPlaceholder: "Dodaj film",
    addBtn: "Dodaj",
    removeBtn: "Usuń",
    watched: "Obejrzane",
    unwatched: "Nieobejrzane",
    total: "Wszystkie filmy",
    langBtn: "EN",
    duplicateMovie: "Film o tej nazwie już jest na Twojej liście.",
    errorAdd: "Wystąpił błąd przy dodawaniu filmu.",
    searchCleared: "Wyszukiwanie zostało anulowane.",
    manualCleared: "Ręczne dodawanie zostało wyczyszczone.",
    emptySearch: "Wpisz tytuł, aby wyszukać film.",
    emptyManual: "Wpisz tytuł, aby dodać film.",
    clearBtn: "Wyczyść",
    favoriteFilter: "❤️ Ulubione",
    sortDefault: "— Sortuj według —",
    sortNewest: "Najnowsze",
    sortOldest: "Najstarsze",
    sortAZ: "A → Z",
    sortZA: "Z → A",
    localSearchPlaceholder: "Szukaj filmów...",

    // New for table headers
    headerPoster: "Miniaturka",
    headerTitle: "Tytuł",
    headerDate: "Data",
    headerTmdb: "TMDB",
    headerNote: "Notatka",
    headerWatched: "Obejrzane",
    headerFavorite: "Ulubione",
    headerRating: "Ocena",
    headerRemove: "Usuń",

    // NEW ONLY FOR MOBILE
    watchedMobileBtn: "✔️ Obejrzane",
    unwatchedMobileBtn: "❌ Obejrzane",
    notePlaceholderMobile: "Dodaj notatkę...",
    removeBtnMobile: "Usuń",
  },

  en: {
    title: "Movie Watchlist",
    searchPlaceholder: "Search TMDB for a movie",
    searchBtn: "Search",
    addPlaceholder: "Add a movie",
    addBtn: "Add",
    removeBtn: "Remove",
    watched: "Watched",
    unwatched: "Unwatched",
    total: "All movies",
    langBtn: "PL",
    duplicateMovie: "A movie with this title is already on your list.",
    errorAdd: "Something went wrong while adding the movie.",
    searchCleared: "Search has been cleared.",
    manualCleared: "Manual input has been cleared.",
    emptySearch: "Enter a movie title to search.",
    emptyManual: "Enter a movie title to add.",
    clearBtn: "Clear",
    favoriteFilter: "❤️ Favorites",
    sortDefault: "— Sort by —",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortAZ: "A → Z",
    sortZA: "Z → A",
    localSearchPlaceholder: "Search movies...",

    // New for table headers
    headerPoster: "Poster",
    headerTitle: "Title",
    headerDate: "Date",
    headerTmdb: "TMDB",
    headerNote: "Note",
    headerWatched: "Watched",
    headerFavorite: "Favorite",
    headerRating: "Rating",
    headerRemove: "Remove",

    // 🆕 NEW ONLY FOR MOBILE
    watchedMobileBtn: "✔️ Watched",
    unwatchedMobileBtn: "❌ Watch",
    notePlaceholderMobile: "Add a note...",
    removeBtnMobile: "Remove",
  },
};

// simple class to manage language setting
export class LanguageManager {
  constructor() {
    // get saved lang from localStorage, or use "pl" by default
    this.lang = localStorage.getItem("lang") || "pl";
  }

  // switch between "pl" and "en"
  toggle() {
    this.lang = this.lang === "pl" ? "en" : "pl";
    localStorage.setItem("lang", this.lang);
  }

  // return current language
  getCurrent() {
    return this.lang;
  }
}
