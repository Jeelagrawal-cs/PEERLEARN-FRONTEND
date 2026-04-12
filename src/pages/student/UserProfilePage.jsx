import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  CalendarDays,
  Edit3,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  fetchMyProfile,
  fetchPublicProfile,
  updateMyProfile,
} from "../../services/user.service.js";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleString();
}

function getInitials(name) {
  return String(name || "User")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const toneClassMap = {
    slate: "bg-slate-50 text-slate-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
          toneClassMap[tone] || toneClassMap.slate
        }`}
      >
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ReplyIcon(props) {
  return <MessageSquare {...props} />;
}

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const currentRole = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();

  const currentUserId = Number(user?.user_id || user?.id || 0);
  const requestedUserId = userId ? Number(userId) : null;
  const isOwnProfileRoute =
    !requestedUserId || requestedUserId === currentUserId;

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [uiMessage, setUiMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    loadProfile({ refresh: false });
  }, [userId]);

  useEffect(() => {
    if (!uiMessage.text) return undefined;

    const timer = setTimeout(() => {
      setUiMessage({ type: "", text: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [uiMessage]);

  async function loadProfile({ refresh = false } = {}) {
    try {
      setError("");

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = isOwnProfileRoute
        ? await fetchMyProfile()
        : await fetchPublicProfile(requestedUserId);

      setProfileData(data || null);

      const profile = data?.profile || {};
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || profile.profile_image || "",
      });
    } catch (loadError) {
      console.error("Profile load error:", loadError);
      setProfileData(null);
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load profile."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(
      currentRole === "admin" ? "/admin/dashboard" : "/student/dashboard"
    );
  }

  function handleCancelEdit() {
    const profile = profileData?.profile || {};

    setForm({
      full_name: profile.full_name || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || profile.profile_image || "",
    });

    setIsEditing(false);
    setUiMessage({ type: "", text: "" });
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    const payload = {
      full_name: String(form.full_name || "").trim(),
      bio: String(form.bio || "").trim(),
      avatar_url: String(form.avatar_url || "").trim(),
    };

    if (!payload.full_name) {
      setUiMessage({ type: "error", text: "Full name is required." });
      return;
    }

    try {
      setIsSaving(true);

      const updated = await updateMyProfile(payload);
      setProfileData(updated || null);

      const updatedProfile = updated?.profile || {};
      setUser({
        ...user,
        ...updatedProfile,
        full_name: updatedProfile.full_name,
        avatar_url: updatedProfile.avatar_url || updatedProfile.profile_image,
      });

      setForm({
        full_name: updatedProfile.full_name || "",
        bio: updatedProfile.bio || "",
        avatar_url: updatedProfile.avatar_url || updatedProfile.profile_image || "",
      });

      setIsEditing(false);
      setUiMessage({ type: "success", text: "Profile updated successfully." });
    } catch (saveError) {
      console.error("Profile update error:", saveError);
      setUiMessage({
        type: "error",
        text:
          saveError?.response?.data?.message ||
          saveError?.message ||
          "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const profile = profileData?.profile || {};
  const stats = profileData?.stats || {};
  const courses = Array.isArray(profileData?.courses) ? profileData.courses : [];
  const recentActivity = Array.isArray(profileData?.recent_activity)
    ? profileData.recent_activity
    : [];
  const isOwner = Boolean(profileData?.is_owner);

  const memberSince = useMemo(
    () => formatDate(profile.created_at),
    [profile.created_at]
  );

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (profile.full_name) score += 34;
    if (profile.bio) score += 33;
    if (profile.avatar_url || profile.profile_image) score += 33;
    return score;
  }, [profile.full_name, profile.bio, profile.avatar_url, profile.profile_image]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-36 rounded-[32px] bg-slate-200" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="h-36 rounded-[28px] bg-slate-200" />
                <div className="h-36 rounded-[28px] bg-slate-200" />
                <div className="h-36 rounded-[28px] bg-slate-200" />
                <div className="h-36 rounded-[28px] bg-slate-200" />
                <div className="h-36 rounded-[28px] bg-slate-200" />
                <div className="h-36 rounded-[28px] bg-slate-200" />
              </div>
              <div className="h-80 rounded-[30px] bg-slate-200" />
              <div className="h-80 rounded-[30px] bg-slate-200" />
            </div>
            <div className="space-y-6">
              <div className="h-56 rounded-[30px] bg-slate-200" />
              <div className="h-48 rounded-[30px] bg-slate-200" />
              <div className="h-48 rounded-[30px] bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="rounded-[32px] border border-white/80 bg-white p-10 text-center shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              <UserCircle2 size={30} />
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">
              Profile not found
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              {error || "We could not find this user profile."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[34px] border border-white/80 bg-white px-6 py-7 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
              {(profile.avatar_url || profile.profile_image) ? (
                <img
                  src={profile.avatar_url || profile.profile_image}
                  alt={profile.full_name || "Profile"}
                  className="h-20 w-20 shrink-0 rounded-[26px] object-cover shadow-lg sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 text-2xl font-black text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                  {getInitials(profile.full_name)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
                    {isOwner ? "My Profile" : "User Profile"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                    {String(profile.role_name || "student").toUpperCase()}
                  </span>

                  {isRefreshing ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                      <RefreshCw size={14} className="animate-spin" />
                      Refreshing
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 break-words text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {profile.full_name || "User"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={15} />
                    Member since {memberSince}
                  </span>

                  {profile.email ? (
                    <span className="inline-flex items-center gap-2 break-all">
                      <Mail size={15} />
                      {profile.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3 self-start">
              <button
                type="button"
                onClick={() => loadProfile({ refresh: true })}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Edit3 size={15} />
                  {isEditing ? "Close Edit" : "Edit Profile"}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {(error || uiMessage.text) && (
          <section
            className={`mt-6 rounded-[24px] border px-5 py-4 shadow-sm ${
              error || uiMessage.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium leading-6">
                {error || uiMessage.text}
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setUiMessage({ type: "", text: "" });
                }}
                className="rounded-xl p-1 transition hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={GraduationCap}
                label="Enrolled Courses"
                value={stats.enrolled_courses_count || 0}
                tone="blue"
              />
              <StatCard
                icon={Upload}
                label="Resources Uploaded"
                value={stats.uploaded_resources_count || 0}
                tone="violet"
              />
              <StatCard
                icon={MessageSquare}
                label="Discussions Started"
                value={stats.discussions_started_count || 0}
                tone="emerald"
              />
              <StatCard
                icon={ReplyIcon}
                label="Replies Posted"
                value={stats.replies_posted_count || 0}
                tone="amber"
              />
              <StatCard
                icon={Bookmark}
                label="Bookmarks"
                value={stats.bookmarks_count || 0}
                tone="rose"
              />
              <StatCard
                icon={FileText}
                label="Total Downloads"
                value={stats.total_resource_downloads || 0}
                tone="slate"
              />
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <UserCircle2 size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    About
                  </h2>
                  <p className="text-sm text-slate-500">
                    Profile bio and personal academic identity.
                  </p>
                </div>
              </div>

              {!isEditing ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Full Name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {profile.full_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Bio
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {profile.bio || "No bio added yet."}
                    </p>
                  </div>

                 {null}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          full_name: event.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Bio
                    </label>
                    <textarea
                      rows={5}
                      value={form.bio}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Tell others about yourself..."
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Profile Image URL
                    </label>
                    <input
                      type="text"
                      value={form.avatar_url}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          avatar_url: event.target.value,
                        }))
                      }
                      placeholder="Paste image URL"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <X size={15} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Save size={15} />
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Enrolled Courses
                  </h2>
                  <p className="text-sm text-slate-500">
                    Recent courses connected to this profile.
                  </p>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  No enrolled courses available yet.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {courses.map((course) => (
                    <div
                      key={course.course_id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            {course.course_code}
                          </p>
                          <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900">
                            {course.course_name}
                          </h3>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          Sem {course.semester || "—"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {course.description || "No description available."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <span>{course.department || "Department not set"}</span>
                        <span>{course.active_resource_count || 0} resources</span>
                      </div>

                      <div className="mt-4">
                        <Link
                          to={`/student/courses/${course.course_id}`}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-slate-500">
                    Latest uploads and discussion contributions.
                  </p>
                </div>
              </div>

              {recentActivity.length === 0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  No recent activity yet.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {recentActivity.map((item, index) => (
                    <div
                      key={`${item.activity_type}-${item.reference_id}-${index}`}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            {item.subtitle || item.activity_type}
                          </p>
                          <h3 className="mt-2 text-base font-bold text-slate-900">
                            {item.title || "Untitled activity"}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {item.course_code} • {item.course_name}
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Profile Summary
              </h2>

              <div className="mt-5 flex items-center gap-4">
                {(profile.avatar_url || profile.profile_image) ? (
                  <img
                    src={profile.avatar_url || profile.profile_image}
                    alt={profile.full_name || "Profile"}
                    className="h-16 w-16 rounded-[22px] object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 text-lg font-black text-white">
                    {getInitials(profile.full_name)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-slate-900">
                    {profile.full_name || "User"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {profile.role_name || "student"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Profile Completion
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {profileCompletion}%
                  </p>
                </div>

                <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Member Since
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {memberSince}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Account Info
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-800">Role:</span>{" "}
                  {profile.role_name || "student"}
                </div>

                {profile.status ? (
                  <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                    <span className="font-semibold text-slate-800">Status:</span>{" "}
                    {profile.status}
                  </div>
                ) : null}

                {typeof profile.is_verified !== "undefined" ? (
                  <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                    <span className="font-semibold text-slate-800">
                      Verified:
                    </span>{" "}
                    {profile.is_verified ? "Yes" : "No"}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_10px_35px_rgba(74,104,179,0.08)]">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Quick Actions
              </h2>

              <div className="mt-4 space-y-3">
                <Link
                  to={currentRole === "admin" ? "/admin/dashboard" : "/student/dashboard"}
                  className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <ShieldCheck size={16} />
                  Go to Dashboard
                </Link>

                <Link
                  to="/student/courses"
                  className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <GraduationCap size={16} />
                  Browse Courses
                </Link>

                <Link
                  to="/student/resources"
                  className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <FileText size={16} />
                  View Resources
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default UserProfilePage;