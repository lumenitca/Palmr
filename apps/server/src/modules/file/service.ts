import { minioClient, bucketName } from "../../config/minio.config";

export class FileService {
  getPresignedPutUrl(objectName: string, expires: number): Promise<string> {
    return new Promise((resolve, reject) => {
      (minioClient as any).presignedPutObject(bucketName, objectName, expires, {}, ((
        err: Error | null,
        presignedUrl?: string
      ) => {
        if (err) {
          console.error("Erro no presignedPutObject:", err);
          reject(err);
        } else if (!presignedUrl) {
          reject(new Error("URL não gerada"));
        } else {
          resolve(presignedUrl);
        }
      }) as any);
    });
  }

  getPresignedGetUrl(objectName: string, expires: number): Promise<string> {
    return new Promise((resolve, reject) => {
      (minioClient as any).presignedGetObject(bucketName, objectName, expires, ((
        err: Error | null,
        presignedUrl?: string
      ) => {
        if (err) {
          console.error("Erro no presignedGetObject:", err);
          reject(err);
        } else if (!presignedUrl) {
          reject(new Error("URL não gerada"));
        } else {
          resolve(presignedUrl);
        }
      }) as any);
    });
  }

  deleteObject(objectName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      (minioClient as any).removeObject(bucketName, objectName, (err: Error | null) => {
        if (err) {
          console.error("Erro no removeObject:", err);
          return reject(err);
        }
        resolve();
      });
    });
  }
}
