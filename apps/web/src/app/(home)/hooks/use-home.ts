"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";

import { getAllConfigs } from "@/http/endpoints";

interface Config {
  key: string;
  value: string;
}

interface HomeStore {
  isLoading: boolean;
  checkHomePageAccess: () => Promise<boolean>;
}

const useHomeStore = create<HomeStore>((set) => ({
  isLoading: true,
  checkHomePageAccess: async () => {
    try {
      const response = await getAllConfigs();
      const showHomePage =
        response.data.configs.find((config: Config) => config.key === "showHomePage")?.value === "true";

      set({ isLoading: false });
      return showHomePage;
    } catch (error) {
      console.error("Failed to check homepage access:", error);
      set({ isLoading: false });
      return false;
    }
  },
}));

export function useHome() {
  const router = useRouter();
  const { isLoading, checkHomePageAccess } = useHomeStore();

  useEffect(() => {
    checkHomePageAccess().then((hasAccess) => {
      if (!hasAccess) {
        router.push("/login");
      }
    });
  }, [router, checkHomePageAccess]);

  return {
    isLoading,
  };
}
