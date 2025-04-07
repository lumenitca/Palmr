import { create } from 'zustand'
import { getAppInfo } from "@/http/endpoints";

interface AppInfoStore {
  appName: string;
  appLogo: string;
  setAppName: (name: string) => void;
  setAppLogo: (logo: string) => void;
  refreshAppInfo: () => Promise<void>;
}

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

export const useAppInfo = create<AppInfoStore>((set) => {
  if (typeof window !== 'undefined') {
    getAppInfo().then((response) => {
      set({
        appName: response.data.appName,
        appLogo: response.data.appLogo,
      });
      updateTitle(response.data.appName);
      updateFavicon(response.data.appLogo);
    }).catch((error) => {
      console.error("Failed to fetch app info:", error);
    });
  }

  return {
    appName: "",
    appLogo: "",
    setAppName: (name: string) => {
      set({ appName: name });
      updateTitle(name);
    },
    setAppLogo: (logo: string) => {
      set({ appLogo: logo });
      updateFavicon(logo);
    },
    refreshAppInfo: async () => {
      try {
        const response = await getAppInfo();
        set({
          appName: response.data.appName,
          appLogo: response.data.appLogo,
        });
        updateTitle(response.data.appName);
        updateFavicon(response.data.appLogo);
      } catch (error) {
        console.error("Failed to fetch app info:", error);
      }
    },
  };
});
