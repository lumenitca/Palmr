import { SharesTable } from "@/components/tables/shares-table";
import { SharesTableContainerProps } from "../types";
import { EmptySharesState } from "./empty-shares-state";

export function SharesTableContainer({ shares, onCopyLink, onCreateShare, shareManager }: SharesTableContainerProps) {
  return shares.length > 0 ? (
    <SharesTable
      shares={shares}
      onCopyLink={onCopyLink}
      onDelete={shareManager.setShareToDelete}
      onEdit={shareManager.setShareToEdit}
      onUpdateName={shareManager.handleUpdateName}
      onUpdateDescription={shareManager.handleUpdateDescription}
      onGenerateLink={shareManager.setShareToGenerateLink}
      onManageFiles={shareManager.setShareToManageFiles}
      onManageRecipients={shareManager.setShareToManageRecipients}
      onNotifyRecipients={shareManager.handleNotifyRecipients}
      onViewDetails={shareManager.setShareToViewDetails}
    />
  ) : (
    <EmptySharesState onCreateShare={onCreateShare} />
  );
}
