import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  BookOpen,
  Files,
  CheckCircle2,
  Clock3,
  Search,
  ArrowRight,
  Users,
  GraduationCap,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminOverview,
  fetchAdminResources,
  fetchAdminUsers,
  fetchAdminCourses,
} from "../../services/admin.service.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [overview, setOverview] = useState({});
  const [recentResources, setRecentResources] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const [overviewData, resourcesData, usersData, coursesData] =
          await Promise.all([
            fetchAdminOverview(),
            fetchAdminResources(),
            fetchAdminUsers(),
            fetchAdminCourses(),
          ]);

        setOverview(overviewData || {});
        setRecentResources(
          Array.isArray(resourcesData) ? resourcesData.slice(0, 6) : []
        );
        setUserCount(Array.isArray(usersData) ? usersData.length : 0);
        setCourseCount(Array.isArray(coursesData) ? coursesData.length : 0);
      } catch (err) {
        console.error("Admin dashboard load error:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load admin dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const displayName = useMemo(() => {
    const name = user?.name || user?.full_name || "Admin";
    return String(name).split(" ")[0];
  }, [user]);

  const totalCourses =
    Number(overview?.courses?.total_courses || 0) || courseCount;
  const totalResources = Number(overview?.resources?.total_resources || 0);
  const activeResources = Number(overview?.resources?.active_resources || 0);
  const pendingResources = Number(overview?.resources?.pending_resources || 0);
  const blockedScans = Number(overview?.malware?.block_count || 0);

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TopAdminRow
          userName={displayName}
          onSearchClick={() => navigate("/admin/resources")}
          onUsersClick={() => navigate("/admin/users")}
        />

        <section className="mt-6 space-y-6">
          <HeroCard
            userName={displayName}
            onUsers={() => navigate("/admin/users")}
            onCourses={() => navigate("/admin/courses")}
            onResources={() => navigate("/admin/resources")}
            onScans={() => navigate("/admin/malware-scans")}
          />

          {error ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700 shadow-[0_10px_40px_rgba(74,104,179,0.08)]">
              {error}
            </div>
          ) : null}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Users"
              value={userCount}
              subtitle="Accounts on platform"
              icon={Users}
              iconWrap="bg-blue-100 text-blue-600"
              onClick={() => navigate("/admin/users")}
            />
            <StatCard
              title="Courses"
              value={totalCourses}
              subtitle="Published subjects"
              icon={GraduationCap}
              iconWrap="bg-violet-100 text-violet-600"
              onClick={() => navigate("/admin/courses")}
            />
            <StatCard
              title="Materials"
              value={totalResources}
              subtitle="All uploaded resources"
              icon={Files}
              iconWrap="bg-amber-100 text-amber-600"
              onClick={() => navigate("/admin/resources")}
            />
            <StatCard
              title="Approved"
              value={activeResources}
              subtitle="Visible to students"
              icon={CheckCircle2}
              iconWrap="bg-emerald-100 text-emerald-600"
              onClick={() => navigate("/admin/resources")}
            />
            <StatCard
              title="Pending / Blocked"
              value={pendingResources + blockedScans}
              subtitle="Needs admin attention"
              icon={ShieldAlert}
              iconWrap="bg-rose-100 text-rose-600"
              onClick={() => navigate("/admin/malware-scans")}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)] backdrop-blur sm:p-6">
              <SectionHeader
                title="Recent Materials"
                subtitle="Latest uploads across the platform"
                actionText="Manage all"
                onAction={() => navigate("/admin/resources")}
              />

              <div className="mt-5 space-y-4">
                {isLoading ? (
                  <>
                    <ResourceSkeleton />
                    <ResourceSkeleton />
                    <ResourceSkeleton />
                  </>
                ) : recentResources.length === 0 ? (
                  <EmptyCard
                    title="No materials available yet"
                    description="Once students upload resources, they will appear here for review."
                    buttonText="Open Materials"
                    onClick={() => navigate("/admin/resources")}
                  />
                ) : (
                  recentResources.map((resource, index) => (
                    <ResourceFeedCard
                      key={resource.resource_id || resource.id || index}
                      resource={resource}
                      onOpen={() => navigate("/admin/resources")}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)] backdrop-blur sm:p-6">
              <SectionHeader
                title="Quick Actions"
                subtitle="Fast admin operations"
              />

              <div className="mt-5 grid grid-cols-1 gap-4">
                <QuickActionCard
                  icon={Users}
                  title="Manage Users"
                  description="Promote students to admin or return admin users to student role."
                  buttonText="Open Users"
                  onClick={() => navigate("/admin/users")}
                />
                <QuickActionCard
                  icon={GraduationCap}
                  title="Manage Courses"
                  description="Create, edit, or remove course records used on the platform."
                  buttonText="Open Courses"
                  onClick={() => navigate("/admin/courses")}
                />
                <QuickActionCard
                  icon={FolderOpen}
                  title="Moderate Materials"
                  description="Approve, send back to pending, or remove uploaded learning materials."
                  buttonText="Open Materials"
                  onClick={() => navigate("/admin/resources")}
                />
                <QuickActionCard
                  icon={ShieldAlert}
                  title="Review Malware Scans"
                  description="Inspect blocked and flagged uploads from the demo scanner."
                  buttonText="Open Scan History"
                  onClick={() => navigate("/admin/malware-scans")}
                />
              </div>
            </section>
          </section>
        </section>
      </div>
    </div>
  );
}

function TopAdminRow({ userName, onSearchClick, onUsersClick }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full items-center gap-4 rounded-[26px] border border-white/80 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(74,104,179,0.08)] lg:max-w-2xl">
        <Search size={20} className="text-slate-400" />
        <button
          type="button"
          onClick={onSearchClick}
          className="w-full text-left text-sm font-medium text-slate-400"
        >
          Search materials, courses, uploads...
        </button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onUsersClick}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgba(74,104,179,0.08)] transition hover:bg-slate-50"
        >
          <Users size={16} />
          Users
        </button>

        <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white px-4 py-2.5 shadow-[0_8px_30px_rgba(74,104,179,0.08)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-violet-500 to-blue-500 text-sm font-bold text-white">
            {String(userName || "A").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-slate-500">Admin signed in</p>
            <p className="text-base font-bold text-slate-900">{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ userName, onUsers, onCourses, onResources, onScans }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-44 w-44 rounded-tl-[120px] bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50" />

      <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_360px] xl:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Admin control center, {userName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Monitor uploads, manage courses, review suspicious files, and keep
            Peerlearn clean and organized.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <DashboardActionButton label="Manage Users" onClick={onUsers} />
            <DashboardActionButton label="Manage Courses" onClick={onCourses} />
            <DashboardActionButton
              label="Moderate Materials"
              onClick={onResources}
              light
            />
          </div>
        </div>

        <div className="relative rounded-[28px] border border-slate-100 bg-slate-50/90 p-5 shadow-inner">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Priority Queue
          </p>

          <div className="mt-4 space-y-3">
            <HeroMiniCard
              title="Pending material approvals"
              description="Review newly uploaded resources and approve or remove them."
              onClick={onResources}
            />
            <HeroMiniCard
              title="Blocked scan decisions"
              description="Open malware history to inspect suspicious files and indicators."
              onClick={onScans}
            />
            <HeroMiniCard
              title="Course updates"
              description="Keep course codes, departments, and semester details accurate."
              onClick={onCourses}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardActionButton({ label, onClick, light = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
        light
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          : "bg-slate-900 text-white hover:bg-slate-800",
      ].join(" ")}
    >
      <span>{label}</span>
      <ArrowRight size={16} />
    </button>
  );
}

function HeroMiniCard({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-2xl border border-white bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </button>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, iconWrap, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[28px] border border-white/70 bg-white/90 p-5 text-left shadow-[0_10px_40px_rgba(74,104,179,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(74,104,179,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconWrap}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </button>
  );
}

function SectionHeader({ title, subtitle, actionText, onAction }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      {actionText ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span>{actionText}</span>
          <ArrowRight size={16} />
        </button>
      ) : null}
    </div>
  );
}

function ResourceFeedCard({ resource, onOpen }) {
  const status = String(resource?.status || "unknown").toLowerCase();

  const statusClass =
    status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 text-left transition hover:border-slate-200 hover:bg-white"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-base font-bold text-slate-900">
              {resource?.title || "Untitled material"}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusClass}`}
            >
              {status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {resource?.resource_type || "resource"} •{" "}
            {resource?.course_code ||
              resource?.course_name ||
              `Course ${resource?.course_id || "N/A"}`}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Uploaded by {resource?.uploader_name || "Unknown uploader"}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          <span>Open moderation</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </button>
  );
}

function ResourceSkeleton() {
  return (
    <div className="animate-pulse rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-64 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-36 rounded bg-slate-200" />
    </div>
  );
}

function EmptyCard({ title, description, buttonText, onClick }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {description}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <span>{buttonText}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, buttonText, onClick }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <Icon size={20} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <span>{buttonText}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default AdminDashboardPage;