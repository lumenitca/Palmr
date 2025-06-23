import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getDownloadUrl } from "@/http/endpoints";
import { downloadReverseShareFile } from "@/http/endpoints/reverse-shares";
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
    id?: string;
  };
  isOpen: boolean;
  isReverseShare?: boolean;
}

export function useFilePreview({ file, isOpen, isReverseShare = false }: UseFilePreviewProps) {
  if (isReverseShare) {
    return useReverseShareFilePreview({ file, isOpen });
  }
  return useNormalFilePreview({ file, isOpen });
}

// Separate hook for reverse shares - exact copy of working logic
function useReverseShareFilePreview({ file, isOpen }: { file: UseFilePreviewProps["file"]; isOpen: boolean }) {
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

  const loadedRef = useRef<string | null>(null);
  const fileType: FileType = getFileType(file.name);

  // Reset state when file changes or modal opens
  useEffect(() => {
    if (isOpen && file.id && loadedRef.current !== file.id) {
      loadedRef.current = file.id;
      resetState();
      loadPreview();
    } else if (!isOpen) {
      loadedRef.current = null;
    }
  }, [isOpen, file.id]);

  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [state.previewUrl, state.videoBlob]);

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
    if (!file.id || state.isLoadingPreview) return;

    setState((prev) => ({ ...prev, isLoadingPreview: true }));

    try {
      const response = await downloadReverseShareFile(file.id);
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
        if (extension === "json") {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          setState((prev) => ({ ...prev, textContent: formatted }));
        } else {
          setState((prev) => ({ ...prev, textContent: text }));
        }
      } catch (jsonError) {
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
  };

  const handleDownload = async () => {
    if (!file.id) return;

    try {
      const response = await downloadReverseShareFile(file.id);
      const link = document.createElement("a");
      link.href = response.data.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("filePreview.downloadError"));
    }
  };

  return {
    ...state,
    fileType,
    handleDownload,
    handlePdfLoadError,
  };
}

function useNormalFilePreview({ file, isOpen }: { file: UseFilePreviewProps["file"]; isOpen: boolean }) {
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

  const loadedRef = useRef<string | null>(null);
  const loadingRef = useRef<boolean>(false);

  const fileType: FileType = getFileType(file.name);

  useEffect(() => {
    const fileKey = file.objectName;

    if (isOpen && fileKey && loadedRef.current !== fileKey) {
      loadedRef.current = fileKey;
      resetState();
      loadPreview();
    } else if (!isOpen) {
      loadedRef.current = null;
      loadingRef.current = false;
    }
  }, [isOpen, file.objectName]);

  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [state.previewUrl, state.videoBlob]);

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
    loadedRef.current = null;
    loadingRef.current = false;
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

    const currentFileKey = file.objectName;
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
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
      loadingRef.current = false;
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
        if (extension === "json") {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          setState((prev) => ({ ...prev, textContent: formatted }));
        } else {
          setState((prev) => ({ ...prev, textContent: text }));
        }
      } catch (jsonError) {
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
  };

  const handleDownload = async () => {
    if (!file.objectName) return;

    try {
      const encodedObjectName = encodeURIComponent(file.objectName);
      const response = await getDownloadUrl(encodedObjectName);
      const link = document.createElement("a");
      link.href = response.data.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("filePreview.downloadError"));
    }
  };

  return {
    ...state,
    fileType,
    handleDownload,
    handlePdfLoadError,
  };
}
