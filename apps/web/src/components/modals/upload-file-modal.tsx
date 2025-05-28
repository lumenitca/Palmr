"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconCloudUpload,
  IconFileText,
  IconFileTypePdf,
  IconFileTypography,
  IconLoader,
  IconPhoto,
} from "@tabler/icons-react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { checkFile, getPresignedUrl, registerFile } from "@/http/endpoints";
import { generateSafeFileName } from "@/utils/file-utils";
import getErrorData from "@/utils/getErrorData";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadFileModal({ isOpen, onClose, onSuccess }: UploadFileModalProps) {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);

        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <IconPhoto size={64} className="text-blue-500" />;
    if (fileType.includes("pdf")) return <IconFileTypePdf size={64} className="text-red-500" />;
    if (fileType.includes("word")) return <IconFileTypography size={64} className="text-blue-700" />;

    return <IconFileText size={64} className="text-gray-500" />;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const fileName = selectedFile.name;
      const extension = fileName.split(".").pop() || "";
      const safeObjectName = generateSafeFileName(fileName);

      try {
        await checkFile({
          name: fileName,
          objectName: "checkFile",
          size: selectedFile.size,
          extension: extension,
        });
      } catch (error) {
        console.error("File check failed:", error);
        const errorData = getErrorData(error);
        if (errorData.code === "fileSizeExceeded") {
          toast.error(t(`uploadFile.${errorData.code}`, { maxsizemb: t(`${errorData.details}`) }));
        } else if (errorData.code === "insufficientStorage") {
          toast.error(t(`uploadFile.${errorData.code}`, { availablespace: t(`${errorData.details}`) }));
        } else {
          toast.error(t(`uploadFile.${errorData.code}`));
        }
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const presignedResponse = await getPresignedUrl({
        filename: safeObjectName.replace(`.${extension}`, ""),
        extension: extension,
      });

      const { url, objectName } = presignedResponse.data;

      await axios.put(url, selectedFile, {
        headers: {
          "Content-Type": selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / (progressEvent.total || selectedFile.size)) * 100;
          setUploadProgress(Math.round(progress));
        },
      });

      await registerFile({
        name: fileName,
        objectName: objectName,
        size: selectedFile.size,
        extension: extension,
      });

      toast.success(t("uploadFile.success"));
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Upload failed:", error);
      const errorData = getErrorData(error);

      if (errorData.code && errorData.code !== "error") {
        toast.error(t(`uploadFile.${errorData.code}`));
      } else {
        toast.error(t("uploadFile.error"));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("uploadFile.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <input ref={fileInputRef} className="hidden" type="file" onChange={handleFileSelect} />

          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <IconCloudUpload size={32} className="text-gray-400" />
                <p className="text-gray-600">{t("uploadFile.selectFile")}</p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex flex-col items-center gap-4 mb-4">
                {previewUrl ? (
                  <img
                    alt={t("uploadFile.preview")}
                    className="max-w-full h-auto max-h-48 rounded-lg object-contain"
                    src={previewUrl}
                  />
                ) : (
                  getFileIcon(selectedFile.type)
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {selectedFile.name.length > 40 ? selectedFile.name.substring(0, 40) + "..." : selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500 text-center">
                    {t("uploadFile.uploadProgress")}: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {t("common.cancel")}
          </Button>
          <Button variant="default" disabled={!selectedFile || isUploading} onClick={handleUpload}>
            {isUploading ? (
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconCloudUpload className="mr-2 h-4 w-4" />
            )}
            {t("uploadFile.upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
