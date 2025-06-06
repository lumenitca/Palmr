"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconDownload, IconEdit, IconEye, IconFile, IconTrash, IconX } from "@tabler/icons-react";
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
  deleteReverseShareFile,
  downloadReverseShareFile,
  updateReverseShareFile,
} from "@/http/endpoints/reverse-shares";
import type { ReverseShareFile } from "@/http/endpoints/reverse-shares/types";
import { getFileIcon } from "@/utils/file-icons";
import { ReverseShare } from "../hooks/use-reverse-shares";
import { ReverseShareFilePreviewModal } from "./reverse-share-file-preview-modal";

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
  const [editingFile, setEditingFile] = useState<{ fileId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredFile, setHoveredFile] = useState<{ fileId: string; field: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFile && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingFile]);

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

  const getSenderDisplay = (file: ReverseShareFile) => {
    if (file.uploaderName) {
      return file.uploaderName;
    }
    if (file.uploaderEmail) {
      return file.uploaderEmail;
    }
    return t("reverseShares.modals.receivedFiles.anonymous");
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

  const getFileExtension = (fileName: string) => {
    const match = fileName.match(/\.[^/.]+$/);
    return match ? match[0] : "";
  };

  const getFileNameWithoutExtension = (fileName: string) => {
    return fileName.replace(/\.[^/.]+$/, "");
  };

  const startEdit = (fileId: string, field: string, currentValue: string) => {
    setEditingFile({ fileId, field });

    if (field === "name") {
      // Para edição do nome, remove a extensão
      const nameWithoutExtension = getFileNameWithoutExtension(currentValue);
      setEditValue(nameWithoutExtension);
    } else {
      setEditValue(currentValue);
    }
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

      // Usa a função específica de refresh se disponível, caso contrário usa a geral
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
      setEditingFile(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingFile(null);
    setEditValue("");
  };

  const handleDeleteFile = async (file: ReverseShareFile) => {
    try {
      await deleteReverseShareFile(file.id);

      // Usa a função específica de refresh se disponível, caso contrário usa a geral
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
            {/* Estatísticas */}
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

            {/* Lista de arquivos */}
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
                    {files.map((file) => {
                      const { icon: FileIcon, color } = getFileIcon(file.name);
                      return (
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileIcon className={`h-8 w-8 ${color} flex-shrink-0`} />
                              <div className="min-w-0 flex-1">
                                <div
                                  className="flex items-center gap-1"
                                  onMouseEnter={() => setHoveredFile({ fileId: file.id, field: "name" })}
                                  onMouseLeave={() => setHoveredFile(null)}
                                >
                                  {editingFile?.fileId === file.id && editingFile?.field === "name" ? (
                                    <div className="flex items-center gap-1 flex-1">
                                      <div className="flex items-center">
                                        <Input
                                          ref={inputRef}
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyDown={handleKeyDown}
                                          className="h-8 text-sm font-medium rounded-r-none border-r-0"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="h-8 px-2 bg-muted border border-l-0 rounded-r text-sm font-medium flex items-center text-muted-foreground">
                                          {getFileExtension(file.name)}
                                        </div>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-3 w-3 text-green-600 hover:text-green-700 flex-shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveEdit();
                                        }}
                                      >
                                        <IconCheck className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-red-600 hover:text-red-700 flex-shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          cancelEdit();
                                        }}
                                      >
                                        <IconX className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                      <div className="font-medium truncate max-w-[200px]" title={file.name}>
                                        <span className="text-foreground">
                                          {getFileNameWithoutExtension(file.name)}
                                        </span>
                                        <span className="text-muted-foreground">{getFileExtension(file.name)}</span>
                                      </div>
                                      <div className="w-6 flex justify-center flex-shrink-0">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={`h-6 w-6 text-muted-foreground hover:text-foreground hidden sm:block transition-opacity ${
                                            hoveredFile?.fileId === file.id && hoveredFile?.field === "name"
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startEdit(file.id, "name", file.name);
                                          }}
                                        >
                                          <IconEdit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {file.description && (
                                  <div
                                    className="flex items-center gap-1 mt-1"
                                    onMouseEnter={() => setHoveredFile({ fileId: file.id, field: "description" })}
                                    onMouseLeave={() => setHoveredFile(null)}
                                  >
                                    {editingFile?.fileId === file.id && editingFile?.field === "description" ? (
                                      <div className="flex items-center gap-1 flex-1">
                                        <Input
                                          ref={inputRef}
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyDown={handleKeyDown}
                                          className="h-6 text-xs"
                                          placeholder="Add description..."
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-5 w-5 text-green-600 hover:text-green-700 flex-shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            saveEdit();
                                          }}
                                        >
                                          <IconCheck className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-5 w-5 text-red-600 hover:text-red-700 flex-shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            cancelEdit();
                                          }}
                                        >
                                          <IconX className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 flex-1 min-w-0">
                                        <div
                                          className="text-sm text-muted-foreground truncate max-w-[200px]"
                                          title={file.description}
                                        >
                                          {file.description}
                                        </div>
                                        <div className="w-6 flex justify-center flex-shrink-0">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`h-5 w-5 text-muted-foreground hover:text-foreground hidden sm:block transition-opacity ${
                                              hoveredFile?.fileId === file.id && hoveredFile?.field === "description"
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEdit(file.id, "description", file.description || "");
                                            }}
                                          >
                                            <IconEdit className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
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
                              <span className="text-sm truncate" title={getSenderDisplay(file)}>
                                {getSenderDisplay(file)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(file.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(file)}
                                title={t("reverseShares.modals.receivedFiles.actions.preview")}
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(file)}
                                title={t("reverseShares.modals.receivedFiles.actions.download")}
                              >
                                <IconDownload className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFile(file)}
                                title="Excluir arquivo"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview */}
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
