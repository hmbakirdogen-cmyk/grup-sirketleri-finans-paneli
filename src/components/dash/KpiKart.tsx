// KpiKart — üst 4'lü grid'in ana kartı.
// MEBA KpiCard trio'sundan adapte: react-countup + Sparkline + tone-based color.
//
// Yapı (sol → sağ):
//   [ikon kapsül] ━━━━━━━━━━━━━━━ [sparkline]
//   ETIKET
//   Büyük sayı (count-up)
//   delta + alt bilgi

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { TEMA, FONT } from "@/lib/tema";

interface Props {
  etiket: string;
  /** Sayısal değer — count-up için */
  numerikDeger: number;
  /** Format için decimals (0 / 1 / 2) */
  ondalik?: number;
  /** Sayı önü ek (örn. "%") */
  onek?: string;
  /** Sayı sonu ek (örn. " ₺", "M ₺") */
  sonek?: string;
  /** Sıfırdan değere kaç saniye */
  sure?: number;
  /** % delta — pozitif/negatif rozet */
  delta?: number;
  /** Delta etiketi (örn. "geçen döneme göre") */
  deltaEtiketi?: string;
  /** Trend sparkline verisi (12 ay genelde) */
  sparkline?: number[];
  /** Tone — kart renk kimliği */
  tone?: string;
  /** Üst sol ikon */
  ikon?: LucideIcon;
  /** Vurgu (tek bir KPI, max 1) */
  vurgu?: boolean;
}

export function KpiKart({
  etiket,
  numerikDeger,
  ondalik = 0,
  onek = "",
  sonek = "",
  sure = 1.4,
  delta,
  deltaEtiketi = "geçen dönem",
  sparkline,
  tone = TEMA.mavi,
  ikon: Ikon,
  vurgu = false,
}: Props) {
  const deltaRenk =
    delta === undefined
      ? TEMA.inkMuted
      : delta > 0
        ? TEMA.yesil
        : delta < 0
          ? TEMA.kirmizi
          : TEMA.inkMuted;
  const deltaIkon = delta === undefined || Math.abs(delta) < 0.05
    ? Minus
    : delta > 0
      ? TrendingUp
      : TrendingDown;
  const DeltaIc = deltaIkon;

  return (
    <motion.div
      data-anim="kpi"
      whileHover={{ y: -2 }}
      transition={{ type: "tween", duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        border: `1px solid ${vurgu ? TEMA.borderAktif : TEMA.border}`,
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        padding: "16px 18px 18px",
        minHeight: 156,
        display: "flex",
        flexDirection: "column",
        transition: "border-color 180ms ease",
        // Multi-layer ışık-gölge: top inner highlight + corner glow + drop shadow
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.06)",       // top edge bright line
          "inset 0 -1px 0 rgba(0,0,0,0.30)",            // bottom edge depth
          "0 1px 2px rgba(0,0,0,0.20)",                  // soft drop
          "0 8px 24px rgba(0,0,0,0.25)",                 // ambient float
          vurgu ? `0 0 0 1px ${tone}22, 0 8px 28px ${tone}22` : "0 0 0 0 transparent",
        ].join(", "),
      }}
    >
      {/* Köşe glow — accent renk halo (yalnızca vurgu kartta) */}
      {vurgu && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${tone}33, transparent)`,
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Hover top hairline reveal */}
      <span
        aria-hidden
        className="kpi-hover-line"
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 2,
          opacity: 0,
          background: `linear-gradient(90deg, transparent, ${tone}, transparent)`,
          transition: "opacity 180ms ease",
        }}
      />

      {/* Üst satır — ikon + sparkline */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 32,
            width: 32,
            borderRadius: 9,
            background: tone + "26",
            color: tone,
          }}
        >
          {Ikon ? <Ikon size={16} /> : null}
        </span>
        {sparkline && sparkline.length > 0 && (
          <Sparkline data={sparkline} width={92} height={26} stroke={tone} fill={tone} />
        )}
      </div>

      {/* Etiket */}
      <div
        style={{
          marginTop: 12,
          fontFamily: FONT.ana,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
        }}
      >
        {etiket}
      </div>

      {/* Büyük sayı — count-up */}
      <div
        style={{
          marginTop: 6,
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: FONT.num,
            // Tam rakam için biraz küçülttük (32 → 26); "30.605.000 ₺" tek satır
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: TEMA.ink,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
            textShadow: `0 1px 2px rgba(0,0,0,0.40)`,
          }}
        >
          <CountUp
            end={numerikDeger}
            duration={sure}
            decimals={ondalik}
            decimal=","
            separator="."
            prefix={onek}
            suffix={sonek}
          />
        </span>
      </div>

      {/* Alt satır — delta + etiket */}
      {delta !== undefined && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT.ana,
            fontSize: 12,
            color: TEMA.inkFaded,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <DeltaIc size={12} color={deltaRenk} />
          <span style={{ color: deltaRenk, fontWeight: 700 }}>
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          <span>{deltaEtiketi}</span>
        </div>
      )}

      <style>{`
        [data-anim='kpi']:hover .kpi-hover-line {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
}
