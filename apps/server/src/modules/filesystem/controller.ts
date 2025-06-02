import { FilesystemStorageProvider } from "../../providers/filesystem-storage.provider";
import { FileService } from "../file/service";
import { FastifyRequest, FastifyReply } from "fastify";
import * as fs from "fs";
import * as path from "path";
import { pipeline } from "stream/promises";

export class FilesystemController {
  private fileService = new FileService();

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

      const contentLength = parseInt(request.headers["content-length"] || "0");
      const isLargeFile = contentLength > 50 * 1024 * 1024;

      if (isLargeFile) {
        await this.uploadLargeFile(request, provider, tokenData.objectName);
      } else {
        await this.uploadSmallFile(request, provider, tokenData.objectName);
      }

      provider.consumeUploadToken(token);
      reply.status(200).send({ message: "File uploaded successfully" });
    } catch (error) {
      console.error("Error in filesystem upload:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  private async uploadLargeFile(request: FastifyRequest, provider: FilesystemStorageProvider, objectName: string) {
    const filePath = provider.getFilePath(objectName);
    const dir = path.dirname(filePath);

    await fs.promises.mkdir(dir, { recursive: true });

    const tempPath = `${filePath}.tmp`;
    const writeStream = fs.createWriteStream(tempPath);
    const encryptStream = provider.createEncryptStream();

    try {
      await pipeline(request.raw, encryptStream, writeStream);

      await fs.promises.rename(tempPath, filePath);
    } catch (error) {
      try {
        await fs.promises.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  private async uploadSmallFile(request: FastifyRequest, provider: FilesystemStorageProvider, objectName: string) {
    const stream = request.body as any;
    const chunks: Buffer[] = [];

    return new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);

          if (buffer.length === 0) {
            throw new Error("No file data received");
          }

          await provider.uploadFile(objectName, buffer);
          resolve();
        } catch (error) {
          console.error("Error uploading small file:", error);
          reject(error);
        }
      });

      stream.on("error", (error: Error) => {
        console.error("Error reading upload stream:", error);
        reject(error);
      });
    });
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
      const isLargeFile = stats.size > 50 * 1024 * 1024;

      const fileName = tokenData.fileName || "download";
      reply.header("Content-Disposition", this.encodeFilenameForHeader(fileName));
      reply.header("Content-Type", "application/octet-stream");
      reply.header("Content-Length", stats.size);

      if (isLargeFile) {
        await this.downloadLargeFile(reply, provider, filePath);
      } else {
        const buffer = await provider.downloadFile(tokenData.objectName);
        reply.send(buffer);
      }

      provider.consumeDownloadToken(token);
    } catch (error) {
      console.error("Error in filesystem download:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  private async downloadLargeFile(reply: FastifyReply, provider: FilesystemStorageProvider, filePath: string) {
    const readStream = fs.createReadStream(filePath);
    const decryptStream = provider.createDecryptStream();

    try {
      await pipeline(readStream, decryptStream, reply.raw);
    } catch (error) {
      console.error("Error streaming large file:", error);
      throw error;
    }
  }
}
