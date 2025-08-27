"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WhiteLabelConfig {
  appName: string;
  companyName: string;
  companyUrl: string;
  supportEmail: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  termsUrl?: string;
  privacyUrl?: string;
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
  hideBranding: boolean;
  customCss?: string;
  showPoweredBy: boolean;
  defaultTheme: "light" | "dark" | "system";
  defaultLanguage: string;
}

const WhiteLabelContext = createContext<WhiteLabelConfig | null>(null);

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);

  useEffect(() => {
    // Fetch configuration from API
    fetch("/api/config/whitelabel")
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        
        // Apply custom styles
        if (data.primaryColor) {
          document.documentElement.style.setProperty("--primary", data.primaryColor);
        }
        
        if (data.customCss) {
          const style = document.createElement("style");
          style.textContent = data.customCss;
          document.head.appendChild(style);
        }
        
        if (data.faviconUrl) {
          const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (favicon) {
            favicon.href = data.faviconUrl;
          }
        }
        
        // Update page title
        document.title = data.appName;
      })
      .catch(error => {
        console.error("Failed to load white-label config:", error);
        // Set default config
        setConfig({
          appName: "Palmr",
          companyName: "Palmr",
          companyUrl: "https://palmr.kyantech.com.br",
          supportEmail: "support@example.com",
          mspMode: false,
          requirePasswordProtection: false,
          mandatoryVirusScan: false,
          disablePublicRegistration: false,
          minPasswordLength: 12,
          require2FA: false,
          sessionTimeoutMinutes: 60,
          hideBranding: false,
          showPoweredBy: true,
          defaultTheme: "system",
          defaultLanguage: "en",
        });
      });
  }, []);

  return (
    <WhiteLabelContext.Provider value={config}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    throw new Error("useWhiteLabel must be used within WhiteLabelProvider");
  }
  return context;
}