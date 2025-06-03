"use server";

import { cookies } from "next/headers";

const SENSITIVE_KEYS = [
  "smtpPass",
  "smtpUser",
  "oidcClientSecret",
  "oidcIssuerUrl",
  "oidcClientId",
  "oidcRedirectUri",
  "serverUrl",
];

const BLACKLISTED_KEYS = ["smtpPass", "oidcClientSecret"];

interface Config {
  key: string;
  value: string;
  type: string;
  group: string;
  updatedAt: string;
}

interface ConfigsResponse {
  configs: Config[];
}

interface UserResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    isAdmin: boolean;
    isActive: boolean;
  };
}

/**
 * Validates if the current user is an administrator
 * @returns true se for admin, false caso contrário
 */
async function validateAdminAccess(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const apiRes = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader || "",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      return false;
    }

    const data: UserResponse = await apiRes.json();
    return data.user?.isAdmin === true;
  } catch (error) {
    console.error("Error validating admin access:", error);
    return false;
  }
}

/**
 * Fetches secure configurations, filtering sensitive data
 * This server action replaces the direct call to getAllConfigs
 */
export async function getSecureConfigs(): Promise<ConfigsResponse> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const apiRes = await fetch(`${process.env.API_BASE_URL}/app/configs`, {
      method: "GET",
      headers: {
        cookie: cookieHeader || "",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      throw new Error(`API request failed with status ${apiRes.status}`);
    }

    const data: ConfigsResponse = await apiRes.json();

    const filteredConfigs = data.configs
      .filter((config) => !BLACKLISTED_KEYS.includes(config.key))
      .map((config) => {
        if (SENSITIVE_KEYS.includes(config.key)) {
          return {
            ...config,
            value: config.value ? "***HIDDEN***" : config.value,
          };
        }
        return config;
      });

    return {
      configs: filteredConfigs,
    };
  } catch (error) {
    console.error("Error fetching secure configs:", error);
    throw new Error("Failed to fetch configurations");
  }
}

/**
 * Fetches admin configurations, requires admin access
 */
export async function getAdminConfigs(): Promise<ConfigsResponse> {
  try {
    const isAdmin = await validateAdminAccess();
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const apiRes = await fetch(`${process.env.API_BASE_URL}/app/configs`, {
      method: "GET",
      headers: {
        cookie: cookieHeader || "",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      throw new Error(`API request failed with status ${apiRes.status}`);
    }

    const data: ConfigsResponse = await apiRes.json();

    return data;
  } catch (error) {
    console.error("Error fetching admin configs:", error);
    throw new Error("Failed to fetch configurations");
  }
}

export async function getSecureConfigValue(key: string): Promise<string | null> {
  try {
    if (BLACKLISTED_KEYS.includes(key)) {
      return null;
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const apiRes = await fetch(`${process.env.API_BASE_URL}/app/configs`, {
      method: "GET",
      headers: {
        cookie: cookieHeader || "",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      throw new Error(`API request failed with status ${apiRes.status}`);
    }

    const data: ConfigsResponse = await apiRes.json();
    const config = data.configs.find((c) => c.key === key);

    if (!config) {
      return null;
    }

    if (SENSITIVE_KEYS.includes(key)) {
      return config.value ? "***HIDDEN***" : config.value;
    }

    return config.value;
  } catch (error) {
    console.error(`Error fetching config value for key ${key}:`, error);
    return null;
  }
}
