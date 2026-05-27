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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "motion-vendor";
          if (
            id.includes("@react-three") ||
            id.includes("/three/")
          ) {
            return "three-vendor";
          }
          if (
            id.includes("recharts") ||
            id.includes("@visx") ||
            id.includes("lightweight-charts") ||
            id.includes("@tremor") ||
            id.includes("react-countup")
          ) {
            return "charts-vendor";
          }
          if (id.includes("@tanstack")) return "tanstack-vendor";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("sonner") ||
            id.includes("cmdk") ||
            id.includes("lucide-react")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
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
