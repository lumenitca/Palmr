import { useRouter } from "next/navigation";
import { IconCloudUpload, IconFolderOpen } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { FilesTable } from "@/components/tables/files-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RecentFilesProps } from "../types";
import { EmptyFilesState } from "./empty-file-state";

export function RecentFiles({ files, fileManager, onOpenUploadModal }: RecentFilesProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCloudUpload className="text-xl text-gray-500" />
            {t("recentFiles.title")}
          </h2>
          {files.length >= 5 ? (
            <Button
              className="font-semibold text-sm cursor-pointer"
              variant="outline"
              size="default"
              onClick={() => router.push("/files")}
            >
              <IconFolderOpen className="h-4 w-4" />
              {t("recentFiles.viewAll")}
            </Button>
          ) : files.length === 0 ? null : (
            <Button
              className="font-semibold text-sm cursor-pointer"
              variant="outline"
              size="default"
              onClick={onOpenUploadModal}
            >
              <IconCloudUpload className="h-4 w-4" />
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
            onShare={fileManager.setFileToShare}
            onUpdateName={(fileId, newName) => {
              const file = files.find((f) => f.id === fileId);
              if (file) {
                fileManager.handleRename(fileId, newName, file.description);
              }
            }}
            onUpdateDescription={(fileId, newDescription) => {
              const file = files.find((f) => f.id === fileId);
              if (file) {
                fileManager.handleRename(fileId, file.name, newDescription);
              }
            }}
          />
        ) : (
          <EmptyFilesState onUpload={onOpenUploadModal} />
        )}
      </CardContent>
    </Card>
  );
}
