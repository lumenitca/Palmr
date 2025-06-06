"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/general/language-switcher";
import { ModeToggle } from "@/components/general/mode-toggle";
import type { GetReverseShareForUploadResult } from "@/http/endpoints/reverse-shares/types";
import { version } from "../../../../../../package.json";
import { FileUploadSection } from "./file-upload-section";

type ReverseShareInfo = GetReverseShareForUploadResult["data"]["reverseShare"];

interface WeTransferLayoutProps {
  reverseShare: ReverseShareInfo;
  password: string;
  alias: string;
}

// Lista de imagens de background
const backgroundImages = [
  "/assets/wetransfer-bgs/1.jpg",
  "/assets/wetransfer-bgs/2.jpg",
  "/assets/wetransfer-bgs/3.jpg",
  "/assets/wetransfer-bgs/4.jpg",
  "/assets/wetransfer-bgs/5.jpg",
  "/assets/wetransfer-bgs/6.jpg",
  "/assets/wetransfer-bgs/7.jpg",
  "/assets/wetransfer-bgs/8.jpg",
];

// Função para escolher uma imagem aleatória
function getRandomImage(images: string[]): string {
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];

  return selectedImage;
}

// Footer transparente para o layout WeTransfer
function TransparentFooter() {
  const t = useTranslations();

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-50 w-full flex items-center justify-center py-3 h-16 pointer-events-none">
      <div className="flex flex-col items-center pointer-events-auto">
        <Link
          target="_blank"
          className="flex items-center gap-1 text-white/80 hover:text-primary transition-colors"
          href="https://kyantech.com.br"
          title={t("footer.kyanHomepage")}
        >
          <span className="text-white/70 text-xs sm:text-sm">{t("footer.poweredBy")}</span>
          <p className="text-white text-xs sm:text-sm font-medium cursor-pointer hover:text-primary">
            Kyantech Solutions
          </p>
        </Link>
        <span className="text-white text-[11px] mt-1">v{version}</span>
      </div>
    </footer>
  );
}

export function WeTransferLayout({ reverseShare, password, alias }: WeTransferLayoutProps) {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Escolher uma imagem aleatória no início
  useEffect(() => {
    const randomImage = getRandomImage(backgroundImages);
    setSelectedImage(randomImage);
  }, []);

  // Precarregar a imagem selecionada
  useEffect(() => {
    if (!selectedImage) return;

    const preloadImage = () => {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => {
        console.error("Erro ao carregar imagem de background:", selectedImage);
        setImageLoaded(true);
      };
      img.src = selectedImage;
    };

    preloadImage();
  }, [selectedImage]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fallback gradient background */}
      <div className="absolute inset-0 z-0 bg-background" />

      {/* Background Image - imagem única aleatória */}
      {imageLoaded && selectedImage && (
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `url(${selectedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      {/* Dark overlay para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/40 z-20" />

      {/* Controles - Topo Direito */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-40 flex items-center gap-2">
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xs border border-white/20 dark:border-white/10 rounded-lg p-1">
          <LanguageSwitcher />
        </div>
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xs border border-white/20 dark:border-white/10 rounded-lg p-1">
          <ModeToggle />
        </div>
      </div>

      {/* Loading indicator para a imagem */}
      {!imageLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="animate-pulse text-white/70 text-sm">Carregando...</div>
        </div>
      )}

      {/* Content - Alinhado à esquerda */}
      <div className="relative z-30 min-h-screen flex items-center justify-start p-4 md:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-white dark:bg-black rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm border border-white/20">
            {/* Header */}
            <div className="text-left mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {reverseShare.name || "Enviar Arquivos"}
              </h1>
              {reverseShare.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{reverseShare.description}</p>
              )}
            </div>

            {/* Upload Section */}
            <FileUploadSection reverseShare={reverseShare} password={password} alias={alias} />
          </div>
        </div>
      </div>

      {/* Footer transparente */}
      <TransparentFooter />
    </div>
  );
}
