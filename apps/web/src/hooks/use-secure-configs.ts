"use client";

import { useEffect, useState } from "react";

import { getAdminConfigs, getSecureConfigs, getSecureConfigValue } from "@/lib/actions/config";

interface Config {
  key: string;
  value: string;
  type: string;
  group: string;
  updatedAt: string;
}

/**
 * Hook para buscar configurações de forma segura
 * Substitui o uso direto de getAllConfigs que expunha dados sensíveis
 */
export function useSecureConfigs() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSecureConfigs();
      setConfigs(data.configs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error loading secure configs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return {
    configs,
    isLoading,
    error,
    reload: loadConfigs,
  };
}

/**
 * Hook para buscar configurações para administradores
 * REQUER PERMISSÕES DE ADMIN - retorna erro se usuário não for admin
 */
export function useAdminConfigs() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsUnauthorized(false);

      const data = await getAdminConfigs();
      setConfigs(data.configs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("Unauthorized") || errorMessage.includes("Admin access required")) {
        setIsUnauthorized(true);
        setError("Access denied: Administrator privileges required");
      } else {
        setError(errorMessage);
      }

      console.error("Error loading admin configs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return {
    configs,
    isLoading,
    error,
    isUnauthorized,
    reload: loadConfigs,
  };
}

/**
 * Hook para buscar um valor específico de configuração
 * Útil quando você só precisa de um valor específico (ex: smtpEnabled)
 */
export function useSecureConfigValue(key: string) {
  const [value, setValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigValue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const configValue = await getSecureConfigValue(key);
      setValue(configValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error(`Error loading config value for ${key}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigValue();
  }, [key]);

  return {
    value,
    isLoading,
    error,
    reload: loadConfigValue,
  };
}
