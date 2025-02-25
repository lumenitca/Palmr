import { useFileManager } from "@/hooks/use-file-manager";
import { listFiles } from "@/http/endpoints";
import { useDisclosure } from "@heroui/modal";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useFiles() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen: isUploadModalOpen, onOpen: onOpenUploadModal, onClose: onCloseUploadModal } = useDisclosure();

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

  const fileManager = useFileManager(loadFiles);
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
      onOpenUploadModal,
      onCloseUploadModal,
    },
    fileManager,
    filteredFiles,
    handleSearch: setSearchQuery,
    loadFiles,
  };
}
