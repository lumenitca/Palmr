import { env } from "../env";
import { Client } from "minio";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: Number(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD,
  region: env.MINIO_REGION,
});

export const bucketName = env.MINIO_BUCKET_NAME;
