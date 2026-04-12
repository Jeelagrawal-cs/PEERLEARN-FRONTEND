import React, { useEffect, useMemo, useState } from "react";
import {
  BookmarkCheck,
  Download,
  Trash2,
  Search,
  ArrowRight,
  FolderOpen,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchBookmarks,
  removeBookmark,
} from "../../services/bookmark.service.js";
import { openOrDownloadResource } from "../../services/resource.service.js";

function BookmarksPage() {
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [search, setSearch] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    try {
      setIsLoading(true);
      setPageError("");

      const data = await fetchBookmarks();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Bookmarks fetch error:", error);
      setBookmarks([]);
      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not load bookmarks."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(resourceId) {
    try {
      setRemovingId(resourceId);
      await removeBookmark(resourceId);
      setBookmarks((prev) =>
        prev.filter((item) => Number(item.resource_id) !== Number(resourceId))
      );
    } catch (error) {
      console.error("Remove bookmark error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Could not remove bookmark"
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function handleOpen(resource) {
    try {
      setOpeningId(resource.resource_id);
      await openOrDownloadResource(resource);
    } catch (error) {
      console.error("Open bookmark error:", error);
      alert(
        error?.message ||
          error?.response?.data?.message ||
          "Could not open resource"
      );
    } finally {
      setOpeningId(null);
    }
  }

  function goToDetails(resourceId) {
    navigate(`/student/resources/${resourceId}`);
  }

  const filteredBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return bookmarks;

    return bookmarks.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const description = String(item.description || "").toLowerCase();
      const courseName = String(item.course_name || "").toLowerCase();
      const uploaderName = String(item.uploader_name || "").toLowerCase();
      const type = String(item.resource_type || "").toLowerCase();

      return (
        title.includes(query) ||
        description.includes(query) ||
        courseName.includes(query) ||
        uploaderName.includes(query) ||
        type.includes(query)
      );
    });
  }, [bookmarks, search]);

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/80 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_260px] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <BookmarkCheck size={14} />
                Saved Library
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Your bookmarked resources
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Keep your most useful notes, documents, and learning materials in
                one place for quick access.
              </p>
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50 p-5">
              <div className="rounded-[24px] bg-white/90 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Saved count</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  {bookmarks.length}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  resource{bookmarks.length === 1 ? "" : "s"} saved
                </p>
              </div>
            </div>
          </div>
        </section>

        {pageError ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            {pageError}
          </div>
        ) : null}

        <section className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-3 rounded-[24px] border border-white/80 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(74,104,179,0.08)] lg:max-w-xl">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bookmarks..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={loadBookmarks}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgba(74,104,179,0.08)] transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </section>

        {isLoading ? (
          <section className="mt-6 rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <p className="text-sm text-slate-500">Loading bookmarks...</p>
          </section>
        ) : filteredBookmarks.length === 0 ? (
          <section className="mt-6 rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <BookmarkCheck size={28} />
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
                No bookmarks yet
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
                Save helpful resources while browsing so you can return to them
                quickly later.
              </p>

              <button
                type="button"
                onClick={() => navigate("/student/resources")}
                className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Resources
              </button>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {filteredBookmarks.map((item) => {
              const resourceId = Number(item.resource_id);

              return (
                <div
                  key={resourceId}
                  onClick={() => goToDetails(resourceId)}
                  className="cursor-pointer rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,104,179,0.08)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(74,104,179,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <BookmarkCheck size={20} />
                    </div>

                    <div className="flex items-center gap-2">
                      {item.resource_type ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                          {item.resource_type}
                        </span>
                      ) : null}

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                        Saved
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold leading-8 text-slate-900 transition hover:text-blue-700">
                      {item.title || "Untitled Resource"}
                    </h3>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goToDetails(resourceId);
                      }}
                      className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <span>Details</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">
                    {item.description || "No description available."}
                  </p>

                  <div className="mt-5 space-y-3">
                    {item.course_name ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FolderOpen size={16} className="text-slate-400" />
                        <span>
                          Course:{" "}
                          <span className="font-semibold text-slate-800">
                            {item.course_name}
                          </span>
                        </span>
                      </div>
                    ) : null}

                    {item.uploader_name ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText size={16} className="text-slate-400" />
                        <span>
                          Uploaded by:{" "}
                          <span className="font-semibold text-slate-800">
                            {item.uploader_name}
                          </span>
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div
                    className="mt-6 grid grid-cols-2 gap-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpen(item)}
                      disabled={openingId === resourceId}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Download size={16} />
                      {openingId === resourceId ? "Opening..." : "Open"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(resourceId)}
                      disabled={removingId === resourceId}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 size={16} />
                      {removingId === resourceId ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;