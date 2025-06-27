"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { renderIconByName } from "@/components/ui/icon-picker";
import { useAppInfo } from "@/contexts/app-info-context";

interface AuthProvider {
  id: string;
  name: string;
  displayName: string;
  type: string;
  icon?: string;
  authUrl?: string;
}

export function MultiProviderButtons() {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const { firstAccess } = useAppInfo();

  useEffect(() => {
    if (firstAccess) {
      setLoading(false);
      return;
    }

    loadProviders();
  }, [firstAccess]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/providers");
      const data = await response.json();

      if (data.success) {
        setProviders(data.data || []);
      } else {
        console.error("Failed to load providers:", data.error);
      }
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = (provider: AuthProvider) => {
    if (!provider.authUrl) {
      toast.error(`${provider.displayName} is not properly configured`);
      return;
    }

    window.location.href = provider.authUrl;
  };

  if (firstAccess) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="w-full"
            onClick={() => handleProviderLogin(provider)}
            type="button"
          >
            <div className="flex items-center gap-2">
              {provider.icon && <span className="text-lg">{renderIconByName(provider.icon)}</span>}
              <span>Continue with {provider.displayName}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
