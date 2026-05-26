// GlassCard — Vision Pro / Linear estetiğinde cam morfizm kartı
// MEBA Komuta Merkezi'nden aktarıldı (2026-05-26 Sprint 2).
//
// Özellikler:
// - Backdrop blur + saturate + ince border + inner top highlight
// - Hero modunda mouse parallax + specular sheen (haber bülteni gradient)
// - hover'da hafif yukarı kalkış (hero için)
// - GPU layer hint (translateZ)
//
// Kullanım:
//   <GlassCard hero parallax>...</GlassCard>  ← KPI kartı için
//   <GlassCard>...</GlassCard>                 ← basit cam yüzey

import { motion, useMotionValue, useTransform } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  /** Hero kartlar daha güçlü shadow + glass (KPI kartları, başlık kartları) */
  hero?: boolean;
  /** Mouse parallax + specular highlight (performans için bazı yerlerde kapatılabilir) */
  parallax?: boolean;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  hero = false,
  parallax = false,
  className = "",
  onClick,
}: GlassCardProps) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const highlightX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const highlightY = useTransform(mouseY, [0, 1], ["0%", "100%"]);
  const specularBg = useTransform(
    [highlightX, highlightY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.08), transparent 50%)`,
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!parallax) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={hero ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
      style={{
        backgroundColor: "rgb(24 24 27 / 0.6)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        boxShadow: hero
          ? [
              "inset 0 1px 0 rgba(255,255,255,0.06)",
              "0 8px 24px rgba(0,0,0,0.20)",
              "0 20px 48px rgba(0,0,0,0.30)",
            ].join(", ")
          : [
              "inset 0 1px 0 rgba(255,255,255,0.04)",
              "0 1px 2px rgba(0,0,0,0.10)",
              "0 4px 12px rgba(0,0,0,0.15)",
            ].join(", "),
        transform: "translateZ(0)",
      }}
    >
      {parallax && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: specularBg }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
