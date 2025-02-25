import { FileListProps } from "../types";
import { EmptyState } from "./empty-state";
import { Header } from "./header";
import { SearchBar } from "./search-bar";
import { FilesTable } from "@/components/tables/files-table";
import { Card, CardBody } from "@heroui/card";

export function FileList({ files, filteredFiles, fileManager, searchQuery, onSearch, onUpload }: FileListProps) {
  return (
    <Card>
      <CardBody className="p-6">
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
      </CardBody>
    </Card>
  );
}
