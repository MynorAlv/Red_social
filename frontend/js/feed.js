// =================== FEED ===================

// PREVIEW DE IMAGEN EN EL FORMULARIO 
const postImg = $("post-image");
const postPreview = $("post-preview");

if (postImg && postPreview) {
  postImg.addEventListener("change", () => {
    const file = postImg.files?.[0];
    if (file) {
      postPreview.src = URL.createObjectURL(file);
      postPreview.classList.remove("hidden");
    } else {
      postPreview.src = "";
      postPreview.classList.add("hidden");
    }
  });
}

// === CARGAR FEED ===
async function loadFeed() {
  try {
    const data = await apiGet(API_PUB.list);
    state.feed = data.publications || data.items || data || [];
    renderFeed();
  } catch (e) {
    state.feed = [];
    renderFeed();
    toast("No se pudo cargar el feed: " + e.message, false);
  }
}

// === RENDERIZAR PUBLICACIONES ===
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
      ? p.image.url
      : typeof p.image === "string" && p.image.startsWith("http")
      ? p.image
      : null;

    const descripcionIA = p.descripcion_ia || ""; // 🧠 detección IA desde backend

    // Avatar del usuario
    let avatarUrl =
      p.user?.image?.url ||
      p.user?.image ||
      "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

    const card = document.createElement("div");
    card.className = "post-card";

        // Determinar si el usuario actual es el dueño de la publicación
        const meId = state.me?._id || state.me?.id;
        const pubUserId = p.user?._id || p.user?.id;
        const isOwner = meId && pubUserId && meId.toString() === pubUserId.toString();

card.innerHTML = `
  <div class="post-header">
    <img src="${avatarUrl}" alt="avatar"
         onerror="this.src='https://cdn-icons-png.flaticon.com/512/1946/1946429.png'">
    <div class="post-meta">
      <div class="post-user">${author}</div>
      <div class="post-date">${when}</div>
    </div>
    ${isOwner ? `
  <div class="post-menu">
    <button class="menu-btn" onclick="toggleMenu(this)">⋮</button>
    <div class="menu-dropdown hidden">
      <button onclick="deletePost('${p._id}')">Eliminar publicación</button>
    </div>
  </div>`
  : ""}

  </div>
  ${
    imgUrl
      ? `<img src="${imgUrl}" class="post-image" onclick="showModal('${imgUrl}')" 
             onerror="this.style.display='none'">`
      : ""
  }
  ${p.descripcion_ia ? `<div class="ai-detect">Detectado: ${p.descripcion_ia}</div>` : ""}
  ${text ? `<div class="post-text">${text}</div>` : ""}
  <div class="post-actions">
    <span>❤️ Me gusta</span>
    <span>💬 Comentar</span>
    <span>↗️ Compartir</span>
  </div>
`;


    wrap.appendChild(card);
  }

  // Actualizar avatar del usuario actual
  updateCurrentUserAvatarInFeed();
}


// === PUBLICAR NUEVO POST ===
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
    if (file) fd.append("image", file);

    const res = await fetch(API_PUB.create, {
      method: "POST",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      body: fd,
    });

    await res.json();
    await loadFeed();

    // limpiar preview y texto
    if (postPreview) {
      postPreview.src = "";
      postPreview.classList.add("hidden");
    }
    if ($("post-image")) $("post-image").value = "";
    if ($("post-text")) $("post-text").value = "";

    if (status) status.textContent = "Publicado ✓";
  } catch (err) {
    if (status) status.textContent = "Error al publicar";
    console.error(err);
  } finally {
    if (status) setTimeout(() => (status.textContent = ""), 1500);
  }
});

// === ACTUALIZAR AVATAR DEL USUARIO ACTUAL EN EL FEED ===
function updateCurrentUserAvatarInFeed() {
  const avatarImg = document.querySelector(".post-form .user-avatar");
  if (!avatarImg || !state.me) return;

  let avatarUrl = "";

  if (state.me.image) {
    if (typeof state.me.image === "string") {
      avatarUrl = state.me.image;
    } else if (state.me.image.url) {
      avatarUrl = state.me.image.url;
    }
  }

  avatarImg.src =
    avatarUrl && avatarUrl.startsWith("http")
      ? avatarUrl
      : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  avatarImg.onerror = () => {
    avatarImg.src = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  };
}

// === MENÚ DE 3 PUNTOS ===
function toggleMenu(btn) {
  const menu = btn.nextElementSibling;
  menu.classList.toggle("hidden");

  // Cerrar otros menús abiertos
  document.querySelectorAll(".menu-dropdown").forEach((m) => {
    if (m !== menu) m.classList.add("hidden");
  });
}

// Cerrar el menú si se hace clic fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".post-menu")) {
    document.querySelectorAll(".menu-dropdown").forEach((m) => m.classList.add("hidden"));
  }
});

// === ELIMINAR PUBLICACIÓN ===
async function deletePost(id) {
  if (!confirm("¿Seguro que deseas eliminar esta publicación?")) return;

  try {
    const res = await fetch(`${API_PUB.list}/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    const data = await res.json();
    if (data.status === "success") {
      toast("Publicación eliminada correctamente");
      await loadFeed();
    } else {
      toast("Error al eliminar publicación", false);
    }
  } catch (err) {
    console.error("Error eliminando publicación:", err);
    toast("Error al eliminar publicación", false);
  }
}
