import { isS3Enabled } from "../../config/storage.config";
import { FilesystemStorageProvider } from "../../providers/filesystem-storage.provider";
import { S3StorageProvider } from "../../providers/s3-storage.provider";
import { StorageProvider } from "../../types/storage";

export class FileService {
  private storageProvider: StorageProvider;

  constructor() {
    if (isS3Enabled) {
      this.storageProvider = new S3StorageProvider();
    } else {
      this.storageProvider = FilesystemStorageProvider.getInstance();
    }
  }

  async getPresignedPutUrl(objectName: string, expires: number): Promise<string> {
    try {
      return await this.storageProvider.getPresignedPutUrl(objectName, expires);
    } catch (err) {
      console.error("Erro no presignedPutObject:", err);
      throw err;
    }
  }

  async getPresignedGetUrl(objectName: string, expires: number, fileName?: string): Promise<string> {
    try {
      return await this.storageProvider.getPresignedGetUrl(objectName, expires, fileName);
    } catch (err) {
      console.error("Erro no presignedGetObject:", err);
      throw err;
    }
  }

  async deleteObject(objectName: string): Promise<void> {
    try {
      await this.storageProvider.deleteObject(objectName);
    } catch (err) {
      console.error("Erro no removeObject:", err);
      throw err;
    }
  }

  isFilesystemMode(): boolean {
    return !isS3Enabled;
  }
}
