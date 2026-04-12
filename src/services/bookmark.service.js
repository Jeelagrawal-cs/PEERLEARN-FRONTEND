import api from "./api.js";

export async function fetchBookmarks() {
  const response = await api.get("/api/bookmarks");
  return response.data?.data || [];
}

export async function addBookmark(resourceId) {
  const response = await api.post("/api/bookmarks", {
    resource_id: resourceId,
  });

  return response.data;
}

export async function removeBookmark(resourceId) {
  const response = await api.delete(`/api/bookmarks/${resourceId}`);
  return response.data;
}