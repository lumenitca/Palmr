import { addFiles, listFiles, removeFiles } from "@/http/endpoints";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { IconFile, IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface FileSelectorProps {
  shareId: string;
  selectedFiles: string[];
  onSave: (files: string[]) => Promise<void>;
}

export function FileSelector({ shareId, selectedFiles, onSave }: FileSelectorProps) {
  const t = useTranslations();
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [shareFiles, setShareFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableFilter, setAvailableFilter] = useState("");
  const [shareFilter, setShareFilter] = useState("");

  useEffect(() => {
    loadFiles();
  }, [shareId, selectedFiles]);

  const loadFiles = async () => {
    try {
      const response = await listFiles();
      const allFiles = response.data.files || [];

      setShareFiles(allFiles.filter((file) => selectedFiles.includes(file.id)));
      setAvailableFiles(allFiles.filter((file) => !selectedFiles.includes(file.id)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load files");
    }
  };

  const moveToShare = (fileId: string) => {
    const file = availableFiles.find((f) => f.id === fileId);

    if (file) {
      setShareFiles([...shareFiles, file]);
      setAvailableFiles(availableFiles.filter((f) => f.id !== fileId));
    }
  };

  const removeFromShare = (fileId: string) => {
    const file = shareFiles.find((f) => f.id === fileId);

    if (file) {
      setAvailableFiles([...availableFiles, file]);
      setShareFiles(shareFiles.filter((f) => f.id !== fileId));
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const filesToAdd = shareFiles.filter((file) => !selectedFiles.includes(file.id)).map((file) => file.id);

      const filesToRemove = selectedFiles.filter((fileId) => !shareFiles.find((f) => f.id === fileId));

      if (filesToAdd.length > 0) {
        await addFiles(shareId, { files: filesToAdd });
      }

      if (filesToRemove.length > 0) {
        await removeFiles(shareId, { files: filesToRemove });
      }

      await onSave(shareFiles.map((f) => f.id));
      toast.success("Files updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update files");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvailableFiles = availableFiles.filter((file) =>
    file.name.toLowerCase().includes(availableFilter.toLowerCase())
  );

  const filteredShareFiles = shareFiles.filter((file) => file.name.toLowerCase().includes(shareFilter.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 h-[500px]">
        <div className="flex-1 border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-medium">
              {t("fileSelector.availableFiles", { count: filteredAvailableFiles.length })}
            </h3>
            <Input
              className="mt-2"
              placeholder={t("fileSelector.searchPlaceholder")}
              type="search"
              value={availableFilter}
              onChange={(e) => setAvailableFilter(e.target.value)}
            />
          </div>
          <div className="p-4 h-[calc(100%-115px)] overflow-y-auto">
            {filteredAvailableFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {availableFilter ? t("fileSelector.noMatchingFiles") : t("fileSelector.noAvailableFiles")}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredAvailableFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary-500 cursor-pointer"
                    onClick={() => moveToShare(file.id)}
                  >
                    <div className="flex items-center gap-2">
                      <IconFile className="text-gray-400" size={20} />
                      <span className="truncate max-w-[150px]" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <IconArrowRight className="text-gray-400" size={20} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-medium">{t("fileSelector.shareFiles", { count: filteredShareFiles.length })}</h3>
            <Input
              className="mt-2"
              placeholder={t("fileSelector.searchPlaceholder")}
              type="search"
              value={shareFilter}
              onChange={(e) => setShareFilter(e.target.value)}
            />
          </div>
          <div className="p-4 h-[calc(100%-115px)] overflow-y-auto">
            {filteredShareFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {shareFilter ? t("fileSelector.noMatchingFiles") : t("fileSelector.noFilesInShare")}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredShareFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-primary-500 cursor-pointer"
                    onClick={() => removeFromShare(file.id)}
                  >
                    <div className="flex items-center gap-2">
                      <IconFile className="text-gray-400" size={20} />
                      <span className="truncate max-w-[150px]" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <IconArrowLeft className="text-gray-400" size={20} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="default" disabled={isLoading} onClick={handleSave}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin">⠋</div>
              {t("fileSelector.saveChanges")}
            </div>
          ) : (
            t("fileSelector.saveChanges")
          )}
        </Button>
      </div>
    </div>
  );
}
