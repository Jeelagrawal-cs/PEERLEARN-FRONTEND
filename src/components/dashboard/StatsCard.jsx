import React from "react";

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  accent = "from-indigo-500 to-blue-500",
  iconBg = "bg-indigo-50",
  textAccent = "text-indigo-600",
}) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Top glow line */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

      {/* Soft background accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-100 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium tracking-wide text-slate-500">
            {title}
          </p>

          <div className="mt-4 flex items-end gap-3">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {value}
            </h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg} ring-1 ring-inset ring-slate-200`}
        >
          <span className={`text-2xl ${textAccent}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;