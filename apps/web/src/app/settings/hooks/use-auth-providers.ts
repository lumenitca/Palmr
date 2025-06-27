"use client";

import { useEffect, useState } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AuthProvider, NewProvider } from "../components/auth-provider-form/types";

export function useAuthProviders() {
  const t = useTranslations();
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<AuthProvider | null>(null);
  const [editingFormData, setEditingFormData] = useState<Record<string, any>>({});
  const [hideDisabledProviders, setHideDisabledProviders] = useState<boolean>(false);
  const [providerToDelete, setProviderToDelete] = useState<{
    id: string;
    name: string;
    displayName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("hideDisabledProviders");
    if (savedState !== null) {
      setHideDisabledProviders(JSON.parse(savedState));
    }
  }, []);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/providers/all");
      const data = await response.json();

      if (data.success) {
        setProviders(data.data.sort((a: AuthProvider, b: AuthProvider) => a.sortOrder - b.sortOrder));
      } else {
        toast.error(t("authProviders.messages.loadFailed"));
      }
    } catch (error) {
      console.error("Error loading providers:", error);
      toast.error(t("authProviders.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const updateProvider = async (id: string, updates: Partial<AuthProvider>) => {
    try {
      setSaving(id);
      const response = await fetch(`/api/auth/providers/manage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        toast.success(t("authProviders.messages.providerUpdated"));
      } else {
        toast.error(t("authProviders.messages.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error(t("authProviders.messages.updateFailed"));
    } finally {
      setSaving(null);
    }
  };

  const addProvider = async (newProvider: NewProvider) => {
    try {
      setSaving("new");
      const response = await fetch("/api/auth/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProvider.name.toLowerCase().replace(/\s+/g, "-"),
          displayName: newProvider.displayName,
          type: newProvider.type,
          icon: newProvider.icon,
          clientId: newProvider.clientId,
          clientSecret: newProvider.clientSecret,
          enabled: false,
          autoRegister: true,
          scope: newProvider.scope || (newProvider.type === "oidc" ? "openid profile email" : "user:email"),
          sortOrder: providers.length + 1,
          ...(newProvider.issuerUrl ? { issuerUrl: newProvider.issuerUrl } : {}),
          ...(newProvider.authorizationEndpoint ? { authorizationEndpoint: newProvider.authorizationEndpoint } : {}),
          ...(newProvider.tokenEndpoint ? { tokenEndpoint: newProvider.tokenEndpoint } : {}),
          ...(newProvider.userInfoEndpoint ? { userInfoEndpoint: newProvider.userInfoEndpoint } : {}),
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadProviders();
        toast.success(t("authProviders.messages.providerAdded"));
      } else {
        toast.error(t("authProviders.messages.addFailed"));
      }
    } catch (error) {
      console.error("Error adding provider:", error);
      toast.error(t("authProviders.messages.addFailed"));
    } finally {
      setSaving(null);
    }
  };

  const editProvider = async (providerData: Partial<AuthProvider>) => {
    if (!editingProvider || !providerData.name || !providerData.displayName) {
      toast.error(t("authProviders.messages.fillRequiredFields"));
      return;
    }

    try {
      setSaving(editingProvider.id);
      const response = await fetch(`/api/auth/providers/manage/${editingProvider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...providerData,
          name: providerData.name?.toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadProviders();
        setEditingProvider(null);
        toast.success(t("authProviders.messages.providerUpdated"));
      } else {
        toast.error(t("authProviders.messages.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error(t("authProviders.messages.updateFailed"));
    } finally {
      setSaving(null);
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/auth/providers/manage/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setProviders((prev) => prev.filter((p) => p.id !== id));
        toast.success(t("authProviders.messages.providerDeleted"));
        setProviderToDelete(null);
      } else {
        toast.error(t("authProviders.messages.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error(t("authProviders.messages.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(providers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((provider, index) => ({
      ...provider,
      sortOrder: index + 1,
    }));
    setProviders(updatedItems);

    const updatedProviders = updatedItems.map((provider) => ({
      id: provider.id,
      sortOrder: provider.sortOrder,
    }));

    try {
      const response = await fetch("/api/auth/providers/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers: updatedProviders }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t("authProviders.messages.providerOrderUpdated"));
      } else {
        toast.error(t("authProviders.messages.orderUpdateFailed"));
        await loadProviders();
      }
    } catch (error) {
      console.error("Error updating provider order:", error);
      toast.error(t("authProviders.messages.orderUpdateFailed"));
      await loadProviders();
    }
  };

  const handleHideDisabledProvidersChange = (checked: boolean) => {
    setHideDisabledProviders(checked);
    localStorage.setItem("hideDisabledProviders", JSON.stringify(checked));
  };

  const handleEditProvider = (provider: AuthProvider) => {
    if (editingProvider?.id === provider.id) {
      setEditingProvider(null);
    } else {
      setEditingProvider(provider);
    }
  };

  const handleDeleteProvider = (provider: AuthProvider) => {
    setProviderToDelete({
      id: provider.id,
      name: provider.name,
      displayName: provider.displayName,
    });
  };

  const handleCancelEdit = () => {
    setEditingProvider(null);
    setEditingFormData({});
  };

  // Computed values
  const enabledCount = providers.filter((p) => p.enabled).length;
  const filteredProviders = hideDisabledProviders ? providers.filter((p) => p.enabled) : providers;

  return {
    // State
    providers,
    loading,
    saving,
    editingProvider,
    editingFormData,
    hideDisabledProviders,
    providerToDelete,
    isDeleting,

    // Computed
    enabledCount,
    filteredProviders,

    // Actions
    loadProviders,
    updateProvider,
    addProvider,
    editProvider,
    deleteProvider,
    handleDragEnd,
    handleHideDisabledProvidersChange,
    handleEditProvider,
    handleDeleteProvider,
    handleCancelEdit,

    // Setters
    setEditingFormData,
    setProviderToDelete,
  };
}
