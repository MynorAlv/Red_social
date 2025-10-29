// UTILS 
const $ = (id) => document.getElementById(id);
const show = (id) => $(id)?.classList.remove("hidden");
const hide = (id) => $(id)?.classList.add("hidden");

function toast(msg, ok = true) {
  const box = $("message-box");
  if (!box) return;
  box.textContent = (ok ? "✓ " : "✗ ") + msg;
  show("view-message");
  setTimeout(() => hide("view-message"), 2500);
}

function linkBtn(href, text) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = text;
  return a;
}

function button(text, onClick, classes = "") {
  const b = document.createElement("button");
  b.textContent = text;
  b.className = classes;
  b.onclick = onClick;
  return b;
}

function authHeaders() {
  return token ? { Authorization: "Bearer " + token } : {};
}
