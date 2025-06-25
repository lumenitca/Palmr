"use client";

import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import {
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
} from "@tabler/icons-react";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
}

interface NewProvider {
  name: string;
  displayName: string;
  type: "oidc" | "oauth2";
  icon: string;
}

export function AuthProvidersSettings() {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AuthProvider | null>(null);
  const [editingFormData, setEditingFormData] = useState<Record<string, any>>({});
  const [newProvider, setNewProvider] = useState<NewProvider>({
    name: "",
    displayName: "",
    type: "oidc",
    icon: "",
  });

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
    if (!newProvider.name || !newProvider.displayName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving("new");
      const response = await fetch("/api/auth/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProvider,
          name: newProvider.name.toLowerCase().replace(/\s+/g, "-"),
          enabled: false,
          autoRegister: true,
          scope: newProvider.type === "oidc" ? "openid profile email" : "user:email",
          sortOrder: providers.length + 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadProviders();
        setNewProvider({ name: "", displayName: "", type: "oidc", icon: "" });
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

  const enabledCount = providers.filter((p) => p.enabled).length;

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
              <div className="text-sm text-muted-foreground">{providers.length} providers configured</div>
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
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <span>
                      <IconInfoCircle className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">Atenção</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao adicionar um novo provider, você deve testar seu funcionamento por conta própria. Considere usar
                    os oficiais para ter um funcionamento mais fluído. Caso não tenha sucesso, considere abrir uma issue
                    no{" "}
                    <a
                      href="https://github.com/kyantech/Palmr/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold"
                    >
                      GitHub.
                    </a>
                    .
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

            {/* Providers List - Compact with Drag and Drop */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Drag providers to reorder them. This order will be reflected on the login page.
                </p>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="providers">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {providers.map((provider, index) => (
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
            </div>

            {providers.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-muted-foreground">
                <IconSettings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No authentication providers configured</p>
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
}: ProviderRowProps) {
  const isEditing = editingProvider?.id === provider.id;

  return (
    <div className={`border rounded-lg ${isDragging ? "border-blue-300 bg-blue-50 dark:bg-blue-950/20" : ""}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            title="Drag to reorder"
          >
            <IconGripVertical className="h-4 w-4" />
          </div>

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
              {provider.isOfficial && <span className="text-blue-600 dark:text-blue-400"> • Optimized by Palmr.</span>}
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
  });

  const [showClientSecret, setShowClientSecret] = useState(false);
  const isOfficial = provider.isOfficial;

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

      {formData.type === "oidc" && (
        <div>
          <Label className="mb-2 block">Issuer URL *</Label>
          <Input
            placeholder="https://your-provider.com/.well-known/openid_configuration"
            value={formData.issuerUrl}
            onChange={(e) => updateFormData({ issuerUrl: e.target.value })}
          />
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
            ? "Common OIDC scopes: openid, profile, email, groups"
            : "Common OAuth2 scopes depend on the provider"}
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

      <div className="flex gap-2 justify-end">
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
