import { randomUUID } from "crypto";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { env } from "../../env";

export class LogoService {
  private readonly uploadsDir = "/app/uploads/logo";

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
      throw error;
    }
  }

  async uploadLogo(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error("Upload file not found");
      }

      const metadata = await sharp(filePath).metadata();
      if (!metadata.width || !metadata.height) {
        await fs.promises.unlink(filePath);
        throw new Error("Invalid image file");
      }

      const webpBuffer = await sharp(filePath)
        .resize(256, 256, { fit: "contain" })
        .webp({ quality: 80 })
        .toBuffer();

      const filename = `${randomUUID()}.webp`;
      const outputPath = path.join(this.uploadsDir, filename);
      
      await fs.promises.writeFile(outputPath, webpBuffer);

      await fs.promises.unlink(filePath);

      return `${env.BASE_URL}/uploads/logo/${filename}`;
    } catch (error) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
      
      console.error("Error uploading logo:", error);
      throw error;
    }
  }

  async deleteLogo(imageUrl: string) {
    try {
      const filename = imageUrl.split('/logo/')[1];
      
      if (!filename) {
        throw new Error("Invalid logo URL - could not extract filename");
      }

      const filePath = path.join(this.uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error("Error in logo deletion process:", error);
      throw error;
    }
  }
}
