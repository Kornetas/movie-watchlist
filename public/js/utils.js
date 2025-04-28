export function showMessage(text, type = "info", timeout = 3000) {
  const box = document.getElementById("messageBox");
  const content = document.getElementById("messageContent");

  content.className = `alert alert ${type}`;
  content.textContent = text;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, timeout);
}

// Parse movie dates from strings to Date objects
export function parseMovieDates(movies) {
  movies.forEach((movie) => {
    if (typeof movie.added_at === "string") {
      movie.added_at = new Date(movie.added_at);
    }
  });
}
