"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconCalendarCheck,
  IconCalendarDue,
  IconCheck,
  IconCopy,
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconLink,
  IconLock,
  IconLockOpen,
  IconShield,
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteReverseShareFile, downloadReverseShareFile } from "@/http/endpoints/reverse-shares";
import { getFileIcon } from "@/utils/file-icons";
import { ReverseShare } from "../hooks/use-reverse-shares";
import { EditPasswordModal } from "./edit-password-modal";
import { FileSizeInput } from "./file-size-input";
import { FileTypesTagsInput } from "./file-types-tags-input";
import { GenerateAliasModal } from "./generate-alias-modal";
import { ReverseShareFilePreviewModal } from "./reverse-share-file-preview-modal";

interface ReverseShareDetailsModalProps {
  reverseShare: ReverseShare | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReverseShare?: (id: string, data: any) => Promise<void>;
  onCreateAlias?: (reverseShareId: string, alias: string) => Promise<void>;
  onCopyLink?: (reverseShare: ReverseShare) => void;
  onToggleActive?: (id: string, isActive: boolean) => Promise<void>;
  onUpdatePassword?: (id: string, data: { hasPassword: boolean; password?: string }) => Promise<void>;
  refreshTrigger?: number;
  onSuccess?: () => void;
}

interface ReverseShareFile {
  id: string;
  name: string;
  description: string | null;
  extension: string;
  size: string;
  objectName: string;
  uploaderEmail: string | null;
  uploaderName: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ReverseShareDetailsModal({
  reverseShare,
  isOpen,
  onClose,
  onUpdateReverseShare,
  onCreateAlias,
  onCopyLink,
  onToggleActive,
  onUpdatePassword,
  refreshTrigger,
  onSuccess,
}: ReverseShareDetailsModalProps) {
  const t = useTranslations();
  const [editingField, setEditingField] = useState<{ field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<ReverseShareFile | null>(null);

  // Estados para controlar os checkboxes independentemente dos valores
  const [noFilesLimit, setNoFilesLimit] = useState(false);
  const [noSizeLimit, setNoSizeLimit] = useState(false);
  const [allFileTypes, setAllFileTypes] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  useEffect(() => {
    setPendingChanges({});
    setEditingField(null);
    setEditValue("");
  }, [reverseShare?.id, reverseShare?.hasPassword, reverseShare?.isActive, reverseShare?.alias?.alias]);

  // Reage a mudanças nos dados principais para forçar re-render
  useEffect(() => {
    // Força re-render quando reverseShare muda
    if (reverseShare) {
      // Limpeza de estados quando dados são atualizados externamente
      setEditingField(null);
      setEditValue("");
    }
  }, [reverseShare]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não disponível";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatFileSize = (size: string | number | null) => {
    if (!size) return t("reverseShares.labels.noLimit");
    const sizeInBytes = typeof size === "string" ? parseInt(size) : size;
    if (sizeInBytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const k = 1024;
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
    return `${parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
  };

  const startEdit = (field: string, currentValue: any) => {
    setEditingField({ field });

    // Tratar valores null/undefined para os campos com checkbox "sem limite"
    if (field === "maxFiles") {
      const hasValue = currentValue && currentValue !== 0;
      setNoFilesLimit(!hasValue);
      setEditValue(hasValue ? currentValue.toString() : "0");
    } else if (field === "maxFileSize") {
      const hasValue = currentValue && currentValue !== 0;
      setNoSizeLimit(!hasValue);
      setEditValue(hasValue ? currentValue.toString() : "0");
    } else if (field === "allowedFileTypes") {
      const hasValue = currentValue && currentValue.trim() !== "";
      setAllFileTypes(!hasValue);
      setEditValue(currentValue || "");
    } else {
      setEditValue(currentValue?.toString() || "");
    }
  };

  const saveEdit = async () => {
    if (!editingField || !reverseShare || !onUpdateReverseShare) return;

    const { field } = editingField;
    let processedValue: string | number | null | boolean = editValue;

    // Processar valores específicos
    if (field === "maxFiles") {
      // Se for "0" ou vazio, significa sem limite (null)
      if (!editValue || editValue === "0") {
        processedValue = null;
      } else {
        processedValue = parseInt(editValue);
      }
    } else if (field === "maxFileSize") {
      // O FileSizeInput já retorna o valor em bytes como string, só precisamos converter para número
      // Se for "0" ou vazio, significa sem limite (null)
      if (!editValue || editValue === "0") {
        processedValue = null;
      } else {
        processedValue = parseInt(editValue);
      }
    } else if (field === "isActive") {
      processedValue = editValue === "true";
    } else if (field === "expiration") {
      processedValue = editValue ? new Date(editValue).toISOString() : null;
    } else if (field === "allowedFileTypes") {
      // Se for vazio, significa todos os tipos (null)
      processedValue = editValue && editValue.trim() !== "" ? editValue.trim() : null;
    }

    setPendingChanges((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    try {
      await onUpdateReverseShare(reverseShare.id, { [field]: processedValue });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to update:", error);
      setPendingChanges((prev) => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
    }

    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const getDisplayValue = (field: string) => {
    const pendingChange = pendingChanges[field];
    if (pendingChange !== undefined) {
      return pendingChange;
    }
    return (reverseShare as any)?.[field];
  };

  const handleCopyLink = () => {
    if (reverseShare && onCopyLink) {
      onCopyLink(reverseShare);
    }
  };

  const handleOpenLink = () => {
    if (reverseShare?.alias?.alias) {
      const link = `${window.location.origin}/r/${reverseShare.alias.alias}`;
      window.open(link, "_blank");
    }
  };

  const handleAliasCreated = async () => {
    setShowAliasModal(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleToggleActive = async () => {
    if (reverseShare && onToggleActive) {
      await onToggleActive(reverseShare.id, !reverseShare.isActive);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handlePasswordUpdated = async () => {
    setShowPasswordModal(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  // Funções para gerenciar arquivos
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

      toast.success("Arquivo baixado com sucesso");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Erro ao fazer download do arquivo");
    }
  };

  const handlePreview = (file: ReverseShareFile) => {
    setPreviewFile(file);
  };

  const handleDeleteFile = async (file: ReverseShareFile) => {
    try {
      await deleteReverseShareFile(file.id);
      toast.success("Arquivo excluído com sucesso");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Erro ao excluir arquivo");
    }
  };

  if (!reverseShare) return null;

  const reverseShareLink = reverseShare?.alias?.alias
    ? `${window.location.origin}/r/${reverseShare.alias.alias}`
    : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("reverseShares.modals.details.title")}</DialogTitle>
            <DialogDescription>{t("reverseShares.modals.details.description")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <p className="text-lg font-semibold text-green-600">{reverseShare.files?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("reverseShares.labels.filesReceived")}</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <p className="text-lg font-semibold text-blue-600">{reverseShare.maxFiles || "∞"}</p>
                  <p className="text-xs text-muted-foreground">{t("reverseShares.labels.fileLimit")}</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    {reverseShare.isActive ? (
                      <IconToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <IconToggleLeft className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reverseShare.isActive ? t("reverseShares.status.active") : t("reverseShares.status.inactive")}
                  </p>
                </div>
              </div>

              {/* Informações Básicas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <h3 className="text-base font-medium text-foreground">Informações Básicas</h3>
                </div>

                {/* Nome */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    {onUpdateReverseShare && editingField?.field !== "name" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit("name", getDisplayValue("name"))}
                      >
                        <IconEdit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {editingField?.field === "name" ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-8 flex-1 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-green-600 hover:text-green-700"
                        onClick={saveEdit}
                      >
                        <IconCheck className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={cancelEdit}
                      >
                        <IconX className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium block">
                      {getDisplayValue("name") || t("reverseShares.card.untitled")}
                    </span>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("reverseShares.labels.description")}
                    </label>
                    {onUpdateReverseShare && editingField?.field !== "description" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit("description", getDisplayValue("description"))}
                      >
                        <IconEdit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {editingField?.field === "description" ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-8 flex-1 text-sm"
                        placeholder={t("reverseShares.card.noDescription")}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-green-600 hover:text-green-700"
                        onClick={saveEdit}
                      >
                        <IconCheck className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={cancelEdit}
                      >
                        <IconX className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm block">
                      {getDisplayValue("description") || t("reverseShares.card.noDescription")}
                    </span>
                  )}
                </div>

                {/* Layout da Página */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("reverseShares.labels.pageLayout")}
                    </label>
                    {onUpdateReverseShare && editingField?.field !== "pageLayout" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit("pageLayout", getDisplayValue("pageLayout"))}
                      >
                        <IconEdit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {editingField?.field === "pageLayout" ? (
                    <div className="flex items-center gap-2">
                      <Select value={editValue} onValueChange={setEditValue}>
                        <SelectTrigger className="h-8 flex-1 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEFAULT">{t("reverseShares.labels.layoutOptions.default")}</SelectItem>
                          <SelectItem value="WETRANSFER">
                            {t("reverseShares.labels.layoutOptions.wetransfer")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-green-600 hover:text-green-700"
                        onClick={saveEdit}
                      >
                        <IconCheck className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={cancelEdit}
                      >
                        <IconX className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 border-purple-200">
                        {getDisplayValue("pageLayout") === "WETRANSFER"
                          ? t("reverseShares.labels.layoutOptions.wetransfer")
                          : t("reverseShares.labels.layoutOptions.default")}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Link de Compartilhamento */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <h3 className="text-base font-medium text-foreground">
                    {t("reverseShares.modals.details.linkSection")}
                  </h3>
                  {onCreateAlias && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowAliasModal(true)}
                      title={reverseShareLink ? "Editar Alias" : "Criar Alias"}
                    >
                      <IconEdit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {reverseShareLink ? (
                  <div className="flex gap-2">
                    <Input value={reverseShareLink} readOnly className="flex-1 bg-muted/30 text-sm h-8" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyLink}
                      title="Copiar Link"
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleOpenLink}
                      title="Abrir Link"
                    >
                      <IconLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("reverseShares.labels.noLinkCreated")}</p>
                  </div>
                )}
              </div>

              {/* Configurações e Limites */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <h3 className="text-base font-medium text-foreground">{t("reverseShares.labels.limits")}</h3>
                  </div>
                  <div className="space-y-2">
                    {/* Máximo de Arquivos */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("reverseShares.labels.maxFiles")}
                        </div>
                        {onUpdateReverseShare && editingField?.field !== "maxFiles" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit("maxFiles", getDisplayValue("maxFiles"))}
                          >
                            <IconEdit className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                      {editingField?.field === "maxFiles" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="no-files-limit"
                              checked={noFilesLimit}
                              onCheckedChange={(checked) => {
                                setNoFilesLimit(!!checked);
                                if (checked) {
                                  setEditValue("0");
                                }
                              }}
                            />
                            <label htmlFor="no-files-limit" className="text-xs text-muted-foreground cursor-pointer">
                              Sem limite de arquivos
                            </label>
                          </div>
                          {!noFilesLimit && (
                            <Input
                              ref={inputRef}
                              type="number"
                              min="1"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-7 flex-1 text-sm"
                              placeholder={t("reverseShares.labels.noLimit")}
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-green-600 hover:text-green-700"
                              onClick={saveEdit}
                            >
                              <IconCheck className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-red-600 hover:text-red-700"
                              onClick={cancelEdit}
                            >
                              <IconX className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {getDisplayValue("maxFiles") || t("reverseShares.labels.noLimit")}
                        </div>
                      )}
                    </div>

                    {/* Tamanho Máximo do Arquivo */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("reverseShares.labels.maxFileSize")}
                        </div>
                        {onUpdateReverseShare && editingField?.field !== "maxFileSize" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit("maxFileSize", getDisplayValue("maxFileSize"))}
                          >
                            <IconEdit className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                      {editingField?.field === "maxFileSize" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="no-size-limit"
                              checked={noSizeLimit}
                              onCheckedChange={(checked) => {
                                setNoSizeLimit(!!checked);
                                if (checked) {
                                  setEditValue("0");
                                }
                              }}
                            />
                            <label htmlFor="no-size-limit" className="text-xs text-muted-foreground cursor-pointer">
                              Sem limite de tamanho
                            </label>
                          </div>
                          {!noSizeLimit && (
                            <FileSizeInput value={editValue} onChange={(value) => setEditValue(value)} />
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-green-600 hover:text-green-700"
                              onClick={saveEdit}
                            >
                              <IconCheck className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-red-600 hover:text-red-700"
                              onClick={cancelEdit}
                            >
                              <IconX className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">{formatFileSize(getDisplayValue("maxFileSize"))}</div>
                      )}
                    </div>

                    {/* Tipos de Arquivo Permitidos */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("reverseShares.labels.allowedTypes")}
                        </div>
                        {onUpdateReverseShare && editingField?.field !== "allowedFileTypes" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit("allowedFileTypes", getDisplayValue("allowedFileTypes"))}
                          >
                            <IconEdit className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                      {editingField?.field === "allowedFileTypes" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="all-file-types"
                              checked={allFileTypes}
                              onCheckedChange={(checked) => {
                                setAllFileTypes(!!checked);
                                if (checked) {
                                  setEditValue("");
                                }
                              }}
                            />
                            <label htmlFor="all-file-types" className="text-xs text-muted-foreground cursor-pointer">
                              Todos os tipos de arquivo
                            </label>
                          </div>
                          {!allFileTypes && (
                            <FileTypesTagsInput
                              value={editValue ? editValue.split(",").filter(Boolean) : []}
                              onChange={(tags) => setEditValue(tags.join(","))}
                              placeholder="jpg png pdf docx"
                              className="h-7 text-sm"
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-green-600 hover:text-green-700"
                              onClick={saveEdit}
                            >
                              <IconCheck className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 text-red-600 hover:text-red-700"
                              onClick={cancelEdit}
                            >
                              <IconX className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {getDisplayValue("allowedFileTypes") || t("reverseShares.modals.details.allTypes")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <h3 className="text-base font-medium text-foreground">
                      {t("reverseShares.modals.details.securityAndStatus")}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("reverseShares.modals.details.protection")}
                        </div>
                        {onUpdatePassword && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPasswordModal(true)}
                            title="Editar Proteção por Senha"
                          >
                            <IconEdit className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                      <div className="mt-1">
                        {reverseShare.hasPassword ? (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-200">
                            <IconLock className="h-3 w-3 mr-1" />
                            {t("reverseShares.modals.details.protectedByPassword")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-200">
                            <IconLockOpen className="h-3 w-3 mr-1" />
                            {t("reverseShares.modals.details.publicAccess")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {t("reverseShares.modals.details.status")}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {reverseShare.isActive ? (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-200">
                            <IconToggleRight className="h-3 w-3 mr-1" />
                            {t("reverseShares.status.active")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-500/20 text-red-700 border-red-200">
                            <IconToggleLeft className="h-3 w-3 mr-1" />
                            {t("reverseShares.status.inactive")}
                          </Badge>
                        )}
                        {onToggleActive && (
                          <Button size="sm" variant="outline" onClick={handleToggleActive} className="h-6 text-xs">
                            {reverseShare.isActive
                              ? t("reverseShares.modals.details.deactivate")
                              : t("reverseShares.modals.details.activate")}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expiração Editável */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {t("reverseShares.modals.details.expiration")}
                        </div>
                        {onUpdateReverseShare && editingField?.field !== "expiration" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const currentExpiration = getDisplayValue("expiration");
                              const formattedValue = currentExpiration
                                ? new Date(currentExpiration).toISOString().slice(0, 16)
                                : "";
                              startEdit("expiration", formattedValue);
                            }}
                          >
                            <IconEdit className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                      {editingField?.field === "expiration" ? (
                        <div className="flex items-center gap-2">
                          <Input
                            ref={inputRef}
                            type="datetime-local"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-7 flex-1 text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-green-600 hover:text-green-700"
                            onClick={saveEdit}
                          >
                            <IconCheck className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-red-600 hover:text-red-700"
                            onClick={cancelEdit}
                          >
                            <IconX className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {getDisplayValue("expiration") ? formatDate(getDisplayValue("expiration")) : "Nunca"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground border-b pb-2">
                  {t("reverseShares.modals.details.dates")}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {t("reverseShares.modals.details.createdAt")}
                    </div>
                    <div>{formatDate(reverseShare.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {t("reverseShares.modals.details.updatedAt")}
                    </div>
                    <div>{formatDate(reverseShare.updatedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Arquivos Recebidos */}
              {reverseShare.files && reverseShare.files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-foreground border-b pb-2">
                    {t("reverseShares.modals.details.files")} ({reverseShare.files.length})
                  </h3>
                  <div className="border rounded-lg bg-muted/10 p-2">
                    <div className="grid gap-1 max-h-40 overflow-y-auto">
                      {reverseShare.files.map((file: ReverseShareFile) => {
                        const { icon: FileIcon, color } = getFileIcon(file.name);
                        return (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-2 bg-background rounded border mr-2 group"
                          >
                            <FileIcon className={`h-3.5 w-3.5 ${color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate max-w-[200px]" title={file.name}>
                                {file.name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatFileSize(file.size)}</span>
                                {file.uploaderEmail && (
                                  <>
                                    <span>•</span>
                                    <span title={file.uploaderEmail}>{file.uploaderName || file.uploaderEmail}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{formatDate(file.createdAt)}</span>
                              </div>
                            </div>
                            {/* Ações dos arquivos */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handlePreview(file)}
                                title="Visualizar arquivo"
                              >
                                <IconEye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDownload(file)}
                                title="Baixar arquivo"
                              >
                                <IconDownload className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteFile(file)}
                                title="Excluir arquivo"
                              >
                                <IconTrash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAliasModal && onCreateAlias && (
        <GenerateAliasModal
          reverseShare={reverseShare}
          isOpen={showAliasModal}
          onClose={() => setShowAliasModal(false)}
          onCreateAlias={onCreateAlias}
          onCopyLink={onCopyLink || (() => {})}
        />
      )}

      {showPasswordModal && onUpdatePassword && (
        <EditPasswordModal
          reverseShare={reverseShare}
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onUpdatePassword={async (id: string, data: { hasPassword: boolean; password?: string }) => {
            await onUpdatePassword(id, data);
            handlePasswordUpdated();
          }}
        />
      )}

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
