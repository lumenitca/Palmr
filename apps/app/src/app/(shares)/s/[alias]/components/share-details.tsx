import { IconShare } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { ShareDetailsProps } from "../types";
import { ShareFilesTable } from "./files-table";

export function ShareDetails({ share, onDownload }: ShareDetailsProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <IconShare className="w-6 h-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">{share.name || t("share.details.untitled")}</h1>
            </div>
            {share.description && <p className="text-muted-foreground">{share.description}</p>}
            <div className="flex gap-4 text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
