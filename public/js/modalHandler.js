import { texts } from "./language.js";

let movieToDelete = null;

// Function to open the modal and store movie ID
export function openDeleteModal(movieId) {
  movieToDelete = movieId;
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();
}

// Function to update modal texts based on current language
export function updateModalLanguage(lang) {
  const title = document.getElementById("deleteConfirmLabel");
  const message = document.getElementById("deleteConfirmMessage");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  title.textContent = texts[lang].confirmDeleteTitle;
  message.textContent = texts[lang].confirmDeleteMessage;
  confirmBtn.textContent = texts[lang].confirmDeleteBtn;
  cancelBtn.textContent = texts[lang].cancelDeleteBtn;
}

// Function to handle the delete confirmation
export function setupConfirmDelete(loadMovies, languageManager) {
  const confirmBtn = document.getElementById("confirmDeleteBtn");

  confirmBtn.addEventListener("click", () => {
    confirmBtn.blur(); // 🆕 BLUR button to prevent ARIA warning!

    if (movieToDelete) {
      fetch(`/api/movies/${movieToDelete}`, {
        method: "DELETE",
      }).then(() => {
        movieToDelete = null;
        loadMovies(languageManager);

        const modalElement = document.getElementById("deleteConfirmModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    }
  });
}
