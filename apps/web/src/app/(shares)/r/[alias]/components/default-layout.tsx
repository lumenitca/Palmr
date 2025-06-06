"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/general/language-switcher";
import { ModeToggle } from "@/components/general/mode-toggle";
import { DefaultFooter } from "@/components/ui/default-footer";
import { useAppInfo } from "@/contexts/app-info-context";
import type { GetReverseShareForUploadResult } from "@/http/endpoints/reverse-shares/types";
import { FileUploadSection } from "./file-upload-section";

type ReverseShareInfo = GetReverseShareForUploadResult["data"]["reverseShare"];

interface DefaultLayoutProps {
  reverseShare: ReverseShareInfo;
  password: string;
  alias: string;
}

export function DefaultLayout({ reverseShare, password, alias }: DefaultLayoutProps) {
  const { appName, appLogo } = useAppInfo();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header público */}
      <header className="w-full px-6 border-b border-border/50 bg-background/70 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl sm:p-0 h-16 flex items-center justify-between">
          <Link className="flex items-center gap-2" href="/">
            {appLogo && <img alt="App Logo" className="h-8 w-8 object-contain rounded" src={appLogo} />}
            <p className="font-bold text-2xl text-foreground">{appName}</p>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 container mx-auto px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8 ">
          {/* Header da página */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {reverseShare.name || "Enviar Arquivos"}
            </h1>
            {reverseShare.description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {reverseShare.description}
              </p>
            )}
          </div>

          {/* Seção de upload */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8 lg:p-10">
            <FileUploadSection reverseShare={reverseShare} password={password} alias={alias} />
          </div>

          {/* Informações adicionais (se houver limites) */}
          {(reverseShare.maxFiles || reverseShare.maxFileSize || reverseShare.allowedFileTypes) && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium text-foreground">Informações importantes:</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                {reverseShare.maxFiles && <p>• Máximo de {reverseShare.maxFiles} arquivo(s)</p>}
                {reverseShare.maxFileSize && <p>• Tamanho máximo por arquivo: {reverseShare.maxFileSize}MB</p>}
                {reverseShare.allowedFileTypes && <p>• Tipos permitidos: {reverseShare.allowedFileTypes}</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <DefaultFooter />
    </div>
  );
}
