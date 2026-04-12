import React, { useEffect, useMemo, useState } from "react";
import {
  fetchAdminUsers,
  makeUserAdmin,
  makeAdminStudent,
} from "../../services/admin.service.js";
import { Search, ShieldCheck, ArrowRightLeft } from "lucide-react";
import UserProfileLink from "../../components/common/UserProfileLink.jsx";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionUserId, setActionUserId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError("");
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load users."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMakeAdmin(userId) {
    try {
      setActionUserId(userId);
      setError("");
      setMessage("");
      const response = await makeUserAdmin(userId);
      setMessage(response?.message || "User promoted to admin.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to make admin."
      );
    } finally {
      setActionUserId(null);
    }
  }

  async function handleMakeStudent(userId) {
    try {
      setActionUserId(userId);
      setError("");
      setMessage("");
      const response = await makeAdminStudent(userId);
      setMessage(response?.message || "Admin changed to student.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to change role."
      );
    } finally {
      setActionUserId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      const name = String(user?.name || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      const role = String(user?.role_name || user?.role || "").toLowerCase();
      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const adminCount = users.filter(
    (user) =>
      String(user?.role_name || user?.role || "").toLowerCase() === "admin"
  ).length;
  const studentCount = totalUsers - adminCount;

  return (
    <div className="min-h-full bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Peerlearn Admin
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                User management
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Review platform users, open profiles, and manage roles without leaving the admin area.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Total users</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {totalUsers}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Admins</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {adminCount}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Students</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {studentCount}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or role"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const role = String(
                        user?.role_name || user?.role || "student"
                      ).toLowerCase();

                      return (
                        <tr key={user?.user_id || user?.id}>
                          <td className="px-6 py-4 align-top">
                            <div className="min-w-[220px]">
                              <UserProfileLink
                                userId={user?.user_id || user?.id}
                                name={user?.name || "Unknown User"}
                                className="text-sm font-semibold text-slate-900"
                                ownProfileClassName="text-sm font-semibold text-slate-900"
                              />
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top text-sm text-slate-600">
                            {user?.email || "—"}
                          </td>

                          <td className="px-6 py-4 align-top">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                role === "admin"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {role === "admin" ? "Admin" : "Student"}
                            </span>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {role !== "admin" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMakeAdmin(user?.user_id || user?.id)
                                  }
                                  disabled={actionUserId === (user?.user_id || user?.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  Make Admin
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMakeStudent(user?.user_id || user?.id)
                                  }
                                  disabled={actionUserId === (user?.user_id || user?.id)}
                                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                  Make Student
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminUsersPage;