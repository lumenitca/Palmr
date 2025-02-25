import { minioClient } from "../../config/minio.config";
import { randomUUID } from "crypto";
import sharp from "sharp";

export class LogoService {
  private readonly bucketName = "logos";

  constructor() {
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(this.bucketName, "sa-east-1");
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      console.error("Error initializing logo bucket:", error);
    }
  }

  async uploadLogo(imageBuffer: Buffer): Promise<string> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error("Invalid image file");
      }

      const webpBuffer = await sharp(imageBuffer).resize(256, 256, { fit: "contain" }).webp({ quality: 80 }).toBuffer();

      const objectName = `app/${randomUUID()}.webp`;
      await minioClient.putObject(this.bucketName, objectName, webpBuffer);

      const publicUrl = `${process.env.MINIO_PUBLIC_URL}/${this.bucketName}/${objectName}`;
      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  }

  async deleteLogo(imageUrl: string) {
    try {
      const objectName = imageUrl.split(`/${this.bucketName}/`)[1];
      await minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error("Error deleting logo:", error);
      throw error;
    }
  }
}
