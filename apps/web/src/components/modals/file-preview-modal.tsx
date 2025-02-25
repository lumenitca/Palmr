/* eslint-disable jsx-a11y/media-has-caption */
import { getDownloadUrl } from "@/http/endpoints";
import { getFileIcon } from "@/utils/file-icons";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaDownload } from "react-icons/fa";
import { toast } from "sonner";

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
  const { t } = useTranslation();
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          <p className="text-gray-500">{t("filePreview.loading")}</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileIcon className={`text-6xl ${color}`} />
          <p className="text-gray-500">{t("filePreview.notAvailable")}</p>
          <p className="text-sm text-gray-400">{t("filePreview.downloadToView")}</p>
        </div>
      );
    }

    switch (fileType) {
      case "pdf":
        return (
          <div className="w-full h-[70vh] max-h-[600px] overflow-hidden">
            <iframe key={file.objectName} className="w-full h-full" src={previewUrl} title={file.name} />
          </div>
        );
      case "image":
        return (
          <div className="flex items-center justify-center max-h-[70vh]">
            <Image
              key={file.objectName}
              alt={file.name}
              classNames={{
                wrapper: "max-w-full max-h-[600px]",
                img: "object-contain",
              }}
              height={600}
              loading="lazy"
              radius="lg"
              src={previewUrl}
            />
          </div>
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
    <Modal isOpen={isOpen} size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getFileIcon(file.name).icon({ className: "text-xl" })}
            <span>{file.name}</span>
          </div>
        </ModalHeader>
        <ModalBody>{renderPreview()}</ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("common.close")}
          </Button>
          <Button color="primary" startContent={<FaDownload />} onPress={handleDownload}>
            {t("common.download")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
