// =================== APP ===================
function setNav() {
  const nav = $("nav");
  if (!nav) return;
  nav.innerHTML = "";
  if (state.me) {
    nav.append(
      linkBtn("#/feed", "Feed"),
      linkBtn("#/users", "Usuarios"),
      linkBtn("#/profile", "Mi Perfil"),
      button("Salir", logout)
    );
  } else {
    nav.append(linkBtn("#/auth", "Entrar"));
  }
}

function hideAll() {
  ["view-auth", "view-feed", "view-users", "view-profile", "view-message"].forEach(hide);
}

async function route() {
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

  // ✅ Nuevo: perfil público (#/profile/:id) sin modificar el switch
  if (r.startsWith("#/profile/")) {
    const userId = r.split("/")[2];
    show("view-profile");
    await loadPublicProfile(userId); // Debe existir en tu users.js
    return; // Evita que caiga al switch
  }

  switch (r) {
    case "#/feed":
      show("view-feed");
      await loadFeed();
      break;

    case "#/users":
      show("view-users");
      await loadUsers();
      break;

    case "#/profile":
      show("view-profile");
      await Promise.all([loadFeed(), loadMyPosts()]);
      updateProfileHeader(); // se mantiene tal cual
      break;

    default:
      show("view-feed");
      await loadFeed();
      break;
  }
}


window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => { setNav(); route(); });
