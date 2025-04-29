// Show a message at the top (info, warning, error)
export function showMessage(text, type = "info", timeout = 3000) {
  const box = document.getElementById("messageBox");
  const content = document.getElementById("messageContent");

  // Set the message style and text
  content.className = `alert alert ${type}`;
  content.textContent = text;
  box.style.display = "block";

  // Hide message after timeout (default 3 seconds)
  setTimeout(() => {
    box.style.display = "none";
  }, timeout);
}

// Convert movie "added_at" field from string to Date object
export function parseMovieDates(movies) {
  movies.forEach((movie) => {
    if (typeof movie.added_at === "string") {
      movie.added_at = new Date(movie.added_at);
    }
  });
}
