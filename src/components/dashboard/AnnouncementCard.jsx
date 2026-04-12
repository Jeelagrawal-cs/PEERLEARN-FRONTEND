import React from "react";

const AnnouncementCard = ({ title, date, desc, buttonText = "Learn More" }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <h3 className="text-xl font-semibold leading-8 text-slate-900">{title}</h3>

      <p className="mt-3 text-sm font-medium text-slate-500">{date}</p>

      <p className="mt-4 min-h-[72px] text-sm leading-7 text-slate-600">
        {desc}
      </p>

      <button className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50">
        {buttonText}
      </button>
    </div>
  );
};

export default AnnouncementCard;