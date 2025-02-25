import { SettingsForm } from "./components/settings-form";
import { SettingsHeader } from "./components/settings-header";
import { useSettings } from "./hooks/use-settings";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { Navbar } from "@/components/layout/navbar";
import { DefaultFooter } from "@/components/ui/default-footer";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";

export function SettingsPage() {
  const { t } = useTranslation();

  usePageTitle(t("settings.pageTitle"));
  const settings = useSettings();

  if (settings.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-8">
          <SettingsHeader />
          <SettingsForm
            collapsedGroups={settings.collapsedGroups}
            groupForms={settings.groupForms}
            groupedConfigs={settings.groupedConfigs}
            onGroupSubmit={settings.onGroupSubmit}
            onToggleCollapse={settings.toggleCollapse}
          />
        </div>
      </div>
      <DefaultFooter />
    </div>
  );
}
