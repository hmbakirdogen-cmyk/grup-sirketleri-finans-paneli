// Chart3DBackdrop — MEBA Komuta Merkezi'nden adapte.
// Dramatic 3D stage for chart panels.
// Floor + side walls + horizon glow + sweep light beam.
// Mehmet Bey: "broadcast moment" — Bloomberg/Tesla Investor Day hissi.

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Glow tint — aktif firma rengi önerilir (CSS var değil, gerçek renk) */
  tint?: string;
  /** Entrance animasyonunu kapat (parent zaten animate ediyorsa) */
  staticEntrance?: boolean;
  style?: React.CSSProperties;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Chart3DBackdrop({
  children,
  className = "",
  tint = "#5b9dff",
  staticEntrance = false,
  style,
}: Props) {
  const reduce = useReducedMotion();

  // Perspective horizontal floor lines that tighten toward horizon
  const gridRows = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    const y = Number((150 + Math.pow(t, 1.55) * 130).toFixed(3));
    const inset = Number(((1 - Math.pow(t, 1.55)) * 70).toFixed(3));
    return { y, inset };
  });

  return (
    <motion.div
      initial={reduce || staticEntrance ? false : { opacity: 0, scale: 0.985, rotateX: 6 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        perspective: 1400,
        perspectiveOrigin: "50% 30%",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* Stage SVG */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          height: "100%",
          width: "100%",
          pointerEvents: "none",
        }}
        viewBox="0 0 400 280"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="c3d-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint} stopOpacity={0} />
            <stop offset="55%" stopColor={tint} stopOpacity={0.12} />
            <stop offset="100%" stopColor={tint} stopOpacity={0.24} />
          </linearGradient>
          <linearGradient id="c3d-wall-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={tint} stopOpacity={0.14} />
            <stop offset="100%" stopColor={tint} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="c3d-wall-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={tint} stopOpacity={0.14} />
            <stop offset="100%" stopColor={tint} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="c3d-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint} stopOpacity={0} />
            <stop offset="100%" stopColor={tint} stopOpacity={0.55} />
          </linearGradient>
          <radialGradient id="c3d-horizon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tint} stopOpacity={0.50} />
            <stop offset="60%" stopColor={tint} stopOpacity={0.12} />
            <stop offset="100%" stopColor={tint} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Walls */}
        <path d="M 0 280 L 40 280 L 110 150 L 0 150 Z" fill="url(#c3d-wall-l)" />
        <path d="M 400 280 L 360 280 L 290 150 L 400 150 Z" fill="url(#c3d-wall-r)" />

        {/* Floor trapezoid */}
        <path d="M 40 280 L 360 280 L 290 150 L 110 150 Z" fill="url(#c3d-floor)" />

        {/* Horizon glow */}
        <ellipse cx="200" cy="150" rx="170" ry="22" fill="url(#c3d-horizon)" />
        <line x1="110" y1="150" x2="290" y2="150" stroke={tint} strokeOpacity={0.50} strokeWidth={0.8} />

        {/* Perspective verticals */}
        {Array.from({ length: 11 }).map((_, i) => {
          const t = i / 10;
          const xBottom = 40 + t * 320;
          const xTop = 110 + t * 180;
          return (
            <line
              key={`v${i}`}
              x1={xBottom}
              y1={280}
              x2={xTop}
              y2={150}
              stroke="url(#c3d-line)"
              strokeWidth={0.7}
              opacity={0.45}
            />
          );
        })}

        {/* Perspective horizontals */}
        {gridRows.map(({ y, inset }, i) => (
          <line
            key={`h${i}`}
            x1={40 + inset}
            y1={y}
            x2={360 - inset}
            y2={y}
            stroke="rgba(148,163,184,0.16)"
            strokeWidth={0.6}
          />
        ))}
      </svg>

      {/* Ambient hero glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(65% 55% at 50% 35%, ${tint}22 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      {/* Birinci sweep beam — yatay sol→sağ, beyaz parıltı */}
      {!reduce && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "35%",
            pointerEvents: "none",
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 30%, ${tint}66 50%, rgba(255,255,255,0.10) 70%, transparent 100%)`,
            mixBlendMode: "screen",
            filter: "blur(10px)",
          }}
          initial={{ x: "-50%", opacity: 0 }}
          animate={{ x: "180%", opacity: [0, 0.95, 0] }}
          transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
          aria-hidden
        />
      )}

      {/* İkinci sweep beam — daha yavaş, ters yön, accent renkli */}
      {!reduce && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "25%",
            pointerEvents: "none",
            background: `linear-gradient(90deg, transparent 0%, ${tint}33 50%, transparent 100%)`,
            mixBlendMode: "screen",
            filter: "blur(14px)",
          }}
          initial={{ x: "180%", opacity: 0 }}
          animate={{ x: "-60%", opacity: [0, 0.55, 0] }}
          transition={{
            duration: 7.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2,
            delay: 2,
          }}
          aria-hidden
        />
      )}

      {/* Sol üst köşe glow — accent renk halo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${tint}33, transparent)`,
          filter: "blur(28px)",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* Sağ alt köşe glow — accent renk halo, daha yumuşak */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -50,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${tint}22, transparent)`,
          filter: "blur(32px)",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* Top inner highlight — cam üzerinde ışık yansıması */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 1,
          background:
            "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.18) 50%, transparent 95%)",
          pointerEvents: "none",
        }}
      />

      {/* Top vignette — koyu üst, depth */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 48,
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Bottom vignette — koyu alt, yere oturma hissi */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          pointerEvents: "none",
          background: "linear-gradient(0deg, rgba(0,0,0,0.28) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Sol-sağ rim light — kenarlardan accent sızıntısı */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "10% 0 10% 0",
          left: 0,
          width: 2,
          pointerEvents: "none",
          background: `linear-gradient(180deg, transparent 0%, ${tint}aa 50%, transparent 100%)`,
          filter: "blur(3px)",
          opacity: 0.5,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "10% 0 10% 0",
          right: 0,
          width: 2,
          pointerEvents: "none",
          background: `linear-gradient(180deg, transparent 0%, ${tint}aa 50%, transparent 100%)`,
          filter: "blur(3px)",
          opacity: 0.5,
        }}
      />

      {/* Children — chart sits above the floor */}
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          transform: "translateZ(0)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
