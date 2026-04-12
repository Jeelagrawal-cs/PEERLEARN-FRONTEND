import api from "./api.js";

export async function fetchMyProfile() {
  const response = await api.get("/api/users/profile");
  return response.data?.data || null;
}

export async function updateMyProfile(payload) {
  const response = await api.put("/api/users/profile", payload);
  return response.data?.data || null;
}

export async function fetchPublicProfile(userId) {
  const response = await api.get(`/api/users/public/${userId}`);
  return response.data?.data || null;
}