import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowLeft,
  Edit3,
  Lock,
  LockOpen,
  MessageSquare,
  Pin,
  RefreshCw,
  Reply,
  Search,
  SendHorizonal,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  createCourseDiscussionPost,
  createCourseDiscussionReply,
  deleteCourseDiscussionPost,
  deleteCourseDiscussionReply,
  fetchCourseDiscussions,
  toggleCourseDiscussionLock,
  toggleCourseDiscussionPin,
  updateCourseDiscussionPost,
  updateCourseDiscussionReply,
  voteCourseDiscussionPost,
  voteCourseDiscussionReply,
} from "../../services/discussion.service.js";

const SORT_OPTIONS = [
  { label: "Latest Activity", value: "latest" },
  { label: "Most Replies", value: "most_replies" },
  { label: "Pinned First", value: "pinned" },
  { label: "Top Score", value: "top" },
];

function formatDateTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleString();
}

function StudentCourseDiscussionsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserId = Number(user?.user_id || user?.id || 0);
  const currentUserRole = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();
  const isAdmin = currentUserRole === "admin";

  const [discussionData, setDiscussionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [replyLoadingPostId, setReplyLoadingPostId] = useState(null);
  const [pinLoadingPostId, setPinLoadingPostId] = useState(null);
  const [lockLoadingPostId, setLockLoadingPostId] = useState(null);
  const [postVoteLoadingId, setPostVoteLoadingId] = useState(null);
  const [replyVoteLoadingId, setReplyVoteLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const [newPostForm, setNewPostForm] = useState({
    title: "",
    content: "",
  });

  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplyForms, setOpenReplyForms] = useState({});

  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostForm, setEditingPostForm] = useState({
    title: "",
    content: "",
  });
  const [isSavingPostEdit, setIsSavingPostEdit] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyForm, setEditingReplyForm] = useState({
    postId: null,
    content: "",
  });
  const [isSavingReplyEdit, setIsSavingReplyEdit] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [courseId]);

  useEffect(() => {
    loadDiscussions();
  }, [courseId, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDiscussions(false, searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function canManageContent(ownerUserId) {
    return isAdmin || Number(ownerUserId) === currentUserId;
  }

  function handleBack() {
    if (isAdmin) {
      navigate("/admin/courses");
      return;
    }

    navigate(`/student/courses/${courseId}`);
  }

  async function loadDiscussions(refresh = false, overrideSearch = null) {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");
      setAccessDenied(false);

      const data = await fetchCourseDiscussions(courseId, {
        search: overrideSearch !== null ? overrideSearch : searchQuery,
        sort: sortBy,
      });

      setDiscussionData(data || null);
    } catch (loadError) {
      console.error("Course discussions load error:", loadError);
      setDiscussionData(null);

      const status = Number(loadError?.response?.status || 0);
      if (status === 403) {
        setAccessDenied(true);
      }

      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load course discussions."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleCreatePost(event) {
    event.preventDefault();

    const title = String(newPostForm.title || "").trim();
    const content = String(newPostForm.content || "").trim();

    if (!title || !content) {
      alert("Please enter both title and content.");
      return;
    }

    try {
      setIsSubmittingPost(true);

      await createCourseDiscussionPost(courseId, {
        title,
        content,
      });

      setNewPostForm({
        title: "",
        content: "",
      });

      await loadDiscussions(true);
    } catch (submitError) {
      console.error("Create post error:", submitError);
      alert(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Failed to create discussion post."
      );
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleCreateReply(postId, isLocked) {
    if (Number(isLocked || 0) === 1) {
      alert("This discussion is locked. New replies are disabled.");
      return;
    }

    const content = String(replyDrafts[postId] || "").trim();

    if (!content) {
      alert("Please enter your reply.");
      return;
    }

    try {
      setReplyLoadingPostId(postId);

      await createCourseDiscussionReply(courseId, postId, {
        content,
      });

      setReplyDrafts((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setOpenReplyForms((prev) => ({
        ...prev,
        [postId]: true,
      }));

      await loadDiscussions(true);
    } catch (submitError) {
      console.error("Create reply error:", submitError);
      alert(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Failed to create discussion reply."
      );
    } finally {
      setReplyLoadingPostId(null);
    }
  }

  function startEditPost(post) {
    if (!canManageContent(post.user_id)) return;

    setEditingPostId(Number(post.discussion_post_id));
    setEditingPostForm({
      title: post.title || "",
      content: post.content || "",
    });
  }

  function cancelEditPost() {
    setEditingPostId(null);
    setEditingPostForm({
      title: "",
      content: "",
    });
  }

  async function handleSavePostEdit(postId, ownerUserId) {
    if (!canManageContent(ownerUserId)) {
      alert("Only the creator or admin can edit this discussion post.");
      return;
    }

    const title = String(editingPostForm.title || "").trim();
    const content = String(editingPostForm.content || "").trim();

    if (!title || !content) {
      alert("Please enter both title and content.");
      return;
    }

    try {
      setIsSavingPostEdit(true);

      await updateCourseDiscussionPost(courseId, postId, {
        title,
        content,
      });

      cancelEditPost();
      await loadDiscussions(true);
    } catch (saveError) {
      console.error("Update post error:", saveError);
      alert(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "Failed to update discussion post."
      );
    } finally {
      setIsSavingPostEdit(false);
    }
  }

  async function handleDeletePost(postId, ownerUserId) {
    if (!canManageContent(ownerUserId)) {
      alert("Only the creator or admin can delete this discussion post.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this discussion post? All replies under it will also be removed."
    );

    if (!confirmed) return;

    try {
      setDeletingPostId(postId);
      await deleteCourseDiscussionPost(courseId, postId);

      if (Number(editingPostId) === Number(postId)) {
        cancelEditPost();
      }

      await loadDiscussions(true);
    } catch (deleteError) {
      console.error("Delete post error:", deleteError);
      alert(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Failed to delete discussion post."
      );
    } finally {
      setDeletingPostId(null);
    }
  }

  async function handleTogglePin(postId) {
    if (!isAdmin) {
      alert("Only admin can pin or unpin discussions.");
      return;
    }

    try {
      setPinLoadingPostId(postId);
      await toggleCourseDiscussionPin(courseId, postId);
      await loadDiscussions(true);
    } catch (toggleError) {
      console.error("Toggle pin error:", toggleError);
      alert(
        toggleError?.response?.data?.message ||
          toggleError?.message ||
          "Failed to update pinned status."
      );
    } finally {
      setPinLoadingPostId(null);
    }
  }

  async function handleToggleLock(postId) {
    if (!isAdmin) {
      alert("Only admin can lock or unlock discussions.");
      return;
    }

    try {
      setLockLoadingPostId(postId);
      await toggleCourseDiscussionLock(courseId, postId);
      await loadDiscussions(true);
    } catch (toggleError) {
      console.error("Toggle lock error:", toggleError);
      alert(
        toggleError?.response?.data?.message ||
          toggleError?.message ||
          "Failed to update locked status."
      );
    } finally {
      setLockLoadingPostId(null);
    }
  }

  async function handleVotePost(postId, voteType) {
    try {
      setPostVoteLoadingId(postId);
      await voteCourseDiscussionPost(courseId, postId, voteType);
      await loadDiscussions(true);
    } catch (voteError) {
      console.error("Vote post error:", voteError);
      alert(
        voteError?.response?.data?.message ||
          voteError?.message ||
          "Failed to vote on discussion post."
      );
    } finally {
      setPostVoteLoadingId(null);
    }
  }

  function startEditReply(postId, reply) {
    if (!canManageContent(reply.user_id)) return;

    setEditingReplyId(Number(reply.discussion_reply_id));
    setEditingReplyForm({
      postId: Number(postId),
      content: reply.content || "",
    });
  }

  function cancelEditReply() {
    setEditingReplyId(null);
    setEditingReplyForm({
      postId: null,
      content: "",
    });
  }

  async function handleSaveReplyEdit(postId, replyId, ownerUserId) {
    if (!canManageContent(ownerUserId)) {
      alert("Only the creator or admin can edit this reply.");
      return;
    }

    const content = String(editingReplyForm.content || "").trim();

    if (!content) {
      alert("Please enter reply content.");
      return;
    }

    try {
      setIsSavingReplyEdit(true);

      await updateCourseDiscussionReply(courseId, postId, replyId, {
        content,
      });

      cancelEditReply();
      await loadDiscussions(true);
    } catch (saveError) {
      console.error("Update reply error:", saveError);
      alert(
        saveError?.response?.data?.message ||
          saveError?.message ||
          "Failed to update discussion reply."
      );
    } finally {
      setIsSavingReplyEdit(false);
    }
  }

  async function handleDeleteReply(postId, replyId, ownerUserId) {
    if (!canManageContent(ownerUserId)) {
      alert("Only the creator or admin can delete this reply.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this reply?");

    if (!confirmed) return;

    try {
      setDeletingReplyId(replyId);

      await deleteCourseDiscussionReply(courseId, postId, replyId);

      if (Number(editingReplyId) === Number(replyId)) {
        cancelEditReply();
      }

      await loadDiscussions(true);
    } catch (deleteError) {
      console.error("Delete reply error:", deleteError);
      alert(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Failed to delete discussion reply."
      );
    } finally {
      setDeletingReplyId(null);
    }
  }

  async function handleVoteReply(postId, replyId, voteType) {
    try {
      setReplyVoteLoadingId(replyId);
      await voteCourseDiscussionReply(courseId, postId, replyId, voteType);
      await loadDiscussions(true);
    } catch (voteError) {
      console.error("Vote reply error:", voteError);
      alert(
        voteError?.response?.data?.message ||
          voteError?.message ||
          "Failed to vote on discussion reply."
      );
    } finally {
      setReplyVoteLoadingId(null);
    }
  }

  const course = discussionData?.course || null;
  const summary = discussionData?.summary || {
    total_posts: 0,
    total_replies: 0,
  };
  const posts = Array.isArray(discussionData?.posts) ? discussionData.posts : [];
  const activeFilters = discussionData?.filters || {
    search: "",
    sort: "latest",
  };

  const headerTitle = useMemo(() => {
    if (course?.course_name) {
      return `${course.course_name} Discussions`;
    }

    return "Course Discussions";
  }, [course]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
          <p className="text-sm text-slate-500">Loading course discussions...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
            <MessageSquare size={24} />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
            Discussion board is for enrolled students
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {error || "Enroll in this course to access discussions"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              {isAdmin ? "Back to Admin Courses" : "Back to Course"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !discussionData) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            {isAdmin ? "Back to Admin Courses" : "Back to Course"}
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
                {isAdmin ? "Back to Admin Courses" : "Back to Course"}
              </button>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                  Discussion Board
                </span>

                {course?.course_code ? (
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                    {course.course_code}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {headerTitle}
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Ask questions, clarify topics, and keep course discussions in one
                clean space.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <MessageSquare size={16} />
                  {summary.total_posts} {summary.total_posts === 1 ? "post" : "posts"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <Reply size={16} />
                  {summary.total_replies}{" "}
                  {summary.total_replies === 1 ? "reply" : "replies"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
                  <Users size={16} />
                  {isAdmin ? "Admin moderation view" : "Enrolled board"}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[240px]">
              <button
                type="button"
                onClick={() => loadDiscussions(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw size={16} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search discussions by title, content, or author..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSortBy("latest");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Search: {activeFilters.search ? `"${activeFilters.search}"` : "All"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Sort:{" "}
              {SORT_OPTIONS.find((item) => item.value === activeFilters.sort)?.label ||
                "Latest Activity"}
            </span>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Sparkles size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Start a discussion
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Share a question, doubt, resource context, or class-related idea.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
                <input
                  type="text"
                  value={newPostForm.title}
                  onChange={(event) =>
                    setNewPostForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Discussion title"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
                />

                <textarea
                  value={newPostForm.content}
                  onChange={(event) =>
                    setNewPostForm((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Write your discussion post here..."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <SendHorizonal size={16} />
                    {isSubmittingPost ? "Posting..." : "Create Post"}
                  </button>
                </div>
              </form>
            </section>

            {posts.length === 0 ? (
              <section className="rounded-[32px] border border-white/80 bg-white p-10 text-center shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <MessageSquare size={28} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  No discussions found
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Try changing your search or sort filters, or create a new discussion.
                </p>
              </section>
            ) : (
              <section className="space-y-5">
                {posts.map((post) => {
                  const postId = Number(post.discussion_post_id);
                  const replies = Array.isArray(post.replies) ? post.replies : [];
                  const isReplySubmitting = Number(replyLoadingPostId) === postId;
                  const isReplyFormOpen = Boolean(openReplyForms[postId]);
                  const isEditingPost = Number(editingPostId) === postId;
                  const isDeletingPost = Number(deletingPostId) === postId;
                  const canManagePost = canManageContent(post.user_id);
                  const isPinned = Number(post.is_pinned || 0) === 1;
                  const isLocked = Number(post.is_locked || 0) === 1;
                  const isPinLoading = Number(pinLoadingPostId) === postId;
                  const isLockLoading = Number(lockLoadingPostId) === postId;
                  const isPostVoteLoading = Number(postVoteLoadingId) === postId;
                  const currentPostVote = String(post.current_user_vote || "");
                  const postScore = Number(post.score || 0);

                  return (
                    <article
                      key={postId}
                      className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]"
                    >
                      <div className="flex gap-4">
                        <div className="flex w-[72px] shrink-0 flex-col items-center rounded-[22px] bg-slate-50 px-2 py-3">
                          <button
                            type="button"
                            onClick={() => handleVotePost(postId, "upvote")}
                            disabled={isPostVoteLoading}
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                              currentPostVote === "upvote"
                                ? "bg-emerald-100 text-emerald-700"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            <ArrowBigUp size={22} />
                          </button>

                          <span className="mt-2 text-lg font-black text-slate-900">
                            {postScore}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleVotePost(postId, "downvote")}
                            disabled={isPostVoteLoading}
                            className={`mt-2 flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                              currentPostVote === "downvote"
                                ? "bg-rose-100 text-rose-700"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            <ArrowBigDown size={22} />
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                                Discussion
                              </span>

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                                {Number(post.reply_count || 0)}{" "}
                                {Number(post.reply_count || 0) === 1 ? "reply" : "replies"}
                              </span>

                              {isPinned ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                                  <Pin size={12} />
                                  Pinned
                                </span>
                              ) : null}

                              {isLocked ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                                  <Lock size={12} />
                                  Locked
                                </span>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {isAdmin ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePin(postId)}
                                    disabled={isPinLoading}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    <Pin size={14} />
                                    {isPinLoading
                                      ? "Saving..."
                                      : isPinned
                                      ? "Unpin"
                                      : "Pin"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleLock(postId)}
                                    disabled={isLockLoading}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {isLocked ? <LockOpen size={14} /> : <Lock size={14} />}
                                    {isLockLoading
                                      ? "Saving..."
                                      : isLocked
                                      ? "Unlock"
                                      : "Lock"}
                                  </button>
                                </>
                              ) : null}

                              {canManagePost ? (
                                <>
                                  {!isEditingPost ? (
                                    <button
                                      type="button"
                                      onClick={() => startEditPost(post)}
                                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      <Edit3 size={14} />
                                      Edit
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={cancelEditPost}
                                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      <X size={14} />
                                      Cancel
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(postId, post.user_id)}
                                    disabled={isDeletingPost}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    <Trash2 size={14} />
                                    {isDeletingPost ? "Deleting..." : "Delete"}
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {isEditingPost ? (
                            <div className="mt-5 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                              <input
                                type="text"
                                value={editingPostForm.title}
                                onChange={(event) =>
                                  setEditingPostForm((prev) => ({
                                    ...prev,
                                    title: event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400"
                              />

                              <textarea
                                value={editingPostForm.content}
                                onChange={(event) =>
                                  setEditingPostForm((prev) => ({
                                    ...prev,
                                    content: event.target.value,
                                  }))
                                }
                                rows={5}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400"
                              />

                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={cancelEditPost}
                                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSavePostEdit(postId, post.user_id)}
                                  disabled={isSavingPostEdit}
                                  className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {isSavingPostEdit ? "Saving..." : "Save Changes"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                                {post.title}
                              </h2>

                              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="font-semibold text-slate-700">
                                  {post.author_name || "Unknown user"}
                                </span>
                                <span>•</span>
                                <span>{formatDateTime(post.created_at)}</span>
                                {post.updated_at &&
                                post.created_at &&
                                new Date(post.updated_at).getTime() !==
                                  new Date(post.created_at).getTime() ? (
                                  <>
                                    <span>•</span>
                                    <span>Edited {formatDateTime(post.updated_at)}</span>
                                  </>
                                ) : null}
                              </div>

                              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                {post.content}
                              </p>
                            </>
                          )}

                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenReplyForms((prev) => ({
                                  ...prev,
                                  [postId]: !prev[postId],
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Reply size={16} />
                              {isReplyFormOpen ? "Hide Reply Form" : "Reply"}
                            </button>

                            <span className="text-sm text-slate-500">
                              {replies.length} {replies.length === 1 ? "reply" : "replies"}
                            </span>
                          </div>

                          {isReplyFormOpen ? (
                            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                              <textarea
                                value={replyDrafts[postId] || ""}
                                onChange={(event) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [postId]: event.target.value,
                                  }))
                                }
                                rows={4}
                                placeholder={
                                  isLocked
                                    ? "This discussion is locked."
                                    : "Write your reply..."
                                }
                                disabled={isLocked}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                              />

                              <div className="mt-4 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleCreateReply(postId, isLocked)}
                                  disabled={isReplySubmitting || isLocked}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <SendHorizonal size={16} />
                                  {isReplySubmitting ? "Posting..." : "Post Reply"}
                                </button>
                              </div>
                            </div>
                          ) : null}

                          <div className="mt-6 space-y-4">
                            {replies.map((reply) => {
                              const replyId = Number(reply.discussion_reply_id);
                              const isEditingReply = Number(editingReplyId) === replyId;
                              const isDeletingReply = Number(deletingReplyId) === replyId;
                              const canManageReply = canManageContent(reply.user_id);
                              const currentReplyVote = String(reply.current_user_vote || "");
                              const replyScore = Number(reply.score || 0);
                              const isReplyVoteLoading =
                                Number(replyVoteLoadingId) === replyId;

                              return (
                                <div
                                  key={replyId}
                                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="flex gap-4">
                                    <div className="flex w-[64px] shrink-0 flex-col items-center rounded-[20px] bg-white px-2 py-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleVoteReply(postId, replyId, "upvote")
                                        }
                                        disabled={isReplyVoteLoading}
                                        className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                                          currentReplyVote === "upvote"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                      >
                                        <ArrowBigUp size={20} />
                                      </button>

                                      <span className="mt-2 text-base font-black text-slate-900">
                                        {replyScore}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleVoteReply(postId, replyId, "downvote")
                                        }
                                        disabled={isReplyVoteLoading}
                                        className={`mt-2 flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                                          currentReplyVote === "downvote"
                                            ? "bg-rose-100 text-rose-700"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                      >
                                        <ArrowBigDown size={20} />
                                      </button>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                          <span className="font-semibold text-slate-700">
                                            {reply.author_name || "Unknown user"}
                                          </span>
                                          <span>•</span>
                                          <span>{formatDateTime(reply.created_at)}</span>
                                          {reply.updated_at &&
                                          reply.created_at &&
                                          new Date(reply.updated_at).getTime() !==
                                            new Date(reply.created_at).getTime() ? (
                                            <>
                                              <span>•</span>
                                              <span>
                                                Edited {formatDateTime(reply.updated_at)}
                                              </span>
                                            </>
                                          ) : null}
                                        </div>

                                        {canManageReply ? (
                                          <div className="flex flex-wrap items-center gap-2">
                                            {!isEditingReply ? (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  startEditReply(postId, reply)
                                                }
                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                              >
                                                <Edit3 size={14} />
                                                Edit
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={cancelEditReply}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                              >
                                                <X size={14} />
                                                Cancel
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteReply(
                                                  postId,
                                                  replyId,
                                                  reply.user_id
                                                )
                                              }
                                              disabled={isDeletingReply}
                                              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                              <Trash2 size={14} />
                                              {isDeletingReply ? "Deleting..." : "Delete"}
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>

                                      {isEditingReply ? (
                                        <div className="mt-4 space-y-4">
                                          <textarea
                                            value={editingReplyForm.content}
                                            onChange={(event) =>
                                              setEditingReplyForm((prev) => ({
                                                ...prev,
                                                content: event.target.value,
                                              }))
                                            }
                                            rows={4}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400"
                                          />

                                          <div className="flex justify-end gap-3">
                                            <button
                                              type="button"
                                              onClick={cancelEditReply}
                                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                              Cancel
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleSaveReplyEdit(
                                                  postId,
                                                  replyId,
                                                  reply.user_id
                                                )
                                              }
                                              disabled={isSavingReplyEdit}
                                              className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                              {isSavingReplyEdit ? "Saving..." : "Save"}
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                          {reply.content}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {replies.length === 0 ? (
                              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                No replies yet. Start the conversation.
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Discussion tips
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>Use a clear title so classmates can understand the topic quickly.</p>
                <p>Search first to avoid duplicate questions.</p>
                <p>Upvote helpful answers so the best replies rise to the top.</p>
                <p>Admins can pin important posts and lock completed threads.</p>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Board summary
              </h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Posts
                  </div>
                  <div className="mt-1 text-2xl font-black text-slate-900">
                    {summary.total_posts}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Replies
                  </div>
                  <div className="mt-1 text-2xl font-black text-slate-900">
                    {summary.total_replies}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current Mode
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {isAdmin ? "Admin moderation access" : "Student discussion access"}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default StudentCourseDiscussionsPage;