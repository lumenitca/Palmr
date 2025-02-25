import { IconType } from "react-icons";
import {
  FaFile,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAudio,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";

interface FileIconMapping {
  extensions: string[];
  icon: IconType;
  color: string;
}

const fileIcons: FileIconMapping[] = [
  {
    extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"],
    icon: FaFileImage,
    color: "text-blue-500",
  },
  {
    extensions: ["pdf"],
    icon: FaFilePdf,
    color: "text-red-500",
  },
  {
    extensions: ["doc", "docx"],
    icon: FaFileWord,
    color: "text-blue-600",
  },
  {
    extensions: ["xls", "xlsx", "csv"],
    icon: FaFileExcel,
    color: "text-green-600",
  },
  {
    extensions: ["ppt", "pptx"],
    icon: FaFilePowerpoint,
    color: "text-orange-500",
  },
  {
    extensions: ["mp3", "wav", "ogg", "m4a"],
    icon: FaFileAudio,
    color: "text-purple-500",
  },
  {
    extensions: ["mp4", "avi", "mov", "wmv", "mkv"],
    icon: FaFileVideo,
    color: "text-pink-500",
  },
  {
    extensions: ["zip", "rar", "7z", "tar", "gz"],
    icon: FaFileArchive,
    color: "text-yellow-600",
  },
  {
    extensions: ["html", "css", "js", "ts", "jsx", "tsx", "json", "xml"],
    icon: FaFileCode,
    color: "text-gray-600",
  },
  {
    extensions: ["txt", "md", "rtf"],
    icon: FaFileAlt,
    color: "text-gray-500",
  },
];

export function getFileIcon(filename: string): { icon: IconType; color: string } {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  const mapping = fileIcons.find((type) => type.extensions.includes(extension));

  return mapping || { icon: FaFile, color: "text-gray-400" };
}
