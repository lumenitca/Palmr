import { IconDotsVertical, IconDownload, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFileIcon } from "@/utils/file-icons";
import { formatFileSize } from "@/utils/format-file-size";

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
  const t = useTranslations();

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
    <div className="rounded-lg shadow-sm overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow className="border-b-0">
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4 rounded-tl-lg">
              {t("filesTable.columns.name")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("filesTable.columns.description")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("filesTable.columns.size")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("filesTable.columns.createdAt")}
            </TableHead>
            <TableHead className="h-10 text-xs font-bold text-muted-foreground bg-muted/50 px-4">
              {t("filesTable.columns.updatedAt")}
            </TableHead>
            <TableHead className="h-10 w-[70px] text-xs font-bold text-muted-foreground bg-muted/50 px-4 rounded-tr-lg">
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
                    <span className="truncate max-w-[250px] font-medium" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="h-12 px-4">{file.description || "-"}</TableCell>
                <TableCell className="h-12 px-4">{formatFileSize(file.size)}</TableCell>
                <TableCell className="h-12 px-4">{formatDateTime(file.createdAt)}</TableCell>
                <TableCell className="h-12 px-4">{formatDateTime(file.updatedAt || file.createdAt)}</TableCell>
                <TableCell className="h-12 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted cursor-pointer">
                        <IconDotsVertical className="h-4 w-4" />
                        <span className="sr-only">{t("filesTable.actions.menu")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onPreview(file)}>
                        <IconEye className="mr-2 h-4 w-4" />
                        {t("filesTable.actions.preview")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer py-2" onClick={() => onRename(file)}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        {t("filesTable.actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer py-2"
                        onClick={() => onDownload(file.objectName, file.name)}
                      >
                        <IconDownload className="mr-2 h-4 w-4" />
                        {t("filesTable.actions.download")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="cursor-pointer py-2 text-destructive focus:text-destructive"
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        {t("filesTable.actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
