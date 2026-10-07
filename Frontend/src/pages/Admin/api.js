// Small fetch helper for the backend. VITE_API_URL comes from Frontend/.env (http://localhost:5000)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const SESSION_KEY = "dauer_admin_session";

function readToken() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY))?.token || null; } catch { return null; }
}

export async function request(path, { method = "GET", body } = {}) {
  const token = readToken();
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    // Token expired or invalid while using the dashboard: send the admin back to login.
    if (res.status === 401 && token && path !== "/admin/login") {
      localStorage.removeItem(SESSION_KEY);
      window.location.assign("/admin/login");
    }
    const err = new Error(data?.error || "Something went wrong. Please try again.");
    err.status = res.status;
    throw err;
  }
  return data;
}
