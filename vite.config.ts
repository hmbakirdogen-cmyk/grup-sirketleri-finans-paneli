import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// NE: GitHub Pages base path repo adına eşitlendi.
// NEDEN: Repo 2026-05-29'da `grup-sirketleri-finans-paneli` -> `grup-finans-paneli`
//        olarak yeniden adlandırıldı; Pages URL'si değişti. Base path eski adda
//        kalırsa production'da tüm CSS/JS `/grup-sirketleri-finans-paneli/...`
//        yolundan 404 döner ve canlı panel bozuk (stilsiz/boş) açılır.
// NASIL: GH_BASE yeni repo adına çekildi; dev'de yine "/" kalır.
// YAN ETKİ: Yeni Pages adresi https://hmbakirdogen-cmyk.github.io/grup-finans-paneli/.
//           Eski adres artık geçersiz — yer imi/paylaşım varsa güncellenmeli.
const GH_BASE = "/grup-finans-paneli/";

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
