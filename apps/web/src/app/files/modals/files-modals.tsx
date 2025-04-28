import { FileActionsModals } from "@/components/modals/file-actions-modals";
import { FilePreviewModal } from "@/components/modals/file-preview-modal";
import { UploadFileModal } from "@/components/modals/upload-file-modal";
import type { FilesModalsProps } from "../types";

export function FilesModals({ fileManager, modals, onSuccess }: FilesModalsProps) {
  return (
    <>
      <UploadFileModal isOpen={modals.isUploadModalOpen} onClose={modals.onCloseUploadModal} onSuccess={onSuccess} />

      <FilePreviewModal
        file={fileManager.previewFile || { name: "", objectName: "" }}
        isOpen={!!fileManager.previewFile}
        onClose={() => fileManager.setPreviewFile(null)}
      />

      <FileActionsModals
        fileToDelete={fileManager.fileToDelete}
        fileToRename={fileManager.fileToRename}
        onCloseDelete={() => fileManager.setFileToDelete(null)}
        onCloseRename={() => fileManager.setFileToRename(null)}
        onDelete={fileManager.handleDelete}
        onRename={fileManager.handleRename}
      />
    </>
  );
}
