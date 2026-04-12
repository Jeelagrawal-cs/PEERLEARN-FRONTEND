import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;