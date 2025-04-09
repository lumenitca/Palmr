import { useRouter } from "next/navigation";
import { IconPlus, IconShare } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { SharesTable } from "@/components/tables/shares-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecentSharesProps } from "../types";
import { EmptySharesState } from "./empty-shares-state";

export function RecentShares({ shares, shareManager, onOpenCreateModal, onCopyLink }: RecentSharesProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <IconShare className="text-xl text-gray-500" />
              {t("recentShares.title")}
            </h2>
            {shares.length >= 5 ? (
              <Button
                className="font-semibold text-sm cursor-pointer"
                variant="outline"
                size="default"
                onClick={() => router.push("/shares")}
              >
                <IconShare className="h-4 w-4" />
                {t("recentShares.viewAll")}
              </Button>
            ) : shares.length === 0 ? null : (
              <Button
                className="font-semibold text-sm cursor-pointer"
                variant="outline"
                size="default"
                onClick={onOpenCreateModal}
              >
                <IconPlus className="h-4 w-4" />
                {t("recentShares.createShare")}
              </Button>
            )}
          </div>

          {shares.length > 0 ? (
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
            <EmptySharesState onCreate={onOpenCreateModal} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
