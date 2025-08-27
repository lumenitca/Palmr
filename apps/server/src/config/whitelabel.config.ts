import { env } from "../env";

export interface WhiteLabelConfig {
  // Branding
  appName: string;
  companyName: string;
  companyUrl: string;
  supportEmail: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  termsUrl?: string;
  privacyUrl?: string;

  // MSP Security
  mspMode: boolean;
  requirePasswordProtection: boolean;
  mandatoryVirusScan: boolean;
  disablePublicRegistration: boolean;
  maxFileSizeMB?: number;
  allowedFileExtensions?: string[];
  blockedFileExtensions?: string[];
  minPasswordLength: number;
  require2FA: boolean;
  sessionTimeoutMinutes: number;

  // UI Settings
  hideBranding: boolean;
  customCss?: string;
  showPoweredBy: boolean;
  defaultTheme: "light" | "dark" | "system";
  defaultLanguage: string;
}

export const whiteLabelConfig: WhiteLabelConfig = {
  // Branding
  appName: env.APP_NAME,
  companyName: env.COMPANY_NAME,
  companyUrl: env.COMPANY_URL,
  supportEmail: env.SUPPORT_EMAIL,
  logoUrl: env.LOGO_URL,
  faviconUrl: env.FAVICON_URL,
  primaryColor: env.PRIMARY_COLOR,
  termsUrl: env.TERMS_URL,
  privacyUrl: env.PRIVACY_URL,

  // MSP Security
  mspMode: env.MSP_MODE === "true",
  requirePasswordProtection: env.REQUIRE_PASSWORD_PROTECTION === "true",
  mandatoryVirusScan: env.MANDATORY_VIRUS_SCAN === "true",
  disablePublicRegistration: env.DISABLE_PUBLIC_REGISTRATION === "true",
  maxFileSizeMB: env.MAX_FILE_SIZE_MB,
  allowedFileExtensions: env.ALLOWED_FILE_EXTENSIONS?.split(",").map(ext => ext.trim()),
  blockedFileExtensions: env.BLOCKED_FILE_EXTENSIONS?.split(",").map(ext => ext.trim()),
  minPasswordLength: parseInt(env.MIN_PASSWORD_LENGTH, 10),
  require2FA: env.REQUIRE_2FA === "true",
  sessionTimeoutMinutes: parseInt(env.SESSION_TIMEOUT_MINUTES, 10),

  // UI Settings
  hideBranding: env.HIDE_BRANDING === "true",
  customCss: env.CUSTOM_CSS,
  showPoweredBy: env.SHOW_POWERED_BY === "true",
  defaultTheme: env.DEFAULT_THEME,
  defaultLanguage: env.DEFAULT_LANGUAGE,
};