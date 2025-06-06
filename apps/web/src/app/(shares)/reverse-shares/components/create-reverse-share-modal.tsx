"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconFile,
  IconFiles,
  IconLock,
  IconSettings,
  IconUpload,
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
import type { CreateReverseShareBody } from "@/http/endpoints/reverse-shares/types";
import { FileSizeInput } from "./file-size-input";
import { FileTypesTagsInput } from "./file-types-tags-input";

interface CreateReverseShareFormData {
  name: string;
  description?: string;
  expiration?: string;
  maxFiles?: string;
  maxFileSize?: string;
  allowedFileTypes?: string;
  password?: string;
  pageLayout?: "DEFAULT" | "WETRANSFER";
  isPasswordProtected: boolean;
  hasExpiration: boolean;
  hasFileLimits: boolean;
  noFilesLimit: boolean;
  noSizeLimit: boolean;
  allFileTypes: boolean;
}

interface CreateReverseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReverseShare: (data: CreateReverseShareBody) => Promise<any>;
  isCreating: boolean;
}

export function CreateReverseShareModal({
  isOpen,
  onClose,
  onCreateReverseShare,
  isCreating,
}: CreateReverseShareModalProps) {
  const t = useTranslations();

  const form = useForm<CreateReverseShareFormData>({
    defaultValues: {
      name: "",
      description: "",
      expiration: "",
      maxFiles: "",
      maxFileSize: "",
      allowedFileTypes: "",
      password: "",
      pageLayout: "DEFAULT",
      isPasswordProtected: false,
      hasExpiration: false,
      hasFileLimits: false,
      noFilesLimit: true,
      noSizeLimit: true,
      allFileTypes: true,
    },
  });

  const isPasswordProtected = form.watch("isPasswordProtected");
  const hasExpiration = form.watch("hasExpiration");
  const hasFileLimits = form.watch("hasFileLimits");
  const noFilesLimit = form.watch("noFilesLimit");
  const noSizeLimit = form.watch("noSizeLimit");
  const allFileTypes = form.watch("allFileTypes");

  const onSubmit = async (data: CreateReverseShareFormData) => {
    try {
      const payload: CreateReverseShareBody = {
        name: data.name,
        pageLayout: data.pageLayout || "DEFAULT",
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.description?.trim()) {
        payload.description = data.description.trim();
      }

      if (data.hasExpiration && data.expiration) {
        payload.expiration = new Date(data.expiration).toISOString();
      }

      if (data.isPasswordProtected && data.password?.trim()) {
        payload.password = data.password.trim();
      }

      if (data.hasFileLimits) {
        if (data.maxFiles && data.maxFiles !== "0" && parseInt(data.maxFiles) > 0) {
          payload.maxFiles = parseInt(data.maxFiles);
        }
        if (data.maxFileSize && data.maxFileSize !== "0" && parseInt(data.maxFileSize) > 0) {
          payload.maxFileSize = parseInt(data.maxFileSize);
        }
      }

      if (data.allowedFileTypes?.trim()) {
        payload.allowedFileTypes = data.allowedFileTypes.trim();
      }

      await onCreateReverseShare(payload);
      form.reset();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[650px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUpload size={20} />
            {t("reverseShares.modals.create.title")}
          </DialogTitle>
          <DialogDescription>{t("reverseShares.modals.create.description")}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)] py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Nome é obrigatório" }}
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
                      <FormDescription>{t("reverseShares.form.description.description")}</FormDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormDescription>{t("reverseShares.form.pageLayout.description")}</FormDescription>
                      <FormMessage />
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
                    {t("reverseShares.labels.configureExpiration")}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => form.setValue("hasExpiration", !hasExpiration)}
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
                        <FormDescription>{t("reverseShares.form.expiration.description")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Proteção por Senha */}
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <Label className="flex items-center gap-2">
                    <IconLock size={16} />
                    {t("reverseShares.labels.protectWithPassword")}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const newValue = !isPasswordProtected;
                      form.setValue("isPasswordProtected", newValue);
                      if (!newValue) {
                        form.setValue("password", "");
                      }
                    }}
                  >
                    {isPasswordProtected ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  </Button>
                </div>

                {isPasswordProtected && (
                  <FormField
                    control={form.control}
                    name="password"
                    rules={{
                      required: isPasswordProtected ? t("validation.passwordRequired") : false,
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("reverseShares.form.password.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("reverseShares.form.password.placeholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>{t("reverseShares.form.password.description")}</FormDescription>
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
                    {t("reverseShares.labels.configureLimits")}
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
                                id="no-files-limit-create"
                                checked={noFilesLimit}
                                onCheckedChange={(checked) => {
                                  form.setValue("noFilesLimit", !!checked);
                                  if (checked) {
                                    field.onChange("0");
                                  }
                                }}
                              />
                              <label
                                htmlFor="no-files-limit-create"
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
                                id="no-size-limit-create"
                                checked={noSizeLimit}
                                onCheckedChange={(checked) => {
                                  form.setValue("noSizeLimit", !!checked);
                                  if (checked) {
                                    field.onChange("0");
                                  }
                                }}
                              />
                              <label
                                htmlFor="no-size-limit-create"
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
                          <FormDescription>{t("reverseShares.form.maxFileSize.description")}</FormDescription>
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
                                id="all-file-types-create"
                                checked={allFileTypes}
                                onCheckedChange={(checked) => {
                                  form.setValue("allFileTypes", !!checked);
                                  if (checked) {
                                    field.onChange("");
                                  }
                                }}
                              />
                              <label
                                htmlFor="all-file-types-create"
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

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">⠋</div>
                      {t("common.creating")}
                    </div>
                  ) : (
                    t("reverseShares.form.submit")
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
