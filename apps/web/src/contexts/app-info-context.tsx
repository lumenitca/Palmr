import { getAppInfo } from "@/http/endpoints";
import { createContext, useContext, useEffect, useState } from "react";

interface AppInfoContextType {
  appName: string;
  appLogo: string;
  setAppName: (name: string) => void;
  setAppLogo: (logo: string) => void;
  refreshAppInfo: () => Promise<void>;
}

const AppInfoContext = createContext<AppInfoContextType>({
  appName: "",
  appLogo: "",
  setAppName: () => {},
  setAppLogo: () => {},
  refreshAppInfo: async () => {},
});

export function AppInfoProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppName] = useState("");
  const [appLogo, setAppLogo] = useState("");

  const updateFavicon = (logo: string) => {
    const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']") || document.createElement("link");

    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = logo || "/favicon.ico";
    document.head.appendChild(link);
  };

  const updateTitle = (name: string) => {
    document.title = name;
  };

  const refreshAppInfo = async () => {
    try {
      const response = await getAppInfo();

      setAppName(response.data.appName);
      setAppLogo(response.data.appLogo);

      updateTitle(response.data.appName);
      updateFavicon(response.data.appLogo);
    } catch (error) {
      console.error("Failed to fetch app info:", error);
    }
  };

  useEffect(() => {
    updateTitle(appName);
  }, [appName]);

  useEffect(() => {
    updateFavicon(appLogo);
  }, [appLogo]);

  useEffect(() => {
    refreshAppInfo();
  }, []);

  return (
    <AppInfoContext.Provider value={{ appName, appLogo, setAppName, setAppLogo, refreshAppInfo }}>
      {children}
    </AppInfoContext.Provider>
  );
}

export const useAppInfo = () => useContext(AppInfoContext);
