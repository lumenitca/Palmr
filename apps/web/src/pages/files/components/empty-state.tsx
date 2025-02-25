import type { EmptyStateProps } from "../types";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt, FaFolderOpen } from "react-icons/fa";

export function EmptyState({ onUpload }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-6 flex flex-col items-center gap-2">
      <FaFolderOpen className="text-4xl text-gray-500" />
      <p className="text-gray-500">{t("emptyState.noFiles")}</p>
      <Button color="primary" size="sm" startContent={<FaCloudUploadAlt />} onPress={onUpload}>
        {t("emptyState.uploadFile")}
      </Button>
    </div>
  );
}
