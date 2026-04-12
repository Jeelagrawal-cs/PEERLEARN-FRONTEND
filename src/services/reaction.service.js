import api from "./api.js";

export async function fetchMyReactions() {
  const response = await api.get("/api/reactions/my");
  return response.data?.data || [];
}

export async function addReaction(resourceId) {
  const response = await api.post("/api/reactions", {
    resource_id: resourceId,
    reaction_type: "like",
  });

  return response.data;
}

export async function removeReaction(resourceId) {
  const response = await api.delete(`/api/reactions/${resourceId}`);
  return response.data;
}