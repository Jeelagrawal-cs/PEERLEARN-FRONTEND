import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getRoleFromUser(user) {
    if (!user) return "student";

    if (user.role) return String(user.role).toLowerCase();
    if (user.role_name) return String(user.role_name).toLowerCase();
    if (Number(user.role_id) === 1) return "admin";

    return "student";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await loginUser(formData);
      login(response);

      const user = response?.user || null;
      const role = getRoleFromUser(user);

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <h2 className="text-5xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>

        <p className="mt-3 text-base text-slate-500">
          Login to continue to Peerlearn.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;