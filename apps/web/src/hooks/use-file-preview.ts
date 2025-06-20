import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getDownloadUrl } from "@/http/endpoints";
import { getFileExtension, getFileType, type FileType } from "@/utils/file-types";

interface FilePreviewState {
  previewUrl: string | null;
  videoBlob: string | null;
  textContent: string | null;
  downloadUrl: string | null;
  isLoading: boolean;
  isLoadingPreview: boolean;
  pdfAsBlob: boolean;
  pdfLoadFailed: boolean;
}

interface UseFilePreviewProps {
  file: {
    name: string;
    objectName: string;
    type?: string;
  };
  isOpen: boolean;
}

export function useFilePreview({ file, isOpen }: UseFilePreviewProps) {
  const t = useTranslations();
  const [state, setState] = useState<FilePreviewState>({
    previewUrl: null,
    videoBlob: null,
    textContent: null,
    downloadUrl: null,
    isLoading: true,
    isLoadingPreview: false,
    pdfAsBlob: false,
    pdfLoadFailed: false,
  });

  const fileType: FileType = getFileType(file.name);

  // Reset state when file changes or modal opens
  useEffect(() => {
    if (isOpen && file.objectName && !state.isLoadingPreview) {
      resetState();
      loadPreview();
    }
  }, [file.objectName, isOpen]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [state.previewUrl, state.videoBlob]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      cleanupBlobUrls();
    }
  }, [isOpen]);

  const resetState = () => {
    setState((prev) => ({
      ...prev,
      previewUrl: null,
      videoBlob: null,
      textContent: null,
      downloadUrl: null,
      pdfAsBlob: false,
      pdfLoadFailed: false,
      isLoading: true,
    }));
  };

  const cleanupBlobUrls = () => {
    if (state.previewUrl && state.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.previewUrl);
    }
    if (state.videoBlob && state.videoBlob.startsWith("blob:")) {
      URL.revokeObjectURL(state.videoBlob);
    }
  };

  const loadPreview = async () => {
    if (!file.objectName || state.isLoadingPreview) return;

    setState((prev) => ({ ...prev, isLoadingPreview: true }));

    try {
      const encodedObjectName = encodeURIComponent(file.objectName);
      const response = await getDownloadUrl(encodedObjectName);
      const url = response.data.url;

      setState((prev) => ({ ...prev, downloadUrl: url }));

      switch (fileType) {
        case "video":
          await loadVideoPreview(url);
          break;
        case "audio":
          await loadAudioPreview(url);
          break;
        case "pdf":
          await loadPdfPreview(url);
          break;
        case "text":
          await loadTextPreview(url);
          break;
        default:
          setState((prev) => ({ ...prev, previewUrl: url }));
      }
    } catch (error) {
      console.error("Failed to load preview:", error);
      toast.error(t("filePreview.loadError"));
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingPreview: false,
      }));
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
      setState((prev) => ({ ...prev, videoBlob: blobUrl }));
    } catch (error) {
      console.error("Failed to load video as blob:", error);
      setState((prev) => ({ ...prev, previewUrl: url }));
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
      setState((prev) => ({ ...prev, previewUrl: blobUrl }));
    } catch (error) {
      console.error("Failed to load audio as blob:", error);
      setState((prev) => ({ ...prev, previewUrl: url }));
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
      setState((prev) => ({
        ...prev,
        previewUrl: blobUrl,
        pdfAsBlob: true,
      }));
    } catch (error) {
      console.error("Failed to load PDF as blob:", error);
      setState((prev) => ({ ...prev, previewUrl: url }));
      setTimeout(() => {
        if (!state.pdfLoadFailed && !state.pdfAsBlob) {
          handlePdfLoadError();
        }
      }, 4000);
    }
  };

  const loadTextPreview = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const extension = getFileExtension(file.name);

      try {
        // For JSON files, validate and format
        if (extension === "json") {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          setState((prev) => ({ ...prev, textContent: formatted }));
        } else {
          // For other text files, show as-is
          setState((prev) => ({ ...prev, textContent: text }));
        }
      } catch (jsonError) {
        // If JSON parsing fails, show as plain text
        setState((prev) => ({ ...prev, textContent: text }));
      }
    } catch (error) {
      console.error("Failed to load text content:", error);
      setState((prev) => ({ ...prev, textContent: null }));
    }
  };

  const handlePdfLoadError = async () => {
    if (state.pdfLoadFailed || state.pdfAsBlob) return;

    setState((prev) => ({ ...prev, pdfLoadFailed: true }));

    if (state.downloadUrl) {
      setTimeout(() => {
        loadPdfPreview(state.downloadUrl!);
      }, 500);
    }
  };

  const handleDownload = async () => {
    try {
      let downloadUrlToUse = state.downloadUrl;

      if (!downloadUrlToUse) {
        const encodedObjectName = encodeURIComponent(file.objectName);
        const response = await getDownloadUrl(encodedObjectName);
        downloadUrlToUse = response.data.url;
      }

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

  return {
    ...state,
    fileType,
    handleDownload,
    handlePdfLoadError,
  };
}
