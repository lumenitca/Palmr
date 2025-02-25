import { ShareType } from "@/types/share";

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
  // State properties
  shareToDelete: ShareType | null;
  shareToEdit: ShareType | null;
  shareToManageFiles: ShareType | null;
  shareToManageRecipients: ShareType | null;

  // Actions (existing properties)
  setShareToDelete: (share: ShareType | null) => void;
  setShareToEdit: (share: ShareType | null) => void;
  setShareToManageFiles: (share: ShareType | null) => void;
  setShareToManageRecipients: (share: ShareType | null) => void;
  setShareToViewDetails: (share: ShareType | null) => void;
  setShareToGenerateLink: (share: ShareType | null) => void;
  handleDelete: (shareId: string) => Promise<void>;
  handleEdit: (shareId: string, data: any) => Promise<void>;
  handleManageFiles: (shareId: string, files: any[]) => Promise<void>;
  handleManageRecipients: (shareId: string, recipients: any[]) => Promise<void>;
  handleGenerateLink: (shareId: string, alias: string) => Promise<void>;
  handleNotifyRecipients: (share: ShareType) => Promise<void>;
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
