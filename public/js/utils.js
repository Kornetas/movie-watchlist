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
