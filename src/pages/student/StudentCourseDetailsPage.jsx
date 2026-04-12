import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addMyCourse,
  fetchCourseActivity,
  fetchCourseDetails,
  removeMyCourse,
} from "../../services/course.service.js";
import { fetchCourseDiscussionPreview } from "../../services/discussion.service.js";
import { openOrDownloadResource } from "../../services/resource.service.js";

const RESOURCE_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Notes", value: "notes" },
  { label: "Assignment", value: "assignment" },
  { label: "Past Paper", value: "past_paper" },
  { label: "Recorded Lecture", value: "recorded_lecture" },
  { label: "Presentation", value: "presentation" },
  { label: "Document", value: "document" },
  { label: "Image", value: "image" },
  { label: "Link", value: "link" },
];

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Most Downloaded", value: "downloads" },
];

function formatTypeLabel(type) {
  if (!type) return "Resource";

  return String(type)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleString();
}

function StudentCourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseDetails, setCourseDetails] = useState(null);
  const [courseActivity, setCourseActivity] = useState(null);
  const [discussionPreview, setDiscussionPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [discussionError, setDiscussionError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [courseId]);

  useEffect(() => {
    loadPageData();
  }, [courseId]);

  async function loadPageData() {
    try {
      setIsLoading(true);
      setError("");

      if (!courseId || courseId === "undefined") {
        setCourseDetails(null);
        setError("Valid course ID is required.");
        return;
      }

      const data = await fetchCourseDetails(courseId);
      setCourseDetails(data || null);
    } catch (loadError) {
      console.error("Course details load error:", loadError);
      setCourseDetails(null);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load course details."
      );
    } finally {
      setIsLoading(false);
    }

    loadCourseActivity();
    loadDiscussionPreview();
  }

  async function loadCourseActivity() {
    try {
      setIsActivityLoading(true);
      setActivityError("");

      if (!courseId || courseId === "undefined") {
        setCourseActivity(null);
        setActivityError("Valid course ID is required.");
        return;
      }

      const data = await fetchCourseActivity(courseId);
      setCourseActivity(data || null);
    } catch (loadError) {
      console.error("Course activity load error:", loadError);
      setCourseActivity(null);
      setActivityError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load course activity."
      );
    } finally {
      setIsActivityLoading(false);
    }
  }

  async function loadDiscussionPreview() {
    try {
      setIsDiscussionLoading(true);
      setDiscussionError("");

      if (!courseId || courseId === "undefined") {
        setDiscussionPreview(null);
        setDiscussionError("Valid course ID is required.");
        return;
      }

      const data = await fetchCourseDiscussionPreview(courseId);
      setDiscussionPreview(data || null);
    } catch (loadError) {
      console.error("Discussion preview load error:", loadError);
      setDiscussionPreview(null);
      setDiscussionError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load discussion preview."
      );
    } finally {
      setIsDiscussionLoading(false);
    }
  }

  async function handleEnroll() {
    if (!courseDetails?.course?.course_id) return;

    try {
      setIsActionLoading(true);
      await addMyCourse(courseDetails.course.course_id);
      await loadPageData();
    } catch (actionError) {
      console.error("Enroll course error:", actionError);
      alert(
        actionError?.response?.data?.message ||
          actionError?.message ||
          "Failed to enroll in course."
      );
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleRemove() {
    if (!courseDetails?.course?.course_id) return;

    try {
      setIsActionLoading(true);
      await removeMyCourse(courseDetails.course.course_id);
      await loadPageData();
    } catch (actionError) {
      console.error("Remove course error:", actionError);
      alert(
        actionError?.response?.data?.message ||
          actionError?.message ||
          "Failed to remove course."
      );
    } finally {
      setIsActionLoading(false);
    }
  }

  function handleOpenResource(resource) {
    try {
      openOrDownloadResource(resource);
    } catch (resourceError) {
      console.error("Open resource error:", resourceError);
      alert(resourceError?.message || "Unable to open this resource right now.");
    }
  }

  function handleViewResourceDetails(resourceId) {
    if (!resourceId) {
      alert("Invalid resource ID.");
      return;
    }

    navigate(`/student/resources/${resourceId}`);
  }

  function handleUploadToThisCourse() {
    if (!courseDetails?.course?.course_id) return;
    navigate(`/student/upload?courseId=${courseDetails.course.course_id}`);
  }

  function handleOpenDiscussions() {
    if (!courseId || courseId === "undefined") {
      alert("Invalid course ID.");
      return;
    }

    navigate(`/courses/${courseId}/discussions`);
  }

  const course = courseDetails?.course || null;
  const resources = Array.isArray(courseDetails?.resources)
    ? courseDetails.resources
    : [];
  const isEnrolled = Number(course?.is_enrolled || 0) === 1;

  const activitySummary = courseActivity?.summary || {
    total_resources: 0,
    total_comments: 0,
    total_reactions: 0,
  };

  const recentActivityItems = Array.isArray(courseActivity?.items)
    ? courseActivity.items.slice(0, 6)
    : [];

  const discussionSummary = discussionPreview?.summary || {
    total_posts: 0,
    total_replies: 0,
  };

  const discussionPosts = Array.isArray(discussionPreview?.posts)
    ? discussionPreview.posts
    : [];

  const canViewDiscussions = Boolean(discussionPreview?.can_view);

  const filteredResources = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let nextResources = [...resources];

    if (selectedType !== "all") {
      nextResources = nextResources.filter(
        (resource) => String(resource?.resource_type || "") === selectedType
      );
    }

    if (keyword) {
      nextResources = nextResources.filter((resource) => {
        const title = String(resource?.title || "").toLowerCase();
        const description = String(resource?.description || "").toLowerCase();
        const uploaderName = String(resource?.uploader_name || "").toLowerCase();
        const resourceType = String(resource?.resource_type || "").toLowerCase();

        return (
          title.includes(keyword) ||
          description.includes(keyword) ||
          uploaderName.includes(keyword) ||
          resourceType.includes(keyword)
        );
      });
    }

    nextResources.sort((a, b) => {
      if (sortBy === "downloads") {
        return Number(b?.download_count || 0) - Number(a?.download_count || 0);
      }

      return (
        new Date(b?.created_at || 0).getTime() -
        new Date(a?.created_at || 0).getTime()
      );
    });

    return nextResources;
  }, [resources, search, selectedType, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
          <p className="text-sm text-slate-500">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-sm text-red-700">{error || "Course not found."}</p>

          <button
            type="button"
            onClick={() => navigate("/student/courses")}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/80 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/student/courses")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <ArrowLeft size={16} />
                Back to Courses
              </button>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                  {course.course_code || "Course"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                    isEnrolled
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {isEnrolled ? "Enrolled" : "Not Enrolled"}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {course.course_name}
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                {course.description || "No description available for this course."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <GraduationCap size={16} />
                  Semester {course.semester || "N/A"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <BookOpen size={16} />
                  {course.department || "General"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <FolderOpen size={16} />
                  {resources.length} {resources.length === 1 ? "resource" : "resources"}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[280px]">
              <button
                type="button"
                onClick={loadPageData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleUploadToThisCourse}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={16} />
                Upload Resource to This Course
              </button>

              <button
                type="button"
                onClick={handleOpenDiscussions}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                <MessageSquare size={16} />
                View Discussions
              </button>

              {isEnrolled ? (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isActionLoading}
                  className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isActionLoading ? "Removing..." : "Remove Course"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isActionLoading}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isActionLoading ? "Enrolling..." : "Enroll in Course"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="relative lg:col-span-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search resources in this course..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
              />
            </div>

            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              {RESOURCE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-6">
            {filteredResources.length === 0 ? (
              <section className="rounded-[32px] border border-white/80 bg-white p-10 text-center shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <FolderOpen size={28} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  No resources found
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  There are no resources matching your current search, filter, or sort
                  selection for this course.
                </p>
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredResources.map((resource) => {
                  const resourceId = Number(resource.resource_id || 0);

                  return (
                    <div
                      key={resourceId}
                      className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_10px_30px_rgba(74,104,179,0.07)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(74,104,179,0.10)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                          <FileText size={18} />
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                          {formatTypeLabel(resource.resource_type)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-black tracking-tight text-slate-900">
                        {resource.title || "Untitled Resource"}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {resource.description || "No description available."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-50 px-3 py-1">
                          {resource.uploader_name || "Unknown uploader"}
                        </span>
                        <span className="rounded-full bg-slate-50 px-3 py-1">
                          {formatDate(resource.created_at)}
                        </span>
                        <span className="rounded-full bg-slate-50 px-3 py-1">
                          Downloads: {Number(resource.download_count || 0)}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenResource(resource)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          <Download size={15} />
                          Open Resource
                        </button>

                        <button
                          type="button"
                          onClick={() => handleViewResourceDetails(resourceId)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Course Activity
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Latest engagement happening in this course.
                  </p>
                </div>
              </div>

              {isActivityLoading ? (
                <p className="mt-5 text-sm text-slate-500">Loading activity...</p>
              ) : activityError ? (
                <p className="mt-5 text-sm text-red-600">{activityError}</p>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    <div className="rounded-[22px] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Resources
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {activitySummary.total_resources}
                      </p>
                    </div>

                    <div className="rounded-[22px] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Comments
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {activitySummary.total_comments}
                      </p>
                    </div>

                    <div className="rounded-[22px] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Reactions
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {activitySummary.total_reactions}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {recentActivityItems.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        No recent activity found.
                      </div>
                    ) : (
                      recentActivityItems.map((item, index) => (
                        <div
                          key={`${item.activity_type || "activity"}-${index}`}
                          className="rounded-[20px] bg-slate-50 px-4 py-4"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title || item.activity_type || "Course activity"}
                          </p>
                          <p className="mt-1 text-xs leading-6 text-slate-500">
                            {item.description || "Recent course update"} •{" "}
                            {formatDateTime(item.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <MessageSquare size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Discussions
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Quick view of active course discussions.
                  </p>
                </div>
              </div>

              {isDiscussionLoading ? (
                <p className="mt-5 text-sm text-slate-500">Loading discussions...</p>
              ) : discussionError ? (
                <p className="mt-5 text-sm text-red-600">{discussionError}</p>
              ) : !canViewDiscussions ? (
                <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Enroll in this course to access the discussion board.
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Posts
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {discussionSummary.total_posts}
                      </p>
                    </div>

                    <div className="rounded-[22px] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Replies
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {discussionSummary.total_replies}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {discussionPosts.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        No discussions yet. Start the first conversation.
                      </div>
                    ) : (
                      discussionPosts.map((post) => (
                        <button
                          key={post.discussion_post_id}
                          type="button"
                          onClick={handleOpenDiscussions}
                          className="block w-full rounded-[20px] bg-slate-50 px-4 py-4 text-left transition hover:bg-slate-100"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {Number(post.is_pinned || 0) === 1 ? (
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                Pinned
                              </span>
                            ) : null}

                            {Number(post.is_locked || 0) === 1 ? (
                              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                                Locked
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">
                            {post.title || "Untitled Discussion"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {post.author_name || "Unknown"} •{" "}
                            {Number(post.reply_count || 0)} replies
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default StudentCourseDetailsPage;