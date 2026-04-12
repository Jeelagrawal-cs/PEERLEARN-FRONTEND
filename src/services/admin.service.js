import api from "./api.js";

export async function fetchAdminDashboard() {
  const response = await api.get("/api/admin/dashboard");
  return response.data?.data || {};
}

export async function fetchAdminOverview() {
  return fetchAdminDashboard();
}

export async function fetchAdminCourses() {
  const response = await api.get("/api/admin/courses");
  return response.data?.data || [];
}

export async function createAdminCourse(payload) {
  const response = await api.post("/api/admin/courses", payload);
  return response.data;
}

export async function updateAdminCourse(courseId, payload) {
  const response = await api.put(`/api/admin/courses/${courseId}`, payload);
  return response.data;
}

export async function deleteAdminCourse(courseId) {
  const response = await api.delete(`/api/admin/courses/${courseId}`);
  return response.data;
}

export async function fetchAdminResources() {
  const response = await api.get("/api/admin/resources");
  return response.data?.data || [];
}

export async function approveAdminResource(resourceId) {
  const response = await api.patch(`/api/admin/resources/${resourceId}/approve`);
  return response.data;
}

export async function markAdminResourcePending(resourceId) {
  const response = await api.patch(`/api/admin/resources/${resourceId}/pending`);
  return response.data;
}

export async function updateAdminResource(resourceId, payload) {
  const response = await api.put(`/api/admin/resources/${resourceId}`, payload);
  return response.data;
}

export async function updateAdminResourceStatus(resourceId, status) {
  if (status === "active" || status === "approved") {
    return approveAdminResource(resourceId);
  }

  if (status === "pending") {
    return markAdminResourcePending(resourceId);
  }

  const response = await api.put(`/api/admin/resources/${resourceId}`, { status });
  return response.data;
}

export async function deleteAdminResource(resourceId) {
  const response = await api.delete(`/api/admin/resources/${resourceId}`);
  return response.data;
}

export async function fetchAdminUsers() {
  const response = await api.get("/api/admin/users");
  return response.data?.data || [];
}

export async function makeUserAdmin(userId) {
  const response = await api.patch(`/api/admin/users/${userId}/make-admin`);
  return response.data;
}

export async function makeAdminStudent(userId) {
  const response = await api.patch(`/api/admin/users/${userId}/make-student`);
  return response.data;
}

export async function fetchAdminMalwareScans(params = {}) {
  const response = await api.get("/api/admin/malware-scans", { params });
  return response.data?.data || { overview: {}, scans: [] };
}