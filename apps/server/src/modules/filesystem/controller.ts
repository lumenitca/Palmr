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
      } catch (cleanupError) {
        console.error("Error deleting temp file:", cleanupError);
      }
      throw error;
    }
  }

  private async uploadSmallFile(request: FastifyRequest, provider: FilesystemStorageProvider, objectName: string) {
    const body = request.body as any;

    if (Buffer.isBuffer(body)) {
      if (body.length === 0) {
        throw new Error("No file data received");
      }
      await provider.uploadFile(objectName, body);
      return;
    }

    if (typeof body === "string") {
      const buffer = Buffer.from(body, "utf8");
      if (buffer.length === 0) {
        throw new Error("No file data received");
      }
      await provider.uploadFile(objectName, buffer);
      return;
    }

    if (typeof body === "object" && body !== null && !body.on) {
      const buffer = Buffer.from(JSON.stringify(body), "utf8");
      if (buffer.length === 0) {
        throw new Error("No file data received");
      }
      await provider.uploadFile(objectName, buffer);
      return;
    }

    if (body && typeof body.on === "function") {
      const chunks: Buffer[] = [];

      return new Promise<void>((resolve, reject) => {
        body.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        body.on("end", async () => {
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

        body.on("error", (error: Error) => {
          console.error("Error reading upload stream:", error);
          reject(error);
        });
      });
    }

    try {
      const buffer = Buffer.from(body);
      if (buffer.length === 0) {
        throw new Error("No file data received");
      }
      await provider.uploadFile(objectName, buffer);
    } catch (error) {
      throw new Error(`Unsupported request body type: ${typeof body}. Expected stream, buffer, string, or object.`);
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
          const buffer = await provider.downloadFile(tokenData.objectName);
          reply.send(buffer);
        }
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

  private async downloadLargeFileRange(
    reply: FastifyReply,
    provider: FilesystemStorageProvider,
    objectName: string,
    start: number,
    end: number
  ) {
    const buffer = await provider.downloadFile(objectName);
    const chunk = buffer.slice(start, end + 1);
    reply.send(chunk);
  }
}
