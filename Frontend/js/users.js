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
    li.className = "user-card";

    const uName = u.nick || u.username || u.name || "(sin nombre)";
    const isMe =
      state.me &&
      ((u._id && u._id === state.me._id) ||
        (u.id && u.id === state.me.id) ||
        u.email?.toLowerCase() === state.me.email?.toLowerCase());

    const avatar =
      typeof u.image === "string"
        ? u.image
        : u.image?.url || "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

    li.innerHTML = `
      <div class="user-info">
        <img src="${avatar}" alt="avatar" class="user-avatar"
             onerror="this.src='https://cdn-icons-png.flaticon.com/512/1946/1946429.png'">
        <div>
          <div class="user-name">${uName}${isMe ? ' <span class="badge">Tú</span>' : ""}</div>
          <div class="user-email">${u.email || ""}</div>
        </div>
      </div>
    `;

    // Al hacer clic, ir a su perfil
    li.addEventListener("click", () => {
      if (isMe) {
        location.hash = "#/profile";
      } else {
        location.hash = `#/profile/${u._id}`;
      }
      route();
    });

    wrap.appendChild(li);
  }
}

// ===============================
// PERFIL PERSONAL (MI PERFIL)
// ===============================
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

    renderProfile(true); // <- true indica que es tu perfil
  } catch (e) {
    console.error("Error cargando publicaciones propias:", e);
    state.myPosts = [];
    renderProfile(true);
  }
}

// ===============================
// RENDERIZAR PERFIL (GENÉRICO)
// ===============================
function renderProfile(isOwnProfile = false, user = state.me, posts = state.myPosts) {
  const nameEl = $("profile-name");
  const emailEl = $("profile-email");
  const avatarEl = $("profile-avatar-img");
  const bannerEl = document.querySelector(".profile-banner img");
  const wrap = $("my-posts");

  if (!user) return;

  // Nombre y correo
  if (nameEl) nameEl.textContent = user.nick || user.name || "Usuario";
  if (emailEl) emailEl.textContent = user.email || "";

  // Avatar
  const avatarUrl =
    typeof user.image === "string"
      ? user.image
      : user.image?.url || "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  // Banner
  const bannerUrl =
    typeof user.banner === "string"
      ? user.banner
      : user.banner?.url ||
        "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=1000&q=80";

  if (avatarEl) {
    avatarEl.src = avatarUrl;
    avatarEl.onerror = () =>
      (avatarEl.src = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png");
    avatarEl.style.cursor = isOwnProfile ? "pointer" : "default";
    avatarEl.onclick = isOwnProfile ? handleAvatarChange : null;
  }

  if (bannerEl) {
    bannerEl.src = bannerUrl;
    bannerEl.onerror = () =>
      (bannerEl.src =
        "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=1000&q=80");
    bannerEl.style.cursor = isOwnProfile ? "pointer" : "default";
    bannerEl.onclick = isOwnProfile ? handleBannerChange : null;
  }

  if (!wrap) return;
  wrap.innerHTML = "";

  if (!posts?.length) {
    wrap.innerHTML = `<p class="muted">${isOwnProfile ? "Aún no has publicado nada." : "Este usuario aún no ha publicado nada."}</p>`;
    return;
  }

  for (const p of posts) {
  const when = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
  const text = (p.text || "").replace(/</g, "&lt;");
  const imgUrl = typeof p.image === "string" ? p.image : p.image?.url || null;

  const card = document.createElement("div");
  card.className = "post-card";
  card.innerHTML = `
    <div class="post-header">
      <img src="${avatarUrl}" alt="avatar">
      <div>
        <div class="post-user">${user.nick || user.name}</div>
        <div class="post-date">${when}</div>
      </div>
    </div>
    ${imgUrl ? `<img src="${imgUrl}" class="post-image">` : ""}
    ${
      p.descripcion_ia
        ? `<div class="ia-label"><strong>Detectado:</strong> ${p.descripcion_ia}</div>`
        : ""
    }
    ${
      p.emocion_ia
        ? `<div class="ia-emocion"><strong>Emoción:</strong> ${p.emocion_ia}</div>`
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

// ===============================
// PERFIL PÚBLICO DE OTRO USUARIO
// ===============================
async function loadPublicProfile(userId) {
  try {
    const token = localStorage.getItem("token");
    const [userRes, postsRes] = await Promise.all([
      fetch(`/api/users/${userId}`, {
        headers: { Authorization: "Bearer " + token },
      }),
      fetch(`/api/publications`, {
        headers: { Authorization: "Bearer " + token },
      }),
    ]);

    const userData = await userRes.json();
    const postsData = await postsRes.json();

    const user = userData.user;
    const allPosts = postsData.publications || [];
    const userPosts = allPosts.filter((p) => p.user?._id === userId);

    renderProfile(false, user, userPosts); // <- falso indica que no es tu perfil
  } catch (err) {
    console.error("Error cargando perfil público:", err);
    toast("No se pudo cargar el perfil del usuario", false);
  }
}

// =================== CAMBIAR AVATAR Y BANNER ===================
async function handleAvatarChange() {
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
        const refreshed = await fetch("/api/users/me", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        const refreshedData = await refreshed.json();
        state.me = refreshedData.user || refreshedData;
        localStorage.setItem("user", JSON.stringify(state.me));
        renderProfile(true);
        toast("Foto de perfil actualizada correctamente");
      } else toast("Error al actualizar avatar", false);
    } catch (err) {
      console.error(err);
      toast("Error al subir avatar", false);
    }
  };
  input.click();
}

async function handleBannerChange() {
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
        const refreshed = await fetch("/api/users/me", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        const refreshedData = await refreshed.json();
        state.me = refreshedData.user || refreshedData;
        localStorage.setItem("user", JSON.stringify(state.me));
        renderProfile(true);
        toast("Portada actualizada correctamente");
      } else toast("Error al actualizar portada", false);
    } catch (err) {
      console.error(err);
      toast("Error al subir portada", false);
    }
  };
  input.click();
}
