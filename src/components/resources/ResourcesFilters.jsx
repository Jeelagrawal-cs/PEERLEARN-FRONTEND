import React from "react";

const ResourcesFilters = () => {
  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          Filter Resources
        </h3>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search Title
          </label>
          <input
            type="text"
            placeholder="Search by title or keyword..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Course
          </label>
          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option>All Courses</option>
            <option>BCA</option>
            <option>B.Tech</option>
            <option>BBA</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Semester
          </label>
          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option>All Semesters</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
            <option>Semester 3</option>
            <option>Semester 4</option>
            <option>Semester 5</option>
            <option>Semester 6</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subject
          </label>
          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option>All Subjects</option>
            <option>Data Structures</option>
            <option>Calculus</option>
            <option>Physics</option>
            <option>Algorithms</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Clear Filters
        </button>
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Apply Filters
        </button>
      </div>
    </section>
  );
};

export default ResourcesFilters;