import { IconCloudUpload } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { HeaderProps } from "../types";

export function Header({ onUpload }: HeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{t("files.title")}</h2>
      <Button variant="default" onClick={onUpload}>
        <IconCloudUpload className="h-4 w-4" />
        {t("files.uploadFile")}
      </Button>
    </div>
  );
}
