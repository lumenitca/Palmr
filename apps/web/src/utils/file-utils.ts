import { nanoid } from "nanoid";

export function generateSafeFileName(originalName: string): string {
  const extension = originalName.split(".").pop() || "";
  const safeId = nanoid().replace(/[-_]/g, "").slice(0, 12);

  return `${safeId}.${extension}`;
}
