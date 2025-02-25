import { useAppInfo } from "@/contexts/app-info-context";
import { useEffect } from "react";

export function usePageTitle(pageTitle?: string) {
  const { appName } = useAppInfo();

  useEffect(() => {
    document.title = pageTitle ? `${appName} | ${pageTitle}` : appName;
  }, [appName, pageTitle]);
}
