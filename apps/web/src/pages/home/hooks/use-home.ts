import { getAllConfigs } from "@/http/endpoints";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useHome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const checkHomePageAccess = async () => {
    try {
      const response = await getAllConfigs();
      const showHomePage = response.data.configs.find((config) => config.key === "showHomePage")?.value === "true";

      if (!showHomePage) {
        navigate("/login");

        return;
      }
    } catch (error) {
      console.error("Failed to check homepage access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHomePageAccess();
  }, [navigate]);

  return {
    isLoading,
  };
}
