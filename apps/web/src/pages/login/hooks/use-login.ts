import { useAuth } from "@/contexts/auth-context";
import { login, getCurrentUser } from "@/http/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, setUser, setIsAdmin, setIsAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError(null);

    try {
      await login(data);
      const userResponse = await getCurrentUser();
      const { isAdmin, ...userData } = userResponse.data.user;

      setUser(userData);
      setIsAdmin(isAdmin);
      setIsAuthenticated(true);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(t(`errors.${err.response.data.error}`));
      } else {
        setError(t("errors.unexpectedError"));
      }
    }
  };

  return {
    isAuthenticated,
    error,
    isVisible,
    form,
    toggleVisibility,
    onSubmit,
  };
}
