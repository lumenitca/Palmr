import { FileList } from "./components/file-list";
import { useFiles } from "./hooks/use-files";
import { FilesModals } from "./modals/files-modals";
import { FileManagerLayout } from "@/components/layout/file-manager-layout";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { FaFolderOpen } from "react-icons/fa";

export function FilesPage() {
  const { t } = useTranslation();

  usePageTitle(t("files.pageTitle"));

  const { isLoading, files, searchQuery, modals, fileManager, filteredFiles, handleSearch, loadFiles } = useFiles();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <FileManagerLayout
      breadcrumbLabel={t("files.breadcrumb")}
      icon={<FaFolderOpen className="text-xl" />}
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
  );
}
