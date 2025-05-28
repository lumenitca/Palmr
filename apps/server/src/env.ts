import { z } from "zod";

const envSchema = z.object({
  FRONTEND_URL: z.string().url().min(1),
  S3_ENDPOINT: z.string().min(1),
  S3_PORT: z.string().optional(),
  S3_USE_SSL: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  S3_FORCE_PATH_STYLE: z.string().optional().default("false"),
  PORT: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  SERVER_IP: z.string().min(1),
  MAX_FILESIZE: z.string().min(1),
});

export const env = envSchema.parse(process.env);
