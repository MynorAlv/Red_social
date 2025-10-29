// === MODAL ===
function showModal(url) {
  const modal = document.getElementById("modal-viewer");
  const modalImg = document.getElementById("modal-img");
  modalImg.src = url;
  modal.classList.add("show");
}

function hideModal() {
  const modal = document.getElementById("modal-viewer");
  modal.classList.remove("show");
}
