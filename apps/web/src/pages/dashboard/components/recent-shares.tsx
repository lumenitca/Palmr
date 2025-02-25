import { RecentSharesProps } from "../types";
import { SharesTable } from "@/components/tables/shares-table";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";
import { FaShareAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function RecentShares({ shares, shareManager, onOpenCreateModal, onCopyLink }: RecentSharesProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaShareAlt className="text-xl text-gray-500" />
              {t("recentShares.title")}
            </h2>
            {shares.length >= 5 ? (
              <Button
                className="font-semibold"
                color="primary"
                size="sm"
                startContent={<FaShareAlt />}
                variant="flat"
                onPress={() => navigate("/shares")}
              >
                {t("recentShares.viewAll")}
              </Button>
            ) : shares.length === 0 ? null : (
              <Button
                className="font-semibold"
                color="primary"
                size="sm"
                startContent={<FaPlus />}
                variant="flat"
                onPress={onOpenCreateModal}
              >
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
      </CardBody>
    </Card>
  );
}

function EmptySharesState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <FaShareAlt className="text-4xl text-default-300" />
      <div className="text-center">
        <p className="text-default-500">{t("recentShares.noShares")}</p>
        <Button className="mt-4" color="primary" size="sm" startContent={<FaPlus />} onPress={onCreate}>
          {t("recentShares.createFirst")}
        </Button>
      </div>
    </div>
  );
}
