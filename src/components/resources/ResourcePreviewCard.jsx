import React from "react";
import {
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  FileWarning,
} from "lucide-react";
import {
  getResourcePrimaryUrl,
  openOrDownloadResource,
} from "../../services/resource.service.js";

function ResourcePreviewCard({ resource }) {
  const previewUrl = getResourcePrimaryUrl(resource);

  const resourceType = String(resource?.resource_type || "resource");
  const storageType = String(resource?.storage_type || "").toLowerCase();
  const mimeType = String(resource?.mime_type || "").toLowerCase();
  const fileName = String(
    resource?.file_name ||
      resource?.stored_file_name ||
      resource?.title ||
      "Resource file"
  );

  const isExternal =
    storageType === "external_link" || resourceType.toLowerCase() === "link";

  const fileKind = getFileKind({ isExternal, mimeType, fileName });

  function handleOpen() {
    try {
      openOrDownloadResource(resource);
    } catch (error) {
      alert(error?.message || "Could not open resource");
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <PreviewIcon kind={fileKind} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Resource Access
              </p>
              <h2 className="text-xl font-bold text-slate-900">
                {isExternal ? "Open external material" : "Open resource file"}
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            {isExternal
              ? "This resource links to content outside the platform. Open it in a new tab to continue."
              : "This file opens in a new tab for a smoother and more reliable reading experience."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          disabled={!previewUrl}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ExternalLink size={16} />
          {isExternal ? "Open Link" : "Open File"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-slate-700 shadow-sm">
              <PreviewIcon kind={fileKind} size={34} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              {getPreviewHeading({ isExternal, previewUrl, fileKind })}
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              {getPreviewText({ isExternal, previewUrl, fileKind })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <InfoBox label="Resource Type" value={resourceType} />
          <InfoBox label="File Name" value={fileName} />
          <InfoBox label="MIME Type" value={mimeType || "Unknown"} />
          <InfoBox
            label="Source"
            value={isExternal ? "External link" : "Uploaded file"}
          />
        </div>
      </div>
    </section>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-slate-50/80 px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function PreviewIcon({ kind, size = 26 }) {
  if (kind === "external") return <LinkIcon size={size} />;
  if (kind === "image") return <ImageIcon size={size} />;
  if (kind === "warning") return <FileWarning size={size} />;
  return <FileText size={size} />;
}

function getFileKind({ isExternal, mimeType, fileName }) {
  const lowerFile = String(fileName || "").toLowerCase();

  if (isExternal) return "external";
  if (
    mimeType.startsWith("image/") ||
    lowerFile.endsWith(".png") ||
    lowerFile.endsWith(".jpg") ||
    lowerFile.endsWith(".jpeg") ||
    lowerFile.endsWith(".gif") ||
    lowerFile.endsWith(".webp") ||
    lowerFile.endsWith(".svg")
  ) {
    return "image";
  }

  if (
    mimeType.includes("pdf") ||
    lowerFile.endsWith(".pdf") ||
    lowerFile.endsWith(".doc") ||
    lowerFile.endsWith(".docx") ||
    lowerFile.endsWith(".ppt") ||
    lowerFile.endsWith(".pptx") ||
    lowerFile.endsWith(".xls") ||
    lowerFile.endsWith(".xlsx")
  ) {
    return "warning";
  }

  return "file";
}

function getPreviewHeading({ isExternal, previewUrl, fileKind }) {
  if (!previewUrl) return "File not attached";
  if (isExternal) return "External study resource";
  if (fileKind === "image") return "Image resource";
  return "Open file in new tab";
}

function getPreviewText({ isExternal, previewUrl, fileKind }) {
  if (!previewUrl) {
    return "This resource currently does not have a valid file or link attached.";
  }

  if (isExternal) {
    return "This material is hosted outside Peerlearn. Use the main button above to continue to the linked resource.";
  }

  if (fileKind === "image") {
    return "This image-based resource is best viewed in a separate tab for full size and clarity.";
  }

  return "For a cleaner and more consistent experience, this file opens directly in a new browser tab instead of rendering inside the page.";
}

export default ResourcePreviewCard;