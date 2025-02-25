import { ShareDetailsProps } from "../types";
import { ShareFilesTable } from "./files-table";
import { Card, CardBody } from "@heroui/card";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { FaShare } from "react-icons/fa";

export function ShareDetails({ share, onDownload }: ShareDetailsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FaShare className="text-xl text-default-500" />
              <h1 className="text-2xl font-semibold">{share.name || t("share.details.untitled")}</h1>
            </div>
            {share.description && <p className="text-default-500">{share.description}</p>}
            <div className="flex gap-4 text-sm text-default-500">
              <span>
                {t("share.details.created", {
                  date: format(new Date(share.createdAt), "MM/dd/yyyy HH:mm"),
                })}
              </span>
              {share.expiration && (
                <span>
                  {t("share.details.expires", {
                    date: format(new Date(share.expiration), "MM/dd/yyyy HH:mm"),
                  })}
                </span>
              )}
            </div>
          </div>

          <ShareFilesTable files={share.files} onDownload={onDownload} />
        </div>
      </CardBody>
    </Card>
  );
}
