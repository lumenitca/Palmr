import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enviar Arquivos - Palmr",
  description: "Envie arquivos através do link compartilhado",
};

export default function ReverseShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
