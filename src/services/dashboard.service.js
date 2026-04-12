import api from "./api.js";

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.courses)) return payload.courses;
  if (Array.isArray(payload?.resources)) return payload.resources;
  if (Array.isArray(payload?.bookmarks)) return payload.bookmarks;
  return [];
}

export async function getDashboardStats() {
  const [resourcesRes, bookmarksRes, coursesRes, myResourcesRes] =
    await Promise.allSettled([
      api.get("/api/resources"),
      api.get("/api/bookmarks"),
      api.get("/api/courses/my-courses"),
      api.get("/api/resources/my/list"),
    ]);

  const resources =
    resourcesRes.status === "fulfilled"
      ? extractArray(resourcesRes.value.data)
      : [];

  const bookmarks =
    bookmarksRes.status === "fulfilled"
      ? extractArray(bookmarksRes.value.data)
      : [];

  const allCoursesForUserView =
    coursesRes.status === "fulfilled"
      ? extractArray(coursesRes.value.data)
      : [];

  const enrolledCourses = Array.isArray(allCoursesForUserView)
    ? allCoursesForUserView.filter((course) => Boolean(course?.is_enrolled))
    : [];

  const myResources =
    myResourcesRes.status === "fulfilled"
      ? extractArray(myResourcesRes.value.data)
      : [];

  const downloadCount = Array.isArray(myResources)
    ? myResources.reduce(
        (sum, item) => sum + Number(item?.download_count || 0),
        0
      )
    : 0;

  const recentResources = Array.isArray(resources)
    ? [...resources]
        .sort((a, b) => {
          const dateA = new Date(a?.created_at || a?.uploaded_at || 0).getTime();
          const dateB = new Date(b?.created_at || b?.uploaded_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 3)
    : [];

  return {
    totalResources: Array.isArray(resources) ? resources.length : 0,
    downloads: downloadCount,
    bookmarks: Array.isArray(bookmarks) ? bookmarks.length : 0,
    courses: enrolledCourses.length,
    recentResources,
  };
}