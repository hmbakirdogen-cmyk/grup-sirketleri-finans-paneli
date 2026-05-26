// ProgressRing — MEBA Komuta Merkezi'nden adapte.
// 3D dimensional gauge: concentric depth shadow, sphere interior radial highlight,
// 60-tick gauge ring, animated arc with gloss highlight.
//
// Grup paneli: Yönetici Özeti panelinin yanında veya KPI vurgusu için.

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { TEMA } from "@/lib/tema";

interface Props {
  /** 0..100 */
  value: number;
  size?: number;
  stroke?: number;
  /** Ana renk — accent (aktif firma rengi) önerilir */
  color?: string;
  /** Gradient kullansın mı? (Aksi takdirde düz renk) */
  gradient?: boolean;
  /** Etrafına tick mark çizgileri */
  ticks?: boolean;
  children?: ReactNode;
  label?: string;
}

export function ProgressRing({
  value,
  size = 160,
  stroke = 14,
  color = TEMA.mavi,
  gradient = true,
  ticks = true,
  children,
  label,
}: Props) {
  const reduce = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ - (clamped / 100) * circ;
  const uid = `${size}-${Math.round(clamped)}-${color.replace("#", "")}`;
  const gradId = `pr-grad-${uid}`;
  const glowId = `pr-glow-${uid}`;
  const sphereId = `pr-sphere-${uid}`;
  const innerShadowId = `pr-ishadow-${uid}`;
  const cx = size / 2;
  const cy = size / 2;

  const tickArr = Array.from({ length: 60 }, (_, i) => i);
  const tickInner = radius + stroke / 2 + 5;
  const tickOuterMinor = tickInner + 3;
  const tickOuterMajor = tickInner + 7;

  // Lighter ve darker varyant (gradient için)
  // Basit yaklaşım: aynı renk daha açık + daha koyu opacity
  const colorLight = color + "ee";
  const colorDark = color + "cc";

  return (
    <div
      style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}
      aria-label={label}
    >
      <svg width={size} height={size + 8} viewBox={`0 0 ${size} ${size + 8}`}>
        <defs>
          {gradient && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorDark} />
              <stop offset="55%" stopColor={colorLight} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          )}
          <radialGradient id={sphereId} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
          </radialGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={innerShadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="2.5" result="o" />
            <feComposite in="o" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="s" />
            <feColorMatrix
              in="s"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
            />
          </filter>
        </defs>

        {/* Outer depth shadow */}
        <circle
          cx={cx}
          cy={cy + 3}
          r={radius + stroke / 2}
          fill="none"
          stroke="rgba(0,0,0,0.40)"
          strokeWidth={2}
          opacity={0.5}
          filter={`url(#${glowId})`}
        />

        {/* Tick marks */}
        {ticks && (
          <g transform={`translate(${cx} ${cy})`} opacity={0.55}>
            {tickArr.map((i) => {
              const major = i % 5 === 0;
              const angle = (i * 6 - 90) * (Math.PI / 180);
              const x1 = Math.cos(angle) * tickInner;
              const y1 = Math.sin(angle) * tickInner;
              const x2 = Math.cos(angle) * (major ? tickOuterMajor : tickOuterMinor);
              const y2 = Math.sin(angle) * (major ? tickOuterMajor : tickOuterMinor);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={major ? color : TEMA.inkFaded}
                  strokeOpacity={major ? 0.65 : 0.22}
                  strokeWidth={major ? 1.3 : 0.7}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {/* Recessed track + progress arc */}
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
            filter={`url(#${innerShadowId})`}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={gradient ? `url(#${gradId})` : color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            filter={`url(#${glowId})`}
            initial={{ strokeDashoffset: reduce ? offset : circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduce ? 0 : 1.6, ease: [0.22, 0.61, 0.36, 1] }}
          />
          {/* Gloss highlight on arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={Math.max(1, stroke * 0.18)}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: reduce ? offset : circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduce ? 0 : 1.6, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ transform: `translateY(-${stroke * 0.22}px)` }}
          />
        </g>

        {/* Sphere interior — volumetric center */}
        <circle cx={cx} cy={cy} r={radius - stroke / 2 - 1} fill={`url(#${sphereId})`} />
      </svg>
      {children && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
