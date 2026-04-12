import React from "react";
import {
  Calendar,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Heart,
  MessageCircle,
  User,
} from "lucide-react";

function ResourceMetaCard({ resource }) {
  const uploadDate = resource?.created_at
    ? new Date(resource.created_at).toLocaleDateString()
    : "Unknown";

  const fileSizeText = formatFileSize(resource?.file_size);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <InfoCard
        icon={FolderOpen}
        label="Course"
        value={
          resource?.course_name
            ? `${resource.course_name}${
                resource?.course_code ? ` (${resource.course_code})` : ""
              }`
            : "Not specified"
        }
      />
      <InfoCard
        icon={User}
        label="Uploaded by"
        value={resource?.uploader_name || "Unknown"}
      />
      <InfoCard icon={Calendar} label="Uploaded on" value={uploadDate} />
      <InfoCard
        icon={FileText}
        label="Resource type"
        value={resource?.resource_type || "resource"}
      />
      <InfoCard
        icon={Download}
        label="Downloads"
        value={String(Number(resource?.download_count || 0))}
      />
      <InfoCard
        icon={Eye}
        label="Views"
        value={String(Number(resource?.view_count || 0))}
      />
      <InfoCard
        icon={MessageCircle}
        label="Comments"
        value={String(Number(resource?.comment_count || 0))}
      />
      <InfoCard
        icon={Heart}
        label="Likes"
        value={String(Number(resource?.reaction_count || 0))}
      />
      {fileSizeText ? (
        <InfoCard icon={FileText} label="File size" value={fileSizeText} />
      ) : null}
      {resource?.file_name ? (
        <InfoCard icon={FileText} label="File name" value={resource.file_name} />
      ) : null}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(fileSize) {
  const bytes = Number(fileSize);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default ResourceMetaCard;