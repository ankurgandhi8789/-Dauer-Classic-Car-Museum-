import { request, SESSION_KEY } from "./api";

export async function login(email, password) {
  const data = await request("/admin/login", { method: "POST", body: { email, password } });
  const session = {
    token: data.token,
    name: data.name,
    email: data.email,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!s?.token || !s.expiresAt || s.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
