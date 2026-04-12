import React, { useEffect, useMemo, useState } from "react";
import {
  deleteAdminResource,
  fetchAdminCourses,
  fetchAdminResources,
  updateAdminResource,
  updateAdminResourceStatus,
} from "../../services/admin.service.js";
import {
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  X,
  FolderOpen,
  ShieldAlert,
} from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  course_id: "",
  resource_type: "notes",
  visibility: "public",
  status: "pending",
};

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError("");

      const [resourceData, courseData] = await Promise.all([
        fetchAdminResources(),
        fetchAdminCourses(),
      ]);

      setResources(Array.isArray(resourceData) ? resourceData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load materials."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(resource) {
    setEditingId(resource.resource_id);
    setForm({
      title: resource.title || "",
      description: resource.description || "",
      course_id: resource.course_id || "",
      resource_type: resource.resource_type || "notes",
      visibility: resource.visibility || "public",
      status: resource.status || "pending",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSave() {
    try {
      setError("");
      setMessage("");
      await updateAdminResource(editingId, form);
      setMessage("Material updated successfully.");
      cancelEdit();
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update material."
      );
    }
  }

  async function handleStatus(resourceId, status) {
    try {
      setError("");
      setMessage("");
      await updateAdminResourceStatus(resourceId, status);
      setMessage("Material status updated successfully.");
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update status."
      );
    }
  }

  async function handleDelete(resourceId) {
    try {
      setError("");
      setMessage("");
      await deleteAdminResource(resourceId);

      if (editingId === resourceId) {
        cancelEdit();
      }

      setMessage("Material deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete material."
      );
    }
  }

  const filteredResources = useMemo(() => {
    let list = [...resources];

    if (statusFilter !== "all") {
      list = list.filter((resource) => resource.status === statusFilter);
    }

    const keyword = search.trim().toLowerCase();
    if (!keyword) return list;

    return list.filter((resource) => {
      const title = String(resource?.title || "").toLowerCase();
      const description = String(resource?.description || "").toLowerCase();
      const course = String(
        resource?.course_name || resource?.course_code || ""
      ).toLowerCase();
      const uploader = String(resource?.uploader_name || "").toLowerCase();
      const type = String(resource?.resource_type || "").toLowerCase();

      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        course.includes(keyword) ||
        uploader.includes(keyword) ||
        type.includes(keyword)
      );
    });
  }, [resources, statusFilter, search]);

  const pendingCount = resources.filter(
    (resource) => resource.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/70 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_360px] xl:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Moderate materials
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Review uploaded resources, approve them for students, return
                them to pending, or remove them when needed.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <SummaryPill label="Total" value={resources.length} />
                <SummaryPill label="Pending" value={pendingCount} />
                <SummaryPill
                  label="Editing"
                  value={editingId ? "Yes" : "No"}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-[28px] border border-slate-100 bg-slate-50/90 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Filters
              </p>

              <div className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, uploader, course..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Approved</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>
        </section>

        {message ? (
          <div className="mt-6 rounded-[24px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {editingId ? (
          <section className="mt-6 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Edit material
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update the resource details below.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancel edit
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Title"
                value={form.title || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter title"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course
                </label>
                <select
                  value={form.course_id || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, course_id: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Resource Type
                </label>
                <select
                  value={form.resource_type || "notes"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      resource_type: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="past_paper">Past Paper</option>
                  <option value="recorded_lecture">Recorded Lecture</option>
                  <option value="presentation">Presentation</option>
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Visibility
                </label>
                <select
                  value={form.visibility || "public"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, visibility: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="public">Public</option>
                  <option value="course_only">Course Only</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={form.status || "pending"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="removed">Removed</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Write a short description..."
                  rows="4"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Pencil size={16} />
              Save Changes
            </button>
          </section>
        ) : null}

        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)] sm:p-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Material list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredResources.length} material
              {filteredResources.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {isLoading ? (
              <>
                <ResourceSkeleton />
                <ResourceSkeleton />
                <ResourceSkeleton />
              </>
            ) : filteredResources.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-900">
                  No materials found
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Try another search or filter.
                </p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div
                  key={resource.resource_id}
                  className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                          <FolderOpen size={20} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="truncate text-lg font-bold text-slate-900">
                              {resource.title || "Untitled material"}
                            </h3>
                            <StatusBadge status={resource.status} />
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {resource.resource_type || "unknown"} •{" "}
                            {resource.course_name ||
                              resource.course_code ||
                              `Course ${resource.course_id}`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <InfoChip
                          label="Uploader"
                          value={resource.uploader_name || "Unknown"}
                        />
                        <InfoChip
                          label="Visibility"
                          value={resource.visibility || "public"}
                        />
                        <InfoChip
                          label="Resource ID"
                          value={resource.resource_id || "N/A"}
                        />
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {resource.description || "No description available."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end">
                      {resource.status !== "active" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatus(resource.resource_id, "active")
                          }
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                      ) : null}

                      {resource.status !== "pending" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatus(resource.resource_id, "pending")
                          }
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
                        >
                          <Clock3 size={16} />
                          Pending
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => startEdit(resource)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(resource.resource_id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();

  const classes =
    normalized === "active"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${classes}`}
    >
      {normalized}
    </span>
  );
}

function ResourceSkeleton() {
  return (
    <div className="animate-pulse rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
      <div className="h-4 w-56 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-44 rounded bg-slate-200" />
      <div className="mt-4 h-3 w-full rounded bg-slate-200" />
    </div>
  );
}

export default AdminResourcesPage;
