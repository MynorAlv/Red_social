// =================== FEED ===================

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

async function loadFeed() {
  try {
    const data = await apiGet(API_PUB.list);
    state.feed = data.publications || [];
    renderFeed();
  } catch (e) {
    state.feed = [];
    renderFeed();
    toast("No se pudo cargar el feed: " + e.message, false);
  }
}

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
    const imgUrl = p.image?.url || null;
    const avatar = p.user?.image?.url || "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

    const card = document.createElement("div");
    card.className = "post-card";

    card.innerHTML = `
      <div class="post-header">
        <img src="${avatar}" alt="avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1946/1946429.png'">
        <div>
          <div class="post-user">${author}</div>
          <div class="post-date">${when}</div>
        </div>
      </div>
      ${imgUrl ? `<img src="${imgUrl}" class="post-image" onclick="showModal('${imgUrl}')">` : ""}
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
