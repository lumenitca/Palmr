import { QuickAccessCards } from "./components/quick-access-cards";
import { RecentFiles } from "./components/recent-files";
import { RecentShares } from "./components/recent-shares";
import { StorageUsage } from "./components/storage-usage";
import { useDashboard } from "./hooks/use-dashboard";
import { DashboardModals } from "./modals/dashboard-modals";
import { FileManagerLayout } from "@/components/layout/file-manager-layout";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";
import { TbLayoutDashboardFilled } from "react-icons/tb";

export function DashboardPage() {
  const { t } = useTranslation();

  usePageTitle(t("dashboard.pageTitle"));

  const {
    isLoading,
    diskSpace,
    recentFiles,
    recentShares,
    modals,
    fileManager,
    shareManager,
    handleCopyLink,
    loadDashboardData,
  } = useDashboard();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <FileManagerLayout
      breadcrumbLabel={t("dashboard.breadcrumb")}
      icon={<TbLayoutDashboardFilled className="text-xl" />}
      showBreadcrumb={false}
      title={t("dashboard.pageTitle")}
    >
      <StorageUsage diskSpace={diskSpace} />
      <QuickAccessCards />

      <div className="flex flex-col gap-6">
        <RecentFiles
          fileManager={fileManager}
          files={recentFiles}
          isUploadModalOpen={modals.isUploadModalOpen}
          onOpenUploadModal={modals.onOpenUploadModal}
        />

        <RecentShares
          isCreateModalOpen={modals.isCreateModalOpen}
          shareManager={shareManager}
          shares={recentShares}
          onCopyLink={handleCopyLink}
          onOpenCreateModal={modals.onOpenCreateModal}
        />
      </div>

      <DashboardModals
        fileManager={fileManager}
        modals={modals}
        shareManager={shareManager}
        onSuccess={loadDashboardData}
      />
    </FileManagerLayout>
  );
}
