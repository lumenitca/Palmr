import { IconCloudUpload, IconFolder } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { EmptyStateProps } from "../types";

export function EmptyState({ onUpload }: EmptyStateProps) {
  const t = useTranslations();

  return (
    <div className="text-center py-6 flex flex-col items-center gap-2">
      <IconFolder className="h-8 w-8 text-muted-foreground" />
      <p className="text-muted-foreground">{t("emptyState.noFiles")}</p>
      <Button variant="default" size="sm" onClick={onUpload}>
        <IconCloudUpload className="h-4 w-4" />
        {t("emptyState.uploadFile")}
      </Button>
    </div>
  );
}
