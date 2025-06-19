import { env } from "../env";
import { StorageProvider } from "../types/storage";
import { IS_RUNNING_IN_CONTAINER } from "../utils/container-detection";
import * as crypto from "crypto";
import * as fsSync from "fs";
import * as fs from "fs/promises";
import * as path from "path";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

export class FilesystemStorageProvider implements StorageProvider {
  private static instance: FilesystemStorageProvider;
  private uploadsDir: string;
  private encryptionKey = env.ENCRYPTION_KEY;
  private uploadTokens = new Map<string, { objectName: string; expiresAt: number }>();
  private downloadTokens = new Map<string, { objectName: string; expiresAt: number; fileName?: string }>();

  private constructor() {
    this.uploadsDir = IS_RUNNING_IN_CONTAINER ? "/app/server/uploads" : path.join(process.cwd(), "uploads");

    this.ensureUploadsDir();
    setInterval(() => this.cleanExpiredTokens(), 5 * 60 * 1000);
  }

  public static getInstance(): FilesystemStorageProvider {
    if (!FilesystemStorageProvider.instance) {
      FilesystemStorageProvider.instance = new FilesystemStorageProvider();
    }
    return FilesystemStorageProvider.instance;
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  private cleanExpiredTokens(): void {
    const now = Date.now();

    for (const [token, data] of this.uploadTokens.entries()) {
      if (now > data.expiresAt) {
        this.uploadTokens.delete(token);
      }
    }

    for (const [token, data] of this.downloadTokens.entries()) {
      if (now > data.expiresAt) {
        this.downloadTokens.delete(token);
      }
    }
  }

  public getFilePath(objectName: string): string {
    const sanitizedName = objectName.replace(/[^a-zA-Z0-9\-_./]/g, "_");
    return path.join(this.uploadsDir, sanitizedName);
  }

  private createEncryptionKey(): Buffer {
    return crypto.scryptSync(this.encryptionKey, "salt", 32);
  }

  public createEncryptStream(): Transform {
    const key = this.createEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let isFirstChunk = true;

    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          if (isFirstChunk) {
            this.push(iv);
            isFirstChunk = false;
          }

          const encrypted = cipher.update(chunk);
          this.push(encrypted);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },

      flush(callback) {
        try {
          const final = cipher.final();
          this.push(final);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });
  }

  public createDecryptStream(): Transform {
    const key = this.createEncryptionKey();
    let iv: Buffer | null = null;
    let decipher: crypto.Decipher | null = null;
    let ivBuffer = Buffer.alloc(0);

    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          if (!iv) {
            ivBuffer = Buffer.concat([ivBuffer, chunk]);

            if (ivBuffer.length >= 16) {
              iv = ivBuffer.slice(0, 16);
              decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
              const remainingData = ivBuffer.slice(16);
              if (remainingData.length > 0) {
                const decrypted = decipher.update(remainingData);
                this.push(decrypted);
              }
            }
            callback();
            return;
          }

          if (decipher) {
            const decrypted = decipher.update(chunk);
            this.push(decrypted);
          }
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },

      flush(callback) {
        try {
          if (decipher) {
            const final = decipher.final();
            this.push(final);
          }
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });
  }

  async getPresignedPutUrl(objectName: string, expires: number): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + expires * 1000;

    this.uploadTokens.set(token, { objectName, expiresAt });

    return `/api/filesystem/upload/${token}`;
  }

  async getPresignedGetUrl(objectName: string, expires: number, fileName?: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + expires * 1000;

    this.downloadTokens.set(token, { objectName, expiresAt, fileName });

    return `/api/filesystem/download/${token}`;
  }

  async deleteObject(objectName: string): Promise<void> {
    const filePath = this.getFilePath(objectName);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  async uploadFile(objectName: string, buffer: Buffer): Promise<void> {
    const filePath = this.getFilePath(objectName);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    if (buffer.length > 50 * 1024 * 1024) {
      await this.uploadFileStream(objectName, buffer);
    } else {
      const encryptedBuffer = this.encryptFileBuffer(buffer);
      await fs.writeFile(filePath, encryptedBuffer);
    }
  }

  private async uploadFileStream(objectName: string, buffer: Buffer): Promise<void> {
    const filePath = this.getFilePath(objectName);
    const { Readable } = await import("stream");

    const readable = Readable.from(buffer);
    const writeStream = fsSync.createWriteStream(filePath);
    const encryptStream = this.createEncryptStream();

    await pipeline(readable, encryptStream, writeStream);
  }

  private encryptFileBuffer(buffer: Buffer): Buffer {
    const key = this.createEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    const encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

    return encrypted;
  }

  async downloadFile(objectName: string): Promise<Buffer> {
    const filePath = this.getFilePath(objectName);
    const encryptedBuffer = await fs.readFile(filePath);

    if (encryptedBuffer.length > 16) {
      try {
        return this.decryptFileBuffer(encryptedBuffer);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.warn("Failed to decrypt with new method, trying legacy format", error.message);
        }
        return this.decryptFileLegacy(encryptedBuffer);
      }
    }

    return this.decryptFileLegacy(encryptedBuffer);
  }

  private decryptFileBuffer(encryptedBuffer: Buffer): Buffer {
    const key = this.createEncryptionKey();
    const iv = encryptedBuffer.slice(0, 16);
    const encrypted = encryptedBuffer.slice(16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  private decryptFileLegacy(encryptedBuffer: Buffer): Buffer {
    const CryptoJS = require("crypto-js");
    const decrypted = CryptoJS.AES.decrypt(encryptedBuffer.toString("utf8"), this.encryptionKey);
    return Buffer.from(decrypted.toString(CryptoJS.enc.Utf8), "base64");
  }

  async fileExists(objectName: string): Promise<boolean> {
    const filePath = this.getFilePath(objectName);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  validateUploadToken(token: string): { objectName: string } | null {
    const data = this.uploadTokens.get(token);
    if (!data || Date.now() > data.expiresAt) {
      this.uploadTokens.delete(token);
      return null;
    }
    return { objectName: data.objectName };
  }

  validateDownloadToken(token: string): { objectName: string; fileName?: string } | null {
    const data = this.downloadTokens.get(token);

    if (!data) {
      return null;
    }

    const now = Date.now();

    if (now > data.expiresAt) {
      this.downloadTokens.delete(token);
      return null;
    }

    return { objectName: data.objectName, fileName: data.fileName };
  }

  consumeUploadToken(token: string): void {
    this.uploadTokens.delete(token);
  }

  consumeDownloadToken(token: string): void {
    this.downloadTokens.delete(token);
  }
}
