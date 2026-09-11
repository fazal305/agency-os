// Executable/script extensions are blocked outright — deliverables are
// creative/document assets, never something a browser or OS would execute.
const BLOCKED_EXTENSIONS = new Set([
  "exe", "msi", "bat", "cmd", "com", "scr", "sh", "bash", "ps1",
  "js", "mjs", "cjs", "jar", "app", "dmg", "apk", "vbs", "wsf",
]);

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB

export function validateUploadedFile(file) {
  if (!file || file.size === 0) return "Choose a file to upload.";
  if (file.size > MAX_FILE_BYTES) return "Files must be 25MB or smaller.";

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && BLOCKED_EXTENSIONS.has(extension)) {
    return "That file type isn't allowed.";
  }

  return null;
}
