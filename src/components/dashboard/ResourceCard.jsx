import React from "react";

const typeStyles = {
  PDF: "bg-sky-50 text-sky-600",
  DOCX: "bg-violet-50 text-violet-600",
  DOC: "bg-violet-50 text-violet-600",
  PPTX: "bg-orange-50 text-orange-600",
  PPT: "bg-orange-50 text-orange-600",
  DEFAULT: "bg-slate-100 text-slate-600",
};

const ResourceCard = ({ title, author, date, desc, type }) => {
  const badgeClass = typeStyles[type] || typeStyles.DEFAULT;

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
        Uploaded by {author} on {date}
      </p>

      <p className="mt-4 min-h-[72px] text-sm leading-7 text-slate-600">
        {desc}
      </p>

      <button className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50">
        View Resource
      </button>
    </div>
  );
};

export default ResourceCard;