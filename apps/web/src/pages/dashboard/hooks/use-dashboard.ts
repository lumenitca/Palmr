import { useFileManager } from "@/hooks/use-file-manager";
import { useShareManager } from "@/hooks/use-share-manager";
import { getDiskSpace, listFiles, listUserShares, getAllConfigs } from "@/http/endpoints";
import { ListUserShares200SharesItem } from "@/http/models/listUserShares200SharesItem";
import { useDisclosure } from "@heroui/modal";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDashboard() {
  const { t } = useTranslation();
  const [diskSpace, setDiskSpace] = useState<{
    diskSizeGB: number;
    diskUsedGB: number;
    diskAvailableGB: number;
    uploadAllowed: boolean;
  } | null>(null);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentShares, setRecentShares] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [smtpEnabled, setSmtpEnabled] = useState("false");

  const { isOpen: isUploadModalOpen, onOpen: onOpenUploadModal, onClose: onCloseUploadModal } = useDisclosure();
  const { isOpen: isCreateModalOpen, onOpen: onOpenCreateModal, onClose: onCloseCreateModal } = useDisclosure();

  const loadDashboardData = async () => {
    try {
      const [diskSpaceRes, filesRes, sharesRes, configsRes] = await Promise.all([
        getDiskSpace(),
        listFiles(),
        listUserShares(),
        getAllConfigs(),
      ]);

      setDiskSpace(diskSpaceRes.data);

      const allFiles = filesRes.data.files || [];
      const sortedFiles = [...allFiles].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRecentFiles(sortedFiles.slice(0, 5));

      const allShares = sharesRes.data.shares || [];
      const sortedShares = [...allShares].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRecentShares(sortedShares.slice(0, 5));

      const smtpConfig = configsRes.data.configs.find((config: any) => config.key === "smtpEnabled");

      setSmtpEnabled(smtpConfig?.value === "true" ? "true" : "false");
    } catch (error) {
      toast.error(t("dashboard.loadError"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fileManager = useFileManager(loadDashboardData);
  const shareManager = useShareManager(loadDashboardData);

  const handleCopyLink = (share: ListUserShares200SharesItem) => {
    if (!share.alias?.alias) return;
    const link = `${window.location.origin}/s/${share.alias.alias}`;

    navigator.clipboard.writeText(link);
    toast.success(t("dashboard.linkCopied"));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    isLoading,
    diskSpace,
    recentFiles,
    recentShares,
    modals: {
      isUploadModalOpen,
      isCreateModalOpen,
      onOpenUploadModal,
      onCloseUploadModal,
      onOpenCreateModal,
      onCloseCreateModal,
    },
    fileManager,
    shareManager,
    handleCopyLink,
    loadDashboardData,
    smtpEnabled,
  };
}
