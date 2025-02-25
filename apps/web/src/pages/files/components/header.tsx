import type { HeaderProps } from "../types";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt } from "react-icons/fa";

export function Header({ onUpload }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{t("files.title")}</h2>
      <Button color="primary" startContent={<FaCloudUploadAlt />} onPress={onUpload}>
        {t("files.uploadFile")}
      </Button>
    </div>
  );
}
