export const API_BASE = "http://localhost:8000";

async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {};
  let fetchBody;

  if (body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchBody = new URLSearchParams(body).toString();
  }

  const storedToken = token || localStorage.getItem("access_token");
  if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: body ? (method === "GET" ? "POST" : method) : method,
    headers,
    body: fetchBody,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "오류가 발생했습니다.");
  return data;
}

async function apiFormData(path, { method = "POST", formData } = {}) {
  const token = localStorage.getItem("access_token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "오류가 발생했습니다.");
  return data;
}

export const authApi = {
  sendCode: (email) => apiFetch("/auth/send-code", { body: { email } }),
  verifyCode: (email, code) => apiFetch("/auth/verify-code", { body: { email, code } }),
  register: (data) => apiFetch("/auth/register", { body: data }),
  login: (email, password) => apiFetch("/auth/login", { body: { email, password } }),
  getMe: () => apiFetch("/auth/me"),
  updateProfile: (data) => apiFetch("/auth/update", { method: "PUT", body: data }),
  sendUpdateCode: (email) => apiFetch("/auth/update/send-code", { body: { email } }),
};

export const postsApi = {
  getAll: () => apiFetch("/posts/"),
  create: (formData) => apiFormData("/posts/", { formData }),
  update: (id, formData) => apiFormData(`/posts/${id}`, { method: "PUT", formData }),
  delete: (id) => apiFetch(`/posts/${id}`, { method: "DELETE" }),
  report: (id, reason) => apiFetch(`/posts/${id}/report`, { body: { reason } }),
};

export const chatApi = {
  getUsers: () => apiFetch("/users"),
  getMessages: (userId) => apiFetch(`/chat/${userId}`),
  sendMessage: (userId, content) => apiFetch(`/chat/${userId}`, { body: { content } }),
  reportUser: (userId, reason) => apiFetch(`/chat/report/${userId}`, { body: { reason } }),
};