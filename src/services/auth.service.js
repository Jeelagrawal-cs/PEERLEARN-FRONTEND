import api from "./api.js";

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user.user_id || null,
    name: user.name || user.full_name || "User",
    role: user.role || user.role_name || "student",
    avatar_url: user.avatar_url || user.profile_image || null,
  };
}

function normalizeAuthPayload(responseData) {
  const payload = responseData?.data || responseData || {};

  return {
    token: payload?.token || null,
    user: normalizeUser(payload?.user || null),
    raw: responseData,
  };
}

export async function loginUser(payload) {
  const response = await api.post("/api/auth/login", payload);
  return normalizeAuthPayload(response.data);
}

export async function registerUser(payload) {
  const response = await api.post("/api/auth/register", payload);
  return normalizeAuthPayload(response.data);
}

export async function fetchCurrentUser() {
  const response = await api.get("/api/auth/me");
  return normalizeUser(response.data?.data || null);
}