import { ListUserShares200SharesItem } from "@/http/models";

export interface SharesSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateShare: () => void;
  totalShares: number;
  filteredCount: number;
}

export interface SharesTableContainerProps {
  shares: any[];
  onCopyLink: (share: any) => void;
  onCreateShare: () => void;
  shareManager: any;
}

export interface ShareManager {
  shareToDelete: ListUserShares200SharesItem | null;
  shareToEdit: ListUserShares200SharesItem | null;
  shareToManageFiles: ListUserShares200SharesItem | null;
  shareToManageRecipients: ListUserShares200SharesItem | null;

  setShareToDelete: (share: ListUserShares200SharesItem | null) => void;
  setShareToEdit: (share: ListUserShares200SharesItem | null) => void;
  setShareToManageFiles: (share: ListUserShares200SharesItem | null) => void;
  setShareToManageRecipients: (share: ListUserShares200SharesItem | null) => void;
  setShareToViewDetails: (share: ListUserShares200SharesItem | null) => void;
  setShareToGenerateLink: (share: ListUserShares200SharesItem | null) => void;
  handleDelete: (shareId: string) => Promise<void>;
  handleEdit: (shareId: string, data: any) => Promise<void>;
  handleManageFiles: (shareId: string, files: any[]) => Promise<void>;
  handleManageRecipients: (shareId: string, recipients: any[]) => Promise<void>;
  handleGenerateLink: (shareId: string, alias: string) => Promise<void>;
  handleNotifyRecipients: (share: ListUserShares200SharesItem) => Promise<void>;
}

export interface SharesModalsProps {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  shareToViewDetails: any;
  shareToGenerateLink: any;
  shareManager: any;
  onSuccess: () => void;
  onCloseViewDetails: () => void;
  onCloseGenerateLink: () => void;
  smtpEnabled?: string;
}
