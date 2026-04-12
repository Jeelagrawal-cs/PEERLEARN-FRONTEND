import React from "react";
import { ArrowRight } from "lucide-react";

function RelatedResourcesSection({ resources = [], onOpenResource }) {
  if (!Array.isArray(resources) || resources.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,104,179,0.08)] sm:p-8">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          More from this course
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Other materials uploaded for the same course
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {resources.map((item) => {
          const nextId = item.resource_id || item.id;

          return (
            <button
              key={nextId}
              type="button"
              onClick={() => onOpenResource?.(nextId)}
              className="rounded-[24px] border border-slate-100 bg-[#fbfcff] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_10px_30px_rgba(74,104,179,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                  {item.resource_type || "resource"}
                </span>
                <ArrowRight size={16} className="text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {item.title || "Untitled Resource"}
              </h3>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {item.description || "No description available."}
              </p>

              {item.course_name ? (
                <p className="mt-3 text-xs font-semibold text-blue-700">
                  {item.course_name}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RelatedResourcesSection;