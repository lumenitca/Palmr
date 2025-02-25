import { FileManagerHook } from "@/hooks/use-file-manager";

export interface EmptyStateProps {
  onUpload: () => void;
}

export interface HeaderProps {
  onUpload: () => void;
}

export interface FileListProps {
  files: any[];
  filteredFiles: any[];
  fileManager: FileManagerHook;
  searchQuery: string;
  onSearch: (query: string) => void;
  onUpload: () => void;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  totalFiles: number;
  filteredCount: number;
}

export interface FilesModalsProps {
  fileManager: FileManagerHook;
  modals: {
    isUploadModalOpen: boolean;
    onCloseUploadModal: () => void;
  };
  onSuccess: () => Promise<void>;
}
