import { useEffect, useState } from "react";
import { IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { FilesGrid } from "@/components/tables/files-grid";
import { FilesTable } from "@/components/tables/files-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface File {
  id: string;
  name: string;
  description?: string;
  size: number;
  objectName: string;
  createdAt: string;
  updatedAt: string;
}

interface FilesViewManagerProps {
  files: File[];
  searchQuery: string;
  onSearch: (query: string) => void;
  onPreview: (file: File) => void;
  onRename: (file: File) => void;
  onUpdateName: (fileId: string, newName: string) => void;
  onUpdateDescription: (fileId: string, newDescription: string) => void;
  onDownload: (objectName: string, fileName: string) => void;
  onShare: (file: File) => void;
  onDelete: (file: File) => void;
  onBulkDelete?: (files: File[]) => void;
  onBulkShare?: (files: File[]) => void;
  onBulkDownload?: (files: File[]) => void;
  setClearSelectionCallback?: (callback: () => void) => void;
}

export type ViewMode = "table" | "grid";

const VIEW_MODE_KEY = "files-view-mode";

export function FilesViewManager({
  files,
  searchQuery,
  onSearch,
  onPreview,
  onRename,
  onUpdateName,
  onUpdateDescription,
  onDownload,
  onShare,
  onDelete,
  onBulkDelete,
  onBulkShare,
  onBulkDownload,
  setClearSelectionCallback,
}: FilesViewManagerProps) {
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "table";
    }
    return "table";
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const commonProps = {
    files,
    onPreview,
    onRename,
    onUpdateName,
    onUpdateDescription,
    onDownload,
    onShare,
    onDelete,
    onBulkDelete,
    onBulkShare,
    onBulkDownload,
    setClearSelectionCallback,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="search"
          placeholder={t("searchBar.placeholder")}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => setViewMode("table")}
          >
            <IconTable className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => setViewMode("grid")}
          >
            <IconLayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "table" ? <FilesTable {...commonProps} /> : <FilesGrid {...commonProps} />}
    </div>
  );
}
