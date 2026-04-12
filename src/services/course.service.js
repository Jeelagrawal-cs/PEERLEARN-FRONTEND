import api from "./api.js";

function normalizeCoursesResponse(response) {
  return response.data?.courses || response.data?.data || [];
}

export async function fetchCourses() {
  const response = await api.get("/api/courses");
  return normalizeCoursesResponse(response);
}

export async function fetchMyCourses() {
  const response = await api.get("/api/courses/my-courses");
  return normalizeCoursesResponse(response);
}

export async function fetchCourseDetails(courseId) {
  const response = await api.get(`/api/courses/${courseId}/details`);
  return response.data?.data || null;
}

export async function fetchCourseActivity(courseId) {
  const response = await api.get(`/api/courses/${courseId}/activity`);
  return response.data?.data || null;
}

export async function addMyCourse(courseId) {
  const response = await api.post(`/api/courses/${courseId}/enroll`);
  return response.data;
}

export async function removeMyCourse(courseId) {
  const response = await api.delete(`/api/courses/${courseId}/enroll`);
  return response.data;
}