import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

import StudentDashboardPage from "../pages/student/StudentDashboardPage.jsx";
import ResourcesPage from "../pages/student/ResourcesPage.jsx";
import StudentResourceDetailsPage from "../pages/student/StudentResourceDetailsPage.jsx";
import StudentCourseDetailsPage from "../pages/student/StudentCourseDetailsPage.jsx";
import StudentCourseDiscussionsPage from "../pages/student/StudentCourseDiscussionsPage.jsx";
import BookmarksPage from "../pages/student/BookmarksPage.jsx";
import UploadPage from "../pages/student/UploadPage.jsx";
import CoursesPage from "../pages/student/CoursesPage.jsx";
import NotificationsPage from "../pages/student/NotificationsPage.jsx";
import StudyRoomsPage from "../pages/student/StudyRoomsPage.jsx";
import StudyRoomPage from "../pages/student/StudyRoomPage.jsx";
import UserProfilePage from "../pages/student/UserProfilePage.jsx";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminCoursesPage from "../pages/admin/AdminCoursesPage.jsx";
import AdminResourcesPage from "../pages/admin/AdminResourcesPage.jsx";
import AdminUsersPage from "../pages/admin/AdminUsersPage.jsx";
import AdminMalwareScansPage from "../pages/admin/AdminMalwareScansPage.jsx";

import { useAuth } from "../contexts/AuthContext.jsx";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

function StudentRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

function HomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();

  return role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/student/dashboard" replace />
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/courses/:courseId/discussions"
        element={
          <ProtectedRoute>
            <StudentCourseDiscussionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <StudentRoute>
            <DashboardLayout />
          </StudentRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route
          path="resources/:resourceId"
          element={<StudentResourceDetailsPage />}
        />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<StudentCourseDetailsPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="study-rooms" element={<StudyRoomsPage />} />
        <Route path="study-rooms/:courseId" element={<StudyRoomPage />} />
        <Route index element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="resources" element={<AdminResourcesPage />} />
        <Route path="malware-scans" element={<AdminMalwareScansPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRouter;