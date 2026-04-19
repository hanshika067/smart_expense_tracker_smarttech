const TOKEN_KEY = "se_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  signup: (body) => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  listExpenses: (q) => {
    const params = new URLSearchParams(q || {}).toString();
    return request(`/expenses${params ? `?${params}` : ""}`);
  },
  createExpense: (body) => request("/expenses", { method: "POST", body: JSON.stringify(body) }),
  updateExpense: (id, body) => request(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),
  getBudget: () => request("/budget"),
  saveBudget: (body) => request("/budget", { method: "POST", body: JSON.stringify(body) }),
  dashboard: () => request("/analytics/dashboard"),
  categoryReport: () => request("/analytics/reports/category"),
};
