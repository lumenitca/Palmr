import { getFileIcon } from "@/utils/file-icons";
import { formatFileSize } from "@/utils/format-file-size";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useTranslation } from "react-i18next";
import { FaEye, FaEdit, FaDownload, FaTrash, FaEllipsisV } from "react-icons/fa";

interface File {
  id: string;
  name: string;
  description?: string;
  size: number;
  objectName: string;
  createdAt: string;
  updatedAt: string;
}

interface FilesTableProps {
  files: File[];
  onPreview: (file: File) => void;
  onRename: (file: File) => void;
  onDownload: (objectName: string, fileName: string) => void;
  onDelete: (file: File) => void;
}

export function FilesTable({ files, onPreview, onRename, onDownload, onDelete }: FilesTableProps) {
  const { t } = useTranslation();

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

  return (
    <Table aria-label={t("filesTable.ariaLabel")}>
      <TableHeader>
        <TableColumn>{t("filesTable.columns.name")}</TableColumn>
        <TableColumn>{t("filesTable.columns.description")}</TableColumn>
        <TableColumn>{t("filesTable.columns.size")}</TableColumn>
        <TableColumn>{t("filesTable.columns.createdAt")}</TableColumn>
        <TableColumn>{t("filesTable.columns.updatedAt")}</TableColumn>
        <TableColumn className="w-[70px]">{t("filesTable.columns.actions")}</TableColumn>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const { icon: FileIcon, color } = getFileIcon(file.name);

          return (
            <TableRow key={file.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileIcon className={`text-lg ${color}`} />
                  <span className="truncate max-w-[250px]" title={file.name}>
                    {file.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>{file.description || "-"}</TableCell>
              <TableCell>{formatFileSize(file.size)}</TableCell>
              <TableCell>{formatDateTime(file.createdAt)}</TableCell>
              <TableCell>{formatDateTime(file.updatedAt || file.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button isIconOnly aria-label={t("filesTable.actions.menu")} variant="light">
                      <FaEllipsisV />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem key="preview" startContent={<FaEye />} onPress={() => onPreview(file)}>
                      {t("filesTable.actions.preview")}
                    </DropdownItem>
                    <DropdownItem key="edit" startContent={<FaEdit />} onPress={() => onRename(file)}>
                      {t("filesTable.actions.edit")}
                    </DropdownItem>
                    <DropdownItem
                      key="download"
                      startContent={<FaDownload />}
                      onPress={() => onDownload(file.objectName, file.name)}
                    >
                      {t("filesTable.actions.download")}
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<FaTrash />}
                      onPress={() => onDelete(file)}
                    >
                      {t("filesTable.actions.delete")}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
