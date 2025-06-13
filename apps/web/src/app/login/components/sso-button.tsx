import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOIDC } from "../hooks/use-oidc";

interface SSOButtonProps {
  className?: string;
}

export function SSOButton({ className }: SSOButtonProps) {
  const t = useTranslations();
  const { config, isLoading, initiateLogin } = useOIDC();

  if (isLoading || !config?.enabled) {
    return null;
  }

  return (
    <>
      <div className="relative my-4">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-muted-foreground text-sm">{t("login.or")}</span>
        </div>
      </div>

      <Button variant="outline" className={`w-full ${className}`} onClick={initiateLogin} type="button">
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t("login.continueWithSSO")}
      </Button>
    </>
  );
}
