"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { LoadingScreen } from "@/components/layout/loading-screen";
import { getReverseShareForUploadByAlias } from "@/http/endpoints";
import type { GetReverseShareForUploadResult } from "@/http/endpoints/reverse-shares/types";
import { DefaultLayout } from "./components/default-layout";
import { PasswordModal } from "./components/password-modal";
import { WeTransferLayout } from "./components/we-transfer-layout";

type ReverseShareInfo = GetReverseShareForUploadResult["data"]["reverseShare"];

export default function ReverseShareUploadPage() {
  const params = useParams();
  const router = useRouter();
  const alias = params?.alias as string;

  const [reverseShare, setReverseShare] = useState<ReverseShareInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");

  const loadReverseShare = async (passwordAttempt?: string) => {
    try {
      setIsLoading(true);
      const response = await getReverseShareForUploadByAlias(
        alias,
        passwordAttempt ? { password: passwordAttempt } : undefined
      );
      setReverseShare(response.data.reverseShare);
      setShowPasswordModal(false);
      setPassword(passwordAttempt || "");
    } catch (error: any) {
      console.error("Failed to load reverse share:", error);

      if (error.response?.status === 401 && error.response?.data?.error === "Password required") {
        setShowPasswordModal(true);
      } else if (error.response?.status === 401 && error.response?.data?.error === "Invalid password") {
        setShowPasswordModal(true);
        toast.error("Senha incorreta. Tente novamente.");
      } else if (error.response?.status === 404) {
        toast.error("Link não encontrado ou expirado.");
        router.push("/");
      } else if (error.response?.status === 403) {
        toast.error("Este link está inativo.");
        router.push("/");
      } else if (error.response?.status === 410) {
        toast.error("Este link expirou.");
        router.push("/");
      } else {
        toast.error("Erro ao carregar informações. Tente novamente.");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (alias) {
      loadReverseShare();
    }
  }, [alias]);

  const handlePasswordSubmit = (passwordValue: string) => {
    loadReverseShare(passwordValue);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showPasswordModal) {
    return (
      <PasswordModal isOpen={showPasswordModal} onSubmit={handlePasswordSubmit} onClose={() => router.push("/")} />
    );
  }

  if (!reverseShare) {
    return <LoadingScreen />;
  }

  // Escolher o layout baseado no pageLayout
  if (reverseShare.pageLayout === "WETRANSFER") {
    return <WeTransferLayout reverseShare={reverseShare} password={password} alias={alias} />;
  }

  // Layout padrão
  return <DefaultLayout reverseShare={reverseShare} password={password} alias={alias} />;
}
