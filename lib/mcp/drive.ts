import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";

export async function searchDrive(query: string, userId?: string): Promise<string> {
  try {
    const auth = await getGoogleAuth(userId);
    const drive = google.drive({ version: "v3", auth });
    console.log("🔍 Drive search query:", query);

    // Extract search term from query
    const searchTerm = query
    .toLowerCase()
    .replace(/\b(what|are|there|is|find|search|look|for|get|my|files|file|document|docs|in|drive|google|fetch|recent|latest|from|the|show|list|all|any|have|i)\b/g, "")
    .replace(/[?!.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();

    console.log("🔍 Drive userId:", userId || "NONE — using default");

    console.log("🔍 Drive searchTerm after cleaning:", `"${searchTerm}"`);

    const response = await drive.files.list({
      q: searchTerm && searchTerm.length > 2
        ? `name contains '${searchTerm}' and trashed = false`
        : "trashed = false",
      pageSize: 5,
      fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
      orderBy: "modifiedTime desc",
    });

    console.log("📁 Drive files found:", response.data.files?.length);

    const files = response.data.files || [];
    if (files.length === 0) return `No files found${searchTerm ? ` matching "${searchTerm}"` : ""}.`;

    const formatted = files.map(file => {
      const type = file.mimeType?.includes("folder") ? "📁"
        : file.mimeType?.includes("document") ? "📝"
        : file.mimeType?.includes("spreadsheet") ? "📊"
        : file.mimeType?.includes("presentation") ? "📊"
        : "📄";
      const modified = file.modifiedTime
        ? new Date(file.modifiedTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "";
      return `${type} ${file.name} (modified ${modified})`;
    }).join("\n");

    return `Found in Drive:\n${formatted}`;
  } catch (err: any) {
    console.error("Drive search error:", err.message);
    return "Could not search Google Drive.";
  }
}

export async function getDriveFile(fileId: string, userId?: string): Promise<string> {
  try {
    const auth = await getGoogleAuth(userId);
    const drive = google.drive({ version: "v3", auth });
    console.log("🔍 Drive userId:", userId || "NONE — using default");

    const response = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink",
    });

    return `File: ${response.data.name}\nLink: ${response.data.webViewLink}`;
  } catch (err: any) {
    console.error("Drive get file error:", err.message);
    return "Could not get file from Drive.";
  }
}