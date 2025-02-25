import { SharesHeader } from "./components/shares-header";
import { SharesModals } from "./components/shares-modals";
import { SharesSearch } from "./components/shares-search";
import { SharesTableContainer } from "./components/shares-table-container";
import { useShares } from "./hooks/use-shares";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { Navbar } from "@/components/layout/navbar";
import { usePageTitle } from "@/hooks/use-page-title";
import { useShareManager } from "@/hooks/use-share-manager";
import { Card, CardBody } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { useTranslation } from "react-i18next";

export function SharesPage() {
  const { t } = useTranslation();

  usePageTitle(t("shares.pageTitle"));

  const {
    shares,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredShares,
    shareToViewDetails,
    shareToGenerateLink,
    handleCopyLink,
    loadShares,
    setShareToViewDetails,
    setShareToGenerateLink,
    smtpEnabled,
  } = useShares();

  const { isOpen: isCreateModalOpen, onOpen: onOpenCreateModal, onClose: onCloseCreateModal } = useDisclosure();
  const shareManager = useShareManager(loadShares);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-8">
          <SharesHeader />

          <Card>
            <CardBody className="p-6">
              <div className="flex flex-col gap-6">
                <SharesSearch
                  filteredCount={filteredShares.length}
                  searchQuery={searchQuery}
                  totalShares={shares.length}
                  onCreateShare={onOpenCreateModal}
                  onSearchChange={setSearchQuery}
                />

                <SharesTableContainer
                  shareManager={shareManager}
                  shares={filteredShares}
                  onCopyLink={handleCopyLink}
                  onCreateShare={onOpenCreateModal}
                />
              </div>
            </CardBody>
          </Card>

          <SharesModals
            isCreateModalOpen={isCreateModalOpen}
            shareManager={shareManager}
            shareToGenerateLink={shareToGenerateLink}
            shareToViewDetails={shareToViewDetails}
            smtpEnabled={smtpEnabled}
            onCloseCreateModal={onCloseCreateModal}
            onCloseGenerateLink={() => setShareToGenerateLink(null)}
            onCloseViewDetails={() => setShareToViewDetails(null)}
            onSuccess={loadShares}
          />
        </div>
      </div>
    </div>
  );
}
