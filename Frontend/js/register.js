document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const form = $("form-register");
  const btn = $("btn-register");

  const toast = (msg, ok = true) => alert((ok ? "✓ " : "✗ ") + msg);

  const API_AUTH = {
    register: "/api/auth/register",
  };

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = $("register-name")?.value.trim();
    const surname = $("register-surname")?.value.trim();
    const nick = $("register-nick")?.value.trim();
    const email = $("register-email")?.value.trim();
    const password = $("register-pass")?.value.trim();

    if (!name || !nick || !email || !password) {
      toast("Faltan campos obligatorios", false);
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Registrando...";
      }

      const res = await fetch(API_AUTH.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, nick, email, password }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("me", JSON.stringify(data.user));

      toast("Registro exitoso");

      // ✅ Redirigir con token como hash (como Google)
      window.location.href = "/index.html#token=" + data.token;
    } catch (err) {
      toast("Error al registrar: " + err.message, false);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Registrarme";
      }
    }
  });
});
