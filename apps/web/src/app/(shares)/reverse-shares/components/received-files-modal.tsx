"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconCheck,
  IconClipboardCopy,
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  copyReverseShareFileToUserFiles,
  deleteReverseShareFile,
  downloadReverseShareFile,
  updateReverseShareFile,
} from "@/http/endpoints/reverse-shares";
import type { ReverseShareFile } from "@/http/endpoints/reverse-shares/types";
import { getFileIcon } from "@/utils/file-icons";
import { ReverseShare } from "../hooks/use-reverse-shares";
import { ReverseShareFilePreviewModal } from "./reverse-share-file-preview-modal";

interface EditingState {
  fileId: string;
  field: string;
}

interface HoverState {
  fileId: string;
  field: string;
}

function useFileEdit() {
  const [editingFile, setEditingFile] = useState<EditingState | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFile && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingFile]);

  const startEdit = (fileId: string, field: string, currentValue: string) => {
    setEditingFile({ fileId, field });
    if (field === "name") {
      const nameWithoutExtension = getFileNameWithoutExtension(currentValue);
      setEditValue(nameWithoutExtension);
    } else {
      setEditValue(currentValue);
    }
  };

  const cancelEdit = () => {
    setEditingFile(null);
    setEditValue("");
  };

  return {
    editingFile,
    editValue,
    setEditValue,
    inputRef,
    startEdit,
    cancelEdit,
  };
}

const formatFileSize = (sizeString: string) => {
  const sizeInBytes = parseInt(sizeString);
  if (sizeInBytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
  return `${parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    return "Data inválida";
  }
};

const getFileExtension = (fileName: string) => {
  const match = fileName.match(/\.[^/.]+$/);
  return match ? match[0] : "";
};

const getFileNameWithoutExtension = (fileName: string) => {
  return fileName.replace(/\.[^/.]+$/, "");
};

const getSenderDisplay = (file: ReverseShareFile, t: any) => {
  if (file.uploaderName) return file.uploaderName;
  if (file.uploaderEmail) return file.uploaderEmail;
  return t("reverseShares.components.fileRow.anonymous");
};

const getSenderInitials = (file: ReverseShareFile) => {
  if (file.uploaderName) {
    return file.uploaderName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (file.uploaderEmail) {
    return file.uploaderEmail[0].toUpperCase();
  }
  return "?";
};

interface EditableFieldProps {
  file: ReverseShareFile;
  field: "name" | "description";
  isEditing: boolean;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isHovered: boolean;
  onStartEdit: (fileId: string, field: string, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function EditableField({
  file,
  field,
  isEditing,
  editValue,
  inputRef,
  isHovered,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onKeyDown,
}: EditableFieldProps) {
  const t = useTranslations();

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 flex-1">
        {field === "name" ? (
          <div className="flex items-center">
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              onKeyDown={onKeyDown}
              className="h-8 text-sm font-medium rounded-r-none border-r-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="h-8 px-2 bg-muted border border-l-0 rounded-r text-sm font-medium flex items-center text-muted-foreground">
              {getFileExtension(file.name)}
            </div>
          </div>
        ) : (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-6 text-xs"
            placeholder={t("reverseShares.components.fileRow.addDescription")}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 text-green-600 hover:text-green-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onSaveEdit();
          }}
          title={t("reverseShares.components.editField.saveChanges")}
        >
          <IconCheck className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 text-red-600 hover:text-red-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onCancelEdit();
          }}
          title={t("reverseShares.components.editField.cancelEdit")}
        >
          <IconX className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const currentValue = field === "name" ? file.name : file.description;
  const displayValue = field === "name" ? getFileNameWithoutExtension(file.name) : currentValue;

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <div
        className={`${field === "name" ? "font-medium" : "text-sm text-muted-foreground"} truncate max-w-[200px]`}
        title={currentValue || ""}
      >
        {field === "name" ? (
          <>
            <span className="text-foreground">{displayValue}</span>
            <span className="text-muted-foreground">{getFileExtension(file.name)}</span>
          </>
        ) : (
          displayValue || ""
        )}
      </div>
      <div className="w-6 flex justify-center flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className={`h-5 w-5 text-muted-foreground hover:text-foreground hidden sm:block transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(file.id, field, currentValue || "");
          }}
          title={t("reverseShares.components.fileActions.edit")}
        >
          <IconEdit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

interface FileRowProps {
  file: ReverseShareFile;
  editingFile: EditingState | null;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  hoveredFile: HoverState | null;
  copyingFile: string | null;
  onStartEdit: (fileId: string, field: string, currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSetHoveredFile: (hover: HoverState | null) => void;
  onPreview: (file: ReverseShareFile) => void;
  onDownload: (file: ReverseShareFile) => void;
  onDelete: (file: ReverseShareFile) => void;
  onCopy: (file: ReverseShareFile) => void;
}

function FileRow({
  file,
  editingFile,
  editValue,
  inputRef,
  hoveredFile,
  copyingFile,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onKeyDown,
  onSetHoveredFile,
  onPreview,
  onDownload,
  onDelete,
  onCopy,
}: FileRowProps) {
  const t = useTranslations();
  const { icon: FileIcon, color } = getFileIcon(file.name);

  return (
    <TableRow key={file.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <FileIcon className={`h-8 w-8 ${color} flex-shrink-0`} />
          <div className="min-w-0 flex-1">
            <div
              onMouseEnter={() => onSetHoveredFile({ fileId: file.id, field: "name" })}
              onMouseLeave={() => onSetHoveredFile(null)}
            >
              <EditableField
                file={file}
                field="name"
                isEditing={editingFile?.fileId === file.id && editingFile?.field === "name"}
                editValue={editValue}
                inputRef={inputRef}
                isHovered={hoveredFile?.fileId === file.id && hoveredFile?.field === "name"}
                onStartEdit={onStartEdit}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onEditValueChange={onEditValueChange}
                onKeyDown={onKeyDown}
              />
            </div>
            {file.description && (
              <div
                className="mt-1"
                onMouseEnter={() => onSetHoveredFile({ fileId: file.id, field: "description" })}
                onMouseLeave={() => onSetHoveredFile(null)}
              >
                <EditableField
                  file={file}
                  field="description"
                  isEditing={editingFile?.fileId === file.id && editingFile?.field === "description"}
                  editValue={editValue}
                  inputRef={inputRef}
                  isHovered={hoveredFile?.fileId === file.id && hoveredFile?.field === "description"}
                  onStartEdit={onStartEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onEditValueChange={onEditValueChange}
                  onKeyDown={onKeyDown}
                />
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{formatFileSize(file.size)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{getSenderInitials(file)}</AvatarFallback>
          </Avatar>
          <span className="text-sm truncate" title={getSenderDisplay(file, t)}>
            {getSenderDisplay(file, t)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(file.createdAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(file)}
            title={t("reverseShares.components.fileActions.preview")}
          >
            <IconEye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(file)}
            disabled={copyingFile === file.id}
            title={
              copyingFile === file.id
                ? t("reverseShares.components.fileActions.copying")
                : t("reverseShares.components.fileActions.copyToMyFiles")
            }
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            {copyingFile === file.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <IconClipboardCopy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(file)}
            title={t("reverseShares.components.fileActions.download")}
          >
            <IconDownload className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file)}
            title={t("reverseShares.components.fileActions.delete")}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ReceivedFilesModalProps {
  reverseShare: ReverseShare | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
  refreshReverseShare?: (id: string) => Promise<void>;
}

export function ReceivedFilesModal({
  reverseShare,
  isOpen,
  onClose,
  onRefresh,
  refreshReverseShare,
}: ReceivedFilesModalProps) {
  const t = useTranslations();
  const [previewFile, setPreviewFile] = useState<ReverseShareFile | null>(null);
  const [hoveredFile, setHoveredFile] = useState<HoverState | null>(null);
  const [copyingFile, setCopyingFile] = useState<string | null>(null);

  const { editingFile, editValue, setEditValue, inputRef, startEdit, cancelEdit } = useFileEdit();

  const getTotalSize = () => {
    if (!reverseShare?.files) return "0 B";
    const totalBytes = reverseShare.files.reduce((acc, file) => acc + parseInt(file.size), 0);
    return formatFileSize(totalBytes.toString());
  };

  const handleDownload = async (file: ReverseShareFile) => {
    try {
      const response = await downloadReverseShareFile(file.id);
      const downloadUrl = response.data.url;

      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error(`Download failed: ${fileResponse.status}`);
      }

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("reverseShares.modals.receivedFiles.downloadSuccess"));
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("reverseShares.modals.receivedFiles.downloadError"));
    }
  };

  const handlePreview = (file: ReverseShareFile) => {
    setPreviewFile(file);
  };

  const saveEdit = async () => {
    if (!editingFile) return;

    try {
      const updateData: { name?: string; description?: string | null } = {};

      if (editingFile.field === "name") {
        updateData.name = editValue.trim();
      } else if (editingFile.field === "description") {
        updateData.description = editValue.trim() || null;
      }

      await updateReverseShareFile(editingFile.fileId, updateData);

      if (refreshReverseShare && reverseShare) {
        await refreshReverseShare(reverseShare.id);
      } else if (onRefresh) {
        await onRefresh();
      }

      toast.success(t("reverseShares.modals.receivedFiles.editSuccess"));
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error(t("reverseShares.modals.receivedFiles.editError"));
    } finally {
      cancelEdit();
    }
  };

  const handleDeleteFile = async (file: ReverseShareFile) => {
    try {
      await deleteReverseShareFile(file.id);

      if (refreshReverseShare && reverseShare) {
        await refreshReverseShare(reverseShare.id);
      } else if (onRefresh) {
        await onRefresh();
      }

      toast.success("Arquivo excluído com sucesso");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Erro ao excluir arquivo");
    }
  };

  const handleCopyFile = async (file: ReverseShareFile) => {
    try {
      setCopyingFile(file.id);
      await copyReverseShareFileToUserFiles(file.id);
      toast.success(t("reverseShares.modals.receivedFiles.copySuccess"));
    } catch (error: any) {
      console.error("Error copying file:", error);

      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        if (errorMessage.includes("File size exceeds") || errorMessage.includes("Insufficient storage")) {
          toast.error(errorMessage);
        } else {
          toast.error(t("reverseShares.modals.receivedFiles.copyError"));
        }
      } else {
        toast.error(t("reverseShares.modals.receivedFiles.copyError"));
      }
    } finally {
      setCopyingFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  if (!reverseShare) return null;

  const files = reverseShare.files || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconFile size={20} />
              {t("reverseShares.modals.receivedFiles.title")}
            </DialogTitle>
            <DialogDescription>{t("reverseShares.modals.receivedFiles.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  {t("reverseShares.modals.receivedFiles.fileCount", { count: files.length })}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {t("reverseShares.modals.receivedFiles.totalSize", { size: getTotalSize() })}
                </Badge>
              </div>
            </div>

            <Separator />

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <IconFile className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">{t("reverseShares.modals.receivedFiles.noFiles")}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {t("reverseShares.modals.receivedFiles.noFilesDescription")}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("reverseShares.modals.receivedFiles.columns.file")}</TableHead>
                      <TableHead>{t("reverseShares.modals.receivedFiles.columns.size")}</TableHead>
                      <TableHead>{t("reverseShares.modals.receivedFiles.columns.sender")}</TableHead>
                      <TableHead>{t("reverseShares.modals.receivedFiles.columns.date")}</TableHead>
                      <TableHead className="text-right">
                        {t("reverseShares.modals.receivedFiles.columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <FileRow
                        key={file.id}
                        file={file}
                        editingFile={editingFile}
                        editValue={editValue}
                        inputRef={inputRef}
                        hoveredFile={hoveredFile}
                        copyingFile={copyingFile}
                        onStartEdit={startEdit}
                        onSaveEdit={saveEdit}
                        onCancelEdit={cancelEdit}
                        onEditValueChange={setEditValue}
                        onKeyDown={handleKeyDown}
                        onSetHoveredFile={setHoveredFile}
                        onPreview={handlePreview}
                        onDownload={handleDownload}
                        onDelete={handleDeleteFile}
                        onCopy={handleCopyFile}
                      />
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {previewFile && (
        <ReverseShareFilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          file={{
            id: previewFile.id,
            name: previewFile.name,
            objectName: previewFile.objectName,
            extension: previewFile.extension,
          }}
        />
      )}
    </>
  );
}
