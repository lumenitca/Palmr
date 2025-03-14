import { randomUUID } from "crypto";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { env } from "../../env";
import multer from 'multer';
import { Request } from 'express';

export class AvatarService {
  private readonly uploadsDir = "/app/uploads/avatars";

  constructor() {
    this.initializeUploadsDir();
  }

  private initializeUploadsDir() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
    } catch (error) {
      console.error("Error initializing uploads directory:", error);
    }
  }

  async uploadAvatar(userId: string, filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error("Upload file not found");
      }

      const metadata = await sharp(filePath).metadata();
      if (!metadata.width || !metadata.height) {
        await fs.promises.unlink(filePath);
        throw new Error("Invalid image file");
      }

      const userDir = path.join(this.uploadsDir, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const webpBuffer = await sharp(filePath)
        .resize(256, 256, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const filename = `${randomUUID()}.webp`;
      const outputPath = path.join(userDir, filename);
      
      await fs.promises.writeFile(outputPath, webpBuffer);

      await fs.promises.unlink(filePath);

      return `${env.BASE_URL}/uploads/avatars/${userId}/${filename}`;
    } catch (error) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
      
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  async deleteAvatar(imageUrl: string) {
    try {
      const parts = imageUrl.split('/avatars/')[1]?.split('/');
      if (!parts || parts.length !== 2) {
        throw new Error("Invalid avatar URL - could not extract user ID and filename");
      }

      const [userId, filename] = parts;
      const filePath = path.join(this.uploadsDir, userId, filename);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        
        const userDir = path.join(this.uploadsDir, userId);
        const remainingFiles = await fs.promises.readdir(userDir);
        if (remainingFiles.length === 0) {
          await fs.promises.rmdir(userDir);
        }
      }
    } catch (error) {
      console.error("Error in avatar deletion process:", error);
      throw error;
    }
  }
}
