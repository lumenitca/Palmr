"use client";

import { useCallback, useState } from "react";
import { IconCheck, IconFile, IconMail, IconUpload, IconUser, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getPresignedUrlForUploadByAlias, registerFileUploadByAlias } from "@/http/endpoints";
import type { GetReverseShareForUploadResult } from "@/http/endpoints/reverse-shares/types";
import { formatFileSize } from "@/utils/format-file-size";

type ReverseShareInfo = GetReverseShareForUploadResult["data"]["reverseShare"];

interface FileUploadSectionProps {
  reverseShare: ReverseShareInfo;
  password: string;
  alias: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function FileUploadSection({ reverseShare, password, alias }: FileUploadSectionProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderEmail, setUploaderEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (reverseShare.maxFileSize) {
      const maxSize = reverseShare.maxFileSize;
      if (file.size > maxSize) {
        return `Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`;
      }
    }

    // Check file type
    if (reverseShare.allowedFileTypes) {
      const allowedTypes = reverseShare.allowedFileTypes.split(",").map((type) => type.trim().toLowerCase());
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedTypes.includes(fileExtension)) {
        return `Tipo de arquivo não permitido. Tipos aceitos: ${reverseShare.allowedFileTypes}`;
      }
    }

    // Check file count
    if (reverseShare.maxFiles) {
      const totalFiles = files.length + 1 + reverseShare.currentFileCount;
      if (totalFiles > reverseShare.maxFiles) {
        return `Máximo de ${reverseShare.maxFiles} arquivos permitidos`;
      }
    }

    return null;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithProgress[] = [];

      for (const file of acceptedFiles) {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          continue;
        }

        newFiles.push({
          file,
          progress: 0,
          status: "pending",
        });
      }

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files, reverseShare]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number): Promise<void> => {
    const { file } = fileWithProgress;

    try {
      // Update status to uploading
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const, progress: 0 } : f)));

      // Generate object name for the file
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "";
      const objectName = `reverse-shares/${alias}/${timestamp}-${file.name}`;

      // Get presigned URL
      const presignedResponse = await getPresignedUrlForUploadByAlias(
        alias,
        { objectName },
        password ? { password } : undefined
      );

      const { url } = presignedResponse.data;

      // Upload file to presigned URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // Update progress to 100%
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress: 100 } : f)));

      // Register file upload
      await registerFileUploadByAlias(
        alias,
        {
          name: file.name,
          description: description || undefined,
          extension: fileExtension,
          size: file.size,
          objectName,
          uploaderEmail: uploaderEmail || undefined,
          uploaderName: uploaderName || undefined,
        },
        password ? { password } : undefined
      );

      // Update status to success
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "success" as const } : f)));
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.error || "Erro ao enviar arquivo";

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error" as const, error: errorMessage } : f))
      );

      toast.error(errorMessage);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Selecione pelo menos um arquivo");
      return;
    }

    if (!uploaderName && !uploaderEmail) {
      toast.error("Informe seu nome ou e-mail");
      return;
    }

    setIsUploading(true);

    try {
      // Upload all files
      const uploadPromises = files.map((fileWithProgress, index) => uploadFile(fileWithProgress, index));

      await Promise.all(uploadPromises);

      const successCount = files.filter((f) => f.status === "success").length;
      if (successCount > 0) {
        toast.success(`${successCount} arquivo(s) enviado(s) com sucesso!`);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = files.length > 0 && (uploaderName.trim() || uploaderEmail.trim()) && !isUploading;
  const allFilesProcessed = files.every((f) => f.status === "success" || f.status === "error");

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-green-500 bg-blue-50 dark:bg-green-950/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <IconUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragActive ? "Solte os arquivos aqui" : "Arraste arquivos aqui ou clique para selecionar"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {reverseShare.allowedFileTypes && (
            <>
              Tipos aceitos: {reverseShare.allowedFileTypes}
              <br />
            </>
          )}
          {reverseShare.maxFileSize && (
            <>
              Tamanho máximo: {formatFileSize(reverseShare.maxFileSize)}
              <br />
            </>
          )}
          {reverseShare.maxFiles && <>Máximo de {reverseShare.maxFiles} arquivos</>}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Arquivos selecionados:</h4>
          {files.map((fileWithProgress, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <IconFile className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fileWithProgress.file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(fileWithProgress.file.size)}</p>
                {fileWithProgress.status === "uploading" && (
                  <Progress value={fileWithProgress.progress} className="mt-2 h-2" />
                )}
                {fileWithProgress.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">{fileWithProgress.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fileWithProgress.status === "success" && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    <IconCheck className="h-3 w-3 mr-1" />
                    Enviado
                  </Badge>
                )}
                {fileWithProgress.status === "error" && <Badge variant="destructive">Erro</Badge>}
                {fileWithProgress.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => removeFile(index)} disabled={isUploading}>
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              <IconUser className="inline h-4 w-4" />
              Nome
            </Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              <IconMail className="inline h-4 w-4" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={uploaderEmail}
              onChange={(e) => setUploaderEmail(e.target.value)}
              disabled={isUploading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Adicione uma descrição aos arquivos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            rows={3}
          />
        </div>
      </div>

      {/* Upload Button */}
      <Button onClick={handleUpload} disabled={!canUpload} className="w-full text-white" size="lg" variant="default">
        {isUploading ? "Enviando..." : `Enviar ${files.length} arquivo(s)`}
      </Button>

      {/* Success Message */}
      {allFilesProcessed && files.some((f) => f.status === "success") && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">Arquivos enviados com sucesso! 🎉</p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
            Você pode fechar esta página ou enviar mais arquivos.
          </p>
        </div>
      )}
    </div>
  );
}
