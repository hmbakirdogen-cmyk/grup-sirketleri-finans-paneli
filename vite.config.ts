import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// GitHub Pages base path — `/grup-sirketleri-finans-paneli/` (repo adı).
// Production'da bu path altında host edilir; dev'de "/" kalır.
const GH_BASE = "/grup-sirketleri-finans-paneli/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? GH_BASE : "/",
  plugins: [react(), tailwindcss()],
  server: {
    // feedback_localhost_port_disiplini KATİ — tek URL 5173.
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
