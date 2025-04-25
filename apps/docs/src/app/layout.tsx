import { Banner } from "fumadocs-ui/components/banner";
import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import Link from "fumadocs-core/link";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "🌴 Palmr. | Official Website",
  description: "Palmr. is a fast, simple and powerful document sharing platform.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Banner variant="rainbow" id="banner-v-2" changeLayout={false}>
          <Link href="/docs/2.0.0-beta">Palmr. v2.0.0-beta has released!</Link>
        </Banner>
        <RootProvider
          search={{
            options: {
              defaultTag: "2.0.0-beta",
              tags: [
                {
                  name: "v1.1.7 Beta",
                  value: "1.1.7-beta",
                },
                {
                  name: "v2.0.0 Beta ✨",
                  value: "2.0.0-beta",
                  props: {
                    style: {
                      border: "1px solid rgba(0,165,80,0.2)",
                    },
                  },
                },
              ],
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
