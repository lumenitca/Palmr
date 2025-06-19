import { useState } from "react";
import { IconDownload, IconEye } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFileIcon } from "@/utils/file-icons";
import { formatFileSize } from "@/utils/format-file-size";
import { ShareFilesTableProps } from "../types";
import { ShareFilePreviewModal } from "./share-file-preview-modal";

export function ShareFilesTable({ files, onDownload }: ShareFilesTableProps) {
  const t = useTranslations();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; objectName: string; type?: string } | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const handlePreview = (file: { name: string; objectName: string }) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
                {t("filesTable.columns.name")}
              </TableHead>
              <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
                {t("filesTable.columns.size")}
              </TableHead>
              <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
                {t("filesTable.columns.createdAt")}
              </TableHead>
              <TableHead className="h-10 w-[110px] text-xs font-bold text-muted-foreground bg-muted/50 px-4">
                {t("filesTable.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const { icon: FileIcon, color } = getFileIcon(file.name);

              return (
                <TableRow key={file.id} className="hover:bg-muted/50 transition-colors border-0">
                  <TableCell className="h-12 px-4 border-0">
                    <div className="flex items-center gap-2">
                      <FileIcon className={`h-5 w-5 ${color}`} />
                      <span className="truncate max-w-[250px] font-medium">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="h-12 px-4">{formatFileSize(Number(file.size))}</TableCell>
                  <TableCell className="h-12 px-4">{formatDateTime(file.createdAt)}</TableCell>
                  <TableCell className="h-12 px-4">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => handlePreview({ name: file.name, objectName: file.objectName })}
                      >
                        <IconEye className="h-4 w-4" />
                        <span className="sr-only">{t("filesTable.actions.preview")}</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => onDownload(file.objectName, file.name)}
                      >
                        <IconDownload className="h-4 w-4" />
                        <span className="sr-only">{t("filesTable.actions.download")}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedFile && (
        <ShareFilePreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          file={selectedFile}
          onDownload={onDownload}
        />
      )}
    </div>
  );
}
