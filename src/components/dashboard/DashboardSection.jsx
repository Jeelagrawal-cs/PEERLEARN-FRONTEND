import React from "react";

const DashboardSection = ({ title, children }) => {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-[28px] font-bold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">{children}</div>
    </section>
  );
};

export default DashboardSection;