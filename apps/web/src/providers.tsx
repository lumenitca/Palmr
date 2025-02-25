import "./config/i18n";
import { ShareProvider } from "./contexts/ShareContext";
import { AppInfoProvider } from "./contexts/app-info-context";
import { AuthProvider } from "./contexts/auth-context";
import { HeroUIProvider } from "@heroui/system";
import type { NavigateOptions } from "react-router-dom";
import { useHref, useNavigate } from "react-router-dom";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <AuthProvider>
        <AppInfoProvider>
          <ShareProvider>{children}</ShareProvider>
        </AppInfoProvider>
      </AuthProvider>
    </HeroUIProvider>
  );
}
