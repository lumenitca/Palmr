import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: "0.0.0.0", // Importante para aceitar conexões externas
    port: 5173,
  },
  preview: {
    host: "0.0.0.0", // Para modo de produção
    port: 4173,
  },
});
