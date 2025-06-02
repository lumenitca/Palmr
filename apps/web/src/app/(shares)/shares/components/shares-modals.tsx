import { useState } from "react";
import { useTranslations } from "next-intl";

import { CreateShareModal } from "@/components/modals/create-share-modal";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";
import { GenerateShareLinkModal } from "@/components/modals/generate-share-link-modal";
import { ShareActionsModals } from "@/components/modals/share-actions-modals";
import { ShareDetailsModal } from "@/components/modals/share-details-modal";
import { SharesModalsProps } from "../types";

export function SharesModals({
  isCreateModalOpen,
  onCloseCreateModal,
  shareToViewDetails,
  shareToGenerateLink,
  shareManager,
  fileManager,
  onSuccess,
  onCloseViewDetails,
  onCloseGenerateLink,
}: SharesModalsProps) {
  const t = useTranslations();
  const [shareDetailsRefresh, setShareDetailsRefresh] = useState(0);

  const handleShareSuccess = () => {
    setShareDetailsRefresh((prev) => prev + 1);
    onSuccess();
  };

  return (
    <>
      <CreateShareModal isOpen={isCreateModalOpen} onClose={onCloseCreateModal} onSuccess={handleShareSuccess} />

      <ShareActionsModals
        shareToDelete={shareManager.shareToDelete}
        shareToEdit={shareManager.shareToEdit}
        shareToManageFiles={shareManager.shareToManageFiles}
        shareToManageRecipients={shareManager.shareToManageRecipients}
        onCloseDelete={() => shareManager.setShareToDelete(null)}
        onCloseEdit={() => shareManager.setShareToEdit(null)}
        onCloseManageFiles={() => shareManager.setShareToManageFiles(null)}
        onCloseManageRecipients={() => shareManager.setShareToManageRecipients(null)}
        onDelete={shareManager.handleDelete}
        onEdit={shareManager.handleEdit}
        onManageFiles={shareManager.handleManageFiles}
        onManageRecipients={shareManager.handleManageRecipients}
        onSuccess={handleShareSuccess}
        onEditFile={fileManager.handleRename}
      />

      <DeleteConfirmationModal
        isOpen={!!shareManager.sharesToDelete}
        onClose={() => shareManager.setSharesToDelete(null)}
        onConfirm={shareManager.handleDeleteBulk}
        title={t("shareActions.bulkDeleteTitle")}
        description={t("shareActions.bulkDeleteConfirmation", { count: shareManager.sharesToDelete?.length || 0 })}
        files={shareManager.sharesToDelete?.map((share: any) => share.name) || []}
        itemType="shares"
      />

      <ShareDetailsModal
        shareId={shareToViewDetails?.id || null}
        onClose={onCloseViewDetails}
        onUpdateName={shareManager.handleUpdateName}
        onUpdateDescription={shareManager.handleUpdateDescription}
        onGenerateLink={shareManager.handleGenerateLink}
        onManageFiles={shareManager.setShareToManageFiles}
        refreshTrigger={shareDetailsRefresh}
        onSuccess={handleShareSuccess}
      />

      <GenerateShareLinkModal
        share={shareToGenerateLink}
        shareId={shareToGenerateLink?.id || null}
        onClose={onCloseGenerateLink}
        onGenerate={shareManager.handleGenerateLink}
        onSuccess={handleShareSuccess}
      />
    </>
  );
}
