import React from "react";
import { Bookmark } from "lucide-react";

function BookmarksHero() {
  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-sky-50 px-8 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm ring-1 ring-sky-100">
            <Bookmark size={16} />
            Saved Resources
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Your Learning Shortlist
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Keep your most important notes, assignments, and presentations in
            one place so you can revisit them anytime without searching again.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-900">Bookmark Access</p>
          <p className="mt-1 text-sm text-slate-500">
            Faster review. Better revision.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BookmarksHero;