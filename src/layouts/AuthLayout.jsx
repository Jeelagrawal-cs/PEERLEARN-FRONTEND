import React from "react";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Branding Panel */}
        <div className="hidden bg-gradient-to-b from-indigo-600 to-slate-900 px-16 py-14 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-100">
              Peerlearn
            </p>

            <h1 className="mt-10 max-w-xl text-6xl font-bold leading-tight">
              Learn together,
              <br />
              organize better,
              <br />
              and share academic
              <br />
              resources
              <br />
              professionally.
            </h1>

            <p className="mt-10 max-w-md text-lg leading-8 text-indigo-100">
              A modern student-driven platform for notes, assignments, past
              papers, and resource discovery.
            </p>
          </div>

          <div className="grid max-w-lg grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-3xl font-bold">500+</p>
              <p className="mt-2 text-sm text-indigo-100">Resources shared</p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-3xl font-bold">120+</p>
              <p className="mt-2 text-sm text-indigo-100">Active learners</p>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;