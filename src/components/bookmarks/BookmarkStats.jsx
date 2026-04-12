import React from "react";
import { Bookmark, Clock3, FolderOpen } from "lucide-react";

const stats = [
  {
    title: "Saved Resources",
    value: "24",
    subtitle: "Items bookmarked across all your subjects",
    icon: Bookmark,
  },
  {
    title: "Recently Saved",
    value: "8",
    subtitle: "Resources added in the last 7 days",
    icon: Clock3,
  },
  {
    title: "Courses Covered",
    value: "6",
    subtitle: "Subjects represented in your saved library",
    icon: FolderOpen,
  },
];

function BookmarkStats() {
  return (
    <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                  {item.value}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.subtitle}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default BookmarkStats;