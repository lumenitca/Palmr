"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useFileManager } from "@/hooks/use-file-manager";
import { listFiles } from "@/http/endpoints";

export function useFiles() {
  const t = useTranslations();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [clearSelectionCallback, setClearSelectionCallback] = useState<(() => void) | undefined>();

  const loadFiles = async () => {
    try {
      const response = await listFiles();
      const allFiles = response.data.files || [];
      const sortedFiles = [...allFiles].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setFiles(sortedFiles);
    } catch (error) {
      toast.error(t("files.loadError"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fileManager = useFileManager(loadFiles, clearSelectionCallback);
  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    loadFiles();
  }, []);

  return {
    isLoading,
    files,
    searchQuery,
    modals: {
      isUploadModalOpen,
      onOpenUploadModal: () => setIsUploadModalOpen(true),
      onCloseUploadModal: () => setIsUploadModalOpen(false),
    },
    fileManager: {
      ...fileManager,
      setClearSelectionCallback,
    } as typeof fileManager & { setClearSelectionCallback: typeof setClearSelectionCallback },
    filteredFiles,
    handleSearch: setSearchQuery,
    loadFiles,
  };
}
