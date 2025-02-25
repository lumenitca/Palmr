export function formatFileSize(bytes: number): string {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes < MB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  } else if (bytes < GB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  } else {
    return `${(bytes / GB).toFixed(2)} GB`;
  }
}
