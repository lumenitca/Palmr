import type { RecentFilesProps } from "../types";
import { FilesTable } from "@/components/tables/files-table";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt, FaFolderOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function RecentFiles({ files, fileManager, onOpenUploadModal }: RecentFilesProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaCloudUploadAlt className="text-xl text-gray-500" />
            {t("recentFiles.title")}
          </h2>
          {files.length >= 5 ? (
            <Button
              className="font-semibold"
              color="primary"
              size="sm"
              startContent={<FaFolderOpen />}
              variant="flat"
              onPress={() => navigate("/files")}
            >
              {t("recentFiles.viewAll")}
            </Button>
          ) : files.length === 0 ? null : (
            <Button
              className="font-semibold"
              color="primary"
              size="sm"
              startContent={<FaCloudUploadAlt />}
              variant="flat"
              onPress={onOpenUploadModal}
            >
              {t("recentFiles.uploadFile")}
            </Button>
          )}
        </div>
        {files.length > 0 ? (
          <FilesTable
            files={files}
            onDelete={fileManager.setFileToDelete}
            onDownload={fileManager.handleDownload}
            onPreview={fileManager.setPreviewFile}
            onRename={fileManager.setFileToRename}
          />
        ) : (
          <EmptyFilesState onUpload={onOpenUploadModal} />
        )}
      </CardBody>
    </Card>
  );
}

function EmptyFilesState({ onUpload }: { onUpload: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-6 flex flex-col items-center gap-2">
      <FaFolderOpen className="text-4xl text-gray-500" />
      <p className="text-gray-500">{t("recentFiles.noFiles")}</p>
      <Button color="primary" size="sm" startContent={<FaCloudUploadAlt />} onPress={onUpload}>
        {t("recentFiles.uploadFile")}
      </Button>
    </div>
  );
}
