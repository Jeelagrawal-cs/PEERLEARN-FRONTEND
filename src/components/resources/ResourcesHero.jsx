import React from "react";

const ResourcesHero = () => {
  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-sky-50 px-8 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Share Your Knowledge
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Upload notes, assignments, and past papers to help your peers.
            Supported formats include PDF, DOC, PPT, and more.
          </p>
        </div>

        <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Upload Resources
        </button>
      </div>
    </section>
  );
};

export default ResourcesHero;