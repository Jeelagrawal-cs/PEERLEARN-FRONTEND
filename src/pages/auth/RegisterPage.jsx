import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth.service.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.full_name || !formData.email || !formData.password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await registerUser(formData);
      login(response);
      navigate("/student/dashboard", { replace: true });
    } catch (error) {
      console.error("Register error:", error);
      alert(error?.response?.data?.message || error?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <h2 className="text-5xl font-bold tracking-tight text-slate-900">
        Create account
      </h2>
      <p className="mt-3 text-base text-slate-500">
        Join Peerlearn and start sharing resources.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

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
            placeholder="Create a password"
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;