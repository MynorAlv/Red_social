let token = localStorage.getItem("token") || "";
const state = { me: null, feed: [], users: [], myPosts: [] };

// === Capturar token de Google ===
(function handleTokenFromGoogle() {
  const hash = location.hash;
  if (hash.includes("?token=")) {
    // Extraer token del hash URL
    const tokenFromUrl = new URLSearchParams(hash.split("?")[1]).get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      token = tokenFromUrl;

      console.log("✅ Sesión iniciada con Google");
      toast("Sesión iniciada con Google");

      // Limpiar URL (para no mostrar el token)
      const cleanHash = hash.split("?")[0];
      history.replaceState(null, "", cleanHash);

      // Cargar datos del usuario y redirigir al feed
      loadSessionLocal();
      setTimeout(route, 100);
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
$("form-login")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Referencias de campos
  const email = $("login-email")?.value.trim();
  const password = $("login-pass")?.value.trim();
  const btnLogin = $("btn-login"); // ✅ mover aquí

  // Eliminar validación de reCAPTCHA para pruebas
  // const captchaResponse = grecaptcha.getResponse(); // token del captcha

  // Validación de campos
  if (!email || !password) {
    toast("Debes llenar todos los campos", false);
    return;
  }

  // Si no usamos captcha, eliminamos la validación del captcha:
  // if (!captchaResponse) {
  //   toast("Por favor, completa el reCAPTCHA.", false);
  //   return;
  // }

  try {
    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    // Enviar datos sin captcha (ya que lo hemos deshabilitado temporalmente)
    const data = await apiPost(API_AUTH.login, {
      email,
      password,
      // captcha: captchaResponse, // Eliminar esta línea si no usas reCAPTCHA
    });

    // Almacenamos el token y la sesión
    token = data.token;
    localStorage.setItem("token", token);
    saveSession(data.user);

    console.log("Login exitoso:", data);
    toast("Sesión iniciada correctamente");

    // Redirigir al feed
    location.hash = "#/feed";
    route();

    // Limpiar captcha (aunque no se usó)
    // grecaptcha.reset();
  } catch (err) {
    console.error("Error login:", err);
    toast("Error al iniciar sesión: credenciales inválidas o servidor no disponible.", false);
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
});

// =================== MOSTRAR / OCULTAR CONTRASEÑA ===================
function togglePassword(el) {
  // Obtener el input del mismo label
  const input = el.parentElement.querySelector("input");
  if (!input) return;

  // Alternar tipo de input y texto del botón
  if (input.type === "password") {
    input.type = "text";
    el.textContent = "Ocultar";
  } else {
    input.type = "password";
    el.textContent = "Ver";
  }
}
