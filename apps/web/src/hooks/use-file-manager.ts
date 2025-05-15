import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { deleteFile, getDownloadUrl, updateFile } from "@/http/endpoints";

interface FileToRename {
  id: string;
  name: string;
  description?: string;
}

interface FileToDelete {
  id: string;
  name: string;
}

interface PreviewFile {
  name: string;
  objectName: string;
}

export interface FileManagerHook {
  previewFile: PreviewFile | null;
  fileToDelete: any;
  fileToRename: any;
  setFileToDelete: (file: any) => void;
  setFileToRename: (file: any) => void;
  setPreviewFile: (file: PreviewFile | null) => void;
  handleDelete: (fileId: string) => Promise<void>;
  handleDownload: (objectName: string, fileName: string) => Promise<void>;
  handleRename: (fileId: string, newName: string, description?: string) => Promise<void>;
}

export function useFileManager(onRefresh: () => Promise<void>) {
  const t = useTranslations();
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [fileToRename, setFileToRename] = useState<FileToRename | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileToDelete | null>(null);

  const handleDownload = async (objectName: string, fileName: string) => {
    try {
      const encodedObjectName = encodeURIComponent(objectName);
      const response = await getDownloadUrl(encodedObjectName);
      const downloadUrl = response.data.url;
      console.log(fileName)
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t("files.downloadStart"));
    } catch (error) {
      console.error(error);
      toast.success(t("files.downloadError"));
    }
  };

  const handleRename = async (fileId: string, newName: string, description?: string) => {
    try {
      await updateFile(fileId, {
        name: newName,
        description: description || null,
      });
      await onRefresh();
      toast.success(t("files.updateSuccess"));
      setFileToRename(null);
    } catch (error) {
      console.error("Failed to update file:", error);
      toast.success(t("files.updateError"));
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      await onRefresh();
      toast.success(t("files.deleteSuccess"));
      setFileToDelete(null);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.success(t("files.deleteError"));
    }
  };

  return {
    previewFile,
    setPreviewFile,
    fileToRename,
    setFileToRename,
    fileToDelete,
    setFileToDelete,
    handleDownload,
    handleRename,
    handleDelete,
  };
}