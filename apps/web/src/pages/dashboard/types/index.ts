import { FileManagerHook } from "@/hooks/use-file-manager";
import { ShareManagerHook } from "@/hooks/use-share-manager";
import { ListUserShares200SharesItem } from "@/http/models/listUserShares200SharesItem";

export interface RecentFilesProps {
  files: any[];
  fileManager: FileManagerHook;
  isUploadModalOpen: boolean;
  onOpenUploadModal: () => void;
}

export interface RecentSharesProps {
  shares: ListUserShares200SharesItem[];
  shareManager: ShareManagerHook;
  isCreateModalOpen: boolean;
  onOpenCreateModal: () => void;
  onCopyLink: (share: ListUserShares200SharesItem) => void;
}

export interface StorageUsageProps {
  diskSpace: {
    diskSizeGB: number;
    diskUsedGB: number;
    diskAvailableGB: number;
    uploadAllowed: boolean;
  } | null;
}

export interface DashboardModalsProps {
  modals: {
    isUploadModalOpen: boolean;
    isCreateModalOpen: boolean;
    onCloseUploadModal: () => void;
    onCloseCreateModal: () => void;
  };
  fileManager: FileManagerHook;
  shareManager: ShareManagerHook;
  onSuccess: () => Promise<void>;
  smtpEnabled?: string;
}
