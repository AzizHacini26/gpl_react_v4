import { apiFetch, getAuthToken } from "./authApi";

const REPORTS_API_URL = "/api/reports";

export const ReportService = {
  open: async (reportName, params = {}) => {
    const reportWindow = window.open("about:blank", "_blank");
    if (!reportWindow) {
      window.alert("Popup was blocked. Please allow popups for this site.");
      return;
    }

    reportWindow.document.title = "Loading report...";
    reportWindow.document.body.innerHTML = "<p style='font-family:sans-serif;padding:16px'>Loading report...</p>";

    const token = getAuthToken();
    if (!token) {
      reportWindow.close();
      window.alert("Session expired: please log in again.");
      return;
    }

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    );
    const query = new URLSearchParams(filteredParams).toString();
    const url = `${REPORTS_API_URL}/${encodeURIComponent(reportName)}${query ? `?${query}` : ""}`;
    try {
      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const reason = errorText || response.statusText || "Unknown error";
        throw new Error(`Failed to open report (${response.status}): ${reason}`);
      }

      const pdfBlob = await response.blob();
      const blobUrl = URL.createObjectURL(pdfBlob);
      reportWindow.location.replace(blobUrl);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      console.error("Error opening report:", error);
      reportWindow.document.title = "Report error";
      reportWindow.document.body.innerHTML =
        "<p style='font-family:sans-serif;padding:16px;color:#b00020'>Unable to open report.</p>";
      window.alert(`Unable to open report. ${error.message}`);
    }
  },

  openByDocumentType: async (documentTypeCode, params = {}) => {
    const reportWindow = window.open("about:blank", "_blank");
    if (!reportWindow) {
      window.alert("Popup was blocked. Please allow popups for this site.");
      return;
    }

    reportWindow.document.title = "Loading report...";
    reportWindow.document.body.innerHTML = "<p style='font-family:sans-serif;padding:16px'>Loading report...</p>";

    const token = getAuthToken();
    if (!token) {
      reportWindow.close();
      window.alert("Session expired: please log in again.");
      return;
    }

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    );
    const query = new URLSearchParams(filteredParams).toString();
    const url = `${REPORTS_API_URL}/by-document/${encodeURIComponent(documentTypeCode)}${query ? `?${query}` : ""}`;

    try {
      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const reason = errorText || response.statusText || "Unknown error";
        throw new Error(`Failed to open report (${response.status}): ${reason}`);
      }

      const pdfBlob = await response.blob();
      const blobUrl = URL.createObjectURL(pdfBlob);
      reportWindow.location.replace(blobUrl);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      console.error("Error opening report:", error);
      reportWindow.document.title = "Report error";
      reportWindow.document.body.innerHTML =
        "<p style='font-family:sans-serif;padding:16px;color:#b00020'>Unable to open report.</p>";
      window.alert(`Unable to open report. ${error.message}`);
    }
  },
};
