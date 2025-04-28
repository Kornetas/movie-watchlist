// Filter movies by watched, favorite, search text
export function filterMovies(movies, currentFilter, lastLocalSearch) {
  return movies.filter((movie) => {
    const matchesFilter =
      (currentFilter === "watched" && movie.watched) ||
      (currentFilter === "unwatched" && !movie.watched) ||
      (currentFilter === "favorite" && movie.favorite) ||
      currentFilter === "all";

    const searchText = (lastLocalSearch || "").toLowerCase();
    const title = movie.title || "";
    const titlePl = movie.title_pl || "";
    const titleEn = movie.title_en || "";

    const matchesSearch =
      !lastLocalSearch ||
      title.toLowerCase().includes(searchText) ||
      titlePl.toLowerCase().includes(searchText) ||
      titleEn.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });
}

// Sort movies by title or date
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
