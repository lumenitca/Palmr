import { env } from "../env";
import { StorageConfig } from "../types/storage";
import { S3Client } from "@aws-sdk/client-s3";

// Configuração genérica para qualquer provedor S3
export const storageConfig: StorageConfig = {
  endpoint: env.S3_ENDPOINT,
  port: env.S3_PORT ? Number(env.S3_PORT) : undefined,
  useSSL: env.S3_USE_SSL === "true",
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
  region: env.S3_REGION,
  bucketName: env.S3_BUCKET_NAME,
  forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
};

// Cliente S3 genérico - funciona com AWS S3, MinIO, Google Cloud Storage, Azure Blob Storage, etc.
export const s3Client = new S3Client({
  endpoint: storageConfig.useSSL
    ? `https://${storageConfig.endpoint}${storageConfig.port ? `:${storageConfig.port}` : ""}`
    : `http://${storageConfig.endpoint}${storageConfig.port ? `:${storageConfig.port}` : ""}`,
  region: storageConfig.region,
  credentials: {
    accessKeyId: storageConfig.accessKey,
    secretAccessKey: storageConfig.secretKey,
  },
  forcePathStyle: storageConfig.forcePathStyle, // Necessário para MinIO e alguns outros provedores
});

export const bucketName = storageConfig.bucketName;
