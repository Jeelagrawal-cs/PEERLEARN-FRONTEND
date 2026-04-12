import api, { getApiBaseUrl } from "./api.js";

function normalizeListResponse(response) {
  return response?.data?.data || response?.data || [];
}

function normalizeSingleResponse(response) {
  return response?.data?.data || response?.data || null;
}

function getResourceId(resource) {
  return Number(resource?.resource_id || resource?.id || 0);
}

function getCandidateUrls(resource) {
  const values = [
    resource?.file_url,
    resource?.file_path,
    resource?.resource_url,
    resource?.url,
    resource?.link_url,
    resource?.external_url,
    resource?.download_url,
    resource?.view_url,
    resource?.attachment_url,
  ];

  return values.filter((value) => typeof value === "string" && value.trim());
}

function toAbsoluteUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const value = rawUrl.trim();

  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  return `${baseUrl}${normalizedPath}`;
}

export async function fetchResources() {
  const response = await api.get("/api/resources");
  return normalizeListResponse(response);
}

export async function fetchResourceById(resourceId) {
  if (!resourceId) {
    throw new Error("Valid resource ID is required.");
  }

  const response = await api.get(`/api/resources/${resourceId}`);
  return normalizeSingleResponse(response);
}

export async function openOrDownloadResource(resource) {
  const resourceId = getResourceId(resource);

  if (!resourceId) {
    throw new Error("Valid resource ID is required.");
  }

  const directCandidates = getCandidateUrls(resource);

  for (const candidate of directCandidates) {
    const absoluteUrl = toAbsoluteUrl(candidate);

    if (absoluteUrl) {
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
      return {
        success: true,
        mode: "direct",
        url: absoluteUrl,
      };
    }
  }

  const response = await api.get(`/api/resources/${resourceId}`);

  const freshResource = normalizeSingleResponse(response) || {};
  const refreshedCandidates = getCandidateUrls(freshResource);

  for (const candidate of refreshedCandidates) {
    const absoluteUrl = toAbsoluteUrl(candidate);

    if (absoluteUrl) {
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
      return {
        success: true,
        mode: "refetched-direct",
        url: absoluteUrl,
      };
    }
  }

  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");

  const fallbackEndpoints = [
    `${baseUrl}/api/resources/${resourceId}/download`,
    `${baseUrl}/api/resources/${resourceId}/open`,
    `${baseUrl}/api/resources/${resourceId}/view`,
    `${baseUrl}/api/resources/download/${resourceId}`,
  ];

  for (const endpoint of fallbackEndpoints) {
    try {
      const probe = await fetch(endpoint, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (probe.ok) {
        window.open(endpoint, "_blank", "noopener,noreferrer");
        return {
          success: true,
          mode: "fallback-endpoint",
          url: endpoint,
        };
      }
    } catch (error) {
      console.warn("Resource endpoint probe failed:", endpoint, error);
    }
  }

  throw new Error(
    "No valid file URL or resource open endpoint was found for this resource."
  );
}

export async function uploadResource(formData) {
  // Step 1: Create the resource record with JSON body
  const resourcePayload = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "file") {
      resourcePayload[key] = value;
    }
  }

  const createResponse = await api.post("/api/resources", resourcePayload);
  const created = createResponse?.data?.data || createResponse?.data || {};
  const resourceId = created?.resource_id || created?.id;

  // Step 2: If a file was included, upload it to the resource
  const file = formData.get("file");
  if (file && resourceId) {
    const fileFormData = new FormData();
    fileFormData.append("file", file);

    await api.post(`/api/upload/resources/${resourceId}/file`, fileFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return created;
}