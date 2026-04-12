import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Download,
  Upload,
  Search,
  ArrowRight,
  Bell,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../services/dashboard.service.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

const defaultStats = {
  totalResources: 0,
  downloads: 0,
  bookmarks: 0,
  courses: 0,
  recentResources: [],
};

const courseBadgeColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function StudentDashboardPage() {
  const [stats, setStats] = useState(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadNotificationCount } = useNotifications();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await getDashboardStats();

        setStats({
          totalResources: Number(dashboardData?.totalResources || 0),
          downloads: Number(dashboardData?.downloads || 0),
          bookmarks: Number(dashboardData?.bookmarks || 0),
          courses: Number(dashboardData?.courses || 0),
          recentResources: Array.isArray(dashboardData?.recentResources)
            ? dashboardData.recentResources
            : [],
        });
      } catch (error) {
        console.error("Dashboard load error:", error);
        setStats(defaultStats);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const displayName = useMemo(() => {
    const name = user?.name || user?.full_name || "Student";
    return String(name).split(" ")[0];
  }, [user]);

  const recentResources = Array.isArray(stats.recentResources)
    ? stats.recentResources
    : [];

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TopSearchRow
          userName={displayName}
          user={user}
          unreadNotificationCount={unreadNotificationCount}
          onSearchClick={() => navigate("/student/resources")}
          onNotificationClick={() => navigate("/student/notifications")}
        />

        <section className="mt-6 space-y-6">
          <HeroCard
            userName={displayName}
            onUpload={() => navigate("/student/upload")}
            onBrowse={() => navigate("/student/resources")}
            onBookmarks={() => navigate("/student/bookmarks")}
          />

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Enrolled Courses"
              value={stats.courses}
              subtitle="Active subjects"
              icon={BookOpen}
              iconWrap="bg-blue-100 text-blue-600"
              onClick={() => navigate("/student/courses")}
            />
            <StatCard
              title="Saved Bookmarks"
              value={stats.bookmarks}
              subtitle="Quick study picks"
              icon={Bookmark}
              iconWrap="bg-amber-100 text-amber-600"
              onClick={() => navigate("/student/bookmarks")}
            />
            <StatCard
              title="Total Downloads"
              value={stats.downloads}
              subtitle="Your learning usage"
              icon={Download}
              iconWrap="bg-emerald-100 text-emerald-600"
              onClick={() => navigate("/student/resources")}
            />
            <StatCard
              title="Your Contributions"
              value={stats.totalResources}
              subtitle="Shared on the platform"
              icon={Upload}
              iconWrap="bg-violet-100 text-violet-600"
              onClick={() => navigate("/student/upload")}
            />
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_10px_40px_rgba(74,104,179,0.08)] backdrop-blur sm:p-6">
            <SectionHeader
              title="Recent Resources"
              subtitle="Latest materials available for you"
              actionText="See all"
              onAction={() => navigate("/student/resources")}
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
                  title="No resources available yet"
                  description="As soon as resources are uploaded, they will appear here for quick access."
                  buttonText="Browse Resources"
                  onClick={() => navigate("/student/resources")}
                />
              ) : (
                recentResources.map((resource, index) => (
                  <ResourceFeedCard
                    key={resource.id || resource.resource_id || index}
                    resource={resource}
                    badgeClass={
                      courseBadgeColors[index % courseBadgeColors.length]
                    }
                    onOpen={() =>
                      navigate(
                        `/student/resources/${
                          resource.resource_id || resource.id
                        }`
                      )
                    }
                  />
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function TopSearchRow({
  userName,
  user,
  unreadNotificationCount,
  onSearchClick,
  onNotificationClick,
}) {
  const fullName = user?.full_name || user?.name || userName || "U";
  const initials = String(fullName)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full items-center gap-4 rounded-[26px] border border-white/80 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(74,104,179,0.08)] lg:max-w-2xl">
        <Search size={20} className="text-slate-400" />
        <button
          type="button"
          onClick={onSearchClick}
          className="w-full text-left text-sm font-medium text-slate-400"
        >
          Search resources, courses, notes...
        </button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onNotificationClick}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white text-slate-600 shadow-[0_8px_30px_rgba(74,104,179,0.08)] transition hover:bg-slate-50"
        >
          <Bell size={18} />
          {unreadNotificationCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          ) : null}
        </button>

        <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white px-4 py-2.5 shadow-[0_8px_30px_rgba(74,104,179,0.08)]">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={userName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-violet-500 to-blue-500 text-sm font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="text-base font-bold text-slate-900">{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ userName, onUpload, onBrowse, onBookmarks }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-44 w-44 rounded-tl-[120px] bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50" />

      <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_360px] xl:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {userName}!
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Stay on top of your courses, explore fresh materials, and keep your
            best resources within reach.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <DashboardActionButton
              label="Upload Resource"
              icon={Upload}
              onClick={onUpload}
              variant="primary"
            />
            <DashboardActionButton
              label="Browse Materials"
              icon={Search}
              onClick={onBrowse}
            />
            <DashboardActionButton
              label="My Bookmarks"
              icon={Bookmark}
              onClick={onBookmarks}
            />
          </div>
        </div>

        <div className="relative">
          <div className="mx-auto flex max-w-[320px] items-end justify-center gap-4 rounded-[32px] bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50 px-6 py-6">
            <BookStackArt />
          </div>
        </div>
      </div>
    </section>
  );
}

function BookStackArt() {
  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center">
        <div className="relative h-5 w-28 rounded-full bg-slate-200/70" />
        <div className="mt-2 space-y-2">
          <BookBlock className="w-40 bg-blue-500" />
          <BookBlock className="w-36 bg-violet-500" />
          <BookBlock className="w-44 bg-emerald-500" />
          <BookBlock className="w-32 bg-orange-400" />
          <BookBlock className="w-48 bg-rose-400" />
        </div>
      </div>

      <div className="relative">
        <div className="h-36 w-28 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <div className="mx-auto mt-5 h-16 w-14 rounded-2xl border-4 border-white/35" />
          <div className="mx-auto mt-4 h-3 w-8 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

function BookBlock({ className = "" }) {
  return (
    <div
      className={`flex h-8 items-center rounded-xl px-3 shadow-sm ${className}`}
    >
      <div className="h-2 w-10 rounded-full bg-white/70" />
    </div>
  );
}

function DashboardActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "secondary",
}) {
  const classes =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition ${classes}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, iconWrap, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[24px] border border-white/70 bg-white p-5 text-left shadow-[0_8px_30px_rgba(74,104,179,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(74,104,179,0.14)] focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconWrap}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </button>
  );
}

function SectionHeader({ title, subtitle, actionText, onAction }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <span>{actionText}</span>
          <ArrowRight size={16} />
        </button>
      ) : null}
    </div>
  );
}

function ResourceFeedCard({ resource, badgeClass, onOpen }) {
  const title = resource?.title || "Untitled Resource";
  const description =
    resource?.description || "No description added for this resource yet.";
  const course =
    resource?.course_name ||
    resource?.course?.title ||
    resource?.course?.name ||
    "General Course";

  const downloadCount = Number(resource?.download_count || 0);
  const commentCount = Number(resource?.comment_count || 0);

  return (
    <div className="group overflow-hidden rounded-[24px] border border-slate-100 bg-[#fbfcff] p-4 transition duration-200 hover:border-blue-100 hover:shadow-[0_10px_30px_rgba(74,104,179,0.08)] sm:p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="text-left">
            <h3 className="text-xl font-bold text-slate-900 transition hover:text-blue-700">
              {title}
            </h3>
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}
            >
              {course}
            </span>

            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Download size={15} />
              <span>{downloadCount} downloads</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MessageCircle size={15} />
              <span>{commentCount} comments</span>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>

        <div className="flex w-full justify-end md:w-auto">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>View Details</span>
            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ title, description, buttonText, onClick }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="text-lg font-bold text-slate-800">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        {buttonText}
      </button>
    </div>
  );
}

function ResourceSkeleton() {
  return (
    <div className="animate-pulse rounded-[24px] border border-slate-100 bg-slate-50 p-5">
      <div className="h-6 w-48 rounded-lg bg-slate-200" />
      <div className="mt-4 h-5 w-32 rounded-full bg-slate-200" />
      <div className="mt-4 h-4 w-full rounded bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
      <div className="mt-5 h-10 w-28 rounded-2xl bg-slate-200" />
    </div>
  );
}

export default StudentDashboardPage;