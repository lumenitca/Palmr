import { NextResponse } from "next/server";

// This endpoint serves the white-label configuration to the frontend
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/api/config/whitelabel`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch white-label config:", error);
    
    // Return default configuration
    return NextResponse.json({
      appName: process.env.NEXT_PUBLIC_APP_NAME || "Palmr",
      companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Palmr",
      companyUrl: process.env.NEXT_PUBLIC_COMPANY_URL || "https://palmr.kyantech.com.br",
      supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com",
      logoUrl: process.env.NEXT_PUBLIC_LOGO_URL,
      faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL,
      primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
      termsUrl: process.env.NEXT_PUBLIC_TERMS_URL,
      privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL,
      mspMode: process.env.NEXT_PUBLIC_MSP_MODE === "true",
      requirePasswordProtection: process.env.NEXT_PUBLIC_REQUIRE_PASSWORD_PROTECTION === "true",
      mandatoryVirusScan: process.env.NEXT_PUBLIC_MANDATORY_VIRUS_SCAN === "true",
      disablePublicRegistration: process.env.NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION === "true",
      maxFileSizeMB: process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ? parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) : undefined,
      minPasswordLength: parseInt(process.env.NEXT_PUBLIC_MIN_PASSWORD_LENGTH || "12"),
      require2FA: process.env.NEXT_PUBLIC_REQUIRE_2FA === "true",
      sessionTimeoutMinutes: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES || "60"),
      hideBranding: process.env.NEXT_PUBLIC_HIDE_BRANDING === "true",
      showPoweredBy: process.env.NEXT_PUBLIC_SHOW_POWERED_BY !== "false",
      defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME as any || "system",
      defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en",
    });
  }
}