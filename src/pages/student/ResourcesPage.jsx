import React, { useEffect, useMemo, useState } from "react";
import {
  BookmarkPlus,
  Download,
  FileText,
  MessageCircle,
  RefreshCw,
  Search,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  fetchResources,
  openOrDownloadResource,
} from "../../services/resource.service.js";
import { fetchCourses } from "../../services/course.service.js";
import {
  addBookmark,
  fetchBookmarks,
} from "../../services/bookmark.service.js";
import {
  addReaction,
  fetchMyReactions,
  removeReaction,
} from "../../services/reaction.service.js";
import ReactionButton from "../../components/resources/ReactionButton.jsx";
import CommentSection from "../../components/resources/CommentSection.jsx";

const RESOURCES_SCROLL_KEY = "peerlearn_resources_scroll_y";
const RESOURCES_RESTORE_KEY = "peerlearn_resources_restore_scroll";

function normalizeBookmarks(bookmarkData) {
  return Array.isArray(bookmarkData) ? bookmarkData : [];
}

function normalizeReactions(reactionData) {
  return Array.isArray(reactionData) ? reactionData : [];
}

function normalizeCourses(courseData) {
  return Array.isArray(courseData) ? courseData : [];
}

function getCourseId(course) {
  return String(course?.course_id || "");
}

function isCourseEnrolled(course) {
  return (
    course?.is_enrolled === 1 ||
    course?.is_enrolled === true ||
    course?.isEnrolled === true
  );
}

function getResourceId(resource) {
  return Number(resource?.resource_id || 0);
}

function ResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [myReactions, setMyReactions] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarking, setIsBookmarking] = useState(null);
  const [isDownloading, setIsDownloading] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState(
    location.state?.selectedCourseId || ""
  );
  const [selectedCourseName, setSelectedCourseName] = useState(
    location.state?.selectedCourseName || ""
  );

  const currentUserId = user?.id || user?.user_id || null;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.selectedCourseId) {
      setSelectedCourseId(String(location.state.selectedCourseId));
      setSelectedCourseName(location.state.selectedCourseName || "");
    }
  }, [location.state]);

  useEffect(() => {
    if (isLoading) return;

    const shouldRestore =
      sessionStorage.getItem(RESOURCES_RESTORE_KEY) === "true";

    if (shouldRestore) {
      const savedScrollY = sessionStorage.getItem(RESOURCES_SCROLL_KEY);
      const scrollY = Number(savedScrollY || 0);

      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: Number.isFinite(scrollY) ? scrollY : 0,
          behavior: "auto",
        });
      });

      sessionStorage.removeItem(RESOURCES_RESTORE_KEY);
    } else {
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      });
    }
  }, [isLoading, location.key]);

  async function loadData() {
    try {
      setIsLoading(true);
      setError("");

      const [resourceData, courseData, bookmarkData, reactionData] =
        await Promise.all([
          fetchResources(),
          fetchCourses(),
          fetchBookmarks(),
          fetchMyReactions(),
        ]);

      setResources(Array.isArray(resourceData) ? resourceData : []);
      setCourses(normalizeCourses(courseData));
      setBookmarks(normalizeBookmarks(bookmarkData));
      setMyReactions(normalizeReactions(reactionData));
    } catch (loadError) {
      console.error("Resources fetch error:", loadError);
      setResources([]);
      setCourses([]);
      setBookmarks([]);
      setMyReactions([]);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load resources."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const enrolledCourses = useMemo(() => {
    return courses.filter(isCourseEnrolled);
  }, [courses]);

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      enrolledCourses.map((course) => getCourseId(course)).filter(Boolean)
    );
  }, [enrolledCourses]);

  const bookmarkedIds = useMemo(() => {
    return new Set(bookmarks.map((item) => Number(item.resource_id)));
  }, [bookmarks]);

  const reactedIds = useMemo(() => {
    return new Set(myReactions.map((item) => Number(item.resource_id)));
  }, [myReactions]);

  const availableFilteredCourseName = useMemo(() => {
    if (!selectedCourseId) return "";

    const match = enrolledCourses.find(
      (course) => getCourseId(course) === String(selectedCourseId)
    );

    return (
      selectedCourseName ||
      match?.name ||
      match?.title ||
      match?.course_name ||
      ""
    );
  }, [enrolledCourses, selectedCourseId, selectedCourseName]);

  const filteredResources = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const resourceCourseId = String(resource?.course_id || "");

      if (!enrolledCourseIds.has(resourceCourseId)) return false;

      if (selectedCourseId && resourceCourseId !== String(selectedCourseId)) {
        return false;
      }

      if (!normalized) return true;

      const title = String(resource?.title || "").toLowerCase();
      const description = String(resource?.description || "").toLowerCase();
      const courseName = String(resource?.course_name || "").toLowerCase();
      const courseCode = String(resource?.course_code || "").toLowerCase();
      const uploaderName = String(resource?.uploader_name || "").toLowerCase();
      const resourceType = String(resource?.resource_type || "").toLowerCase();

      return (
        title.includes(normalized) ||
        description.includes(normalized) ||
        courseName.includes(normalized) ||
        courseCode.includes(normalized) ||
        uploaderName.includes(normalized) ||
        resourceType.includes(normalized)
      );
    });
  }, [resources, search, selectedCourseId, enrolledCourseIds]);

  function clearCourseFilter() {
    setSelectedCourseId("");
    setSelectedCourseName("");
    navigate("/student/resources", { replace: true, state: {} });
  }

  function goToResourceDetails(resourceId) {
    if (!resourceId || Number(resourceId) <= 0) {
      console.error("Invalid resource ID:", resourceId);
      alert("Resource could not be opened because its ID is missing.");
      return;
    }

    sessionStorage.setItem(RESOURCES_SCROLL_KEY, String(window.scrollY));
    sessionStorage.setItem(RESOURCES_RESTORE_KEY, "true");
    navigate(`/student/resources/${resourceId}`);
  }

  async function handleBookmark(resourceId) {
    if (!resourceId || Number(resourceId) <= 0) {
      alert("Invalid resource ID.");
      return;
    }

    try {
      setIsBookmarking(resourceId);
      await addBookmark(resourceId);

      const updatedBookmarks = await fetchBookmarks();
      setBookmarks(normalizeBookmarks(updatedBookmarks));
    } catch (bookmarkError) {
      console.error("Bookmark error:", bookmarkError);
      alert(
        bookmarkError?.response?.data?.message ||
          bookmarkError?.message ||
          "Could not bookmark resource"
      );
    } finally {
      setIsBookmarking(null);
    }
  }

  async function handleDownload(resource) {
    const resourceId = getResourceId(resource);

    if (!resourceId) {
      alert("Invalid resource.");
      return;
    }

    try {
      setIsDownloading(resourceId);
      await openOrDownloadResource(resource);
    } catch (downloadError) {
      console.error("Download error:", downloadError);
      alert(
        downloadError?.message ||
          downloadError?.response?.data?.message ||
          "Could not open resource"
      );
    } finally {
      setIsDownloading(null);
    }
  }

  async function handleToggleReaction(resourceId) {
    if (!resourceId || Number(resourceId) <= 0) {
      alert("Invalid resource ID.");
      return;
    }

    const liked = reactedIds.has(Number(resourceId));

    try {
      if (liked) {
        await removeReaction(resourceId);
        setMyReactions((prev) =>
          prev.filter((item) => Number(item.resource_id) !== Number(resourceId))
        );
        setResources((prev) =>
          prev.map((item) =>
            Number(item.resource_id) === Number(resourceId)
              ? {
                  ...item,
                  reaction_count: Math.max(
                    0,
                    Number(item.reaction_count || 0) - 1
                  ),
                }
              : item
          )
        );
      } else {
        await addReaction(resourceId);
        setMyReactions((prev) => [...prev, { resource_id: Number(resourceId) }]);
        setResources((prev) =>
          prev.map((item) =>
            Number(item.resource_id) === Number(resourceId)
              ? {
                  ...item,
                  reaction_count: Number(item.reaction_count || 0) + 1,
                }
              : item
          )
        );
      }
    } catch (reactionError) {
      console.error("Reaction error:", reactionError);
      alert(
        reactionError?.response?.data?.message ||
          reactionError?.message ||
          "Could not update reaction"
      );
    }
  }

  function toggleComments(resourceId) {
    setExpandedComments((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  }

  function handleCommentCountChange(resourceId, nextCount) {
    setResources((prev) =>
      prev.map((item) =>
        Number(item.resource_id) === Number(resourceId)
          ? {
              ...item,
              comment_count: Number(nextCount || 0),
            }
          : item
      )
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Resources
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Browse materials from your enrolled courses only.
        </p>
      </div>

      <section className="mb-8 rounded-3xl border border-slate-200 bg-sky-50 px-8 py-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-slate-500">
              Enrolled Course Materials
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Explore Your Course Resources
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              You are only seeing resources that belong to the courses you are
              enrolled in.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search resources..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-72"
              />
            </div>

            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {selectedCourseId ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <Filter size={14} />
              <span>
                Showing materials for:{" "}
                <span className="text-slate-900">
                  {availableFilteredCourseName || "Selected Course"}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={clearCourseFilter}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <X size={14} />
              Clear Filter
            </button>
          </div>
        ) : null}
      </section>

      {error ? (
        <section className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading resources...</p>
        </section>
      ) : enrolledCourses.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">
            You are not enrolled in any courses yet. Enroll in a course to see
            its resources.
          </p>
        </section>
      ) : filteredResources.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">
            No resources found for your enrolled courses.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredResources.map((resource) => {
            const resourceId = getResourceId(resource);
            const alreadyBookmarked = bookmarkedIds.has(resourceId);
            const isCommentsOpen = Boolean(expandedComments[resourceId]);
            const hasReacted = reactedIds.has(resourceId);

            return (
              <div
                key={resourceId}
                onClick={() => goToResourceDetails(resourceId)}
                className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                    <FileText size={20} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {resource.resource_type || "resource"}
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold leading-8 text-slate-900 transition hover:text-blue-700">
                    {resource.title}
                  </h3>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      goToResourceDetails(resourceId);
                    }}
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <span>Details</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">
                  {resource.description ||
                    "No description available for this resource."}
                </p>

                <div className="mt-5 space-y-2 text-sm text-slate-500">
                  {resource.course_name ? (
                    <p>
                      Course:{" "}
                      <span className="font-medium text-slate-700">
                        {resource.course_name}
                        {resource.course_code ? ` (${resource.course_code})` : ""}
                      </span>
                    </p>
                  ) : null}

                  {resource.uploader_name ? (
                    <p>
                      Uploaded by:{" "}
                      <span className="font-medium text-slate-700">
                        {resource.uploader_name}
                      </span>
                    </p>
                  ) : null}

                  {resource.created_at ? (
                    <p>
                      Uploaded:{" "}
                      <span className="font-medium text-slate-700">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDownload(resource);
                    }}
                    disabled={isDownloading === resourceId}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Download size={16} />
                    {isDownloading === resourceId ? "Opening..." : "Open"}
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleBookmark(resourceId);
                    }}
                    disabled={isBookmarking === resourceId || alreadyBookmarked}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <BookmarkPlus size={16} />
                    {alreadyBookmarked
                      ? "Bookmarked"
                      : isBookmarking === resourceId
                      ? "Saving..."
                      : "Bookmark"}
                  </button>

                  <ReactionButton
                    reacted={hasReacted}
                    count={Number(resource.reaction_count || 0)}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleReaction(resourceId);
                    }}
                  />

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleComments(resourceId);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <MessageCircle size={16} />
                    {isCommentsOpen
                      ? "Hide Comments"
                      : `Comments (${Number(resource.comment_count || 0)})`}
                  </button>
                </div>

                {isCommentsOpen ? (
                  <div
                    className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <CommentSection
                      resourceId={resourceId}
                      currentUserId={currentUserId}
                      onCommentCountChange={(nextCount) =>
                        handleCommentCountChange(resourceId, nextCount)
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default ResourcesPage;