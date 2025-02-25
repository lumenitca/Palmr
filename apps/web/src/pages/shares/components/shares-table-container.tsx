import { SharesTableContainerProps } from "../types";
import { EmptySharesState } from "./empty-shares-state";
import { SharesTable } from "@/components/tables/shares-table";

export function SharesTableContainer({ shares, onCopyLink, onCreateShare, shareManager }: SharesTableContainerProps) {
  return shares.length > 0 ? (
    <SharesTable
      shares={shares}
      onCopyLink={onCopyLink}
      onDelete={shareManager.setShareToDelete}
      onEdit={shareManager.setShareToEdit}
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
