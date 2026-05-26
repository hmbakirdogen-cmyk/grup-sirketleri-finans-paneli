// AiAsistanFAB — sağ alt sabit AI küresi.
// Tıklama → CommandPalette açar (mevcut palette aynı zamanda AI sorgu).
// Idle pulse animasyonu + accent halo + Sparkles ikon.

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { TEMA } from "@/lib/tema";

interface Props {
  /** Aktif firma rengi (halo) */
  accent: string;
  onClick: () => void;
}

export function AiAsistanFAB({ accent, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      aria-label="AI Asistan — Cmd+K"
      title="AI Asistan'a sor (Cmd+K)"
      style={{
        position: "fixed",
        right: 32,
        bottom: 32,
        zIndex: 40,
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: `radial-gradient(circle at 30% 25%, #c4b5fd 0%, #a78bfa 35%, #8b5cf6 70%, #6d28d9 100%)`,
        boxShadow: [
          "inset 0 2px 4px rgba(255,255,255,0.40)",
          "inset 0 -2px 4px rgba(0,0,0,0.30)",
          "0 12px 32px rgba(139, 92, 246, 0.45)",
          `0 0 0 4px ${accent}22`,
        ].join(", "),
        color: "white",
        display: "grid",
        placeItems: "center",
      }}
    >
      {/* Pulse aura — sürekli atımı */}
      <motion.span
        aria-hidden
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          border: "2px solid rgba(167, 139, 250, 0.45)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <Sparkles size={22} strokeWidth={2.2} />

      {/* Sağ alt küçük "K" rozeti */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -4,
          bottom: -4,
          minWidth: 22,
          height: 22,
          padding: "0 6px",
          borderRadius: 11,
          background: TEMA.bg,
          border: `1px solid ${TEMA.border}`,
          fontSize: 10,
          fontWeight: 700,
          color: TEMA.inkSoft,
          display: "grid",
          placeItems: "center",
          letterSpacing: "0.04em",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        ⌘K
      </span>
    </motion.button>
  );
}
