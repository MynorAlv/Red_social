// =================== AUTH ===================
let token = localStorage.getItem("token") || "";
const state = { me: null, feed: [], users: [], myPosts: [] };

// === Capturar token de Google ===
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

function saveSession(user) {
  state.me = user;
  localStorage.setItem("me", JSON.stringify(user));
  setNav();
}

function loadSessionLocal() {
  try {
    const raw = localStorage.getItem("me");
    state.me = raw ? JSON.parse(raw) : null;
  } catch {
    state.me = null;
  }
  setNav();
}

async function refreshMe() {
  if (!token) {
    state.me = null;
    return;
  }
  try {
    const data = await apiGet(API_USER.me);
    state.me = data.user || data;
    saveSession(state.me);
  } catch {
    state.me = null;
    localStorage.removeItem("me");
    localStorage.removeItem("token");
    token = "";
  }
}

function logout() {
  localStorage.removeItem("me");
  localStorage.removeItem("token");
  token = "";
  state.me = null;
  location.hash = "#/auth";
  route();
}

// === FORMULARIO LOGIN ===
const btnLogin = $("btn-login");
$("form-login")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("login-email")?.value.trim();
  const password = $("login-pass")?.value.trim();
  if (!email || !password) return;
  try {
    if (btnLogin) {
      btnLogin.disabled = true;
      btnLogin.textContent = "Entrando...";
    }
    const data = await apiPost(API_AUTH.login, { email, password });
    token = data.token;
    localStorage.setItem("token", token);
    saveSession(data.user);
    toast("Sesión iniciada correctamente");
    location.hash = "#/feed";
    route();
  } catch (err) {
    toast("Error al iniciar sesión: credenciales inválidas o servidor no disponible.", false);
  } finally {
    if (btnLogin) {
      btnLogin.disabled = false;
      btnLogin.textContent = "Entrar";
    }
  }
});
