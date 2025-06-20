"use client";

import { useEffect, useState } from "react";
import { IconDownload } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CustomAudioPlayer } from "@/components/audio/custom-audio-player";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDownloadUrl } from "@/http/endpoints";
import { getFileIcon } from "@/utils/file-icons";

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
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [pdfAsBlob, setPdfAsBlob] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (isOpen && file.objectName && !isLoadingPreview) {
      setIsLoading(true);
      setPreviewUrl(null);
      setVideoBlob(null);
      setPdfAsBlob(false);
      setDownloadUrl(null);
      setPdfLoadFailed(false);
      loadPreview();
    }
  }, [file.objectName, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      if (videoBlob && videoBlob.startsWith("blob:")) {
        URL.revokeObjectURL(videoBlob);
      }
    };
  }, [previewUrl, videoBlob]);

  useEffect(() => {
    if (!isOpen) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (videoBlob && videoBlob.startsWith("blob:")) {
        URL.revokeObjectURL(videoBlob);
        setVideoBlob(null);
      }
    }
  }, [isOpen]);

  const loadPreview = async () => {
    if (!file.objectName || isLoadingPreview) return;

    setIsLoadingPreview(true);
    try {
      const encodedObjectName = encodeURIComponent(file.objectName);
      const response = await getDownloadUrl(encodedObjectName);
      const url = response.data.url;

      setDownloadUrl(url);

      const fileType = getFileType();

      if (fileType === "video") {
        await loadVideoPreview(url);
      } else if (fileType === "audio") {
        await loadAudioPreview(url);
      } else if (fileType === "pdf") {
        await loadPdfPreview(url);
      } else {
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Failed to load preview:", error);
      toast.error(t("filePreview.loadError"));
    } finally {
      setIsLoading(false);
      setIsLoadingPreview(false);
    }
  };

  const loadVideoPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideoBlob(blobUrl);
    } catch (error) {
      console.error("Failed to load video as blob:", error);
      setPreviewUrl(url);
    }
  };

  const loadAudioPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error("Failed to load audio as blob:", error);
      setPreviewUrl(url);
    }
  };

  const loadPdfPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const finalBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(finalBlob);
      setPreviewUrl(blobUrl);
      setPdfAsBlob(true);
    } catch (error) {
      console.error("Failed to load PDF as blob:", error);
      setPreviewUrl(url);
      setTimeout(() => {
        if (!pdfLoadFailed && !pdfAsBlob) {
          handlePdfLoadError();
        }
      }, 4000);
    }
  };

  const handlePdfLoadError = async () => {
    if (pdfLoadFailed || pdfAsBlob) return;

    setPdfLoadFailed(true);

    if (downloadUrl) {
      setTimeout(() => {
        loadPdfPreview(downloadUrl);
      }, 500);
    }
  };

  const handleDownload = async () => {
    try {
      let downloadUrlToUse = downloadUrl;

      if (!downloadUrlToUse) {
        const encodedObjectName = encodeURIComponent(file.objectName);
        const response = await getDownloadUrl(encodedObjectName);
        downloadUrlToUse = response.data.url;
      }

      // Use direct link approach like other parts of the app
      const link = document.createElement("a");
      link.href = downloadUrlToUse;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error(t("filePreview.downloadError"));
      console.error("Download error:", error);
    }
  };

  const getFileType = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(extension || "")) return "image";
    if (["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(extension || "")) return "audio";
    if (["mp4", "webm", "ogg", "mov", "avi", "mkv", "wmv", "flv", "m4v"].includes(extension || "")) return "video";

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

    const mediaUrl = fileType === "video" ? videoBlob : previewUrl;

    if (!mediaUrl && (fileType === "video" || fileType === "audio")) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileIcon className={`h-12 w-12 ${color}`} />
          <p className="text-muted-foreground">{t("filePreview.notAvailable")}</p>
          <p className="text-sm text-muted-foreground">{t("filePreview.downloadToView")}</p>
        </div>
      );
    }

    if (!previewUrl && fileType !== "video") {
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
            <div className="w-full min-h-[600px] border rounded-lg overflow-hidden bg-card">
              {pdfAsBlob ? (
                <iframe
                  src={`${previewUrl!}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full min-h-[600px]"
                  title={file.name}
                  style={{ border: "none" }}
                />
              ) : pdfLoadFailed ? (
                <div className="flex items-center justify-center h-full min-h-[600px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="text-muted-foreground">{t("filePreview.loadingAlternative")}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[600px] relative">
                  <object
                    data={`${previewUrl!}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    type="application/pdf"
                    className="w-full h-full min-h-[600px]"
                    onError={handlePdfLoadError}
                  >
                    <iframe
                      src={`${previewUrl!}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      className="w-full h-full min-h-[600px]"
                      title={file.name}
                      style={{ border: "none" }}
                      onError={handlePdfLoadError}
                    />
                  </object>
                </div>
              )}
            </div>
          </ScrollArea>
        );
      case "image":
        return (
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img src={previewUrl!} alt={file.name} className="object-contain w-full h-full rounded-md" />
          </AspectRatio>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <CustomAudioPlayer src={mediaUrl!} />
          </div>
        );
      case "video":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <div className="w-full max-w-4xl">
              <video controls className="w-full rounded-lg" preload="metadata" style={{ maxHeight: "70vh" }}>
                <source src={mediaUrl!} />
                {t("filePreview.videoNotSupported")}
              </video>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <FileIcon className={`text-6xl ${color}`} />
            <p className="text-muted-foreground">{t("filePreview.notAvailable")}</p>
            <p className="text-sm text-muted-foreground">{t("filePreview.downloadToView")}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const FileIcon = getFileIcon(file.name).icon;
              return <FileIcon size={24} />;
            })()}
            <span className="truncate">{file.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">{renderPreview()}</div>
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
