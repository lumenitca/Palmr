import type { StorageUsageProps } from "../types";
import { formatStorageSize } from "../utils/format-storage-size";
import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { useTranslation } from "react-i18next";
import { FaDatabase } from "react-icons/fa";

export function StorageUsage({ diskSpace }: StorageUsageProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaDatabase className="text-xl text-gray-500" />
            {t("storageUsage.title")}
          </h2>
          <div className="flex flex-col gap-2">
            <Progress
              aria-label={t("storageUsage.ariaLabel")}
              classNames={{
                indicator: "bg-primary",
              }}
              value={((diskSpace?.diskUsedGB || 0) / (diskSpace?.diskSizeGB || 1)) * 100}
            />
            <div className="flex justify-between text-sm">
              <span>{t("storageUsage.used", { size: formatStorageSize(diskSpace?.diskUsedGB || 0) })}</span>
              <span>{t("storageUsage.available", { size: formatStorageSize(diskSpace?.diskAvailableGB || 0) })}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
