// =================== USERS & PROFILE ===================

// Cargar lista de usuarios
async function loadUsers() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No hay token, sesión no iniciada");
      return;
    }

    const res = await fetch(API_USER.list, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();

    state.users = data.users || data.items || data || [];
    renderUsers();
  } catch (e) {
    console.error("Error al cargar usuarios:", e);
    state.users = [];
    renderUsers();
    toast("No se pudo cargar usuarios", false);
  }
}

// Renderizar lista de usuarios
function renderUsers() {
  const wrap = $("users-list");
  if (!wrap) return;
  wrap.innerHTML = "";

  if (!state.users?.length) {
    wrap.innerHTML = `<p class="muted">No hay usuarios registrados.</p>`;
    return;
  }

  for (const u of state.users) {
    const li = document.createElement("div");
    li.className = "item";

    const uName = u.nick || u.username || u.name || "(sin nombre)";
    const isMe =
      state.me &&
      ((u._id && u._id === state.me._id) ||
        (u.id && u.id === state.me.id) ||
        u.email?.toLowerCase() === state.me.email?.toLowerCase());

    li.innerHTML = `
      <div class="meta">
        <strong>${uName}</strong> ${isMe ? "· tú" : ""}
      </div>
      <div class="text">${u.email || ""}</div>
    `;
    wrap.appendChild(li);
  }
}

// Cargar publicaciones del usuario autenticado
async function loadMyPosts() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(API_PUB.mine, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();

    const myId = state.me?.id || state.me?._id;
    state.myPosts = (data.publications || data.items || data || []).filter(
      (p) =>
        (p.user?._id && p.user._id === myId) ||
        (p.user?.id && p.user.id === myId) ||
        p.user === myId
    );

    renderProfile();
  } catch (e) {
    console.error("Error cargando publicaciones propias:", e);
    state.myPosts = [];
    renderProfile();
  }
}

// ===============================
// RENDERIZAR PERFIL PERSONAL
// ===============================
function renderProfile() {
  const nameEl = $("profile-name");
  const emailEl = $("profile-email");
  const avatarEl = $("profile-avatar-img");
  const bannerEl = document.querySelector(".profile-banner img");
  const wrap = $("my-posts");

  if (state.me) {
    // Nombre y correo
    if (nameEl) nameEl.textContent = state.me.nick || state.me.name || "Usuario";
    if (emailEl) emailEl.textContent = state.me.email || "";

    // Avatar (manejar string u objeto)
    if (avatarEl) {
      let avatarUrl = "";

      if (state.me.image) {
        if (typeof state.me.image === "string") {
          avatarUrl = state.me.image;
        } else if (state.me.image.url) {
          avatarUrl = state.me.image.url;
        }
      }

      if (!avatarUrl && state.me?.user?.image?.url) {
        avatarUrl = state.me.user.image.url;
      }

      avatarEl.src =
        avatarUrl && avatarUrl.startsWith("http")
          ? avatarUrl
          : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

      avatarEl.onerror = () => {
        avatarEl.src = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
      };
    }

    // Banner (manejar string u objeto)
    if (bannerEl) {
      let bannerUrl = "";

      if (state.me.banner) {
        if (typeof state.me.banner === "string") {
          bannerUrl = state.me.banner;
        } else if (state.me.banner.url) {
          bannerUrl = state.me.banner.url;
        }
      }

      if (!bannerUrl && state.me?.user?.banner?.url) {
        bannerUrl = state.me.user.banner.url;
      }

      bannerEl.src =
        bannerUrl && bannerUrl.startsWith("http")
          ? bannerUrl
          : "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=1000&q=80";

      bannerEl.onerror = () => {
        bannerEl.src =
          "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=1000&q=80";
      };
    }
  }

  if (!wrap) return;
  wrap.innerHTML = "";

  if (!state.myPosts?.length) {
    wrap.innerHTML = `<p class="muted">Aún no has publicado nada.</p>`;
    return;
  }

  // Renderizar publicaciones del usuario
  for (const p of state.myPosts) {
    const author = p.user?.nick || state.me?.nick || "Yo";
    const when = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
    const text = (p.text || "").replace(/</g, "&lt;");

    let imgUrl = null;
    if (p.image?.url) {
      imgUrl = p.image.url;
    } else if (typeof p.image === "string" && p.image.trim() !== "") {
      imgUrl = p.image;
    }

    const card = document.createElement("div");
    card.className = "post-card";

    card.innerHTML = `
      <div class="post-header">
        <img src="${avatarEl?.src}" alt="avatar" 
             onerror="this.src='https://cdn-icons-png.flaticon.com/512/1946/1946429.png'">
        <div>
          <div class="post-user">${author}</div>
          <div class="post-date">${when}</div>
        </div>
      </div>
      ${
        imgUrl
          ? `<img src="${imgUrl}" class="post-image" onclick="showModal('${imgUrl}')" onerror="this.style.display='none'">`
          : ""
      }
      ${text ? `<div class="post-text">${text}</div>` : ""}
      <div class="post-actions">
        <span>❤️ Me gusta</span>
        <span>💬 Comentar</span>
        <span>↗️ Compartir</span>
      </div>
    `;
    wrap.appendChild(card);
  }
}

// =================== CAMBIAR AVATAR Y BANNER ===================

// Subir nuevo avatar
document.getElementById("profile-avatar-img")?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await fetch("/api/users/avatar", {
        method: "PUT",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        body: fd,
      });
      const data = await res.json();

      if (data.status === "success") {
        const refreshed = await apiGet("/api/users/me");
        state.me = refreshed.user || refreshed;
        renderProfile();
        toast("Foto de perfil actualizada correctamente");
      } else toast("Error al actualizar avatar", false);
    } catch (err) {
      console.error(err);
      toast("Error al subir avatar", false);
    }
  };
  input.click();
});

// Subir nuevo banner
document.querySelector(".profile-banner img")?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("banner", file);

    try {
      const res = await fetch("/api/users/banner", {
        method: "PUT",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        body: fd,
      });
      const data = await res.json();

      if (data.status === "success") {
        const refreshed = await apiGet("/api/users/me");
        state.me = refreshed.user || refreshed;
        renderProfile();
        toast("Portada actualizada correctamente");
      } else toast("Error al actualizar portada", false);
    } catch (err) {
      console.error(err);
      toast("Error al subir portada", false);
    }
  };
  input.click();
});
