import {
  Icon,
  IconFile,
  IconFileCode,
  IconFileDescription,
  IconFileMusic,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypePdf,
  IconFileZip,
  IconPhoto,
  IconPresentation,
  IconVideo,
} from "@tabler/icons-react";

interface FileIconMapping {
  extensions: string[];
  icon: Icon;
  color: string;
}

const fileIcons: FileIconMapping[] = [
  {
    extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"],
    icon: IconPhoto,
    color: "text-blue-500",
  },
  {
    extensions: ["pdf"],
    icon: IconFileTypePdf,
    color: "text-red-500",
  },
  {
    extensions: ["doc", "docx"],
    icon: IconFileText,
    color: "text-blue-600",
  },
  {
    extensions: ["xls", "xlsx", "csv"],
    icon: IconFileSpreadsheet,
    color: "text-green-600",
  },
  {
    extensions: ["ppt", "pptx"],
    icon: IconPresentation,
    color: "text-orange-500",
  },
  {
    extensions: ["mp3", "wav", "ogg", "m4a"],
    icon: IconFileMusic,
    color: "text-purple-500",
  },
  {
    extensions: ["mp4", "avi", "mov", "wmv", "mkv"],
    icon: IconVideo,
    color: "text-pink-500",
  },
  {
    extensions: ["zip", "rar", "7z", "tar", "gz"],
    icon: IconFileZip,
    color: "text-yellow-600",
  },
  {
    extensions: ["html", "css", "js", "ts", "jsx", "tsx", "json", "xml"],
    icon: IconFileCode,
    color: "text-gray-600",
  },
  {
    extensions: ["txt", "md", "rtf"],
    icon: IconFileDescription,
    color: "text-gray-500",
  },
];

export function getFileIcon(filename: string): { icon: Icon; color: string } {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  const mapping = fileIcons.find((type) => type.extensions.includes(extension));

  return mapping || { icon: IconFile, color: "text-gray-400" };
}
