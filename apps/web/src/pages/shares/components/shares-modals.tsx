import { SharesModalsProps } from "../types";
import { CreateShareModal } from "@/components/modals/create-share-modal";
import { GenerateShareLinkModal } from "@/components/modals/generate-share-link-modal";
import { ShareActionsModals } from "@/components/modals/share-actions-modals";
import { ShareDetailsModal } from "@/components/modals/share-details-modal";

export function SharesModals({
  isCreateModalOpen,
  onCloseCreateModal,
  shareToViewDetails,
  shareToGenerateLink,
  shareManager,
  onSuccess,
  onCloseViewDetails,
  onCloseGenerateLink,
}: SharesModalsProps) {
  return (
    <>
      <CreateShareModal isOpen={isCreateModalOpen} onClose={onCloseCreateModal} onSuccess={onSuccess} />

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
        onSuccess={onSuccess}
      />

      <ShareDetailsModal shareId={shareToViewDetails?.id || null} onClose={onCloseViewDetails} />

      <GenerateShareLinkModal
        share={shareToGenerateLink}
        shareId={shareToGenerateLink?.id || null}
        onClose={onCloseGenerateLink}
        onGenerate={shareManager.handleGenerateLink}
        onSuccess={onSuccess}
      />
    </>
  );
}
