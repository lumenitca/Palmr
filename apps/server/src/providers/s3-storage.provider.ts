import { s3Client, bucketName } from "../config/storage.config";
import { StorageProvider } from "../types/storage";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3StorageProvider implements StorageProvider {
  async getPresignedPutUrl(objectName: string, expires: number): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: expires });
  }

  async getPresignedGetUrl(objectName: string, expires: number, fileName?: string): Promise<string> {
    let rcdFileName: string;

    if (fileName && fileName.trim() !== "") {
      rcdFileName = fileName;
    } else {
      const lastSlashIndex = objectName.lastIndexOf("/");
      rcdFileName = lastSlashIndex !== -1 ? objectName.substring(lastSlashIndex + 1) : objectName;
      if (!rcdFileName) {
        rcdFileName = "downloaded_file";
      }
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectName,
      ResponseContentDisposition: `attachment; filename="${rcdFileName}"`,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: expires });
  }

  async deleteObject(objectName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    await s3Client.send(command);
  }
}
