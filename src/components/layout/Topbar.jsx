import { Bell, LogOut, Search, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role =
    user?.role ||
    user?.role_name ||
    (Number(user?.role_id) === 1 ? "admin" : "student");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {role === "admin" ? "Admin Panel" : "Welcome to Peerlearn"}
          </h2>
          <p className="text-sm text-slate-500">
            Signed in as {user?.full_name || "User"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user?.full_name || user?.name || "User"}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-white/30"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-violet-500 to-blue-500 text-xs font-bold text-white">
                {String(user?.full_name || user?.name || "U")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <span>{role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;