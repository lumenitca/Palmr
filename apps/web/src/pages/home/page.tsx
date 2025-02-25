import { HomeContent } from "./components/home-content";
import { Navbar } from "./components/navbar";
import { useHome } from "./hooks/use-home";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { DefaultFooter } from "@/components/ui/default-footer";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();

  usePageTitle(t("home.pageTitle"));

  const { isLoading } = useHome();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <HomeContent isLoading={isLoading} />
      <DefaultFooter />
    </div>
  );
}
