import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowLeft,
  Link as LinkIcon,
  Lock,
  Loader2,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldQuestion,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileWarning,
  ScanLine,
  Info,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchCourses } from "../../services/course.service.js";
import { uploadResource } from "../../services/resource.service.js";
import { scanFileForMalware } from "../../services/malware.service.js";

const RESOURCE_TYPES = [
  { value: "notes", label: "Notes" },
  { value: "assignment", label: "Assignment" },
  { value: "past_paper", label: "Past Paper" },
  { value: "recorded_lecture", label: "Recorded Lecture" },
  { value: "presentation", label: "Presentation" },
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "link", label: "Link" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "course_only", label: "Course Only" },
];

/* ─── Malware Score Ring ───────────────────────────── */
function ScoreRing({ score, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (safeScore / 100) * circumference;

  let color = "#22c55e";
  if (safeScore >= 80) color = "#ef4444";
  else if (safeScore >= 40) color = "#f59e0b";

  return (
    <svg width={size} height={size} className="malware-score-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(148,163,184,0.15)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.28}
        fontWeight="800"
      >
        {safeScore}
      </text>
    </svg>
  );
}

/* ─── Sidebar Component ───────────────────────────── */
function MalwareSidebar({ scanResult, scanning, selectedFile }) {
  if (!selectedFile) {
    return (
      <aside className="malware-sidebar malware-sidebar--empty">
        <div className="malware-sidebar__icon-wrap">
          <ScanLine size={40} strokeWidth={1.5} />
        </div>
        <h3 className="malware-sidebar__title">Malware Scanner</h3>
        <p className="malware-sidebar__subtitle">
          Select a file to automatically scan it for malware threats before
          uploading.
        </p>
      </aside>
    );
  }

  if (scanning) {
    return (
      <aside className="malware-sidebar malware-sidebar--scanning">
        <div className="malware-sidebar__spinner-wrap">
          <Loader2 size={48} className="malware-sidebar__spinner" />
        </div>
        <h3 className="malware-sidebar__title">Scanning File…</h3>
        <p className="malware-sidebar__subtitle">
          Analyzing <strong>{selectedFile.name}</strong> for threats
        </p>
        <div className="malware-sidebar__progress-bar">
          <div className="malware-sidebar__progress-bar-inner" />
        </div>
      </aside>
    );
  }

  if (!scanResult) {
    return (
      <aside className="malware-sidebar malware-sidebar--empty">
        <div className="malware-sidebar__icon-wrap">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <h3 className="malware-sidebar__title">Not Scanned</h3>
        <p className="malware-sidebar__subtitle">
          No scan results available yet.
        </p>
      </aside>
    );
  }

  const { risk_score, risk_level, scan_status, summary, indicators, error } =
    scanResult;

  if (error || risk_score < 0) {
    return (
      <aside className="malware-sidebar malware-sidebar--error">
        <div className="malware-sidebar__icon-wrap malware-sidebar__icon-wrap--error">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <h3 className="malware-sidebar__title">Scan Unavailable</h3>
        <p className="malware-sidebar__subtitle">{summary}</p>
        <div className="malware-sidebar__badge malware-sidebar__badge--warning">
          <AlertTriangle size={14} /> Proceed with caution
        </div>
      </aside>
    );
  }

  /* ── For safe / low-risk files, show a minimal "clean" confirmation ── */
  if (risk_level === "low" || (!risk_level && risk_score < 40)) {
    return (
      <aside className="malware-sidebar malware-sidebar--empty">
        <div
          className="malware-sidebar__icon-wrap"
          style={{ color: "#22c55e" }}
        >
          <ShieldCheck size={40} strokeWidth={1.5} />
        </div>
        <h3 className="malware-sidebar__title">File is Clean</h3>
        <p className="malware-sidebar__subtitle">
          No threats detected — safe to upload.
        </p>
        <div className="malware-sidebar__badge malware-sidebar__badge--safe">
          <CheckCircle2 size={14} />
          Safe to upload
        </div>
      </aside>
    );
  }

  /* ── For medium / high risk, show full detailed report ── */
  const riskConfig = {
    medium: {
      Icon: ShieldAlert,
      label: "Medium Risk",
      badgeClass: "malware-sidebar__badge--warning",
      statusIcon: <AlertTriangle size={14} />,
      statusText: "Review recommended",
      ringWrapClass: "malware-sidebar__ring-wrap--warning",
    },
    high: {
      Icon: ShieldX,
      label: "High Risk",
      badgeClass: "malware-sidebar__badge--danger",
      statusIcon: <XCircle size={14} />,
      statusText: "Upload blocked",
      ringWrapClass: "malware-sidebar__ring-wrap--danger",
    },
  };

  const cfg = riskConfig[risk_level] || riskConfig.medium;

  return (
    <aside className="malware-sidebar malware-sidebar--result">
      <div className="malware-sidebar__header">
        <ScanLine size={18} />
        <span>Scan Report</span>
      </div>

      <div className={`malware-sidebar__ring-wrap ${cfg.ringWrapClass}`}>
        <ScoreRing score={risk_score} size={130} strokeWidth={11} />
        <p className="malware-sidebar__risk-label">{cfg.label}</p>
      </div>

      <div className={`malware-sidebar__badge ${cfg.badgeClass}`}>
        {cfg.statusIcon}
        {cfg.statusText}
      </div>

      <div className="malware-sidebar__meta">
        <div className="malware-sidebar__meta-row">
          <span>File</span>
          <span title={scanResult.original_file_name}>
            {scanResult.original_file_name?.length > 22
              ? scanResult.original_file_name.slice(0, 20) + "…"
              : scanResult.original_file_name}
          </span>
        </div>
        <div className="malware-sidebar__meta-row">
          <span>Type</span>
          <span>{scanResult.file_extension || "—"}</span>
        </div>
        <div className="malware-sidebar__meta-row">
          <span>Size</span>
          <span>{formatBytes(scanResult.file_size)}</span>
        </div>
        {scanResult.magic_type && scanResult.magic_type !== "unknown" && (
          <div className="malware-sidebar__meta-row">
            <span>Magic</span>
            <span style={{ textTransform: "uppercase" }}>
              {scanResult.magic_type}
            </span>
          </div>
        )}
      </div>

      {summary && (
        <div className="malware-sidebar__summary">
          <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{summary}</span>
        </div>
      )}

      {indicators && indicators.length > 0 && (
        <div className="malware-sidebar__indicators">
          <h4 className="malware-sidebar__indicators-title">
            <FileWarning size={14} /> Indicators ({indicators.length})
          </h4>
          <ul className="malware-sidebar__indicator-list">
            {indicators.map((ind, i) => (
              <li
                key={i}
                className={`malware-sidebar__indicator malware-sidebar__indicator--${ind.severity}`}
              >
                <span className="malware-sidebar__indicator-dot" />
                <span>{ind.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/* ─── Main Upload Page ────────────────────────────── */
function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryCourseId = searchParams.get("courseId");

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: queryCourseId || "",
    resource_type: "notes",
    visibility: "public",
    link_url: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (queryCourseId) {
      setForm((prev) => ({
        ...prev,
        course_id: String(queryCourseId),
      }));
    }
  }, [queryCourseId]);

  async function loadCourses() {
    try {
      setLoadingCourses(true);
      setPageError("");

      const data = await fetchCourses();
      const nextCourses = Array.isArray(data) ? data : [];

      setCourses(nextCourses);

      if (!queryCourseId && nextCourses.length > 0 && !form.course_id) {
        const firstCourseId =
          nextCourses[0]?.course_id || nextCourses[0]?.id || "";
        setForm((prev) => ({
          ...prev,
          course_id: String(firstCourseId),
        }));
      }
    } catch (error) {
      console.error("Load courses error:", error);
      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load courses."
      );
    } finally {
      setLoadingCourses(false);
    }
  }

  const selectedCourse = useMemo(() => {
    return (
      courses.find(
        (course) =>
          String(course?.course_id || course?.id || "") ===
          String(form.course_id || "")
      ) || null
    );
  }, [courses, form.course_id]);

  const isCourseLocked = Boolean(queryCourseId);
  const showLinkField = form.resource_type === "link";

  /* Auto-scan when a file is selected */
  const runScan = useCallback(async (file) => {
    if (!file) return;
    setScanning(true);
    setScanResult(null);
    try {
      const result = await scanFileForMalware(file);
      setScanResult(result);
    } catch (err) {
      console.error("Scan error:", err);
      setScanResult({
        risk_score: -1,
        risk_level: "unknown",
        scan_status: "error",
        summary: "Scan failed unexpectedly.",
        indicators: [],
        error: true,
      });
    } finally {
      setScanning(false);
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setScanResult(null);

    if (file) {
      runScan(file);
    }
  }

  const isBlocked =
    scanResult && !scanResult.error && scanResult.scan_status === "block";

  async function handleSubmit(event) {
    event.preventDefault();

    if (isBlocked) {
      setPageError(
        "This file has been flagged as high-risk malware. Upload is blocked."
      );
      return;
    }

    try {
      setSubmitting(true);
      setPageError("");

      if (!form.title.trim()) {
        throw new Error("Title is required.");
      }

      if (!form.course_id) {
        throw new Error("Please select a course.");
      }

      const isLinkType = form.resource_type === "link";

      if (isLinkType && !form.link_url.trim()) {
        throw new Error("Please provide a valid link URL.");
      }

      if (!isLinkType && !selectedFile) {
        throw new Error("Please choose a file to upload.");
      }

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("course_id", form.course_id);
      payload.append("resource_type", form.resource_type);
      payload.append("visibility", form.visibility);

      if (isLinkType) {
        payload.append("link_url", form.link_url.trim());
      }

      if (!isLinkType && selectedFile) {
        payload.append("file", selectedFile);
      }

      await uploadResource(payload);

      const redirectCourseId = form.course_id;

      setForm({
        title: "",
        description: "",
        course_id: queryCourseId || "",
        resource_type: "notes",
        visibility: "public",
        link_url: "",
      });
      setSelectedFile(null);
      setScanResult(null);

      if (redirectCourseId) {
        navigate(`/student/courses/${redirectCourseId}`);
        return;
      }

      navigate("/student/resources");
    } catch (error) {
      console.error("Upload resource error:", error);
      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload resource."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (queryCourseId) {
      navigate(`/student/courses/${queryCourseId}`);
      return;
    }
    navigate("/student/resources");
  }

  return (
    <div className="upload-page">
      {/* ── main column ── */}
      <div className="upload-page__main">
        <section className="upload-page__hero">
          <div className="upload-page__hero-inner">
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="upload-page__back-btn"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="upload-page__badges">
                <span className="upload-page__badge upload-page__badge--violet">
                  Upload
                </span>
                {selectedCourse ? (
                  <span className="upload-page__badge upload-page__badge--sky">
                    {selectedCourse.course_code || "Course"}
                  </span>
                ) : null}
              </div>

              <h1 className="upload-page__heading">
                {queryCourseId
                  ? "Upload Resource to This Course"
                  : "Upload Resource"}
              </h1>

              <p className="upload-page__subtitle">
                Upload clean, organized learning materials. When opened from a
                course page, the course is preselected automatically.
              </p>
            </div>
          </div>
        </section>

        {pageError ? (
          <div className="upload-page__error">
            <p>{pageError}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="upload-page__form">
          <div className="upload-page__grid">
            {/* Title */}
            <div className="upload-page__field upload-page__field--full">
              <label className="upload-page__label">Resource Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter resource title"
                className="upload-page__input"
              />
            </div>

            {/* Description */}
            <div className="upload-page__field upload-page__field--full">
              <label className="upload-page__label">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Write a short description about this resource"
                className="upload-page__input upload-page__textarea"
              />
            </div>

            {/* Course */}
            <div className="upload-page__field">
              <label className="upload-page__label">Course</label>
              {loadingCourses ? (
                <div className="upload-page__input upload-page__input--placeholder">
                  Loading courses...
                </div>
              ) : (
                <div className="upload-page__select-wrap">
                  <select
                    name="course_id"
                    value={form.course_id}
                    onChange={handleChange}
                    disabled={isCourseLocked}
                    className={`upload-page__input upload-page__select ${
                      isCourseLocked ? "upload-page__select--locked" : ""
                    }`}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => {
                      const value = course?.course_id || course?.id;
                      const name =
                        course?.course_name || course?.name || "Course";
                      const code = course?.course_code || course?.code || "";
                      return (
                        <option key={value} value={value}>
                          {code ? `${code} - ${name}` : name}
                        </option>
                      );
                    })}
                  </select>
                  {isCourseLocked ? (
                    <Lock
                      size={16}
                      className="upload-page__select-lock-icon"
                    />
                  ) : null}
                </div>
              )}
            </div>

            {/* Resource Type */}
            <div className="upload-page__field">
              <label className="upload-page__label">Resource Type</label>
              <select
                name="resource_type"
                value={form.resource_type}
                onChange={handleChange}
                className="upload-page__input upload-page__select"
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div className="upload-page__field">
              <label className="upload-page__label">Visibility</label>
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                className="upload-page__input upload-page__select"
              >
                {VISIBILITY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Link or File */}
            {showLinkField ? (
              <div className="upload-page__field">
                <label className="upload-page__label">Resource Link</label>
                <div className="upload-page__link-input-wrap">
                  <LinkIcon
                    size={18}
                    className="upload-page__link-input-icon"
                  />
                  <input
                    type="url"
                    name="link_url"
                    value={form.link_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="upload-page__input upload-page__input--link"
                  />
                </div>
              </div>
            ) : (
              <div className="upload-page__field">
                <label className="upload-page__label">Upload File</label>
                <label className="upload-page__file-drop">
                  <UploadCloud size={18} />
                  <span className="upload-page__file-drop-text">
                    {selectedFile
                      ? selectedFile.name
                      : "Choose file to upload"}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="upload-page__file-input"
                  />
                </label>
              </div>
            )}
          </div>

          {/* ── blocked warning ── */}
          {isBlocked && (
            <div className="upload-page__blocked-banner">
              <ShieldX size={20} />
              <div>
                <strong>Upload Blocked</strong>
                <p>
                  This file has been flagged as high-risk. You cannot upload
                  it. Please choose a different file.
                </p>
              </div>
            </div>
          )}

          <div className="upload-page__actions">
            <button
              type="button"
              onClick={handleBack}
              className="upload-page__btn upload-page__btn--secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingCourses || scanning || isBlocked}
              className="upload-page__btn upload-page__btn--primary"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="upload-page__btn-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Upload Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── sidebar column ── */}
      <div className="upload-page__sidebar">
        <MalwareSidebar
          scanResult={scanResult}
          scanning={scanning}
          selectedFile={selectedFile}
        />
      </div>
    </div>
  );
}

export default UploadPage;