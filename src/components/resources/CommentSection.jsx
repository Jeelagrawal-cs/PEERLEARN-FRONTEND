import React, { useEffect, useState } from "react";
import {
  createComment,
  deleteComment,
  fetchCommentsByResource,
} from "../../services/comment.service.js";

function formatDate(dateValue) {
  if (!dateValue) return "Unknown time";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString();
}

function normalizeComment(comment) {
  if (!comment || typeof comment !== "object") {
    return {
      comment_id: Date.now(),
      text: "",
      authorName: "User",
      created_at: new Date().toISOString(),
    };
  }

  return {
    ...comment,
    text: comment.comment_text || comment.content || "",
    authorName:
      comment.commenter_name || comment.full_name || comment.name || "User",
  };
}

function CommentSection({ resourceId, currentUserId, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadComments() {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchCommentsByResource(resourceId);
        const normalizedComments = Array.isArray(data)
          ? data.map(normalizeComment)
          : [];

        if (!ignore) {
          setComments(normalizedComments);

          if (typeof onCountChange === "function") {
            onCountChange(normalizedComments.length);
          }
        }
      } catch (err) {
        console.error("Failed to load comments:", err);

        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load comments."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (resourceId) {
      loadComments();
    }

    return () => {
      ignore = true;
    };
  }, [resourceId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");

      const createdCommentResponse = await createComment(resourceId, {
        comment_text: content.trim(),
      });

      const createdComment = normalizeComment(createdCommentResponse);

      const nextComments = [...comments, createdComment];
      setComments(nextComments);
      setContent("");

      if (typeof onCountChange === "function") {
        onCountChange(nextComments.length);
      }
    } catch (err) {
      console.error("Failed to create comment:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add comment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      setDeletingId(commentId);
      setError("");

      await deleteComment(commentId);

      const nextComments = comments.filter(
        (item) => Number(item.comment_id) !== Number(commentId)
      );

      setComments(nextComments);

      if (typeof onCountChange === "function") {
        onCountChange(nextComments.length);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete comment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-bold text-slate-900">Comments</h4>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const commentUserId = comment.user_id || comment.id;
            const canDelete =
              currentUserId != null &&
              String(commentUserId) === String(currentUserId);

            return (
              <div
                key={comment.comment_id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {comment.authorName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>

                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.comment_id)}
                      disabled={deletingId === comment.comment_id}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      {deletingId === comment.comment_id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {comment.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CommentSection;