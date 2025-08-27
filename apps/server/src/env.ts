import { z } from "zod";

const envSchema = z.object({
  ENABLE_S3: z.union([z.literal("true"), z.literal("false")]).default("false"),
  ENCRYPTION_KEY: z.string().optional(),
  DISABLE_FILESYSTEM_ENCRYPTION: z.union([z.literal("true"), z.literal("false")]).default("true"),
  S3_ENDPOINT: z.string().optional(),
  S3_PORT: z.string().optional(),
  S3_USE_SSL: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.union([z.literal("true"), z.literal("false")]).default("false"),
  S3_REJECT_UNAUTHORIZED: z.union([z.literal("true"), z.literal("false")]).default("true"),
  PRESIGNED_URL_EXPIRATION: z.string().optional().default("3600"),
  SECURE_SITE: z.union([z.literal("true"), z.literal("false")]).default("false"),
  DATABASE_URL: z.string().optional().default("file:/app/server/prisma/palmr.db"),
  DOWNLOAD_MAX_CONCURRENT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  DOWNLOAD_MEMORY_THRESHOLD_MB: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  DOWNLOAD_QUEUE_SIZE: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  DOWNLOAD_AUTO_SCALE: z.union([z.literal("true"), z.literal("false")]).default("true"),
  DOWNLOAD_MIN_FILE_SIZE_GB: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),

  // White-label configuration
  APP_NAME: z.string().optional().default("Palmr"),
  COMPANY_NAME: z.string().optional().default("Palmr"),
  COMPANY_URL: z.string().optional().default("https://palmr.kyantech.com.br"),
  SUPPORT_EMAIL: z.string().optional().default("support@example.com"),
  LOGO_URL: z.string().optional(),
  FAVICON_URL: z.string().optional(),
  PRIMARY_COLOR: z.string().optional(),
  TERMS_URL: z.string().optional(),
  PRIVACY_URL: z.string().optional(),
  
  // MSP Security Features
  MSP_MODE: z.union([z.literal("true"), z.literal("false")]).default("false"),
  REQUIRE_PASSWORD_PROTECTION: z.union([z.literal("true"), z.literal("false")]).default("false"),
  MANDATORY_VIRUS_SCAN: z.union([z.literal("true"), z.literal("false")]).default("false"),
  DISABLE_PUBLIC_REGISTRATION: z.union([z.literal("true"), z.literal("false")]).default("false"),
  MAX_FILE_SIZE_MB: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  ALLOWED_FILE_EXTENSIONS: z.string().optional(),
  BLOCKED_FILE_EXTENSIONS: z.string().optional(),
  MIN_PASSWORD_LENGTH: z.string().optional().default("12"),
  REQUIRE_2FA: z.union([z.literal("true"), z.literal("false")]).default("false"),
  SESSION_TIMEOUT_MINUTES: z.string().optional().default("60"),
  
  // UI Customization
  HIDE_BRANDING: z.union([z.literal("true"), z.literal("false")]).default("false"),
  CUSTOM_CSS: z.string().optional(),
  SHOW_POWERED_BY: z.union([z.literal("true"), z.literal("false")]).default("true"),
  DEFAULT_THEME: z.enum(["light", "dark", "system"]).default("system"),
  DEFAULT_LANGUAGE: z.string().optional().default("en"),
});

export const env = envSchema.parse(process.env);
