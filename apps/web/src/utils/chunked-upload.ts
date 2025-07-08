import axios from "axios";

export interface ChunkedUploadOptions {
  file: File;
  url: string;
  chunkSize?: number; // Default 1GB
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
  signal?: AbortSignal;
}

export interface ChunkedUploadResult {
  success: boolean;
  objectName?: string;
  finalObjectName?: string;
  error?: string;
}

export class ChunkedUploader {
  private static readonly MAX_CONCURRENT_CHUNKS = 3;

  /**
   * Upload a file in chunks with streaming
   */
  static async uploadFile(options: ChunkedUploadOptions): Promise<ChunkedUploadResult> {
    const { file, url, chunkSize, onProgress, onChunkComplete, signal } = options;

    if (!this.shouldUseChunkedUpload(file.size)) {
      throw new Error(
        `File ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB) should not use chunked upload. Use regular upload instead.`
      );
    }

    const optimalChunkSize = chunkSize || this.calculateOptimalChunkSize(file.size);

    try {
      const fileId = this.generateFileId();

      const totalChunks = Math.ceil(file.size / optimalChunkSize);

      console.log(`Chunked upload debug:`, {
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2) + "MB",
        chunkSize: optimalChunkSize,
        chunkSizeMB: (optimalChunkSize / (1024 * 1024)).toFixed(2) + "MB",
        totalChunks: totalChunks,
        expectedChunkSize: (file.size / totalChunks / (1024 * 1024)).toFixed(2) + "MB per chunk",
      });
      const uploadedChunks = new Set<number>();
      let completedChunks = 0;
      let lastChunkResponse: any = null;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (signal?.aborted) {
          throw new Error("Upload cancelled");
        }

        const start = chunkIndex * optimalChunkSize;
        const end = Math.min(start + optimalChunkSize, file.size);
        const chunk = file.slice(start, end);
        const isLastChunk = chunkIndex === totalChunks - 1;

        let retries = 0;
        const maxRetries = 3;
        let chunkUploaded = false;

        while (retries < maxRetries && !chunkUploaded) {
          try {
            const response = await this.uploadChunk({
              fileId,
              chunk,
              chunkIndex,
              totalChunks,
              chunkSize: optimalChunkSize,
              totalSize: file.size,
              fileName: file.name,
              isLastChunk,
              url,
              signal,
            });

            if (isLastChunk) {
              lastChunkResponse = response;
              console.log("Last chunk response captured:", response);
            }

            chunkUploaded = true;
          } catch (error: any) {
            retries++;

            if (
              error.response?.status === 400 &&
              (error.response?.data?.error?.includes("already uploaded") ||
                error.response?.data?.details?.includes("already uploaded"))
            ) {
              console.log(`Chunk ${chunkIndex + 1} was already uploaded successfully`);
              chunkUploaded = true;
              break;
            }

            console.warn(`Chunk ${chunkIndex + 1} failed (attempt ${retries}/${maxRetries}):`, error.message);

            if (retries >= maxRetries) {
              throw error;
            }

            const backoffDelay = error.message?.includes("timeout") ? 2000 * retries : 1000 * retries;
            console.log(`Waiting ${backoffDelay}ms before retry ${retries + 1}/${maxRetries}`);
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          }
        }

        if (!chunkUploaded) {
          throw new Error(`Failed to upload chunk ${chunkIndex + 1} after ${maxRetries} attempts`);
        }

        uploadedChunks.add(chunkIndex);
        completedChunks++;

        const progress = Math.round((completedChunks / totalChunks) * 100);
        onProgress?.(progress);
        onChunkComplete?.(chunkIndex, totalChunks);

        if (!isLastChunk) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Chunked upload completed. Last chunk response:", lastChunkResponse);

      return {
        success: true,
        finalObjectName: lastChunkResponse?.finalObjectName || lastChunkResponse?.objectName,
      };
    } catch (error: any) {
      console.error("Chunked upload failed:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  /**
   * Upload a single chunk
   */
  private static async uploadChunk({
    fileId,
    chunk,
    chunkIndex,
    totalChunks,
    chunkSize,
    totalSize,
    fileName,
    isLastChunk,
    url,
    signal,
  }: {
    fileId: string;
    chunk: Blob;
    chunkIndex: number;
    totalChunks: number;
    chunkSize: number;
    totalSize: number;
    fileName: string;
    isLastChunk: boolean;
    url: string;
    signal?: AbortSignal;
  }): Promise<any> {
    const headers = {
      "Content-Type": "application/octet-stream",
      "X-File-Id": fileId,
      "X-Chunk-Index": chunkIndex.toString(),
      "X-Total-Chunks": totalChunks.toString(),
      "X-Chunk-Size": chunkSize.toString(),
      "X-Total-Size": totalSize.toString(),
      "X-File-Name": fileName,
      "X-Is-Last-Chunk": isLastChunk.toString(),
    };

    console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} with headers:`, headers);

    try {
      const timeoutPer100MB = 60000; // 60 seconds per 100MB
      const chunkSizeMB = chunk.size / (1024 * 1024);
      const calculatedTimeout = Math.max(30000, Math.ceil(chunkSizeMB / 100) * timeoutPer100MB);

      console.log(`Chunk ${chunkIndex + 1} size: ${chunkSizeMB.toFixed(2)}MB, timeout: ${calculatedTimeout}ms`);

      const response = await axios.put(url, chunk, {
        headers,
        signal,
        timeout: calculatedTimeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status !== 200) {
        throw new Error(`Failed to upload chunk ${chunkIndex}: ${response.statusText}`);
      }

      return response.data;
    } catch (error: any) {
      if (
        error.response?.status === 400 &&
        (error.response?.data?.error?.includes("already uploaded") ||
          error.response?.data?.details?.includes("already uploaded"))
      ) {
        console.log(`Chunk ${chunkIndex + 1} was already uploaded successfully, treating as success`);
        return error.response.data;
      }

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        console.warn(`Chunk ${chunkIndex + 1} upload timed out, will retry`);
        throw new Error(`Upload timeout for chunk ${chunkIndex + 1}`);
      }

      throw error;
    }
  }

  /**
   * Get upload progress
   */
  static async getUploadProgress(fileId: string): Promise<{
    uploaded: number;
    total: number;
    percentage: number;
  } | null> {
    try {
      const response = await axios.get(`/api/filesystem/upload-progress/${fileId}`);
      return response.data;
    } catch (error) {
      console.warn("Failed to get upload progress:", error);
      return null;
    }
  }

  /**
   * Cancel upload
   */
  static async cancelUpload(fileId: string): Promise<void> {
    try {
      await axios.delete(`/api/filesystem/cancel-upload/${fileId}`);
    } catch (error) {
      console.warn("Failed to cancel upload:", error);
    }
  }

  /**
   * Generate unique file ID
   */
  private static generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Check if file should use chunked upload
   */
  static shouldUseChunkedUpload(fileSize: number): boolean {
    const threshold = 100 * 1024 * 1024; // 100MB
    const shouldUse = fileSize > threshold;

    console.log(`Chunked upload decision:`, {
      fileSize,
      fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2) + "MB",
      threshold,
      thresholdMB: (threshold / (1024 * 1024)).toFixed(2) + "MB",
      shouldUse,
      comparison: `${fileSize} > ${threshold} = ${shouldUse}`,
    });

    return shouldUse;
  }

  /**
   * Calculate optimal chunk size based on file size
   */
  static calculateOptimalChunkSize(fileSize: number): number {
    console.log(`Calculating chunk size for file:`, {
      fileSize,
      fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2) + "MB",
    });

    if (fileSize <= 100 * 1024 * 1024) {
      throw new Error(
        `calculateOptimalChunkSize should not be called for files <= 100MB. File size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    // For files > 10GB, use 500MB chunks
    if (fileSize > 10 * 1024 * 1024 * 1024) {
      console.log(`File > 10GB, using 500MB chunks`);
      return 500 * 1024 * 1024;
    }

    // For files > 5GB, use 300MB chunks
    if (fileSize > 5 * 1024 * 1024 * 1024) {
      console.log(`File > 5GB, using 300MB chunks`);
      return 300 * 1024 * 1024;
    }

    // For files > 2GB, use 200MB chunks
    if (fileSize > 2 * 1024 * 1024 * 1024) {
      console.log(`File > 2GB, using 200MB chunks`);
      return 200 * 1024 * 1024;
    }

    // For files > 1GB, use 150MB chunks
    if (fileSize > 1024 * 1024 * 1024) {
      console.log(`File > 1GB, using 150MB chunks`);
      return 150 * 1024 * 1024;
    }

    // For files > 500MB, use 100MB chunks
    if (fileSize > 500 * 1024 * 1024) {
      console.log(`File > 500MB, using 100MB chunks`);
      return 100 * 1024 * 1024;
    }

    // For files > 100MB, use 75MB chunks (minimum for chunked upload)
    console.log(`File > 100MB, using 75MB chunks (minimum for chunked upload)`);
    return 75 * 1024 * 1024;
  }
}
