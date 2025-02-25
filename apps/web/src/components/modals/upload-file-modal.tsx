import { getPresignedUrl, registerFile } from "@/http/endpoints";
import { generateSafeFileName } from "@/utils/file-utils";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Progress } from "@heroui/progress";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt, FaFile, FaFileAlt, FaFileImage, FaFilePdf, FaFileWord } from "react-icons/fa";
import { toast } from "sonner";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadFileModal({ isOpen, onClose, onSuccess }: UploadFileModalProps) {
  const { t } = useTranslation();
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
    if (fileType.startsWith("image/")) return <FaFileImage className="text-4xl text-blue-500" />;
    if (fileType.includes("pdf")) return <FaFilePdf className="text-4xl text-red-500" />;
    if (fileType.includes("word")) return <FaFileWord className="text-4xl text-blue-700" />;

    return <FaFileAlt className="text-4xl text-gray-500" />;
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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{t("uploadFile.title")}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4">
            <input ref={fileInputRef} className="hidden" type="file" onChange={handleFileSelect} />

            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <FaCloudUploadAlt className="text-4xl text-gray-400" />
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
                    <FaFile className="text-xl text-gray-500" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                </div>
                {isUploading && (
                  <Progress
                    showValueLabel
                    aria-label={t("uploadFile.uploadProgress")}
                    className="w-full"
                    value={uploadProgress}
                  />
                )}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            color="primary"
            isDisabled={!selectedFile || isUploading}
            isLoading={isUploading}
            onPress={handleUpload}
          >
            {t("uploadFile.upload")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
