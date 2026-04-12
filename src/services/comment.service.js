import api from "./api.js";

export async function fetchCommentsByResource(resourceId) {
  const response = await api.get(`/api/resources/${resourceId}/comments`);
  return response.data?.data || [];
}

export async function createComment(resourceId, payload) {
  const response = await api.post(`/api/resources/${resourceId}/comments`, payload);
  return response.data?.data || response.data;
}

export async function deleteComment(commentId) {
  const response = await api.delete(`/api/comments/${commentId}`);
  return response.data;
}

export async function updateComment(commentId, payload) {
  const response = await api.put(`/api/comments/${commentId}`, payload);
  return response.data?.data || response.data;
}