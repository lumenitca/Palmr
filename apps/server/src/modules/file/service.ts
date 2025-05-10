import { minioClient, bucketName } from "../../config/minio.config";
import { minioLocalClient } from "../../config/minio.config.local";

export class FileService {
  getPresignedPutUrl(objectName: string, expires: number): Promise<string> {
    return new Promise((resolve, reject) => {
      (minioLocalClient as any).presignedPutObject(bucketName, objectName, expires, {}, ((
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

  getPresignedGetUrl(objectName: string, expires: number, fileName?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reqParams: { [key: string]: any } = {}; 
      let rcdFileName: string;
      if (fileName && fileName.trim() !== '') {
        rcdFileName = fileName;
      } else {
        const lastSlashIndex = objectName.lastIndexOf('/');
        rcdFileName = lastSlashIndex !== -1
          ? objectName.substring(lastSlashIndex + 1)
          : objectName;
        if (!rcdFileName) {
          rcdFileName = 'downloaded_file';
        }
      }
      reqParams['response-content-disposition'] = `attachment; filename="${rcdFileName}"`;
      (minioLocalClient as any).presignedGetObject(
        bucketName,
        objectName,
        expires,
        reqParams, // Pass the constructed request parameters
        ((err: Error | null, presignedUrl?: string) => {
          if (err) {
            console.error("Erro no presignedGetObject:", err);
            reject(err);
          } else if (!presignedUrl) {
            reject(new Error("URL não gerada"));
          } else {
            resolve(presignedUrl);
          }
        }) as any // Consider using proper MinIO SDK types for the callback if available
        // to avoid 'as any'
      );
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
