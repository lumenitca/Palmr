import { getAllConfigs } from "@/http/endpoints";
import { createContext, useContext, useState, useEffect } from "react";

interface ShareContextType {
  smtpEnabled: string;
  refreshShareContext: () => Promise<void>;
}

const ShareContext = createContext<ShareContextType>({
  smtpEnabled: "false",
  refreshShareContext: async () => {},
});

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [smtpEnabled, setSmtpEnabled] = useState("false");

  const loadConfigs = async () => {
    try {
      const response = await getAllConfigs();
      const smtpConfig = response.data.configs.find((config: any) => config.key === "smtpEnabled");

      setSmtpEnabled(smtpConfig?.value || "false");
    } catch (error) {
      console.error("Failed to load SMTP config:", error);
    }
  };

  const refreshShareContext = async () => {
    await loadConfigs();
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return <ShareContext.Provider value={{ smtpEnabled, refreshShareContext }}>{children}</ShareContext.Provider>;
}

export const useShareContext = () => useContext(ShareContext);
