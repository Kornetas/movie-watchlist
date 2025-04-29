import { texts } from "./language.js";

let movieToDelete = null;

// Open delete confirmation modal and store which movie should be deleted
export function openDeleteModal(movieId) {
  movieToDelete = movieId;
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();
}

// Change texts inside modal when switching language
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

// Setup what happens when user clicks "Confirm Delete"
export function setupConfirmDelete(loadMovies, languageManager) {
  const confirmBtn = document.getElementById("confirmDeleteBtn");

  confirmBtn.addEventListener("click", () => {
    confirmBtn.blur(); // remove focus to avoid accessibility warning

    if (movieToDelete) {
      // Send DELETE request to backend
      fetch(`/api/movies/${movieToDelete}`, {
        method: "DELETE",
      }).then(() => {
        movieToDelete = null; // clear the saved ID
        loadMovies(languageManager); // reload movies list after delete

        // Hide the modal after deletion
        const modalElement = document.getElementById("deleteConfirmModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    }
  });
}
