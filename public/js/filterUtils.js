// Filter movies based on current filter and search query
export function filterMovies(movies, currentFilter, lastLocalSearch) {
  return movies.filter((movie) => {
    const matchesFilter =
      (currentFilter === "watched" && movie.watched) ||
      (currentFilter === "unwatched" && !movie.watched) ||
      (currentFilter === "favorite" && movie.favorite) ||
      currentFilter === "all";

    // Convert search text to lowercase
    const searchText = (lastLocalSearch || "").toLowerCase();
    const title = movie.title || "";
    const titlePl = movie.title_pl || "";
    const titleEn = movie.title_en || "";

    // Check if search text is found in any title
    const matchesSearch =
      !lastLocalSearch ||
      title.toLowerCase().includes(searchText) ||
      titlePl.toLowerCase().includes(searchText) ||
      titleEn.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });
}

// Sort movies depending on selected sort option
export function sortMovies(movies, currentSort) {
  if (currentSort) {
    movies.sort((a, b) => {
      if (currentSort === "az") return a.title.localeCompare(b.title);
      if (currentSort === "za") return b.title.localeCompare(a.title);
      if (currentSort === "newest")
        return new Date(b.added_at) - new Date(a.added_at);
      if (currentSort === "oldest")
        return new Date(a.added_at) - new Date(b.added_at);
      return 0;
    });
  }
}
