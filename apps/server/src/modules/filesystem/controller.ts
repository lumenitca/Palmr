import * as fs from "fs";
import { pipeline } from "stream/promises";
import { FastifyReply, FastifyRequest } from "fastify";

import { FilesystemStorageProvider } from "../../providers/filesystem-storage.provider";
import { ChunkManager, ChunkMetadata } from "./chunk-manager";

export class FilesystemController {
  private chunkManager = ChunkManager.getInstance();

  /**
   * Safely encode filename for Content-Disposition header
   */
  private encodeFilenameForHeader(filename: string): string {
    if (!filename || filename.trim() === "") {
      return 'attachment; filename="download"';
    }

    let sanitized = filename
      .replace(/"/g, "'")
      .replace(/[\r\n\t\v\f]/g, "")
      .replace(/[\\|/]/g, "-")
      .replace(/[<>:|*?]/g, "");

    sanitized = sanitized
      .split("")
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && !(code >= 127 && code <= 159);
      })
      .join("")
      .trim();

    if (!sanitized) {
      return 'attachment; filename="download"';
    }

    const asciiSafe = sanitized
      .split("")
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code <= 126;
      })
      .join("");

    if (asciiSafe && asciiSafe.trim()) {
      const encoded = encodeURIComponent(sanitized);
      return `attachment; filename="${asciiSafe}"; filename*=UTF-8''${encoded}`;
    } else {
      const encoded = encodeURIComponent(sanitized);
      return `attachment; filename*=UTF-8''${encoded}`;
    }
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token } = request.params as { token: string };

      const provider = FilesystemStorageProvider.getInstance();

      const tokenData = provider.validateUploadToken(token);

      if (!tokenData) {
        return reply.status(400).send({ error: "Invalid or expired upload token" });
      }

      const chunkMetadata = this.extractChunkMetadata(request);

      if (chunkMetadata) {
        try {
          const result = await this.handleChunkedUpload(request, chunkMetadata, tokenData.objectName);

          if (result.isComplete) {
            provider.consumeUploadToken(token);
            reply.status(200).send({
              message: "File uploaded successfully",
              objectName: result.finalPath,
              finalObjectName: result.finalPath,
            });
          } else {
            reply.status(200).send({
              message: "Chunk uploaded successfully",
              progress: this.chunkManager.getUploadProgress(chunkMetadata.fileId),
            });
          }
        } catch (chunkError: any) {
          return reply.status(400).send({
            error: chunkError.message || "Chunked upload failed",
            details: chunkError.toString(),
          });
        }
      } else {
        await this.uploadFileStream(request, provider, tokenData.objectName);
        provider.consumeUploadToken(token);
        reply.status(200).send({ message: "File uploaded successfully" });
      }
    } catch (error) {
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  private async uploadFileStream(request: FastifyRequest, provider: FilesystemStorageProvider, objectName: string) {
    await provider.uploadFileFromStream(objectName, request.raw);
  }

  /**
   * Extract chunk metadata from request headers
   */
  private extractChunkMetadata(request: FastifyRequest): ChunkMetadata | null {
    const fileId = request.headers["x-file-id"] as string;
    const chunkIndex = request.headers["x-chunk-index"] as string;
    const totalChunks = request.headers["x-total-chunks"] as string;
    const chunkSize = request.headers["x-chunk-size"] as string;
    const totalSize = request.headers["x-total-size"] as string;
    const fileName = request.headers["x-file-name"] as string;
    const isLastChunk = request.headers["x-is-last-chunk"] as string;

    if (!fileId || !chunkIndex || !totalChunks || !chunkSize || !totalSize || !fileName) {
      return null;
    }

    const metadata = {
      fileId,
      chunkIndex: parseInt(chunkIndex, 10),
      totalChunks: parseInt(totalChunks, 10),
      chunkSize: parseInt(chunkSize, 10),
      totalSize: parseInt(totalSize, 10),
      fileName,
      isLastChunk: isLastChunk === "true",
    };

    return metadata;
  }

  /**
   * Handle chunked upload with streaming
   */
  private async handleChunkedUpload(request: FastifyRequest, metadata: ChunkMetadata, originalObjectName: string) {
    const stream = request.raw;

    stream.on("error", (error) => {
      console.error("Request stream error:", error);
    });

    return await this.chunkManager.processChunk(metadata, stream, originalObjectName);
  }

  /**
   * Get upload progress for chunked uploads
   */
  async getUploadProgress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { fileId } = request.params as { fileId: string };

      const progress = this.chunkManager.getUploadProgress(fileId);

      if (!progress) {
        return reply.status(404).send({ error: "Upload not found" });
      }

      reply.status(200).send(progress);
    } catch (error) {
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * Cancel chunked upload
   */
  async cancelUpload(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { fileId } = request.params as { fileId: string };

      await this.chunkManager.cancelUpload(fileId);

      reply.status(200).send({ message: "Upload cancelled successfully" });
    } catch (error) {
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async download(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token } = request.params as { token: string };

      const provider = FilesystemStorageProvider.getInstance();

      const tokenData = provider.validateDownloadToken(token);

      if (!tokenData) {
        return reply.status(400).send({ error: "Invalid or expired download token" });
      }

      const filePath = provider.getFilePath(tokenData.objectName);
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;
      const isLargeFile = fileSize > 50 * 1024 * 1024;

      const fileName = tokenData.fileName || "download";
      const range = request.headers.range;

      reply.header("Content-Disposition", this.encodeFilenameForHeader(fileName));
      reply.header("Content-Type", "application/octet-stream");
      reply.header("Accept-Ranges", "bytes");

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        reply.status(206);
        reply.header("Content-Range", `bytes ${start}-${end}/${fileSize}`);
        reply.header("Content-Length", chunkSize);

        if (isLargeFile) {
          await this.downloadLargeFileRange(reply, provider, tokenData.objectName, start, end);
        } else {
          const buffer = await provider.downloadFile(tokenData.objectName);
          const chunk = buffer.slice(start, end + 1);
          reply.send(chunk);
        }
      } else {
        reply.header("Content-Length", fileSize);

        if (isLargeFile) {
          await this.downloadLargeFile(reply, provider, filePath);
        } else {
          const stream = provider.createDecryptedReadStream(tokenData.objectName);
          reply.send(stream);
        }
      }

      provider.consumeDownloadToken(token);
    } catch (error) {
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  private async downloadLargeFile(reply: FastifyReply, provider: FilesystemStorageProvider, filePath: string) {
    const readStream = fs.createReadStream(filePath);
    const decryptStream = provider.createDecryptStream();

    try {
      await pipeline(readStream, decryptStream, reply.raw);
    } catch (error) {
      throw error;
    }
  }

  private async downloadLargeFileRange(
    reply: FastifyReply,
    provider: FilesystemStorageProvider,
    objectName: string,
    start: number,
    end: number
  ) {
    const filePath = provider.getFilePath(objectName);
    const readStream = fs.createReadStream(filePath, { start, end });
    const decryptStream = provider.createDecryptStream();

    try {
      await pipeline(readStream, decryptStream, reply.raw);
    } catch (error) {
      throw error;
    }
  }
}
