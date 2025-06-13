import { useEffect, useState } from "react";

import { getOIDCConfig, initiateOIDCLogin } from "@/http/endpoints/auth";
import type { OIDCConfigData } from "@/http/endpoints/auth/types";

interface UseOIDCReturn {
  config: OIDCConfigData | null;
  isLoading: boolean;
  error: string | null;
  initiateLogin: () => void;
}

export function useOIDC(): UseOIDCReturn {
  const [config, setConfig] = useState<OIDCConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getOIDCConfig();
        setConfig(response.data);
      } catch (err) {
        console.error("Failed to fetch OIDC config:", err);
        setError("Failed to load SSO configuration");
        setConfig({ enabled: false });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const initiateLogin = () => {
    if (!config?.enabled || !config?.authUrl) {
      console.error("OIDC not properly configured");
      return;
    }

    const state = crypto.randomUUID();

    sessionStorage.setItem("oidc_state", state);

    const authUrl = initiateOIDCLogin(state);
    window.location.href = authUrl;
  };

  return {
    config,
    isLoading,
    error,
    initiateLogin,
  };
}
