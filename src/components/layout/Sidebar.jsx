import React from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Bookmark,
  Upload,
  BookOpen,
  Bell,
  Shield,
  Users,
  GraduationCap,
  Bug,
  LogOut,
  UserCircle2,
  MessagesSquare,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadNotificationCount } = useNotifications();

  const role = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();

  const studentNav = [
    {
      section: "Main",
      items: [
        {
          label: "Dashboard",
          to: "/student/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Profile",
          to: "/student/profile",
          icon: UserCircle2,
        },
        {
          label: "Resources",
          to: "/student/resources",
          icon: FolderOpen,
        },
        {
          label: "My Bookmarks",
          to: "/student/bookmarks",
          icon: Bookmark,
        },
        {
          label: "Upload",
          to: "/student/upload",
          icon: Upload,
        },
        {
          label: "My Courses",
          to: "/student/courses",
          icon: BookOpen,
        },
        {
          label: "Study Rooms",
          to: "/student/study-rooms",
          icon: MessagesSquare,
        },
        {
          label: "Notifications",
          to: "/student/notifications",
          icon: Bell,
          badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
        },
      ],
    },
  ];

  const adminNav = [
    {
      section: "Admin",
      items: [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Profile",
          to: "/admin/profile",
          icon: UserCircle2,
        },
        {
          label: "Users",
          to: "/admin/users",
          icon: Users,
        },
        {
          label: "Courses",
          to: "/admin/courses",
          icon: GraduationCap,
        },
        {
          label: "Materials",
          to: "/admin/resources",
          icon: FolderOpen,
        },
        {
          label: "Malware History",
          to: "/admin/malware-scans",
          icon: Bug,
        },
      ],
    },
  ];

  const navSections = role === "admin" ? adminNav : studentNav;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const userName = user?.name || user?.full_name || "Student User";
  const roleLabel = role === "admin" ? "Admin" : "Student";
  const profilePath = role === "admin" ? "/admin/profile" : "/student/profile";

  return (
    <aside className="hidden min-h-screen w-[290px] shrink-0 border-r border-slate-200/70 bg-[#eef3ff] px-5 py-6 lg:flex lg:flex-col">
      <div className="rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(74,104,179,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
            <Shield size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-blue-700">
              Peerlearn
            </h1>
            <p className="text-sm text-slate-500">
              Academic resource platform
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.section} className="mb-8">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {section.section}
            </p>

            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={
                      item.to.endsWith("/dashboard") ||
                      item.to.endsWith("/profile") ||
                      item.to.endsWith("/study-rooms")
                    }
                    className={({ isActive }) =>
                      [
                        "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-blue-100 text-blue-700 shadow-sm"
                          : "text-slate-700 hover:bg-white hover:text-slate-900",
                      ].join(" ")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-500 shadow-sm transition group-hover:text-slate-700">
                        <Icon size={18} />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-white/80 bg-white p-4 shadow-[0_10px_30px_rgba(74,104,179,0.08)]">
        <Link to={profilePath} className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={userName}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-violet-500 to-blue-500 text-base font-bold text-white">
              {String(userName)
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">
              {userName}
            </p>
            <p className="text-sm text-slate-500">{roleLabel}</p>
          </div>
        </Link>

        <Link
          to={profilePath}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <UserCircle2 size={16} />
          <span>View Profile</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;