import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  Download,
  FileText,
  FolderOpen,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  fetchResources,
  openOrDownloadResource,
} from "../../services/resource.service.js";
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

function StudentResourceDetailsPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [allResources, setAllResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [myReactions, setMyReactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = user?.id || user?.user_id || null;
  const numericResourceId = Number(resourceId || 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [resourceId]);

  useEffect(() => {
    loadResourcePage();
  }, [resourceId]);

  async function loadResourcePage(refresh = false) {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      if (!numericResourceId || Number.isNaN(numericResourceId)) {
        setResource(null);
        setAllResources([]);
        setError("Valid resource ID is required.");
        return;
      }

      const [resourceData, bookmarkData, reactionData] = await Promise.all([
        fetchResources(),
        fetchBookmarks(),
        fetchMyReactions(),
      ]);

      const resources = Array.isArray(resourceData) ? resourceData : [];
      const selectedResource =
        resources.find(
          (item) => Number(item?.resource_id) === Number(numericResourceId)
        ) || null;

      setAllResources(resources);
      setBookmarks(Array.isArray(bookmarkData) ? bookmarkData : []);
      setMyReactions(Array.isArray(reactionData) ? reactionData : []);

      if (!selectedResource) {
        setResource(null);
        setError("Resource not found.");
        return;
      }

      setResource(selectedResource);
    } catch (loadError) {
      console.error("Resource details load error:", loadError);
      setResource(null);
      setAllResources([]);
      setBookmarks([]);
      setMyReactions([]);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load resource details."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function handleBack() {
    if (resource?.course_id) {
      navigate(`/student/courses/${resource.course_id}`);
      return;
    }

    navigate("/student/resources");
  }

  async function handleBookmark() {
    if (!resource?.resource_id) {
      alert("Invalid resource ID.");
      return;
    }

    try {
      setIsBookmarking(true);
      await addBookmark(resource.resource_id);

      const updatedBookmarks = await fetchBookmarks();
      setBookmarks(Array.isArray(updatedBookmarks) ? updatedBookmarks : []);
    } catch (bookmarkError) {
      console.error("Bookmark error:", bookmarkError);
      alert(
        bookmarkError?.response?.data?.message ||
          bookmarkError?.message ||
          "Could not bookmark resource."
      );
    } finally {
      setIsBookmarking(false);
    }
  }

  async function handleDownload() {
    if (!resource?.resource_id) {
      alert("Invalid resource.");
      return;
    }

    try {
      setIsDownloading(true);
      await openOrDownloadResource(resource);
    } catch (downloadError) {
      console.error("Open resource error:", downloadError);
      alert(
        downloadError?.response?.data?.message ||
          downloadError?.message ||
          "Could not open resource."
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleToggleReaction() {
    if (!resource?.resource_id) {
      alert("Invalid resource ID.");
      return;
    }

    const hasReacted = reactedIds.has(Number(resource.resource_id));

    try {
      if (hasReacted) {
        await removeReaction(resource.resource_id);
        setMyReactions((prev) =>
          prev.filter(
            (item) =>
              Number(item.resource_id) !== Number(resource.resource_id)
          )
        );
        setResource((prev) =>
          prev
            ? {
                ...prev,
                reaction_count: Math.max(
                  0,
                  Number(prev.reaction_count || 0) - 1
                ),
              }
            : prev
        );
      } else {
        await addReaction(resource.resource_id);
        setMyReactions((prev) => [
          ...prev,
          { resource_id: Number(resource.resource_id) },
        ]);
        setResource((prev) =>
          prev
            ? {
                ...prev,
                reaction_count: Number(prev.reaction_count || 0) + 1,
              }
            : prev
        );
      }
    } catch (reactionError) {
      console.error("Reaction error:", reactionError);
      alert(
        reactionError?.response?.data?.message ||
          reactionError?.message ||
          "Could not update reaction."
      );
    }
  }

  function handleCommentCountChange(nextCount) {
    setResource((prev) =>
      prev
        ? {
            ...prev,
            comment_count: Number(nextCount || 0),
          }
        : prev
    );
  }

  function handleOpenRelatedResource(nextResourceId) {
    if (!nextResourceId) return;
    navigate(`/student/resources/${nextResourceId}`);
  }

  const bookmarkedIds = useMemo(() => {
    return new Set(bookmarks.map((item) => Number(item.resource_id)));
  }, [bookmarks]);

  const reactedIds = useMemo(() => {
    return new Set(myReactions.map((item) => Number(item.resource_id)));
  }, [myReactions]);

  const alreadyBookmarked = resource
    ? bookmarkedIds.has(Number(resource.resource_id))
    : false;

  const hasReacted = resource
    ? reactedIds.has(Number(resource.resource_id))
    : false;

  const relatedResources = useMemo(() => {
    if (!resource?.course_id) return [];

    return allResources
      .filter(
        (item) =>
          Number(item?.course_id) === Number(resource.course_id) &&
          Number(item?.resource_id) !== Number(resource.resource_id)
      )
      .slice(0, 4);
  }, [allResources, resource]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
          <p className="text-sm text-slate-500">Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-sm text-red-700">{error || "Resource not found."}</p>

          <button
            type="button"
            onClick={() => navigate("/student/resources")}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Resources
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
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                  {formatTypeLabel(resource.resource_type)}
                </span>

                {resource.course_code ? (
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                    {resource.course_code}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {resource.title || "Untitled Resource"}
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                {resource.description || "No description available for this resource."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                {resource.course_name ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                    <FolderOpen size={16} />
                    {resource.course_name}
                  </span>
                ) : null}

                {resource.uploader_name ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                    <Sparkles size={16} />
                    {resource.uploader_name}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <FileText size={16} />
                  {formatDate(resource.created_at)}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[260px]">
              <button
                type="button"
                onClick={() => loadResourcePage(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw size={16} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Download size={16} />
                {isDownloading ? "Opening..." : "Open Resource"}
              </button>

              <button
                type="button"
                onClick={handleBookmark}
                disabled={alreadyBookmarked || isBookmarking}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <BookmarkPlus size={16} />
                {alreadyBookmarked
                  ? "Bookmarked"
                  : isBookmarking
                  ? "Saving..."
                  : "Bookmark"}
              </button>

              {resource.course_id ? (
                <button
                  type="button"
                  onClick={() => navigate(`/student/courses/${resource.course_id}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  <ArrowRight size={16} />
                  Open Course
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <FileText size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Resource Details
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    View material info, open the file, react, and join the discussion through comments.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Type
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {formatTypeLabel(resource.resource_type)}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Reactions
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {Number(resource.reaction_count || 0)}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Comments
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {Number(resource.comment_count || 0)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ReactionButton
                  reacted={hasReacted}
                  count={Number(resource.reaction_count || 0)}
                  onClick={handleToggleReaction}
                />
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <MessageCircle size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Comments
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Ask questions or discuss this resource with other students.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <CommentSection
                  resourceId={Number(resource.resource_id)}
                  currentUserId={currentUserId}
                  onCommentCountChange={handleCommentCountChange}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Quick Info
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Important metadata for this material.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Course
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {resource.course_name || "N/A"}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Uploaded By
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {resource.uploader_name || "Unknown"}
                  </p>
                </div>

                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Uploaded On
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(resource.created_at)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FolderOpen size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Related Resources
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    More materials from the same course.
                  </p>
                </div>
              </div>

              {relatedResources.length === 0 ? (
                <div className="mt-5 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  No related resources found.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {relatedResources.map((item) => (
                    <button
                      key={Number(item.resource_id)}
                      type="button"
                      onClick={() => handleOpenRelatedResource(Number(item.resource_id))}
                      className="w-full rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {item.title || "Untitled Resource"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatTypeLabel(item.resource_type)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default StudentResourceDetailsPage;