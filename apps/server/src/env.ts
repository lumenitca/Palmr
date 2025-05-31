import { z } from "zod";

const envSchema = z.object({
  FRONTEND_URL: z.string().url().min(1),
  ENABLE_S3: z.union([z.literal("true"), z.literal("false")]).default("false"),
  ENCRYPTION_KEY: z.string().optional().default("palmr-default-encryption-key-2025"),
  S3_ENDPOINT: z.string().optional(),
  S3_PORT: z.string().optional(),
  S3_USE_SSL: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.union([z.literal("true"), z.literal("false")]).default("false"),
  MAX_FILESIZE: z.string().min(1),
});

export const env = envSchema.parse(process.env);
