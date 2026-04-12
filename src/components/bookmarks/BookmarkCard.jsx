import React from "react";
import { BookmarkCheck, Clock3, Eye } from "lucide-react";

const badgeStyles = {
  PDF: "bg-red-50 text-red-600",
  DOC: "bg-slate-100 text-slate-700",
  DOCX: "bg-slate-100 text-slate-700",
  PPT: "bg-orange-50 text-orange-600",
  PPTX: "bg-orange-50 text-orange-600",
  DEFAULT: "bg-slate-100 text-slate-700",
};

function BookmarkCard({
  title,
  author,
  savedOn,
  course,
  type,
  description,
}) {
  const badgeClass = badgeStyles[type] || badgeStyles.DEFAULT;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="max-w-[80%] text-xl font-semibold leading-8 text-slate-900">
          {title}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
        >
          {type}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Uploaded by <span className="font-medium text-slate-700">{author}</span>
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Course: <span className="font-medium text-slate-700">{course}</span>
      </p>

      <p className="mt-4 min-h-[72px] text-sm leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
        <div className="flex items-center gap-2">
          <Clock3 size={16} />
          <span>Saved on {savedOn}</span>
        </div>

        <div className="flex items-center gap-2 text-emerald-600">
          <BookmarkCheck size={16} />
          <span>Saved</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Eye size={16} />
          View Resource
        </button>

        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <BookmarkCheck size={16} />
          Bookmarked
        </button>
      </div>
    </div>
  );
}

export default BookmarkCard;