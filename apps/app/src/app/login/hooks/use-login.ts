"use client"

import { useAuth } from "@/contexts/auth-context";
import { login, getCurrentUser } from "@/http/endpoints";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { LoginFormValues } from "../schemas/schema";

export function useLogin() {
  const router = useRouter();
  const t = useTranslations();
  const { isAuthenticated, setUser, setIsAdmin, setIsAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userResponse = await getCurrentUser();
        if (!userResponse?.data?.user) {
          throw new Error("No user data");
        }
        
        const { isAdmin, ...userData } = userResponse.data.user;
        setUser(userData);
        setIsAdmin(isAdmin);
        setIsAuthenticated(true);
        router.push("/dashboard");
      } catch (err) {
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [router, setUser, setIsAdmin, setIsAuthenticated]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: LoginFormValues) => {
    setError(undefined);

    try {
      await login(data);
      const userResponse = await getCurrentUser();
      const { isAdmin, ...userData } = userResponse.data.user;

      setUser(userData);
      setIsAdmin(isAdmin);
      setIsAuthenticated(true);
      router.replace("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(t(`errors.${err.response.data.error}`));
      } else {
        setError(t("errors.unexpectedError"));
      }
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    }
  };

  return {
    isAuthenticated: !isInitialized ? null : isAuthenticated,
    error,
    isVisible,
    toggleVisibility,
    onSubmit,
  };
}
