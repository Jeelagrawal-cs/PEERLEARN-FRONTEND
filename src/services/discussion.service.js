import api from "./api.js";

export async function fetchCourseDiscussionPreview(courseId) {
  const response = await api.get(`/api/courses/${courseId}/discussions/preview`);
  return response.data?.data || null;
}

export async function fetchCourseDiscussions(courseId, params = {}) {
  const response = await api.get(`/api/courses/${courseId}/discussions`, {
    params,
  });
  return response.data?.data || null;
}

export async function createCourseDiscussionPost(courseId, payload) {
  const response = await api.post(`/api/courses/${courseId}/discussions`, payload);
  return response.data?.data || null;
}

export async function updateCourseDiscussionPost(courseId, postId, payload) {
  const response = await api.put(
    `/api/courses/${courseId}/discussions/${postId}`,
    payload
  );
  return response.data?.data || null;
}

export async function deleteCourseDiscussionPost(courseId, postId) {
  const response = await api.delete(`/api/courses/${courseId}/discussions/${postId}`);
  return response.data?.data || null;
}

export async function toggleCourseDiscussionPin(courseId, postId) {
  const response = await api.patch(`/api/courses/${courseId}/discussions/${postId}/pin`);
  return response.data?.data || null;
}

export async function toggleCourseDiscussionLock(courseId, postId) {
  const response = await api.patch(`/api/courses/${courseId}/discussions/${postId}/lock`);
  return response.data?.data || null;
}

export async function voteCourseDiscussionPost(courseId, postId, voteType) {
  const response = await api.post(
    `/api/courses/${courseId}/discussions/${postId}/vote`,
    { vote_type: voteType }
  );
  return response.data?.data || null;
}

export async function createCourseDiscussionReply(courseId, postId, payload) {
  const response = await api.post(
    `/api/courses/${courseId}/discussions/${postId}/replies`,
    payload
  );
  return response.data?.data || null;
}

export async function updateCourseDiscussionReply(courseId, postId, replyId, payload) {
  const response = await api.put(
    `/api/courses/${courseId}/discussions/${postId}/replies/${replyId}`,
    payload
  );
  return response.data?.data || null;
}

export async function deleteCourseDiscussionReply(courseId, postId, replyId) {
  const response = await api.delete(
    `/api/courses/${courseId}/discussions/${postId}/replies/${replyId}`
  );
  return response.data?.data || null;
}

export async function voteCourseDiscussionReply(
  courseId,
  postId,
  replyId,
  voteType
) {
  const response = await api.post(
    `/api/courses/${courseId}/discussions/${postId}/replies/${replyId}/vote`,
    { vote_type: voteType }
  );
  return response.data?.data || null;
}