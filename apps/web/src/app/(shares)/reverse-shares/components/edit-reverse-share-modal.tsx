"use client";

import { useEffect } from "react";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconEye,
  IconFile,
  IconFiles,
  IconLock,
  IconSettings,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { UpdateReverseShareBody } from "@/http/endpoints/reverse-shares/types";
import { ReverseShare } from "../hooks/use-reverse-shares";
import { FileSizeInput } from "./file-size-input";
import { FileTypesTagsInput } from "./file-types-tags-input";

interface EditReverseShareFormData {
  name: string;
  description?: string;
  expiration?: string;
  maxFiles?: string;
  maxFileSize?: string;
  allowedFileTypes?: string;
  pageLayout?: "DEFAULT" | "WETRANSFER";
  hasExpiration: boolean;
  hasFileLimits: boolean;
  hasPassword: boolean;
  password?: string;
  isActive: boolean;
  noFilesLimit: boolean;
  noSizeLimit: boolean;
  allFileTypes: boolean;
}

interface EditReverseShareModalProps {
  reverseShare: ReverseShare | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReverseShare: (data: UpdateReverseShareBody) => Promise<any>;
  isUpdating: boolean;
}

export function EditReverseShareModal({
  reverseShare,
  isOpen,
  onClose,
  onUpdateReverseShare,
  isUpdating,
}: EditReverseShareModalProps) {
  const t = useTranslations();

  const form = useForm<EditReverseShareFormData>({
    defaultValues: {
      name: "",
      description: "",
      expiration: "",
      maxFiles: "",
      maxFileSize: "",
      allowedFileTypes: "",
      pageLayout: "DEFAULT",
      hasExpiration: false,
      hasFileLimits: false,
      hasPassword: false,
      password: "",
      isActive: true,
      noFilesLimit: true,
      noSizeLimit: true,
      allFileTypes: true,
    },
  });

  // Atualiza o formulário quando o reverseShare muda
  useEffect(() => {
    if (reverseShare) {
      // Para campos com limite "sem limite", usar "0" quando null/undefined
      const maxFilesValue = reverseShare.maxFiles ? reverseShare.maxFiles.toString() : "0";
      const maxFileSizeValue = reverseShare.maxFileSize ? reverseShare.maxFileSize.toString() : "0";
      const allowedFileTypesValue = reverseShare.allowedFileTypes || "";

      form.reset({
        name: reverseShare.name || "",
        description: reverseShare.description || "",
        expiration: reverseShare.expiration ? new Date(reverseShare.expiration).toISOString().slice(0, 16) : "",
        maxFiles: maxFilesValue,
        maxFileSize: maxFileSizeValue,
        allowedFileTypes: allowedFileTypesValue,
        pageLayout: (reverseShare.pageLayout as "DEFAULT" | "WETRANSFER") || "DEFAULT",
        hasExpiration: false,
        hasFileLimits: false,
        hasPassword: false,
        password: "",
        isActive: reverseShare.isActive,
        noFilesLimit: !reverseShare.maxFiles,
        noSizeLimit: !reverseShare.maxFileSize,
        allFileTypes: !reverseShare.allowedFileTypes,
      });
    }
  }, [reverseShare, form]);

  const hasExpiration = form.watch("hasExpiration");
  const hasFileLimits = form.watch("hasFileLimits");
  const noFilesLimit = form.watch("noFilesLimit");
  const noSizeLimit = form.watch("noSizeLimit");
  const allFileTypes = form.watch("allFileTypes");

  const onSubmit = async (data: EditReverseShareFormData) => {
    if (!reverseShare) return;

    try {
      const payload: UpdateReverseShareBody = {
        id: reverseShare.id,
        name: data.name,
        pageLayout: data.pageLayout || "DEFAULT",
        isActive: data.isActive,
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.description?.trim()) {
        payload.description = data.description.trim();
      }

      if (data.hasExpiration && data.expiration) {
        payload.expiration = new Date(data.expiration).toISOString();
      } else if (!data.hasExpiration) {
        payload.expiration = undefined;
      }

      // Sempre incluir os campos de limite para garantir que sejam atualizados
      if (data.hasFileLimits) {
        if (data.maxFiles && data.maxFiles !== "0" && parseInt(data.maxFiles) > 0) {
          payload.maxFiles = parseInt(data.maxFiles);
        } else {
          payload.maxFiles = null;
        }
        if (data.maxFileSize && data.maxFileSize !== "0" && parseInt(data.maxFileSize) > 0) {
          payload.maxFileSize = parseInt(data.maxFileSize);
        } else {
          payload.maxFileSize = null;
        }
      } else {
        payload.maxFiles = null;
        payload.maxFileSize = null;
      }

      // Para allowedFileTypes, null significa todos os tipos permitidos
      if (data.allowedFileTypes?.trim()) {
        payload.allowedFileTypes = data.allowedFileTypes.trim();
      } else {
        payload.allowedFileTypes = null;
      }

      if (data.hasPassword && data.password) {
        payload.password = data.password;
      } else if (!data.hasPassword) {
        payload.password = undefined;
      }

      await onUpdateReverseShare(payload);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[650px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit size={20} />
            {t("reverseShares.modals.edit.title")}
          </DialogTitle>
          <DialogDescription>{t("reverseShares.modals.edit.description")}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)] py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: t("validation.required") }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("reverseShares.form.name.label")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("reverseShares.form.name.placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("reverseShares.form.description.label")}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t("reverseShares.form.description.placeholder")} rows={3} {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t("reverseShares.form.description.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pageLayout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <IconSettings size={16} />
                        {t("reverseShares.form.pageLayout.label")}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("reverseShares.form.pageLayout.placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DEFAULT">{t("reverseShares.form.pageLayout.options.default")}</SelectItem>
                          <SelectItem value="WETRANSFER">
                            {t("reverseShares.form.pageLayout.options.wetransfer")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {t("reverseShares.form.pageLayout.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t("reverseShares.form.status.label")}</FormLabel>
                        <FormDescription className="text-xs">
                          {t("reverseShares.form.status.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Expiração */}
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <Label className="flex items-center gap-2">
                    <IconCalendar size={16} />
                    {t("reverseShares.form.expiration.configure")}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const newValue = !hasExpiration;
                      form.setValue("hasExpiration", newValue);
                      if (!newValue) {
                        form.setValue("expiration", "");
                      }
                    }}
                  >
                    {hasExpiration ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  </Button>
                </div>

                {hasExpiration && (
                  <FormField
                    control={form.control}
                    name="expiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reverseShares.form.expiration.label")}</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t("reverseShares.form.expiration.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Limites de Arquivos */}
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <Label className="flex items-center gap-2">
                    <IconFile size={16} />
                    {t("reverseShares.form.fileLimits.configure")}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const newValue = !hasFileLimits;
                      form.setValue("hasFileLimits", newValue);
                      if (!newValue) {
                        form.setValue("maxFiles", "0");
                        form.setValue("maxFileSize", "0");
                        form.setValue("allowedFileTypes", "");
                      }
                    }}
                  >
                    {hasFileLimits ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  </Button>
                </div>

                {hasFileLimits && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maxFiles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconEye size={16} />
                            {t("reverseShares.form.maxFiles.label")}
                          </FormLabel>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="no-files-limit-edit"
                                checked={noFilesLimit}
                                onCheckedChange={(checked) => {
                                  form.setValue("noFilesLimit", !!checked);
                                  if (checked) {
                                    field.onChange("0");
                                  }
                                }}
                              />
                              <label
                                htmlFor="no-files-limit-edit"
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                Sem limite de arquivos
                              </label>
                            </div>
                            {!noFilesLimit && (
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder={t("reverseShares.form.maxFiles.placeholder")}
                                  {...field}
                                />
                              </FormControl>
                            )}
                          </div>
                          <FormDescription className="text-xs">
                            {t("reverseShares.form.maxFiles.description")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxFileSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconFiles size={16} />
                            {t("reverseShares.form.maxFileSize.label")}
                          </FormLabel>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="no-size-limit-edit"
                                checked={noSizeLimit}
                                onCheckedChange={(checked) => {
                                  form.setValue("noSizeLimit", !!checked);
                                  if (checked) {
                                    field.onChange("0");
                                  }
                                }}
                              />
                              <label
                                htmlFor="no-size-limit-edit"
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                Sem limite de tamanho
                              </label>
                            </div>
                            {!noSizeLimit && (
                              <FormControl>
                                <FileSizeInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder={t("reverseShares.form.maxFileSize.placeholder")}
                                />
                              </FormControl>
                            )}
                          </div>
                          <FormDescription className="text-xs">
                            {t("reverseShares.form.maxFileSize.description")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowedFileTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reverseShares.form.allowedFileTypes.label")}</FormLabel>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="all-file-types-edit"
                                checked={allFileTypes}
                                onCheckedChange={(checked) => {
                                  form.setValue("allFileTypes", !!checked);
                                  if (checked) {
                                    field.onChange("");
                                  }
                                }}
                              />
                              <label
                                htmlFor="all-file-types-edit"
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                Todos os tipos de arquivo
                              </label>
                            </div>
                            {!allFileTypes && (
                              <FormControl>
                                <FileTypesTagsInput
                                  value={field.value ? field.value.split(",").filter(Boolean) : []}
                                  onChange={(tags) => field.onChange(tags.join(","))}
                                  placeholder="jpg png pdf docx"
                                />
                              </FormControl>
                            )}
                          </div>
                          <FormDescription className="text-xs">
                            Digite as extensões sem ponto, separadas por espaço, vírgula, traço ou pipe
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Senha */}
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <Label className="flex items-center gap-2">
                    <IconLock size={16} />
                    {t("reverseShares.form.password.configurePassword")}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const newValue = !form.watch("hasPassword");
                      form.setValue("hasPassword", newValue);
                      if (!newValue) {
                        form.setValue("password", "");
                      }
                    }}
                  >
                    {form.watch("hasPassword") ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  </Button>
                </div>

                {form.watch("hasPassword") && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reverseShares.modals.password.password")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("reverseShares.form.password.passwordPlaceholder")} {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t("reverseShares.form.password.passwordHelp")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isUpdating}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">⠋</div>
                      {t("reverseShares.modals.edit.updating")}
                    </div>
                  ) : (
                    t("reverseShares.modals.edit.saveChanges")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
