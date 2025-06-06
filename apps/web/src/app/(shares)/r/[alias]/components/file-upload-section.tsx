"use client";

import { useCallback, useEffect, useState } from "react";
import { IconCheck, IconFile, IconMail, IconUpload, IconUser, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getPresignedUrlForUploadByAlias, registerFileUploadByAlias } from "@/http/endpoints";
import { formatFileSize } from "@/utils/format-file-size";
import { FILE_STATUS, UPLOAD_CONFIG, UPLOAD_PROGRESS } from "../constants";
import { FileUploadSectionProps, FileWithProgress } from "../types";

export function FileUploadSection({ reverseShare, password, alias, onUploadSuccess }: FileUploadSectionProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderEmail, setUploaderEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const t = useTranslations();

  const validateFileSize = (file: File): string | null => {
    if (!reverseShare.maxFileSize) return null;

    if (file.size > reverseShare.maxFileSize) {
      return t("reverseShares.upload.errors.fileTooLarge", {
        maxSize: formatFileSize(reverseShare.maxFileSize),
      });
    }
    return null;
  };

  const validateFileType = (file: File): string | null => {
    if (!reverseShare.allowedFileTypes) return null;

    const allowedTypes = reverseShare.allowedFileTypes.split(",").map((type) => type.trim().toLowerCase());

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension && !allowedTypes.includes(fileExtension)) {
      return t("reverseShares.upload.errors.fileTypeNotAllowed", {
        allowedTypes: reverseShare.allowedFileTypes,
      });
    }
    return null;
  };

  const validateFileCount = (): string | null => {
    if (!reverseShare.maxFiles) return null;

    const totalFiles = files.length + 1 + reverseShare.currentFileCount;
    if (totalFiles > reverseShare.maxFiles) {
      return t("reverseShares.upload.errors.maxFilesExceeded", {
        maxFiles: reverseShare.maxFiles,
      });
    }
    return null;
  };

  const validateFile = (file: File): string | null => {
    return validateFileSize(file) || validateFileType(file) || validateFileCount();
  };

  const createFileWithProgress = (file: File): FileWithProgress => ({
    file,
    progress: UPLOAD_PROGRESS.INITIAL,
    status: FILE_STATUS.PENDING,
  });

  const processAcceptedFiles = (acceptedFiles: File[]): FileWithProgress[] => {
    const validFiles: FileWithProgress[] = [];

    for (const file of acceptedFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        continue;
      }
      validFiles.push(createFileWithProgress(file));
    }

    return validFiles;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = processAcceptedFiles(acceptedFiles);
      setFiles((previousFiles) => [...previousFiles, ...newFiles]);
    },
    [files, reverseShare]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setFiles((previousFiles) => previousFiles.filter((_, i) => i !== index));
  };

  const updateFileStatus = (index: number, updates: Partial<FileWithProgress>) => {
    setFiles((previousFiles) => previousFiles.map((file, i) => (i === index ? { ...file, ...updates } : file)));
  };

  const generateObjectName = (fileName: string): string => {
    const timestamp = Date.now();
    return `reverse-shares/${alias}/${timestamp}-${fileName}`;
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop() || "";
  };

  const uploadFileToStorage = async (file: File, presignedUrl: string): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to storage");
    }
  };

  const registerUploadedFile = async (file: File, objectName: string): Promise<void> => {
    const fileExtension = getFileExtension(file.name);

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
  };

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number): Promise<void> => {
    const { file } = fileWithProgress;

    try {
      // Start upload
      updateFileStatus(index, {
        status: FILE_STATUS.UPLOADING,
        progress: UPLOAD_PROGRESS.INITIAL,
      });

      // Generate object name and get presigned URL
      const objectName = generateObjectName(file.name);
      const presignedResponse = await getPresignedUrlForUploadByAlias(
        alias,
        { objectName },
        password ? { password } : undefined
      );

      // Upload to storage
      await uploadFileToStorage(file, presignedResponse.data.url);

      // Update progress
      updateFileStatus(index, { progress: UPLOAD_PROGRESS.COMPLETE });

      // Register file upload
      await registerUploadedFile(file, objectName);

      // Mark as successful
      updateFileStatus(index, { status: FILE_STATUS.SUCCESS });
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.error || t("reverseShares.upload.errors.uploadFailed");

      updateFileStatus(index, {
        status: FILE_STATUS.ERROR,
        error: errorMessage,
      });

      toast.error(errorMessage);
    }
  };

  const validateUploadRequirements = (): boolean => {
    if (files.length === 0) {
      toast.error(t("reverseShares.upload.errors.selectAtLeastOneFile"));
      return false;
    }

    if (!uploaderName.trim() && !uploaderEmail.trim()) {
      toast.error(t("reverseShares.upload.errors.provideNameOrEmail"));
      return false;
    }

    return true;
  };

  const processAllUploads = async (): Promise<void> => {
    const uploadPromises = files.map((fileWithProgress, index) => uploadFile(fileWithProgress, index));

    await Promise.all(uploadPromises);

    const successfulUploads = files.filter((file) => file.status === FILE_STATUS.SUCCESS);
    if (successfulUploads.length > 0) {
      toast.success(
        t("reverseShares.upload.success.countMessage", {
          count: successfulUploads.length,
        })
      );
    }
  };

  const handleUpload = async () => {
    if (!validateUploadRequirements()) return;

    setIsUploading(true);

    try {
      await processAllUploads();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = files.length > 0 && (uploaderName.trim() || uploaderEmail.trim()) && !isUploading;
  const allFilesProcessed = files.every(
    (file) => file.status === FILE_STATUS.SUCCESS || file.status === FILE_STATUS.ERROR
  );
  const hasSuccessfulUploads = files.some((file) => file.status === FILE_STATUS.SUCCESS);

  // Call onUploadSuccess when all files are processed and there are successful uploads
  useEffect(() => {
    if (allFilesProcessed && hasSuccessfulUploads && files.length > 0) {
      onUploadSuccess?.();
    }
  }, [allFilesProcessed, hasSuccessfulUploads, files.length, onUploadSuccess]);

  const getDragActiveStyles = () => {
    if (isDragActive) {
      return "border-green-500 bg-blue-50 dark:bg-green-950/20";
    }
    return "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500";
  };

  const getDropzoneStyles = () => {
    const baseStyles = "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors";
    const dragStyles = getDragActiveStyles();
    const disabledStyles = isUploading ? "opacity-50 cursor-not-allowed" : "";

    return `${baseStyles} ${dragStyles} ${disabledStyles}`.trim();
  };

  const renderFileRestrictions = () => {
    // Calculate remaining files that can be uploaded
    const calculateRemainingFiles = (): number => {
      if (!reverseShare.maxFiles) return 0;
      const currentTotal = reverseShare.currentFileCount + files.length;
      const remaining = reverseShare.maxFiles - currentTotal;
      return Math.max(0, remaining);
    };

    const remainingFiles = calculateRemainingFiles();

    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {reverseShare.allowedFileTypes && (
          <>
            {t("reverseShares.upload.fileDropzone.acceptedTypes", { types: reverseShare.allowedFileTypes })}
            <br />
          </>
        )}
        {reverseShare.maxFileSize && (
          <>
            {t("reverseShares.upload.fileDropzone.maxFileSize", { size: formatFileSize(reverseShare.maxFileSize) })}
            <br />
          </>
        )}
        {reverseShare.maxFiles && (
          <>
            {t("reverseShares.upload.fileDropzone.remainingFiles", {
              remaining: remainingFiles,
              max: reverseShare.maxFiles,
            })}
          </>
        )}
      </p>
    );
  };

  const renderFileStatusBadge = (fileWithProgress: FileWithProgress) => {
    if (fileWithProgress.status === FILE_STATUS.SUCCESS) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <IconCheck className="h-3 w-3 mr-1" />
          {t("reverseShares.upload.fileList.statusUploaded")}
        </Badge>
      );
    }

    if (fileWithProgress.status === FILE_STATUS.ERROR) {
      return <Badge variant="destructive">{t("reverseShares.upload.fileList.statusError")}</Badge>;
    }

    return null;
  };

  const renderFileItem = (fileWithProgress: FileWithProgress, index: number) => (
    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <IconFile className="h-5 w-5 text-gray-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileWithProgress.file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(fileWithProgress.file.size)}</p>
        {fileWithProgress.status === FILE_STATUS.UPLOADING && (
          <Progress value={fileWithProgress.progress} className="mt-2 h-2" />
        )}
        {fileWithProgress.status === FILE_STATUS.ERROR && (
          <p className="text-xs text-red-500 mt-1">{fileWithProgress.error}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {renderFileStatusBadge(fileWithProgress)}
        {fileWithProgress.status === FILE_STATUS.PENDING && (
          <Button size="sm" variant="ghost" onClick={() => removeFile(index)} disabled={isUploading}>
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div {...getRootProps()} className={getDropzoneStyles()}>
        <input {...getInputProps()} />
        <IconUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragActive
            ? t("reverseShares.upload.fileDropzone.dragActive")
            : t("reverseShares.upload.fileDropzone.dragInactive")}
        </h3>
        {renderFileRestrictions()}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">{t("reverseShares.upload.fileList.title")}</h4>
          {files.map(renderFileItem)}
        </div>
      )}

      {/* User Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              <IconUser className="inline h-4 w-4" />
              {t("reverseShares.upload.form.nameLabel")}
            </Label>
            <Input
              id="name"
              placeholder={t("reverseShares.upload.form.namePlaceholder")}
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              <IconMail className="inline h-4 w-4" />
              {t("reverseShares.upload.form.emailLabel")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("reverseShares.upload.form.emailPlaceholder")}
              value={uploaderEmail}
              onChange={(e) => setUploaderEmail(e.target.value)}
              disabled={isUploading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("reverseShares.upload.form.descriptionLabel")}</Label>
          <Textarea
            id="description"
            placeholder={t("reverseShares.upload.form.descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            rows={UPLOAD_CONFIG.TEXTAREA_ROWS}
          />
        </div>
      </div>

      {/* Upload Button */}
      <Button onClick={handleUpload} disabled={!canUpload} className="w-full text-white" size="lg" variant="default">
        {isUploading
          ? t("reverseShares.upload.form.uploading")
          : t("reverseShares.upload.form.uploadButton", { count: files.length })}
      </Button>

      {/* Success Message */}
      {allFilesProcessed && hasSuccessfulUploads && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">{t("reverseShares.upload.success.title")}</p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
            {t("reverseShares.upload.success.description")}
          </p>
        </div>
      )}
    </div>
  );
}
