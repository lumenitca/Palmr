import { getPresignedUrl, registerFile } from "@/http/endpoints";
import { generateSafeFileName } from "@/utils/file-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { IconCloudUpload, IconFile, IconFileText, IconPhoto, IconFileTypography, IconFileTypePdf } from "@tabler/icons-react";
import { toast } from "sonner";

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
      setIsUploading(true);
      setUploadProgress(0);

      const fileName = selectedFile.name;
      const extension = fileName.split(".").pop() || "";
      const safeObjectName = generateSafeFileName(fileName);

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
      toast.error(t("uploadFile.error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
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
                  {/* <IconFile size={24} className="text-gray-500" /> */}
                  <span className="font-medium">
                    {selectedFile.name.length > 40
                      ? selectedFile.name.substring(0, 40) + "..."
                      : selectedFile.name}
                    {' '} ({selectedFile.size / 1000} KB)
                  </span>
                </div>
              </div>
              {isUploading && (
                <Progress
                  value={uploadProgress}
                  className="w-full"
                />
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="default"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            {isUploading && (
              <IconCloudUpload className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("uploadFile.upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
