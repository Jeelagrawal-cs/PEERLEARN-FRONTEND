import api from "./api.js";

export async function fetchNotifications() {
  const response = await api.get("/api/notifications");
  return response.data?.data || [];
}

export async function markNotificationRead(notificationId) {
  const response = await api.patch(`/api/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch("/api/notifications/read-all");
  return response.data;
}