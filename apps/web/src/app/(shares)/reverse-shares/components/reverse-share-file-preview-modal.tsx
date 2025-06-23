"use client";

import { FilePreviewModal } from "@/components/modals/file-preview-modal";

interface ReverseShareFilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    objectName: string;
    extension?: string;
  } | null;
}

export function ReverseShareFilePreviewModal({ isOpen, onClose, file }: ReverseShareFilePreviewModalProps) {
  if (!file) return null;

  const adaptedFile = {
    name: file.name,
    objectName: file.objectName,
    type: file.extension,
    id: file.id,
  };

  return <FilePreviewModal isOpen={isOpen} onClose={onClose} file={adaptedFile} isReverseShare={true} />;
}
