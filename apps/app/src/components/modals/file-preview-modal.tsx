"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import { getDownloadUrl } from "@/http/endpoints";
import { getFileIcon } from "@/utils/file-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { IconDownload } from "@tabler/icons-react";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    objectName: string;
    type?: string;
  };
}

export function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const t = useTranslations();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && file.objectName) {
      setIsLoading(true);
      setPreviewUrl(null);
      loadPreview();
    }
  }, [file.objectName, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadPreview = async () => {
    if (!file.objectName) return;

    try {
      const encodedObjectName = encodeURIComponent(file.objectName);
      const response = await getDownloadUrl(encodedObjectName);

      setPreviewUrl(response.data.url);
    } catch (error) {
      console.error("Failed to load preview:", error);
      toast.error(t("filePreview.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const encodedObjectName = encodeURIComponent(file.objectName);
      const response = await getDownloadUrl(encodedObjectName);
      const downloadUrl = response.data.url;

      const fileResponse = await fetch(downloadUrl);
      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t("filePreview.downloadError"));
      console.error(error);
    }
  };

  const getFileType = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) return "image";
    if (["mp3", "wav", "ogg", "m4a"].includes(extension || "")) return "audio";
    if (["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(extension || "")) return "video";

    return "other";
  };

  const renderPreview = () => {
    const fileType = getFileType();
    const { icon: FileIcon, color } = getFileIcon(file.name);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground">{t("filePreview.loading")}</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileIcon className={`h-12 w-12 ${color}`} />
          <p className="text-muted-foreground">{t("filePreview.notAvailable")}</p>
          <p className="text-sm text-muted-foreground">{t("filePreview.downloadToView")}</p>
        </div>
      );
    }

    switch (fileType) {
      case "pdf":
        return (
          <ScrollArea className="w-full">
            <iframe className="w-full h-full min-h-[600px]" src={previewUrl} title={file.name} />
          </ScrollArea>
        );
      case "image":
        return (
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img
              src={previewUrl}
              alt={file.name}
              className="object-contain w-full h-full rounded-md"
            />
          </AspectRatio>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <FileIcon className={`text-6xl ${color}`} />
            <audio controls className="w-full max-w-md">
              <source src={previewUrl} type={`audio/${file.name.split(".").pop()}`} />
              {t("filePreview.audioNotSupported")}
            </audio>
          </div>
        );
      case "video":
        return (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <video controls className="w-full max-w-4xl">
              <source src={previewUrl} type={`video/${file.name.split(".").pop()}`} />
              {t("filePreview.videoNotSupported")}
            </video>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <FileIcon className={`text-6xl ${color}`} />
            <p className="text-gray-500">{t("filePreview.notAvailable")}</p>
            <p className="text-sm text-gray-400">{t("filePreview.downloadToView")}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {(() => {
              const FileIcon = getFileIcon(file.name).icon;
              return <FileIcon size={24} />;
            })()}
            <span>{file.name}</span>
          </div>
        </DialogHeader>
        <div className="py-4">{renderPreview()}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>
          <Button onClick={handleDownload}>
            <IconDownload className="h-4 w-4" />
            {t("common.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
