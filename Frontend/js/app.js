// =================== CONFIG ===================
const API_BASE = "/api";
const API = API_BASE;
const API_PUB = {
  list:   `${API}/publications`,
  create: `${API}/publications`,
  mine:   `${API}/publications/mine`,
};
const API_USER = {
  list: `${API}/users`,
  me:   `${API}/auth/me`,
};
const API_AUTH = {
  register: `${API}/auth/register`,
  login:    `${API}/auth/login`,
};

(function initMeta() {
  const apiBaseEl = document.getElementById("api-base");
  if (apiBaseEl) apiBaseEl.textContent = location.origin + API_BASE;
})();

// =================== ESTADO ===================
const state = {
  me: null,
  feed: [],
  users: [],
  myPosts: [],
};

let token = localStorage.getItem("token") || "";

// =================== TOKEN DE GOOGLE ===================
(function handleTokenFromGoogle() {
  const hash = location.hash;
  if (hash.startsWith("#token=")) {
    const tokenFromUrl = hash.replace("#token=", "");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      token = tokenFromUrl;
      location.hash = "#/feed";
      setTimeout(route, 50);
    }
  }
})();

// =================== UTILS ===================
const $ = (id) => document.getElementById(id);
const show = (id) => $(id)?.classList.remove("hidden");
const hide = (id) => $(id)?.classList.add("hidden");

function setNav(){
  const nav = $("nav");
  if (!nav) return;
  nav.innerHTML = "";
  if(state.me){
    nav.append(
      linkBtn("#/feed", "Feed"),
      linkBtn("#/users", "Usuarios"),
      linkBtn("#/profile", "Mi Perfil"),
      button("Salir", logout)
    );
  }else{
    nav.append(linkBtn("#/auth", "Entrar"));
  }
}
function linkBtn(href, text){
  const a=document.createElement("a");
  a.href=href;
  a.textContent=text;
  return a;
}
function button(text, onClick, classes=""){
  const b=document.createElement("button");
  b.textContent=text;
  b.className=classes;
  b.onclick=onClick;
  return b;
}

function toast(msg, ok=true){
  const box = $("message-box");
  if(!box) return;
  box.textContent = (ok ? "✓ " : "✗ ") + msg;
  show("view-message");
  setTimeout(()=> hide("view-message"), 2500);
}

function authHeaders(){
  return token ? { "Authorization": "Bearer " + token } : {};
}
function jsonOrText(res){
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

async function apiGet(url){
  const res = await fetch(url, { headers: { ...authHeaders() } });
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error(`GET ${url} → ${res.status} ${t}`);
  }
  return jsonOrText(res);
}
async function apiPost(url, body){
  const res = await fetch(url, {
    method:"POST",
    headers:{ "Content-Type":"application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error(`POST ${url} → ${res.status} ${t}`);
  }
  return jsonOrText(res);
}
async function apiDelete(url){
  const res = await fetch(url, { method:"DELETE", headers:{ ...authHeaders() } });
  if(!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
  return jsonOrText(res);
}

// =================== RENDER ===================
function renderFeed() {
  const wrap = $("feed-list");
  if (!wrap) return;
  wrap.innerHTML = "";

  if (!state.feed?.length) {
    wrap.innerHTML = `<p class="muted">No hay publicaciones aún.</p>`;
    return;
  }

  for (const p of state.feed) {
    const author = p.user?.nick || "Anónimo";
    const when = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
    const text = (p.text || "").replace(/</g, "&lt;");
    const imgUrl = p.image?.url
      ? (p.image.url.startsWith("http")
          ? p.image.url
          : `http://localhost:3900${p.image.url}`)
      : null;

    const card = document.createElement("div");
    card.className = "post-card";

    card.innerHTML = `
      <div class="post-header">
        <img src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" alt="avatar">
        <div>
          <div class="post-user">${author}</div>
          <div class="post-date">${when}</div>
        </div>
      </div>
      ${
        imgUrl
          ? `<img src="${imgUrl}" class="post-image" onclick="showModal('${imgUrl}')">`
          : ""
      }
      ${
        text
          ? `<div class="post-text">${text}</div>`
          : ""
      }
      <div class="post-actions">
        <span>❤️ Me gusta</span>
        <span>💬 Comentar</span>
        <span>↗️ Compartir</span>
      </div>
    `;
    wrap.appendChild(card);
  }
}




function renderUsers(){
  const wrap = $("users-list");
  if(!wrap) return;
  wrap.innerHTML = "";
  if(!state.users?.length){
    wrap.innerHTML = `<p class="muted">No hay usuarios.</p>`;
    return;
  }
  for(const u of state.users){
    const li = document.createElement("div");
    li.className = "item";
    const uName = u.nick || u.username || u.name || "(sin nombre)";
    const isMe = state.me && (
  u._id === state.me._id || // 🔥 compara correctamente los ObjectId
  u.email?.toLowerCase() === state.me.email?.toLowerCase()
);

    li.innerHTML = `<div class="meta">${uName} ${isMe ? "· tú" : ""}</div><div class="text">${u.bio || ""}</div>`;
    wrap.appendChild(li);
  }
}
function renderProfile(){
  const info = $("profile-info"), wrap = $("my-posts");
  if(info) info.textContent = state.me ? `Usuario: ${state.me.nick || state.me.username || state.me.email}` : "No autenticado";
  if(!wrap) return;
  wrap.innerHTML = "";
  if(!state.myPosts?.length){
    wrap.innerHTML = `<p class="muted">Aún no has publicado nada.</p>`;
    return;
  }
  for(const p of state.myPosts){
    const d = document.createElement("div");
    d.className = "item";
    const when = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
    d.innerHTML = `<div class="meta">${state.me?.nick || state.me?.username || "Yo"} · ${when}</div><div class="text">${(p.text||p.body||"").replace(/</g,"&lt;")}</div>`;
    wrap.appendChild(d);
  }
}

// =================== LÓGICA ===================
async function loadFeed(){
  try{
    const data = await apiGet(API_PUB.list);
    state.feed = data.publications || data.items || data || [];
    renderFeed();
  }catch(e){
    state.feed=[];
    renderFeed();
    toast("No se pudo cargar el feed: " + e.message, false);
  }
}
async function loadUsers(){
  try{
    const data = await apiGet(API_USER.list);
    state.users = data.users || data.items || data || [];
    renderUsers();
  }catch(e){
    state.users=[];
    renderUsers();
    toast("No se pudo cargar usuarios: " + e.message, false);
  }
}
async function loadMyPosts(){
  try{
    const data = await apiGet(API_PUB.mine);
    state.myPosts = data.publications || data.items || data || [];
    renderProfile();
  }catch(e){
    state.myPosts = (state.feed||[]).filter(p=>{
      const author = p.user?.nick || p.author?.nick || p.user?.username || p.author?.username || p.author;
      const meName = state.me?.nick || state.me?.username || state.me?.email;
      return author && meName && author === meName;
    });
    renderProfile();
  }
}
function saveSession(user){
  state.me = user;
  localStorage.setItem("me", JSON.stringify(user));
  setNav();
}
function loadSessionLocal(){
  try{
    const raw=localStorage.getItem("me");
    state.me = raw ? JSON.parse(raw) : null;
  }catch{
    state.me=null;
  }
  setNav();
}
async function refreshMe(){
  if(!token){
    state.me=null;
    return;
  }
  try{
    const data = await apiGet(API_USER.me);
    state.me = data.user || data;
    saveSession(state.me);
  }catch{
    state.me=null;
    localStorage.removeItem("me");
    localStorage.removeItem("token");
    token="";
  }
}

// =================== CERRAR SESIÓN ✅ ===================
function logout(){
  localStorage.removeItem("me");
  localStorage.removeItem("token");
  token = "";
  state.me = null;
  location.hash = "#/auth";
  route();
}

// =================== EVENTOS ===================
const toggle = $("toggle-pass");
const passInput = $("login-pass");
if (toggle && passInput) {
  toggle.addEventListener("click", () => {
    const isPwd = passInput.getAttribute("type") === "password";
    passInput.setAttribute("type", isPwd ? "text" : "password");
    toggle.textContent = isPwd ? "Ocultar" : "Ver";
    passInput.focus();
  });
}
const btnLogin = $("btn-login");
$("form-login")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = $("login-email")?.value.trim();
  const password = $("login-pass")?.value.trim();
  if(!email || !password) return;
  try{
    if(btnLogin){ btnLogin.disabled = true; btnLogin.textContent = "Entrando..."; }
    const data = await apiPost(API_AUTH.login, { email, password });
    token = data.token;
    localStorage.setItem("token", token);
    saveSession(data.user);
    toast("Sesión iniciada correctamente");
    location.hash = "#/feed";
    route();
  }catch(err){
    toast("Error al iniciar sesión: credenciales inválidas o servidor no disponible.", false);
  }finally{
    if(btnLogin){ btnLogin.disabled = false; btnLogin.textContent = "Entrar"; }
  }
});
$("form-post")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("post-text")?.value.trim();
  const file = $("post-image")?.files?.[0];
  const status = $("post-status");

  if (!text && !file) return;

  try {
    if (status) status.textContent = "Publicando...";

    const fd = new FormData();
    if (text) fd.append("text", text);
    if (file) fd.append("image", file); // 🔥 nombre debe ser "image"

    const res = await fetch(API_PUB.create, {
      method: "POST",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      body: fd,
    });

    const data = await res.json();
    console.log("Respuesta publicación:", data);

    await loadFeed();
    if (status) status.textContent = "Publicado ✓";
  } catch (err) {
    if (status) status.textContent = "Error al publicar";
    console.error(err);
  } finally {
    if (status) setTimeout(() => (status.textContent = ""), 1500);
  }
});


// =================== ROUTER SPA ✅ ===================
function hideAll(){
  ["view-auth","view-feed","view-users","view-profile","view-message"].forEach(hide);
}
async function route(){
  loadSessionLocal();
  if (token && !state.me) {
    try {
      await refreshMe();
    } catch (e) {
      console.error("Error al refrescar sesión:", e.message);
    }
  }
  hideAll();
  const r = location.hash || "#/feed";
  if (!state.me) {
    show("view-auth");
    return;
  }
  switch(r){
    case "#/auth":    show("view-auth"); break;
    case "#/feed":    show("view-feed"); await loadFeed(); break;
    case "#/users":   show("view-users"); await loadUsers(); break;
    case "#/profile": show("view-profile"); await Promise.all([loadFeed(), loadMyPosts()]); break;
    default:          show("view-feed"); await loadFeed(); break;
  }
}
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", ()=>{ setNav(); route(); });

// === Modal de imagen ===
function showModal(url, author, text) {
  const modal = document.getElementById("modal-viewer");
  const modalImg = document.getElementById("modal-img");
  modalImg.src = url;
  modal.classList.add("show");
}

function hideModal() {
  const modal = document.getElementById("modal-viewer");
  modal.classList.remove("show");
}
