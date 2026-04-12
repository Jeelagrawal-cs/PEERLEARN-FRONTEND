import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, MessagesSquare, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchMyStudyRooms } from "../../services/studyRoom.service.js";

function StudyRoomsPage() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setIsLoading(true);
      setError("");

      const data = await fetchMyStudyRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error("Study rooms load error:", loadError);
      setRooms([]);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load study rooms."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rooms;

    return rooms.filter((room) => {
      const courseName = String(room.course_name || "").toLowerCase();
      const courseCode = String(room.course_code || "").toLowerCase();
      const department = String(room.department || "").toLowerCase();

      return (
        courseName.includes(keyword) ||
        courseCode.includes(keyword) ||
        department.includes(keyword)
      );
    });
  }, [rooms, search]);

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 text-white shadow-[0_12px_40px_rgba(74,104,179,0.14)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                Flashy demo feature
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Live Study Rooms
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/90">
                Real-time collaborative chat + shared notes for every enrolled
                course. Perfect to present live in two browser tabs.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-blue-100">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    Courses
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-white">
                  {rooms.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-blue-100">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    Experience
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  Live chat + notes sync
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                Room Browser
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                Choose a course and join instantly
              </h2>
            </div>

            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by course name or code"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500">
              Loading study rooms...
            </div>
          ) : error ? (
            <div className="mt-5 rounded-[26px] border border-red-200 bg-red-50 px-5 py-10 text-sm text-red-700">
              {error}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="mt-5 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No study rooms found.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRooms.map((room) => (
                <article
                  key={room.course_id}
                  className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_40px_rgba(74,104,179,0.10)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
                      <MessagesSquare size={24} />
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                      Study room
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {room.course_code}
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                      {room.course_name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {room.description || "Collaborate with classmates in real time."}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Department
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {room.department || "General"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Messages
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {room.total_messages || 0}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/student/study-rooms/${room.course_id}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Enter room
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudyRoomsPage;