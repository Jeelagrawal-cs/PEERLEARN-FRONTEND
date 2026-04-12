import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  addMyCourse,
  fetchCourses,
  removeMyCourse,
} from "../../services/course.service.js";

function getCourseId(course) {
  return course?.course_id ?? null;
}

function getCourseName(course) {
  return (
    course?.course_name ||
    course?.name ||
    course?.title ||
    "Untitled Course"
  );
}

function getCourseCode(course) {
  return course?.course_code || course?.code || "N/A";
}

function getCourseDescription(course) {
  return course?.description || "No description available.";
}

function getCourseSemester(course) {
  return course?.semester || "N/A";
}

function isEnrolled(course) {
  return Number(course?.is_enrolled || 0) === 1;
}

function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setIsLoading(true);
      setError("");
      setNotice(null);

      const data = await fetchCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Courses fetch error:", err);
      setCourses([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load courses."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnroll(courseId, courseName) {
    if (!courseId) {
      alert("Invalid course ID.");
      return;
    }

    try {
      setActionLoadingId(courseId);
      setError("");
      setNotice(null);

      await addMyCourse(courseId);

      setCourses((prev) =>
        prev.map((course) => {
          const currentId = getCourseId(course);

          if (String(currentId) !== String(courseId)) {
            return course;
          }

          return {
            ...course,
            is_enrolled: 1,
          };
        })
      );

      setNotice({
        type: "success",
        message: `You enrolled in ${courseName}.`,
      });
    } catch (err) {
      console.error("Enroll course error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to enroll in course.";

      setError(message);
      setNotice({
        type: "error",
        message,
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemove(courseId, courseName) {
    if (!courseId) {
      alert("Invalid course ID.");
      return;
    }

    try {
      setActionLoadingId(courseId);
      setError("");
      setNotice(null);

      await removeMyCourse(courseId);

      setCourses((prev) =>
        prev.map((course) => {
          const currentId = getCourseId(course);

          if (String(currentId) !== String(courseId)) {
            return course;
          }

          return {
            ...course,
            is_enrolled: 0,
          };
        })
      );

      setNotice({
        type: "success",
        message: `You removed ${courseName} from your enrolled courses.`,
      });
    } catch (err) {
      console.error("Remove course error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove course.";

      setError(message);
      setNotice({
        type: "error",
        message,
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleOpenCourse(course) {
    const courseId = getCourseId(course);

    if (!courseId) {
      console.error("Invalid course object passed to handleOpenCourse:", course);
      alert("Course could not be opened because its ID is missing.");
      return;
    }

    navigate(`/student/courses/${courseId}`);
  }

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return courses;
    }

    return courses.filter((course) => {
      const name = String(getCourseName(course)).toLowerCase();
      const code = String(getCourseCode(course)).toLowerCase();
      const description = String(getCourseDescription(course)).toLowerCase();

      return (
        name.includes(keyword) ||
        code.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [courses, search]);

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/80 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Courses
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Browse available courses, enroll when needed, and open a course
                details page to see course-specific materials.
              </p>
            </div>

            <button
              type="button"
              onClick={loadCourses}
              className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search courses by name, code, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
        </section>

        {notice ? (
          <div
            className={`mt-6 rounded-[24px] border p-5 shadow-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-3">
              {notice.type === "success" ? (
                <CheckCircle2 size={18} className="mt-0.5" />
              ) : (
                <XCircle size={18} className="mt-0.5" />
              )}
              <p className="text-sm font-medium">{notice.message}</p>
            </div>
          </div>
        ) : null}

        {error && !notice ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <p className="text-sm text-slate-500">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <p className="text-sm text-slate-500">No courses found.</p>
          </div>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => {
              const id = getCourseId(course) || `fallback-${index}`;
              const name = getCourseName(course);
              const code = getCourseCode(course);
              const description = getCourseDescription(course);
              const semester = getCourseSemester(course);
              const enrolled = isEnrolled(course);

              return (
                <div
                  key={id}
                  className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,104,179,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(74,104,179,0.12)]"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                      <BookOpen size={20} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {code}
                      </span>

                      {enrolled ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          Enrolled
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {name}
                  </h2>

                  <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-600">
                    {description}
                  </p>

                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Semester:
                    </span>{" "}
                    {semester}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenCourse(course)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Eye size={16} />
                      Open Course
                    </button>

                    {enrolled ? (
                      <button
                        type="button"
                        onClick={() => handleRemove(getCourseId(course), name)}
                        disabled={actionLoadingId === getCourseId(course)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {actionLoadingId === getCourseId(course)
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEnroll(getCourseId(course), name)}
                        disabled={actionLoadingId === getCourseId(course)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {actionLoadingId === getCourseId(course)
                          ? "Enrolling..."
                          : "Enroll"}
                      </button>
                    )}
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

export default CoursesPage;