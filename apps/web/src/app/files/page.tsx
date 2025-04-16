"use client";

import { IconFolderOpen } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FileManagerLayout } from "@/components/layout/file-manager-layout";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { FileList } from "./components/file-list";
import { useFiles } from "./hooks/use-files";
import { FilesModals } from "./modals/files-modals";

export default function FilesPage() {
  const t = useTranslations();

  const { isLoading, files, searchQuery, modals, fileManager, filteredFiles, handleSearch, loadFiles } = useFiles();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <FileManagerLayout
        breadcrumbLabel={t("files.breadcrumb")}
        icon={<IconFolderOpen size={20} />}
        title={t("files.pageTitle")}
      >
        <FileList
          fileManager={fileManager}
          files={files}
          filteredFiles={filteredFiles}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onUpload={modals.onOpenUploadModal}
        />

        <FilesModals fileManager={fileManager} modals={modals} onSuccess={loadFiles} />
      </FileManagerLayout>
    </ProtectedRoute>
  );
}
