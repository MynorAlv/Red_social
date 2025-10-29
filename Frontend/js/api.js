// =================== CONFIG ===================
const API_BASE = "http://localhost:3900/api";
const API = API_BASE;

const API_PUB = {
  list: `${API}/publications`,
  create: `${API}/publications`,
  mine: `${API}/publications/mine`,
};

const API_USER = {
  list: `${API}/users`,
  me: `${API}/auth/me`,
};

const API_AUTH = {
  register: `${API}/auth/register`,
  login: `${API}/auth/login`,
};


// =================== FETCH HELPERS ===================
function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

async function apiGet(url) {
  const res = await fetch(url, { headers: { ...authHeaders() } });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`GET ${url} → ${res.status} ${t}`);
  }
  return jsonOrText(res);
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`POST ${url} → ${res.status} ${t}`);
  }
  return jsonOrText(res);
}

async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE", headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
  return jsonOrText(res);
}
