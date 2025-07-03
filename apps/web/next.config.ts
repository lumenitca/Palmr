import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "1pb",
    },
  },
  api: {
    bodyParser: {
      sizeLimit: "1pb",
    },
    responseLimit: false,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
