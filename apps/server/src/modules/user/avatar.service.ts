import { minioClient } from "../../config/minio.config";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import sharp from "sharp";

const prisma = new PrismaClient();

export class AvatarService {
  private readonly bucketName = "avatars";

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
      console.error("Error initializing avatar bucket:", error);
    }
  }

  async uploadAvatar(userId: string, imageBuffer: Buffer): Promise<string> {
    try {
      // Buscar usuário atual para verificar se tem avatar
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      });

      // Deletar avatar anterior se existir
      if (user?.image) {
        await this.deleteAvatar(user.image);
      }

      // Validar e fazer upload do novo avatar
      const metadata = await sharp(imageBuffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error("Invalid image file");
      }

      const webpBuffer = await sharp(imageBuffer).resize(256, 256, { fit: "cover" }).webp({ quality: 80 }).toBuffer();

      const objectName = `${userId}/${randomUUID()}.webp`;
      await minioClient.putObject(this.bucketName, objectName, webpBuffer);

      const publicUrl = `${process.env.MINIO_PUBLIC_URL}/${this.bucketName}/${objectName}`;
      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  async deleteAvatar(imageUrl: string) {
    try {
      const objectName = imageUrl.split(`/${this.bucketName}/`)[1];
      console.log("Deleting avatar:", objectName);
      await minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  }
}
