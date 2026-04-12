import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { NotificationProvider } from "../contexts/NotificationContext.jsx";

function DashboardLayout() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#f4f7ff]">
        <div className="flex min-h-screen">
          <Sidebar />

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default DashboardLayout;