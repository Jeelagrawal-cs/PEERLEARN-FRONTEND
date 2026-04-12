import { io } from "socket.io-client";
import api, { getApiBaseUrl } from "./api.js";

export async function fetchMyStudyRooms() {
  const response = await api.get("/api/study-rooms/my-rooms");
  return response.data?.data || [];
}

export async function fetchStudyRoomByCourse(courseId) {
  const response = await api.get(`/api/study-rooms/courses/${courseId}`);
  return response.data?.data || null;
}

export function createStudyRoomSocket() {
  const token = localStorage.getItem("token");

  return io(getApiBaseUrl(), {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
}