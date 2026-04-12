import React from "react";
import { UploadCloud } from "lucide-react";

function UploadHero() {
  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-sky-50 px-8 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm ring-1 ring-sky-100">
            <UploadCloud size={16} />
            Resource Contribution
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Share Your Knowledge
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Upload class notes, project documents, lab files, and presentations
            so other students can learn faster and collaborate better.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-900">Supported Files</p>
          <p className="mt-1 text-sm text-slate-500">
            PDF, DOC, DOCX, PPT, PPTX
          </p>
        </div>
      </div>
    </section>
  );
}

export default UploadHero;