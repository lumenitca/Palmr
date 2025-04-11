"use client"

import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { Navbar } from "@/components/layout/navbar";
import { DefaultFooter } from "@/components/ui/default-footer";
import { SettingsForm } from "./components/settings-form";
import { SettingsHeader } from "./components/settings-header";
import { useSettings } from "./hooks/use-settings";

export default function SettingsPage() {
  const settings = useSettings();

  if (settings.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
