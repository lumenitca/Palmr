import { FileListProps } from "../types";
import { EmptyState } from "./empty-state";
import { Header } from "./header";
import { SearchBar } from "./search-bar";
import { FilesTable } from "@/components/tables/files-table";
import { Card, CardContent } from "@/components/ui/card";

export function FileList({ files, filteredFiles, fileManager, searchQuery, onSearch, onUpload }: FileListProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-6">
          <Header onUpload={onUpload} />
          <SearchBar
            filteredCount={filteredFiles.length}
            searchQuery={searchQuery}
            totalFiles={files.length}
            onSearch={onSearch}
          />

          {files.length > 0 ? (
            <FilesTable
              files={filteredFiles}
              onDelete={fileManager.setFileToDelete}
              onDownload={fileManager.handleDownload}
              onPreview={fileManager.setPreviewFile}
              onRename={fileManager.setFileToRename}
            />
          ) : (
            <EmptyState onUpload={onUpload} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
