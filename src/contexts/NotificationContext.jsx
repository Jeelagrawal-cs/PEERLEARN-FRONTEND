import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      setNotificationError("");

      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification load error:", error);
      setNotifications([]);
      setNotificationError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load notifications."
      );
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(
      (item) => !Boolean(item?.is_read ?? item?.read_status ?? 0)
    ).length;
  }, [notifications]);

  const markOneAsRead = useCallback(async (notificationId) => {
    await markNotificationRead(notificationId);

    setNotifications((prev) =>
      prev.map((item) =>
        (item.notification_id || item.id) === notificationId
          ? { ...item, is_read: 1 }
          : item
      )
    );
  }, []);

  const markEverythingAsRead = useCallback(async () => {
    const response = await markAllNotificationsRead();

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: 1,
      }))
    );

    return response;
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      unreadNotificationCount,
      isLoadingNotifications,
      notificationError,
      loadNotifications,
      markOneAsRead,
      markEverythingAsRead,
    }),
    [
      notifications,
      unreadNotificationCount,
      isLoadingNotifications,
      notificationError,
      loadNotifications,
      markOneAsRead,
      markEverythingAsRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}