// AnaGrafik — MEBA TrendChart adaptasyonu, 3 yıllık karşılaştırma destekli.
//
// 3D illüzyon kombinasyonu:
//   - Shadow copy line (4px, blur(3px), translateY(7px)) → derinlik
//   - Glow filter (feGaussianBlur 3.2) → çizgi parıltısı
//   - Multi-stop gradient stroke + area fill → hacim
//   - Drop depth filter → SVG düşüm gölgesi
//
// 3 yıl karşılaştırma (Mehmet Bey 2026-05-26 direktifi):
//   - 2024 soluk gri Line (#475569), strokeWidth 1.25, dot yok
//   - 2025 orta gri Line (#94a3b8), strokeWidth 1.75, dot yok
//   - 2026 accent Area + Line + glow + shadow copy + dot (ana 3D efekti burada)
//   - Hedef yatay referans (altın kesik)
//   - Tooltip 3 yıl yan yana + Δ y/y delta rozet

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { YilTrendNoktasi } from "@/types/domain";

interface Props {
  /** 3 yıllık karşılaştırma verisi (12 ay × 3 yıl) */
  veri: YilTrendNoktasi[];
  baslik?: string;
  altBaslik?: string;
  /** Aktif firmanın signature rengi — 2026 serisi bu renkten türetilir */
  accent?: string;
}

interface TooltipPayload {
  payload: YilTrendNoktasi;
}

function CustomTooltip({
  active,
  payload,
  label,
  accent,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  accent: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const delta25_26 = row.y2025 > 0 ? ((row.y2026 - row.y2025) / row.y2025) * 100 : null;
  const delta24_26 = row.y2024 > 0 ? ((row.y2026 - row.y2024) / row.y2024) * 100 : null;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${TEMA.border}`,
        background: "rgba(15, 17, 22, 0.92)",
        backdropFilter: "blur(20px) saturate(170%)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.50)",
        padding: "12px 16px 14px",
        fontSize: 12,
        minWidth: 230,
        fontFamily: FONT.ana,
      }}
    >
      <div style={{ fontWeight: 700, color: TEMA.ink, marginBottom: 8, fontSize: 13 }}>
        {label} ayı karşılaştırma
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div style={satirStili}>
          <span style={{ color: "#94a3b8" }}>● 2024</span>
          <span style={{ color: TEMA.inkSoft }}>{fmtTL(row.y2024)}</span>
        </div>
        <div style={satirStili}>
          <span style={{ color: "#cbd5e1" }}>● 2025</span>
          <span style={{ color: TEMA.inkSoft }}>{fmtTL(row.y2025)}</span>
        </div>
        <div style={satirStili}>
          <span style={{ color: accent, fontWeight: 700 }}>● 2026</span>
          <span style={{ color: TEMA.ink, fontWeight: 700 }}>{fmtTL(row.y2026)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 6,
            borderTop: `1px solid ${TEMA.border}`,
            marginTop: 2,
          }}
        >
          <span style={{ color: TEMA.altin }}>— Hedef</span>
          <span style={{ color: TEMA.inkSoft }}>{fmtTL(row.hedef)}</span>
        </div>
        {delta25_26 !== null && (
          <div style={satirStili}>
            <span style={{ color: TEMA.inkFaded }}>Δ 2025 → 2026</span>
            <span
              style={{
                color: delta25_26 >= 0 ? TEMA.yesil : TEMA.kirmizi,
                fontWeight: 700,
              }}
            >
              {delta25_26 >= 0 ? "+" : ""}
              {delta25_26.toFixed(0)}%
            </span>
          </div>
        )}
        {delta24_26 !== null && (
          <div style={satirStili}>
            <span style={{ color: TEMA.inkFaded }}>Δ 2024 → 2026</span>
            <span
              style={{
                color: delta24_26 >= 0 ? TEMA.yesil : TEMA.kirmizi,
                fontWeight: 600,
              }}
            >
              {delta24_26 >= 0 ? "+" : ""}
              {delta24_26.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const satirStili: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

export function AnaGrafik({
  veri,
  baslik = "3 Yıllık Karşılaştırma",
  altBaslik,
  accent = TEMA.mavi,
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const accentLight = useMemo(() => rengiKaristir(accent, 0.35, "lighter"), [accent]);
  const accentDark = useMemo(() => rengiKaristir(accent, 0.30, "darker"), [accent]);
  const uid = useMemo(() => `ag-${accent.replace("#", "")}`, [accent]);

  const son2026 = veri[veri.length - 1]?.y2026 ?? 0;
  const hedefAylik = veri[0]?.hedef ?? 0;
  const yillik2026 = veri.reduce((s, d) => s + d.y2026, 0);
  const yillik2025 = veri.reduce((s, d) => s + d.y2025, 0);
  const delta_y_y = yillik2025 > 0 ? ((yillik2026 - yillik2025) / yillik2025) * 100 : 0;

  return (
    <div
      data-anim="grafik"
      style={{
        padding: "24px 24px 18px",
        position: "relative",
        height: "100%",
        minHeight: 460,
      }}
    >
      {/* Üst başlık */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT.ana,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEMA.inkMuted,
              marginBottom: 6,
            }}
          >
            {baslik}
          </div>
          <div style={{ fontFamily: FONT.ana, fontSize: 13, color: TEMA.inkSoft }}>
            {altBaslik ?? "2024 · 2025 · 2026 yıllık ciro karşılaştırması"}
          </div>
        </div>

        {/* Sağ özet — yıllık toplam + y/y delta */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: FONT.num,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: TEMA.ink,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
              textShadow: `0 0 24px ${accent}55`,
            }}
          >
            {fmtTL(yillik2026)}
          </div>
          <div
            style={{
              fontFamily: FONT.ana,
              fontSize: 11,
              color: TEMA.inkMuted,
              marginTop: 4,
              letterSpacing: "0.04em",
              display: "flex",
              gap: 6,
              justifyContent: "flex-end",
              alignItems: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>2026 yıllık</span>
            <span
              style={{
                color: delta_y_y >= 0 ? TEMA.yesil : TEMA.kirmizi,
                fontWeight: 700,
              }}
            >
              {delta_y_y >= 0 ? "▲ +" : "▼ "}
              {delta_y_y.toFixed(0)}% y/y
            </span>
          </div>
        </div>
      </div>

      {/* Legend — 3 yıl + hedef */}
      <div
        style={{
          display: "flex",
          gap: 18,
          marginBottom: 8,
          fontSize: 11,
          color: TEMA.inkMuted,
          fontFamily: FONT.ana,
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8" }} />
          2024
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#cbd5e1" }} />
          2025
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 8px ${accent}80`,
            }}
          />
          <strong style={{ color: TEMA.ink }}>2026</strong>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 0,
              borderTop: `1.5px dashed ${TEMA.altin}`,
            }}
          />
          Aylık Hedef
        </span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={veri}
          margin={{ top: 24, right: 16, bottom: 4, left: -4 }}
          onMouseMove={(e) => {
            if (e?.activeTooltipIndex !== undefined) setHoverIdx(e.activeTooltipIndex);
          }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {/* 2026 area gradient — multi-stop derinlik */}
            <linearGradient id={`fill-26-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentLight} stopOpacity={0.65} />
              <stop offset="35%" stopColor={accent} stopOpacity={0.40} />
              <stop offset="75%" stopColor={accent} stopOpacity={0.15} />
              <stop offset="100%" stopColor={accentDark} stopOpacity={0} />
            </linearGradient>

            {/* 2026 stroke — horizontal gradient */}
            <linearGradient id={`stroke-26-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accentDark} />
              <stop offset="50%" stopColor={accent} />
              <stop offset="100%" stopColor={accentLight} />
            </linearGradient>

            {/* 2025 area gradient — soluk gri */}
            <linearGradient id={`fill-25-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#475569" stopOpacity={0} />
            </linearGradient>

            {/* Glow filter — sadece 2026 line için */}
            <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
            strokeDasharray="2 4"
          />
          <XAxis
            dataKey="ay"
            tick={{ fontSize: 11, fill: TEMA.inkFaded, fontFamily: FONT.ana }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: TEMA.inkFaded, fontFamily: FONT.ana }}
            axisLine={false}
            tickLine={false}
            width={120}
            tickFormatter={(v) => fmtTL(Number(v))}
          />
          <Tooltip
            content={<CustomTooltip accent={accent} />}
            cursor={{
              stroke: accent + "70",
              strokeDasharray: "3 3",
              strokeWidth: 1.5,
            }}
          />

          {/* Hedef referans — altın kesik yatay */}
          <ReferenceLine
            y={hedefAylik}
            stroke={TEMA.altin}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={0.7}
          />

          {/* 2024 — soluk solid çizgi (en geride) */}
          <Line
            type="monotone"
            dataKey="y2024"
            stroke="#475569"
            strokeWidth={1.25}
            strokeOpacity={0.55}
            dot={false}
            animationDuration={1400}
            animationEasing="ease-out"
            legendType="none"
          />

          {/* 2025 — orta gri area + line */}
          <Area
            type="monotone"
            dataKey="y2025"
            stroke="#94a3b8"
            strokeWidth={1.75}
            strokeOpacity={0.75}
            fill={`url(#fill-25-${uid})`}
            animationDuration={1500}
            animationEasing="ease-out"
            dot={false}
            activeDot={{ r: 4, fill: "#cbd5e1", stroke: TEMA.bg, strokeWidth: 2 }}
            legendType="none"
          />

          {/* 2026 SHADOW COPY — derinlik (3D) */}
          <Line
            type="monotone"
            dataKey="y2026"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={4}
            dot={false}
            animationDuration={1500}
            style={{ filter: "blur(3px)", transform: "translateY(7px)" }}
            legendType="none"
          />

          {/* 2026 ANA AREA — gradient fill */}
          <Area
            type="monotone"
            dataKey="y2026"
            stroke="none"
            fill={`url(#fill-26-${uid})`}
            animationDuration={1500}
            animationEasing="ease-out"
            legendType="none"
          />

          {/* 2026 ANA LINE — gradient stroke + glow */}
          <Line
            type="monotone"
            dataKey="y2026"
            stroke={`url(#stroke-26-${uid})`}
            strokeWidth={3}
            animationDuration={1500}
            animationEasing="ease-out"
            filter={`url(#glow-${uid})`}
            dot={{ r: 3.5, fill: accent, stroke: TEMA.bg, strokeWidth: 2 }}
            activeDot={{ r: 7, fill: accentLight, stroke: TEMA.bg, strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Alt info — son ay + hover noktası */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 10,
          borderTop: `1px solid ${TEMA.border}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: TEMA.inkFaded,
          fontFamily: FONT.ana,
          letterSpacing: "0.04em",
        }}
      >
        <span>
          Son ay (Aralık 2026):{" "}
          <span style={{ color: accent, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {fmtTL(son2026)}
          </span>
        </span>
        {hoverIdx !== null && veri[hoverIdx] && (
          <span style={{ color: accent, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {veri[hoverIdx].ay} 2026 · {fmtTL(veri[hoverIdx].y2026)}
          </span>
        )}
      </div>
    </div>
  );
}
