import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Edit3,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createAdminCourse,
  deleteAdminCourse,
  fetchAdminCourses,
  updateAdminCourse,
} from "../../services/admin.service.js";

const EMPTY_FORM = {
  course_code: "",
  course_name: "",
  department: "",
  semester: "",
  description: "",
};

function AdminCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingCourseId, setDeletingCourseId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses(refresh = false) {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      const response = await fetchAdminCourses();
      const nextCourses = Array.isArray(response?.courses)
        ? response.courses
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setCourses(nextCourses);
    } catch (loadError) {
      console.error("Admin courses load error:", loadError);
      setCourses([]);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load admin courses."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function resetCreateForm() {
    setCreateForm(EMPTY_FORM);
    setIsCreateOpen(false);
  }

  function startEdit(course) {
    setEditingCourseId(Number(course.course_id));
    setEditForm({
      course_code: course.course_code || "",
      course_name: course.course_name || "",
      department: course.department || "",
      semester: String(course.semester || ""),
      description: course.description || "",
    });
  }

  function cancelEdit() {
    setEditingCourseId(null);
    setEditForm(EMPTY_FORM);
  }

  async function handleCreateCourse(event) {
    event.preventDefault();

    const payload = {
      course_code: String(createForm.course_code || "").trim(),
      course_name: String(createForm.course_name || "").trim(),
      department: String(createForm.department || "").trim(),
      semester: String(createForm.semester || "").trim(),
      description: String(createForm.description || "").trim(),
    };

    if (!payload.course_code || !payload.course_name) {
      alert("Course code and course name are required.");
      return;
    }

    try {
      setIsCreating(true);
      await createAdminCourse(payload);
      resetCreateForm();
      await loadCourses(true);
    } catch (createError) {
      console.error("Create admin course error:", createError);
      alert(
        createError?.response?.data?.message ||
          createError?.message ||
          "Failed to create course."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateCourse(courseId) {
    const payload = {
      course_code: String(editForm.course_code || "").trim(),
      course_name: String(editForm.course_name || "").trim(),
      department: String(editForm.department || "").trim(),
      semester: String(editForm.semester || "").trim(),
      description: String(editForm.description || "").trim(),
    };

    if (!payload.course_code || !payload.course_name) {
      alert("Course code and course name are required.");
      return;
    }

    try {
      setIsUpdating(true);
      await updateAdminCourse(courseId, payload);
      cancelEdit();
      await loadCourses(true);
    } catch (updateError) {
      console.error("Update admin course error:", updateError);
      alert(
        updateError?.response?.data?.message ||
          updateError?.message ||
          "Failed to update course."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteCourse(courseId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      setDeletingCourseId(courseId);
      await deleteAdminCourse(courseId);

      if (Number(editingCourseId) === Number(courseId)) {
        cancelEdit();
      }

      await loadCourses(true);
    } catch (deleteError) {
      console.error("Delete admin course error:", deleteError);
      alert(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Failed to delete course."
      );
    } finally {
      setDeletingCourseId(null);
    }
  }

  const filteredCourses = useMemo(() => {
    const keyword = String(search || "").trim().toLowerCase();

    if (!keyword) return courses;

    return courses.filter((course) => {
      const courseCode = String(course.course_code || "").toLowerCase();
      const courseName = String(course.course_name || "").toLowerCase();
      const department = String(course.department || "").toLowerCase();
      const semester = String(course.semester || "").toLowerCase();
      const description = String(course.description || "").toLowerCase();

      return (
        courseCode.includes(keyword) ||
        courseName.includes(keyword) ||
        department.includes(keyword) ||
        semester.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [courses, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-white/80 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[30px] border border-white/80 bg-white px-6 py-7 shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                <BookOpen size={14} />
                Admin Courses
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Manage Courses
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Create, update, delete, and open discussion boards for any course
                from one place.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                <span className="rounded-2xl bg-slate-100 px-4 py-2">
                  {courses.length} total courses
                </span>
                <span className="rounded-2xl bg-slate-100 px-4 py-2">
                  {filteredCourses.length} visible
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <button
                type="button"
                onClick={() => loadCourses(true)}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw size={16} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isCreateOpen ? <X size={16} /> : <Plus size={16} />}
                {isCreateOpen ? "Close Form" : "Add Course"}
              </button>
            </div>
          </div>
        </section>

        {isCreateOpen ? (
          <section className="mt-6 rounded-[30px] border border-white/80 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Plus size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Create Course
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add a new course to Peerlearn.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCourse} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                value={createForm.course_code}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    course_code: event.target.value,
                  }))
                }
                placeholder="Course code"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />

              <input
                type="text"
                value={createForm.course_name}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    course_name: event.target.value,
                  }))
                }
                placeholder="Course name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />

              <input
                type="text"
                value={createForm.department}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    department: event.target.value,
                  }))
                }
                placeholder="Department"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />

              <input
                type="text"
                value={createForm.semester}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    semester: event.target.value,
                  }))
                }
                placeholder="Semester"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />

              <textarea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Course description"
                rows={5}
                className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetCreateForm}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {isCreating ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="mt-6 rounded-[28px] border border-white/80 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses by code, name, department, semester..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </section>

        {error ? (
          <section className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </section>
        ) : null}

        <section className="mt-6 space-y-5">
          {filteredCourses.length === 0 ? (
            <div className="rounded-[30px] border border-white/80 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <BookOpen size={28} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                No courses found
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Try changing your search or create a new course.
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const courseId = Number(course.course_id);
              const isEditing = Number(editingCourseId) === courseId;
              const isDeleting = Number(deletingCourseId) === courseId;

              return (
                <article
                  key={courseId}
                  className="rounded-[30px] border border-white/80 bg-white p-6 shadow-sm"
                >
                  {!isEditing ? (
                    <>
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                              {course.course_code || "Course"}
                            </span>

                            {course.department ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                                {course.department}
                              </span>
                            ) : null}

                            {course.semester ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                                Semester {course.semester}
                              </span>
                            ) : null}
                          </div>

                          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                            {course.course_name || "Untitled Course"}
                          </h2>

                          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                            {course.description || "No description available."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:max-w-[420px] xl:justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(`/courses/${courseId}/discussions`)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye size={15} />
                            Discussions
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(course)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(courseId)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Trash2 size={15} />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                          Edit Course
                        </h2>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                          type="text"
                          value={editForm.course_code}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              course_code: event.target.value,
                            }))
                          }
                          placeholder="Course code"
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                        <input
                          type="text"
                          value={editForm.course_name}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              course_name: event.target.value,
                            }))
                          }
                          placeholder="Course name"
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              department: event.target.value,
                            }))
                          }
                          placeholder="Department"
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                        <input
                          type="text"
                          value={editForm.semester}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              semester: event.target.value,
                            }))
                          }
                          placeholder="Semester"
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                        <textarea
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          placeholder="Course description"
                          rows={5}
                          className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      </div>

                      <div className="mt-5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateCourse(courseId)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Save size={16} />
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminCoursesPage;