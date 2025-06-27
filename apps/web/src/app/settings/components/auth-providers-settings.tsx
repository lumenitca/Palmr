"use client";

import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconInfoCircle,
  IconPlus,
  IconSettings,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconPicker, renderIconByName } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TagsInput } from "@/components/ui/tags-input";

interface AuthProvider {
  id: string;
  name: string;
  displayName: string;
  type: string;
  icon?: string;
  enabled: boolean;
  issuerUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  autoRegister: boolean;
  adminEmailDomains?: string;
  sortOrder: number;
  isOfficial?: boolean;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
}

interface NewProvider {
  name: string;
  displayName: string;
  type: "oidc" | "oauth2";
  icon: string;
  clientId: string;
  clientSecret: string;
  issuerUrl: string;
  scope: string;
  // Endpoints customizados opcionais
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

export function AuthProvidersSettings() {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AuthProvider | null>(null);
  const [editingFormData, setEditingFormData] = useState<Record<string, any>>({});
  const [hideDisabledProviders, setHideDisabledProviders] = useState<boolean>(false);

  const [newProvider, setNewProvider] = useState<NewProvider>({
    name: "",
    displayName: "",
    type: "oidc",
    icon: "",
    clientId: "",
    clientSecret: "",
    issuerUrl: "",
    scope: "openid profile email",
    authorizationEndpoint: "",
    tokenEndpoint: "",
    userInfoEndpoint: "",
  });

  // Auto-sugestão de scopes baseada na Provider URL
  const detectProviderTypeAndSuggestScopes = (url: string): string[] => {
    if (!url) return [];

    const urlLower = url.toLowerCase();

    // Padrões conhecidos para detecção automática
    const providerPatterns = [
      { pattern: "frontegg.com", scopes: ["openid", "profile", "email"] },
      { pattern: "discord.com", scopes: ["identify", "email"] },
      { pattern: "github.com", scopes: ["read:user", "user:email"] },
      { pattern: "gitlab.com", scopes: ["read_user", "read_api"] },
      { pattern: "google.com", scopes: ["openid", "profile", "email"] },
      { pattern: "microsoft.com", scopes: ["openid", "profile", "email", "User.Read"] },
      { pattern: "facebook.com", scopes: ["public_profile", "email"] },
      { pattern: "twitter.com", scopes: ["tweet.read", "users.read"] },
      { pattern: "linkedin.com", scopes: ["r_liteprofile", "r_emailaddress"] },
      { pattern: "authentik", scopes: ["openid", "profile", "email"] },
      { pattern: "keycloak", scopes: ["openid", "profile", "email"] },
      { pattern: "auth0.com", scopes: ["openid", "profile", "email"] },
      { pattern: "okta.com", scopes: ["openid", "profile", "email"] },
      { pattern: "onelogin.com", scopes: ["openid", "profile", "email"] },
      { pattern: "pingidentity.com", scopes: ["openid", "profile", "email"] },
      { pattern: "azure.com", scopes: ["openid", "profile", "email", "User.Read"] },
      { pattern: "aws.amazon.com", scopes: ["openid", "profile", "email"] },
      { pattern: "slack.com", scopes: ["identity.basic", "identity.email", "identity.avatar"] },
      { pattern: "bitbucket.org", scopes: ["account", "repository"] },
      { pattern: "atlassian.com", scopes: ["read:jira-user", "read:jira-work"] },
      { pattern: "salesforce.com", scopes: ["api", "refresh_token"] },
      { pattern: "zendesk.com", scopes: ["read"] },
      { pattern: "shopify.com", scopes: ["read_products", "read_customers"] },
      { pattern: "stripe.com", scopes: ["read"] },
      { pattern: "twilio.com", scopes: ["read"] },
      { pattern: "sendgrid.com", scopes: ["mail.send"] },
      { pattern: "mailchimp.com", scopes: ["read"] },
      { pattern: "hubspot.com", scopes: ["contacts", "crm.objects.contacts.read"] },
      { pattern: "zoom.us", scopes: ["user:read:admin"] },
      { pattern: "teams.microsoft.com", scopes: ["openid", "profile", "email", "User.Read"] },
      { pattern: "notion.so", scopes: ["read"] },
      { pattern: "figma.com", scopes: ["files:read"] },
      { pattern: "dropbox.com", scopes: ["files.content.read"] },
      { pattern: "box.com", scopes: ["root_readwrite"] },
      { pattern: "trello.com", scopes: ["read"] },
      { pattern: "asana.com", scopes: ["default"] },
      { pattern: "monday.com", scopes: ["read"] },
      { pattern: "clickup.com", scopes: ["read"] },
      { pattern: "linear.app", scopes: ["read"] },
    ];

    // Procura por padrões conhecidos
    for (const { pattern, scopes } of providerPatterns) {
      if (urlLower.includes(pattern)) {
        return scopes;
      }
    }

    // Fallback baseado no tipo do provider
    if (newProvider.type === "oidc") {
      return ["openid", "profile", "email"];
    } else {
      return ["profile", "email"];
    }
  };

  // Função para auto-sugerir scopes baseado na Provider URL (onBlur)
  const updateProviderUrl = (url: string) => {
    if (!url.trim()) return;

    const suggestedScopes = detectProviderTypeAndSuggestScopes(url);

    setNewProvider((prev) => {
      const shouldUpdateScopes = !prev.scope || prev.scope === "openid profile email" || prev.scope === "profile email";

      return {
        ...prev,
        scope: shouldUpdateScopes ? suggestedScopes.join(" ") : prev.scope,
      };
    });
  };

  // Load hide disabled providers state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("hideDisabledProviders");
    if (savedState !== null) {
      setHideDisabledProviders(JSON.parse(savedState));
    }
  }, []);

  // Load providers
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
        toast.error("Failed to load providers");
      }
    } catch (error) {
      console.error("Error loading providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  // Update provider
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
        toast.success("Provider updated");
      } else {
        toast.error("Failed to update provider");
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error("Failed to update provider");
    } finally {
      setSaving(null);
    }
  };

  // Delete provider
  const deleteProvider = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" provider? This cannot be undone.`)) return;

    try {
      setSaving(id);
      const response = await fetch(`/api/auth/providers/manage/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setProviders((prev) => prev.filter((p) => p.id !== id));
        toast.success("Provider deleted");
      } else {
        toast.error("Failed to delete provider");
      }
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error("Failed to delete provider");
    } finally {
      setSaving(null);
    }
  };

  // Add new provider
  const addProvider = async () => {
    if (!newProvider.name || !newProvider.displayName || !newProvider.clientId || !newProvider.clientSecret) {
      toast.error("Please fill in all required fields (name, display name, client ID, client secret)");
      return;
    }

    // Validação de configuração
    const hasIssuerUrl = !!newProvider.issuerUrl;
    const hasAllCustomEndpoints = !!(
      newProvider.authorizationEndpoint &&
      newProvider.tokenEndpoint &&
      newProvider.userInfoEndpoint
    );

    if (!hasIssuerUrl && !hasAllCustomEndpoints) {
      toast.error("Either provide a Provider URL for automatic discovery OR all three custom endpoints");
      return;
    }

    if (hasIssuerUrl && hasAllCustomEndpoints) {
      toast.error("Choose either automatic discovery (Provider URL) OR manual endpoints, not both");
      return;
    }

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
          // Incluir apenas campos relevantes baseado no modo
          ...(newProvider.issuerUrl ? { issuerUrl: newProvider.issuerUrl } : {}),
          ...(newProvider.authorizationEndpoint ? { authorizationEndpoint: newProvider.authorizationEndpoint } : {}),
          ...(newProvider.tokenEndpoint ? { tokenEndpoint: newProvider.tokenEndpoint } : {}),
          ...(newProvider.userInfoEndpoint ? { userInfoEndpoint: newProvider.userInfoEndpoint } : {}),
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadProviders();
        setNewProvider({
          name: "",
          displayName: "",
          type: "oidc",
          icon: "",
          clientId: "",
          clientSecret: "",
          issuerUrl: "",
          scope: "openid profile email",
          authorizationEndpoint: "",
          tokenEndpoint: "",
          userInfoEndpoint: "",
        });
        setShowAddForm(false);
        toast.success("Provider added");
      } else {
        toast.error("Failed to add provider");
      }
    } catch (error) {
      console.error("Error adding provider:", error);
      toast.error("Failed to add provider");
    } finally {
      setSaving(null);
    }
  };

  // Edit provider
  const editProvider = async (providerData: Partial<AuthProvider>) => {
    if (!editingProvider || !providerData.name || !providerData.displayName) {
      toast.error("Please fill in all required fields");
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
        toast.success("Provider updated");
      } else {
        toast.error("Failed to update provider");
      }
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error("Failed to update provider");
    } finally {
      setSaving(null);
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(providers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    const updatedItems = items.map((provider, index) => ({
      ...provider,
      sortOrder: index + 1,
    }));
    setProviders(updatedItems);

    // Update sortOrder values for API
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
        toast.success("Provider order updated");
        // No need to reload - state is already updated locally
      } else {
        toast.error("Failed to update provider order");
        // Revert local state on error
        await loadProviders();
      }
    } catch (error) {
      console.error("Error updating provider order:", error);
      toast.error("Failed to update provider order");
      // Revert local state on error
      await loadProviders();
    }
  };

  const getProviderIcon = (provider: AuthProvider) => {
    // Use the icon saved in the database, fallback to FaCog if not set
    const iconName = provider.icon || "FaCog";
    return renderIconByName(iconName, "w-5 h-5");
  };

  const handleHideDisabledProvidersChange = (checked: boolean) => {
    setHideDisabledProviders(checked);
    localStorage.setItem("hideDisabledProviders", JSON.stringify(checked));
  };

  const enabledCount = providers.filter((p) => p.enabled).length;
  const filteredProviders = hideDisabledProviders ? providers.filter((p) => p.enabled) : providers;

  return (
    <Card className="p-6 gap-0">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer p-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex flex-row items-center gap-8">
          <Globe className="text-xl text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Authentication Providers</h2>
            <p className="text-sm text-muted-foreground">
              Configure external authentication providers for SSO
              {enabledCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {enabledCount} enabled
                </Badge>
              )}
            </p>
          </div>
        </div>
        {isCollapsed ? (
          <IconChevronDown className="text-muted-foreground" />
        ) : (
          <IconChevronUp className="text-muted-foreground" />
        )}
      </CardHeader>

      <CardContent className={`${isCollapsed ? "hidden" : "block"} px-0`}>
        <Separator className="my-6" />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <IconSettings className="h-6 w-6 animate-spin mr-2" />
            Loading providers...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add Provider Button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {hideDisabledProviders
                  ? `${filteredProviders.length} enabled of ${providers.length} providers`
                  : `${providers.length} providers configured`}
              </div>
              <Button
                onClick={() => {
                  if (editingProvider) {
                    setEditingProvider(null);
                  }
                  setShowAddForm(!showAddForm);
                }}
                variant="outline"
                size="sm"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>

            {/* Add Provider Form */}
            {showAddForm && (
              <div className="border border-dashed rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground dark:text-foreground">Add Provider</h3>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <span>
                      <IconInfoCircle className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">Informação</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para melhor funcionamento, considere usar os providers oficiais. Caso tenha problemas com um
                    provider customizado, considere abrir uma issue no{" "}
                    <a
                      href="https://github.com/kyantech/Palmr/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold"
                    >
                      GitHub.
                    </a>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Provider Name *</Label>
                    <Input
                      placeholder="e.g., mycompany"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Display Name *</Label>
                    <Input
                      placeholder="e.g., My Company SSO"
                      value={newProvider.displayName}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Type</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background dark:bg-background px-3 py-2 text-sm text-foreground dark:text-foreground"
                      value={newProvider.type}
                      onChange={(e) =>
                        setNewProvider((prev) => ({ ...prev, type: e.target.value as "oidc" | "oauth2" }))
                      }
                    >
                      <option value="oidc">OIDC (OpenID Connect)</option>
                      <option value="oauth2">OAuth 2.0</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Icon</Label>
                    <IconPicker
                      value={newProvider.icon}
                      onChange={(icon) => setNewProvider((prev) => ({ ...prev, icon }))}
                      placeholder="Select an icon"
                    />
                  </div>
                </div>

                {/* Configuration Method Toggle */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Configuration Method</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="add-auto-discovery"
                          name="addConfigMethod"
                          checked={
                            !newProvider.authorizationEndpoint &&
                            !newProvider.tokenEndpoint &&
                            !newProvider.userInfoEndpoint
                          }
                          onChange={() =>
                            setNewProvider((prev) => ({
                              ...prev,
                              authorizationEndpoint: "",
                              tokenEndpoint: "",
                              userInfoEndpoint: "",
                            }))
                          }
                          className="w-4 h-4"
                        />
                        <label htmlFor="add-auto-discovery" className="text-sm">
                          <span className="font-medium">Automatic Discovery</span>
                          <span className="text-muted-foreground ml-2">(Just provide Provider URL)</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="add-manual-endpoints"
                          name="addConfigMethod"
                          checked={
                            !!(
                              newProvider.authorizationEndpoint ||
                              newProvider.tokenEndpoint ||
                              newProvider.userInfoEndpoint
                            )
                          }
                          onChange={() => {
                            if (
                              !newProvider.authorizationEndpoint &&
                              !newProvider.tokenEndpoint &&
                              !newProvider.userInfoEndpoint
                            ) {
                              setNewProvider((prev) => ({
                                ...prev,
                                authorizationEndpoint: "/oauth/authorize",
                                tokenEndpoint: "/oauth/token",
                                userInfoEndpoint: "/oauth/userinfo",
                                issuerUrl: "",
                              }));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor="add-manual-endpoints" className="text-sm">
                          <span className="font-medium">Manual Endpoints</span>
                          <span className="text-muted-foreground ml-2">
                            (Recommended - For providers that don't support discovery)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Automatic Discovery Mode */}
                  {!newProvider.authorizationEndpoint &&
                    !newProvider.tokenEndpoint &&
                    !newProvider.userInfoEndpoint && (
                      <div>
                        <Label className="mb-2 block">Provider URL *</Label>
                        <Input
                          placeholder="https://your-provider.com (endpoints will be discovered automatically)"
                          value={newProvider.issuerUrl}
                          onChange={(e) => setNewProvider((prev) => ({ ...prev, issuerUrl: e.target.value }))}
                          onBlur={(e) => updateProviderUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          The system will automatically discover authorization, token, and userinfo endpoints
                        </p>
                      </div>
                    )}

                  {/* Manual Endpoints Mode */}
                  {(newProvider.authorizationEndpoint || newProvider.tokenEndpoint || newProvider.userInfoEndpoint) && (
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Provider URL *</Label>
                        <Input
                          placeholder="https://your-provider.com"
                          value={newProvider.issuerUrl}
                          onChange={(e) => setNewProvider((prev) => ({ ...prev, issuerUrl: e.target.value }))}
                          onBlur={(e) => updateProviderUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Base URL of your provider (endpoints will be relative to this)
                        </p>
                      </div>
                      <div>
                        <Label className="mb-2 block">Authorization Endpoint *</Label>
                        <Input
                          placeholder="/oauth/authorize"
                          value={newProvider.authorizationEndpoint}
                          onChange={(e) =>
                            setNewProvider((prev) => ({ ...prev, authorizationEndpoint: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Token Endpoint *</Label>
                        <Input
                          placeholder="/oauth/token"
                          value={newProvider.tokenEndpoint}
                          onChange={(e) => setNewProvider((prev) => ({ ...prev, tokenEndpoint: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">User Info Endpoint *</Label>
                        <Input
                          placeholder="/oauth/userinfo"
                          value={newProvider.userInfoEndpoint}
                          onChange={(e) => setNewProvider((prev) => ({ ...prev, userInfoEndpoint: e.target.value }))}
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                          <IconInfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-medium">Manual Configuration</p>
                            <p className="mt-1">
                              You're providing all endpoints manually. Make sure they're correct for your provider.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Client Credentials */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Client ID *</Label>
                    <Input
                      placeholder="Your OAuth client ID"
                      value={newProvider.clientId}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, clientId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Client Secret *</Label>
                    <Input
                      type="password"
                      placeholder="Your OAuth client secret"
                      value={newProvider.clientSecret}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, clientSecret: e.target.value }))}
                    />
                  </div>
                </div>

                {/* OAuth Scopes */}
                <div>
                  <Label className="mb-2 block">OAuth Scopes</Label>
                  <TagsInput
                    value={newProvider.scope ? newProvider.scope.split(/[,\s]+/).filter(Boolean) : []}
                    onChange={(tags) => setNewProvider((prev) => ({ ...prev, scope: tags.join(" ") }))}
                    placeholder="Enter scopes (e.g., openid, profile, email)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newProvider.type === "oidc"
                      ? "Scopes auto-suggested based on Provider URL. Common OIDC scopes: openid, profile, email, groups"
                      : "Scopes auto-suggested based on Provider URL. Common OAuth2 scopes depend on the provider"}
                  </p>
                </div>

                {/* Show callback URL if provider name is filled */}
                {newProvider.name && (
                  <div className="pt-2">
                    <CallbackUrlDisplay providerName={newProvider.name} />
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddForm(false)} size="sm">
                    Cancel
                  </Button>
                  <Button onClick={addProvider} disabled={saving === "new"} size="sm">
                    {saving === "new" ? "Adding..." : "Add Provider"}
                  </Button>
                </div>
              </div>
            )}

            {/* Hide Disabled Providers Checkbox */}
            {providers.length > 0 && (
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="hideDisabledProviders"
                  checked={hideDisabledProviders}
                  onCheckedChange={handleHideDisabledProvidersChange}
                />
                <Label htmlFor="hideDisabledProviders" className="text-sm cursor-pointer">
                  Hide disabled providers
                </Label>
              </div>
            )}

            {/* Providers List - Compact with Drag and Drop */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {hideDisabledProviders
                    ? "Drag and drop is disabled when filtering providers. Show all providers to reorder them."
                    : "Drag providers to reorder them. This order will be reflected on the login page."}
                </p>
              </div>

              {!hideDisabledProviders ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="providers">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {filteredProviders.map((provider, index) => (
                          <Draggable key={provider.id} draggableId={provider.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`transition-all ${snapshot.isDragging ? "shadow-lg scale-105" : ""}`}
                              >
                                <ProviderRow
                                  provider={provider}
                                  onUpdate={(updates) => updateProvider(provider.id, updates)}
                                  onEdit={() => {
                                    if (showAddForm) {
                                      setShowAddForm(false);
                                    }
                                    if (editingProvider?.id === provider.id) {
                                      setEditingProvider(null);
                                    } else {
                                      setEditingProvider(provider);
                                    }
                                  }}
                                  onDelete={() => deleteProvider(provider.id, provider.displayName)}
                                  saving={saving === provider.id}
                                  getIcon={getProviderIcon}
                                  editingProvider={editingProvider}
                                  editProvider={editProvider}
                                  onCancelEdit={() => {
                                    setEditingProvider(null);
                                    setEditingFormData({});
                                  }}
                                  editingFormData={editingFormData}
                                  setEditingFormData={setEditingFormData}
                                  dragHandleProps={provided.dragHandleProps}
                                  isDragging={snapshot.isDragging}
                                  isDragDisabled={false}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="space-y-2">
                  {filteredProviders.map((provider) => (
                    <ProviderRow
                      key={provider.id}
                      provider={provider}
                      onUpdate={(updates) => updateProvider(provider.id, updates)}
                      onEdit={() => {
                        if (showAddForm) {
                          setShowAddForm(false);
                        }
                        if (editingProvider?.id === provider.id) {
                          setEditingProvider(null);
                        } else {
                          setEditingProvider(provider);
                        }
                      }}
                      onDelete={() => deleteProvider(provider.id, provider.displayName)}
                      saving={saving === provider.id}
                      getIcon={getProviderIcon}
                      editingProvider={editingProvider}
                      editProvider={editProvider}
                      onCancelEdit={() => {
                        setEditingProvider(null);
                        setEditingFormData({});
                      }}
                      editingFormData={editingFormData}
                      setEditingFormData={setEditingFormData}
                      dragHandleProps={null}
                      isDragging={false}
                      isDragDisabled={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {filteredProviders.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-muted-foreground">
                <IconSettings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {hideDisabledProviders
                    ? "No enabled authentication providers"
                    : "No authentication providers configured"}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact provider row component
interface ProviderRowProps {
  provider: AuthProvider;
  onUpdate: (updates: Partial<AuthProvider>) => void;
  onEdit: () => void;
  onDelete: () => void;
  saving: boolean;
  getIcon: (provider: AuthProvider) => React.ReactNode;
  editingProvider: AuthProvider | null;
  editProvider: (data: Partial<AuthProvider>) => void;
  onCancelEdit: () => void;
  editingFormData: Record<string, any>;
  setEditingFormData: (data: Record<string, any>) => void;
  dragHandleProps: any;
  isDragging: boolean;
  isDragDisabled: boolean;
}

function ProviderRow({
  provider,
  onUpdate,
  onEdit,
  onDelete,
  saving,
  getIcon,
  editingProvider,
  editProvider,
  onCancelEdit,
  editingFormData,
  setEditingFormData,
  dragHandleProps,
  isDragging,
  isDragDisabled,
}: ProviderRowProps) {
  const isEditing = editingProvider?.id === provider.id;

  return (
    <div className={`border rounded-lg ${isDragging ? "border-blue-300 bg-blue-50 dark:bg-blue-950/20" : ""}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          {!isDragDisabled ? (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              title="Drag to reorder"
            >
              <IconGripVertical className="h-4 w-4" />
            </div>
          ) : null}

          <span className="text-lg">{getIcon(provider)}</span>
          <div>
            <div className="flex items-center gap-2">
              {/* Status dot */}
              <div
                className={`w-2 h-2 rounded-full ${provider.enabled ? "bg-green-500" : "bg-gray-400"}`}
                title={provider.enabled ? "Enabled" : "Disabled"}
              />
              <span className="font-medium text-sm">{provider.displayName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {provider.type.toUpperCase()} • {provider.name}
              {provider.isOfficial && <span className="text-blue-600 dark:text-blue-400"> • Official Provider</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={provider.enabled} onCheckedChange={(enabled) => onUpdate({ enabled })} disabled={saving} />
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={saving} title="Editar provider">
            <IconEdit className="h-3 w-3" />
          </Button>
          {!provider.isOfficial && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={saving}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Excluir provider"
            >
              <IconTrash className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Edit Form - Shows right below this provider when editing */}
      {isEditing && (
        <div className="border-t border-border dark:border-border p-4 space-y-4 bg-muted/50 dark:bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground dark:text-foreground">
              Editar Provider: {provider.displayName}
            </h3>
          </div>
          <EditProviderForm
            key={provider.id}
            provider={provider}
            onSave={editProvider}
            onCancel={onCancelEdit}
            saving={saving}
            editingFormData={editingFormData}
            setEditingFormData={setEditingFormData}
          />
        </div>
      )}
    </div>
  );
}

// Edit Provider Form Component
interface EditProviderFormProps {
  provider: AuthProvider;
  onSave: (data: Partial<AuthProvider>) => void;
  onCancel: () => void;
  saving: boolean;
  editingFormData: Record<string, any>;
  setEditingFormData: (data: Record<string, any>) => void;
}

function EditProviderForm({
  provider,
  onSave,
  onCancel,
  saving,
  editingFormData,
  setEditingFormData,
}: EditProviderFormProps) {
  // Usar dados preservados se existirem, senão usar dados do provider
  const savedData = editingFormData[provider.id] || {};
  const [formData, setFormData] = useState({
    name: savedData.name || provider.name || "",
    displayName: savedData.displayName || provider.displayName || "",
    type: (savedData.type || provider.type) as "oidc" | "oauth2",
    icon: savedData.icon || provider.icon || "FaCog",
    issuerUrl: savedData.issuerUrl || provider.issuerUrl || "",
    clientId: savedData.clientId || provider.clientId || "",
    clientSecret: savedData.clientSecret || provider.clientSecret || "",
    scope: savedData.scope || provider.scope || "",
    autoRegister: savedData.autoRegister !== undefined ? savedData.autoRegister : provider.autoRegister,
    adminEmailDomains: savedData.adminEmailDomains || provider.adminEmailDomains || "",
    authorizationEndpoint: savedData.authorizationEndpoint || provider.authorizationEndpoint || "",
    tokenEndpoint: savedData.tokenEndpoint || provider.tokenEndpoint || "",
    userInfoEndpoint: savedData.userInfoEndpoint || provider.userInfoEndpoint || "",
  });

  const [showClientSecret, setShowClientSecret] = useState(false);
  const isOfficial = provider.isOfficial;

  // Auto-sugestão de scopes para formulário de edição
  const detectProviderTypeAndSuggestScopesEdit = (url: string, currentType: string): string[] => {
    if (!url) return [];

    const urlLower = url.toLowerCase();

    // Mesmos padrões do formulário de adição
    const providerPatterns = [
      { pattern: "frontegg.com", scopes: ["openid", "profile", "email"] },
      { pattern: "discord.com", scopes: ["identify", "email"] },
      { pattern: "github.com", scopes: ["read:user", "user:email"] },
      { pattern: "gitlab.com", scopes: ["read_user", "read_api"] },
      { pattern: "google.com", scopes: ["openid", "profile", "email"] },
      { pattern: "microsoft.com", scopes: ["openid", "profile", "email", "User.Read"] },
      { pattern: "facebook.com", scopes: ["public_profile", "email"] },
      { pattern: "twitter.com", scopes: ["tweet.read", "users.read"] },
      { pattern: "linkedin.com", scopes: ["r_liteprofile", "r_emailaddress"] },
      { pattern: "authentik", scopes: ["openid", "profile", "email"] },
      { pattern: "keycloak", scopes: ["openid", "profile", "email"] },
      { pattern: "auth0.com", scopes: ["openid", "profile", "email"] },
      { pattern: "okta.com", scopes: ["openid", "profile", "email"] },
      { pattern: "onelogin.com", scopes: ["openid", "profile", "email"] },
      { pattern: "pingidentity.com", scopes: ["openid", "profile", "email"] },
      { pattern: "azure.com", scopes: ["openid", "profile", "email", "User.Read"] },
      { pattern: "aws.amazon.com", scopes: ["openid", "profile", "email"] },
      { pattern: "slack.com", scopes: ["identity.basic", "identity.email", "identity.avatar"] },
      { pattern: "bitbucket.org", scopes: ["account", "repository"] },
      { pattern: "atlassian.com", scopes: ["read:jira-user", "read:jira-work"] },
      { pattern: "salesforce.com", scopes: ["api", "refresh_token"] },
      { pattern: "zendesk.com", scopes: ["read"] },
      { pattern: "shopify.com", scopes: ["read_products", "read_customers"] },
      { pattern: "stripe.com", scopes: ["read"] },
      { pattern: "twilio.com", scopes: ["read"] },
      { pattern: "sendgrid.com", scopes: ["mail.send"] },
      { pattern: "mailchimp.com", scopes: ["read"] },
      { pattern: "hubspot.com", scopes: ["contacts", "crm.objects.contacts.read"] },
      { pattern: "zoom.us", scopes: ["user:read:admin"] },
      { pattern: "teams.microsoft.com", scopes: ["openid", "profile", "email", "User.Read"] },
      { pattern: "notion.so", scopes: ["read"] },
      { pattern: "figma.com", scopes: ["files:read"] },
      { pattern: "dropbox.com", scopes: ["files.content.read"] },
      { pattern: "box.com", scopes: ["root_readwrite"] },
      { pattern: "trello.com", scopes: ["read"] },
      { pattern: "asana.com", scopes: ["default"] },
      { pattern: "monday.com", scopes: ["read"] },
      { pattern: "clickup.com", scopes: ["read"] },
      { pattern: "linear.app", scopes: ["read"] },
    ];

    // Procura por padrões conhecidos
    for (const { pattern, scopes } of providerPatterns) {
      if (urlLower.includes(pattern)) {
        return scopes;
      }
    }

    // Fallback baseado no tipo do provider
    if (currentType === "oidc") {
      return ["openid", "profile", "email"];
    } else {
      return ["profile", "email"];
    }
  };

  // Função para auto-sugerir scopes baseado na Provider URL no formulário de edição (onBlur)
  const updateProviderUrlEdit = (url: string) => {
    if (!url.trim()) return;

    if (isOfficial) {
      // Para providers oficiais, não faz auto-sugestão de scopes
      return;
    }

    const suggestedScopes = detectProviderTypeAndSuggestScopesEdit(url, formData.type);
    const shouldUpdateScopes =
      !formData.scope || formData.scope === "openid profile email" || formData.scope === "profile email";

    // Só atualiza scopes, não a URL (já foi atualizada pelo onChange)
    if (shouldUpdateScopes) {
      updateFormData({
        scope: suggestedScopes.join(" "),
      });
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);

    setEditingFormData({
      ...editingFormData,
      [provider.id]: newFormData,
    });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      {isOfficial && (
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <span>
              <IconInfoCircle className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Official Provider</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            This provider is optimized by Palmr. Only credentials and configuration can be modified.
          </p>
        </div>
      )}
      {/* Callback URL Display */}
      <CallbackUrlDisplay providerName={formData.name || "provider"} />

      {/* Only show basic fields for non-official providers */}
      {!isOfficial && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Provider Name *</Label>
            <Input
              placeholder="e.g., mycompany"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2 block">Display Name *</Label>
            <Input
              placeholder="e.g., My Company SSO"
              value={formData.displayName}
              onChange={(e) => updateFormData({ displayName: e.target.value })}
            />
          </div>
        </div>
      )}

      {!isOfficial && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Type</Label>
            <select
              className="w-full rounded-md border border-input bg-background dark:bg-background px-3 py-2 text-sm text-foreground dark:text-foreground"
              value={formData.type}
              onChange={(e) => updateFormData({ type: e.target.value as "oidc" | "oauth2" })}
            >
              <option value="oidc">OIDC (OpenID Connect)</option>
              <option value="oauth2">OAuth 2.0</option>
            </select>
          </div>
          <div>
            <Label className="mb-2 block">Icon</Label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => updateFormData({ icon })}
              placeholder="Select an icon"
            />
          </div>
        </div>
      )}

      {/* Configuration - Only for custom providers */}
      {!isOfficial && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Configuration Method</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="auto-discovery"
                  name="configMethod"
                  checked={!formData.authorizationEndpoint && !formData.tokenEndpoint && !formData.userInfoEndpoint}
                  onChange={() =>
                    updateFormData({
                      authorizationEndpoint: "",
                      tokenEndpoint: "",
                      userInfoEndpoint: "",
                    })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="auto-discovery" className="text-sm">
                  <span className="font-medium">Automatic Discovery</span>
                  <span className="text-muted-foreground ml-2">(Just provide Provider URL)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="manual-endpoints"
                  name="configMethod"
                  checked={!!(formData.authorizationEndpoint || formData.tokenEndpoint || formData.userInfoEndpoint)}
                  onChange={() => {
                    if (!formData.authorizationEndpoint && !formData.tokenEndpoint && !formData.userInfoEndpoint) {
                      updateFormData({
                        authorizationEndpoint: "/oauth/authorize",
                        tokenEndpoint: "/oauth/token",
                        userInfoEndpoint: "/oauth/userinfo",
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="manual-endpoints" className="text-sm">
                  <span className="font-medium">Manual Endpoints</span>
                  <span className="text-muted-foreground ml-2">
                    (Recommended - For providers that don't support discovery)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Automatic Discovery Mode */}
          {!formData.authorizationEndpoint && !formData.tokenEndpoint && !formData.userInfoEndpoint && (
            <div>
              <Label className="mb-2 block">Provider URL *</Label>
              <Input
                placeholder="https://your-provider.com (endpoints will be discovered automatically)"
                value={formData.issuerUrl}
                onChange={(e) => updateFormData({ issuerUrl: e.target.value })}
                onBlur={(e) => updateProviderUrlEdit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The system will automatically discover authorization, token, and userinfo endpoints
              </p>
            </div>
          )}

          {/* Manual Endpoints Mode */}
          {(formData.authorizationEndpoint || formData.tokenEndpoint || formData.userInfoEndpoint) && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Provider URL *</Label>
                <Input
                  placeholder="https://your-provider.com"
                  value={formData.issuerUrl}
                  onChange={(e) => updateFormData({ issuerUrl: e.target.value })}
                  onBlur={(e) => updateProviderUrlEdit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Base URL of your provider (endpoints will be relative to this)
                </p>
              </div>
              <div>
                <Label className="mb-2 block">Authorization Endpoint *</Label>
                <Input
                  placeholder="/oauth/authorize"
                  value={formData.authorizationEndpoint}
                  onChange={(e) => updateFormData({ authorizationEndpoint: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2 block">Token Endpoint *</Label>
                <Input
                  placeholder="/oauth/token"
                  value={formData.tokenEndpoint}
                  onChange={(e) => updateFormData({ tokenEndpoint: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2 block">User Info Endpoint *</Label>
                <Input
                  placeholder="/oauth/userinfo"
                  value={formData.userInfoEndpoint}
                  onChange={(e) => updateFormData({ userInfoEndpoint: e.target.value })}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                  <IconInfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium">Manual Configuration</p>
                    <p className="mt-1">
                      You're providing all endpoints manually. Make sure they're correct for your provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Provider - Only Provider URL and Icon */}
      {isOfficial && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Provider URL *</Label>
            <Input
              placeholder={`Replace placeholder with your ${provider.displayName} URL`}
              value={formData.issuerUrl}
              onChange={(e) => updateFormData({ issuerUrl: e.target.value })}
              onBlur={(e) => updateProviderUrlEdit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This is an official provider. Endpoints are pre-configured. You can edit just this URL.
            </p>
          </div>
          <div>
            <Label className="mb-2 block">Icon</Label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => updateFormData({ icon })}
              placeholder="Select an icon"
            />
            <p className="text-xs text-muted-foreground mt-1">You can customize the icon for this official provider.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Client ID *</Label>
          <Input
            placeholder="Your OAuth client ID"
            value={formData.clientId}
            onChange={(e) => updateFormData({ clientId: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-2 block">Client Secret *</Label>
          <div className="relative">
            <Input
              type={showClientSecret ? "text" : "password"}
              placeholder="Your OAuth client secret"
              value={formData.clientSecret}
              onChange={(e) => updateFormData({ clientSecret: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowClientSecret(!showClientSecret)}
            >
              {showClientSecret ? (
                <IconEyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <IconEye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">OAuth Scopes</Label>
        <TagsInput
          value={formData.scope ? formData.scope.split(/[,\s]+/).filter(Boolean) : []}
          onChange={(tags) => updateFormData({ scope: tags.join(" ") })}
          placeholder="Enter scopes (e.g., openid, profile, email)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.type === "oidc"
            ? "Scopes auto-suggested based on Provider URL. Common OIDC scopes: openid, profile, email, groups"
            : "Scopes auto-suggested based on Provider URL. Common OAuth2 scopes depend on the provider"}
        </p>
      </div>

      <div>
        <Label className="mb-2 block">Admin Email Domains</Label>
        <TagsInput
          value={formData.adminEmailDomains ? formData.adminEmailDomains.split(",").filter(Boolean) : []}
          onChange={(tags) => updateFormData({ adminEmailDomains: tags.join(",") })}
          placeholder="Enter domains (e.g., admin.company.com)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Users with emails from these domains will be granted admin privileges
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.autoRegister}
          onCheckedChange={(checked) => updateFormData({ autoRegister: checked })}
        />
        <Label className="cursor-pointer">Auto-register new users</Label>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving} size="sm">
          {saving ? "Salvando..." : "Salvar Provider"}
        </Button>
      </div>
    </div>
  );
}

// Callback URL Display Component
interface CallbackUrlDisplayProps {
  providerName: string;
}

function CallbackUrlDisplay({ providerName }: CallbackUrlDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Usar a URL atual da página
  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth/providers/${providerName}/callback`
      : `/api/auth/providers/${providerName}/callback`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium text-foreground">Callback URL / Redirect URI </Label>
        <div className="flex items-center gap-2 mb-2 border py-2 px-3 mt-2 rounded-md w-fit ">
          <div className=" rounded-md font-mono text-sm break-all font-semibold px-2">{callbackUrl}</div>
          <Button variant="ghost" size="icon" onClick={copyToClipboard} className="shrink-0" title="Copiar URL">
            {copied ? <IconCheck className="h-3 w-3" /> : <IconCopy className="h-3 w-3" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">Use esta URL na configuração do seu provedor OAuth2/OIDC</p>
      </div>
    </div>
  );
}
