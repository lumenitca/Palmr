import { ShareFilesTableProps } from "../types";
import { getFileIcon } from "@/utils/file-icons";
import { formatFileSize } from "@/utils/format-file-size";
import { Button } from "@heroui/button";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { FaDownload, FaFolder } from "react-icons/fa";

export function ShareFilesTable({ files, onDownload }: ShareFilesTableProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FaFolder className="text-default-500" />
        <h2 className="text-lg font-semibold">{t("filesTable.title", "Files")}</h2>
      </div>
      <Table aria-label={t("filesTable.ariaLabel", "Files table")}>
        <TableHeader>
          <TableColumn>{t("filesTable.columns.name", "NAME")}</TableColumn>
          <TableColumn>{t("filesTable.columns.size", "SIZE")}</TableColumn>
          <TableColumn>{t("filesTable.columns.createdAt", "UPLOADED")}</TableColumn>
          <TableColumn className="w-[100px]">{t("filesTable.columns.actions", "ACTIONS")}</TableColumn>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFileIcon(file.name).icon({ className: "text-default-500" })}
                  <span>{file.name}</span>
                </div>
              </TableCell>
              <TableCell>{formatFileSize(Number(file.size))}</TableCell>
              <TableCell>{format(new Date(file.createdAt), "MM/dd/yyyy HH:mm")}</TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  aria-label={t("filesTable.actions.download", "Download")}
                  size="sm"
                  variant="light"
                  onPress={() => onDownload(file.objectName, file.name)}
                >
                  <FaDownload />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
