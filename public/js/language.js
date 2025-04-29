// Texts used in the app (both Polish and English)
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

    // Table headers
    headerPoster: "Miniaturka",
    headerTitle: "Tytuł",
    headerDate: "Data",
    headerTmdb: "TMDB",
    headerNote: "Notatka",
    headerWatched: "Obejrzane",
    headerFavorite: "Ulubione",
    headerRating: "Ocena",
    headerRemove: "Usuń",

    // Mobile-specific texts
    watchedMobileBtn: "✔️ Obejrzane",
    unwatchedMobileBtn: "❌ Obejrzane",
    notePlaceholderMobile: "Dodaj notatkę...",
    removeBtnMobile: "Usuń",

    // Modal texts
    confirmDeleteTitle: "Potwierdź usunięcie",
    confirmDeleteMessage: "Czy na pewno chcesz usunąć ten film?",
    confirmDeleteBtn: "Usuń",
    cancelDeleteBtn: "Anuluj",
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

    // Table headers
    headerPoster: "Poster",
    headerTitle: "Title",
    headerDate: "Date",
    headerTmdb: "TMDB",
    headerNote: "Note",
    headerWatched: "Watched",
    headerFavorite: "Favorite",
    headerRating: "Rating",
    headerRemove: "Remove",

    // Mobile-specific texts
    watchedMobileBtn: "✔️ Watched",
    unwatchedMobileBtn: "❌ Watch",
    notePlaceholderMobile: "Add a note...",
    removeBtnMobile: "Remove",

    // Modal texts
    confirmDeleteTitle: "Confirm Deletion",
    confirmDeleteMessage: "Are you sure you want to delete this movie?",
    confirmDeleteBtn: "Delete",
    cancelDeleteBtn: "Cancel",
  },
};

// Class to manage the selected language
export class LanguageManager {
  constructor() {
    // Load language from localStorage or use "pl" if not set
    this.lang = localStorage.getItem("lang") || "pl";
  }

  // Switch between Polish and English
  toggle() {
    this.lang = this.lang === "pl" ? "en" : "pl";
    localStorage.setItem("lang", this.lang);
  }

  // Return the currently selected language
  getCurrent() {
    return this.lang;
  }
}
