import React from "react";

const typeStyles = {
  PDF: "bg-red-50 text-red-600",
  DOC: "bg-slate-100 text-slate-700",
  DOCX: "bg-slate-100 text-slate-700",
  PPT: "bg-orange-50 text-orange-600",
  PPTX: "bg-orange-50 text-orange-600",
  DEFAULT: "bg-slate-100 text-slate-600",
};

const ResourceGridCard = ({
  image,
  title,
  author,
  type,
  date,
}) => {
  const badgeClass = typeStyles[type] || typeStyles.DEFAULT;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        <img
          src={image}
          alt={title}
          className="h-40 w-full object-cover"
        />
      </div>

      <div className="px-1 pb-1 pt-5">
        <h3 className="min-h-[64px] text-xl font-semibold leading-8 text-slate-900">
          {title}
        </h3>

        <p className="mt-3 text-sm text-slate-500">
          Uploaded by: <span className="font-medium text-slate-700">{author}</span>
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
          >
            {type}
          </span>

          <span className="text-sm text-slate-400">{date}</span>
        </div>

        <button className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          View Details
        </button>
      </div>
    </div>
  );
};

export default ResourceGridCard;