"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";

import { useSecureConfigValue } from "@/hooks/use-secure-configs";

interface HomeStore {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const useHomeStore = create<HomeStore>((set) => ({
  isLoading: true,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export function useHome() {
  const router = useRouter();
  const { isLoading, setIsLoading } = useHomeStore();
  const { value: showHomePage, isLoading: configLoading } = useSecureConfigValue("showHomePage");

  useEffect(() => {
    if (!configLoading) {
      setIsLoading(false);

      if (showHomePage !== "true") {
        router.push("/login");
      }
    }
  }, [router, showHomePage, configLoading, setIsLoading]);

  return {
    isLoading,
  };
}
