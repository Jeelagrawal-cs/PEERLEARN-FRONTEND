import React, { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FolderOpen,
  Heart,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

function formatDate(dateValue) {
  if (!dateValue) return "Unknown time";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString();
}

function getNotificationMeta(notification) {
  const type = String(notification?.type || "").toLowerCase();

  if (type === "comment") {
    return {
      label: "Comment",
      icon: MessageCircle,
      iconWrap: "bg-blue-100 text-blue-700",
    };
  }

  if (type === "reaction") {
    return {
      label: "Reaction",
      icon: Heart,
      iconWrap: "bg-rose-100 text-rose-700",
    };
  }

  if (type === "course_enroll") {
    return {
      label: "Enrollment",
      icon: UserPlus,
      iconWrap: "bg-emerald-100 text-emerald-700",
    };
  }

  if (type === "course_remove") {
    return {
      label: "Course Removed",
      icon: UserMinus,
      iconWrap: "bg-amber-100 text-amber-700",
    };
  }

  if (type === "resource_approved") {
    return {
      label: "Approved",
      icon: CheckCircle2,
      iconWrap: "bg-emerald-100 text-emerald-700",
    };
  }

  if (type === "resource_pending") {
    return {
      label: "Pending Review",
      icon: ShieldCheck,
      iconWrap: "bg-orange-100 text-orange-700",
    };
  }

  return {
    label: "Notification",
    icon: Bell,
    iconWrap: "bg-slate-100 text-slate-700",
  };
}

function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadNotificationCount,
    isLoadingNotifications,
    notificationError,
    loadNotifications,
    markOneAsRead,
    markEverythingAsRead,
  } = useNotifications();

  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [markingId, setMarkingId] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleMarkRead(notificationId) {
    try {
      setMarkingId(notificationId);
      setLocalError("");
      setMessage("");

      await markOneAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      setLocalError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to mark notification read."
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      setIsMarkingAll(true);
      setLocalError("");
      setMessage("");

      const response = await markEverythingAsRead();
      setMessage(response?.message || "All notifications marked as read.");
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
      setLocalError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to mark all notifications."
      );
    } finally {
      setIsMarkingAll(false);
    }
  }

  function handleOpenNotification(notification) {
    const relatedResourceId = notification?.related_resource_id;

    if (relatedResourceId) {
      navigate(`/student/resources/${relatedResourceId}`);
      return;
    }

    navigate("/student/resources");
  }

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;

    if (activeFilter === "unread") {
      return notifications.filter(
        (item) => !Boolean(item.is_read ?? item.read_status ?? 0)
      );
    }

    return notifications.filter(
      (item) => String(item.type || "").toLowerCase() === activeFilter
    );
  }, [notifications, activeFilter]);

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "comment", label: "Comments" },
    { key: "reaction", label: "Reactions" },
    { key: "resource_approved", label: "Approvals" },
    { key: "course_enroll", label: "Enrollments" },
  ];

  const combinedError = localError || notificationError;

  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/80 bg-white px-6 py-7 shadow-[0_12px_40px_rgba(74,104,179,0.10)] sm:px-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_260px] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                <Bell size={14} />
                Activity Center
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Keep track of approvals, comments, reactions, and course-related
                activity in one clean place.
              </p>
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50 p-5">
              <div className="rounded-[24px] bg-white/90 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Unread notifications</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  {unreadNotificationCount}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  out of {notifications.length} total
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "border border-white/80 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadNotifications}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || notifications.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck size={16} />
              {isMarkingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </section>

        {message ? (
          <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            {message}
          </div>
        ) : null}

        {combinedError ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {combinedError}
          </div>
        ) : null}

        <section className="mt-6 rounded-[32px] border border-white/80 bg-white shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
          {isLoadingNotifications ? (
            <div className="p-6 text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Bell size={28} />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
                  No notifications found
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
                  You do not have any notifications in this section right now.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => {
                const notificationId =
                  notification.notification_id || notification.id;
                const isRead = Boolean(
                  notification.is_read ?? notification.read_status ?? 0
                );
                const meta = getNotificationMeta(notification);
                const Icon = meta.icon;

                return (
                  <div
                    key={notificationId}
                    className={`flex flex-col gap-4 p-5 transition sm:flex-row sm:items-start sm:justify-between ${
                      isRead ? "bg-white" : "bg-blue-50/40"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconWrap}`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-slate-900">
                            {notification.title || "Notification"}
                          </p>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                            {meta.label}
                          </span>

                          {!isRead ? (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                              Unread
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {notification.message ||
                            notification.content ||
                            "No message"}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {notification.related_resource_id ? (
                        <button
                          type="button"
                          onClick={() => handleOpenNotification(notification)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <FolderOpen size={15} />
                          Open
                        </button>
                      ) : null}

                      {!isRead ? (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notificationId)}
                          disabled={markingId === notificationId}
                          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {markingId === notificationId
                            ? "Marking..."
                            : "Mark read"}
                        </button>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default NotificationsPage;