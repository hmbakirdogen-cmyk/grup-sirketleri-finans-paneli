// AnaGrafik — MEBA TrendChart adaptasyonu.
// 3D illüzyon kombinasyonu:
//   - Shadow copy line (4px, blur(3px), translateY(6px)) → çizgi altında gölge
//   - Glow filter (feGaussianBlur 3.2) → çizgi parıltısı
//   - Multi-stop gradient stroke + area fill → hacim hissi
//   - LabelList → her nokta üzerinde değer
//
// Chart3DBackdrop ile sarmalandığında broadcast moment tam olur.

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
  LabelList,
} from "recharts";
import { TEMA, FONT, fmtTL } from "@/lib/tema";

interface Props {
  veri: { ay: string; ciro: number }[];
  hedefAylik?: number;
  baslik?: string;
  altBaslik?: string;
  /** Aktif firmanın signature rengi — çizgi + dolgu bu renkten türetilir */
  accent?: string;
}

interface ChartDatum {
  ay: string;
  ciro: number;
  hedef: number | null;
}

// Color helper — accent renginden açık/koyu varyant
function rengiKaristir(renk: string, oran: number, hedef: "lighter" | "darker"): string {
  // Basit hex → rgb → tone shift. accent #5b9dff gibi tam hex bekleniyor.
  const r = parseInt(renk.slice(1, 3), 16);
  const g = parseInt(renk.slice(3, 5), 16);
  const b = parseInt(renk.slice(5, 7), 16);
  const factor = hedef === "lighter" ? 1 + oran : 1 - oran;
  const yeniR = Math.max(0, Math.min(255, Math.round(r * factor)));
  const yeniG = Math.max(0, Math.min(255, Math.round(g * factor)));
  const yeniB = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `rgb(${yeniR}, ${yeniG}, ${yeniB})`;
}

interface TooltipPayload {
  value: number;
  payload: ChartDatum;
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
  const hedef = row.hedef;
  const delta = hedef !== null && hedef > 0 ? ((row.ciro - hedef) / hedef) * 100 : null;

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${TEMA.border}`,
        background: "rgba(15, 17, 22, 0.92)",
        backdropFilter: "blur(20px) saturate(170%)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.40)",
        padding: "10px 14px",
        fontSize: 12,
        minWidth: 180,
        fontFamily: FONT.ana,
      }}
    >
      <div style={{ fontWeight: 600, color: TEMA.ink, marginBottom: 6 }}>{label} 2026</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontVariantNumeric: "tabular-nums" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: accent }}>● Gerçekleşen</span>
          <span style={{ color: TEMA.ink, fontWeight: 600 }}>{fmtTL(row.ciro)}</span>
        </div>
        {hedef !== null && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ color: TEMA.altin }}>— Hedef</span>
            <span style={{ color: TEMA.inkSoft }}>{fmtTL(hedef)}</span>
          </div>
        )}
        {delta !== null && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              paddingTop: 4,
              borderTop: `1px solid ${TEMA.border}`,
              marginTop: 2,
            }}
          >
            <span style={{ color: TEMA.inkFaded }}>Δ vs hedef</span>
            <span
              style={{
                color: delta >= 0 ? TEMA.yesil : TEMA.kirmizi,
                fontWeight: 600,
              }}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnaGrafik({
  veri,
  hedefAylik,
  baslik = "Aylık Ciro",
  altBaslik,
  accent = TEMA.mavi,
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const accentLight = useMemo(() => rengiKaristir(accent, 0.35, "lighter"), [accent]);
  const accentDark = useMemo(() => rengiKaristir(accent, 0.30, "darker"), [accent]);

  // Filter ID'ler için benzersiz suffix (birden fazla AnaGrafik aynı sayfada olabilir)
  const uid = useMemo(() => `ag-${accent.replace("#", "")}`, [accent]);

  const data: ChartDatum[] = useMemo(
    () =>
      veri.map((d) => ({
        ay: d.ay,
        ciro: d.ciro,
        hedef: hedefAylik ?? null,
      })),
    [veri, hedefAylik],
  );

  const sonCiro = data[data.length - 1]?.ciro ?? 0;
  const enYukIdx = data.reduce(
    (maxI, d, i) => (d.ciro > (data[maxI]?.ciro ?? 0) ? i : maxI),
    0,
  );

  return (
    <div
      data-anim="grafik"
      style={{
        padding: "24px 24px 18px",
        position: "relative",
        height: "100%",
        minHeight: 420,
      }}
    >
      {/* Üst başlık */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 16,
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
            {altBaslik ?? "Son 12 ay"}
          </div>
        </div>

        {/* Sağ özet — aktif/son ay */}
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
            {fmtTL(sonCiro)}
          </div>
          <div
            style={{
              fontFamily: FONT.ana,
              fontSize: 11,
              color: TEMA.inkMuted,
              marginTop: 4,
              letterSpacing: "0.06em",
            }}
          >
            {data[data.length - 1]?.ay ?? ""} · son ay
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 8,
          fontSize: 11,
          color: TEMA.inkMuted,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
          Gerçekleşen
        </span>
        {hedefAylik !== undefined && (
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
        )}
      </div>

      {/* Recharts ComposedChart — 3D shadow + glow */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 24, right: 12, bottom: 4, left: -8 }}
          onMouseMove={(e) => {
            if (e?.activeTooltipIndex !== undefined) setHoverIdx(e.activeTooltipIndex);
          }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {/* Multi-stop area gradient — derinlik hissi */}
            <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentLight} stopOpacity={0.65} />
              <stop offset="35%" stopColor={accent} stopOpacity={0.40} />
              <stop offset="75%" stopColor={accent} stopOpacity={0.15} />
              <stop offset="100%" stopColor={accentDark} stopOpacity={0} />
            </linearGradient>

            {/* Gradient stroke — çizgi boyu renk değişimi */}
            <linearGradient id={`stroke-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accentDark} />
              <stop offset="50%" stopColor={accent} />
              <stop offset="100%" stopColor={accentLight} />
            </linearGradient>

            {/* Glow filter — çizgi parıltısı */}
            <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Drop depth — alttan gölge düşümü */}
            <filter id={`drop-${uid}`} x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="6" result="off" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.50" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
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
            tick={{ fontSize: 10, fill: TEMA.inkFaded, fontFamily: FONT.ana }}
            axisLine={false}
            tickLine={false}
            width={68}
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

          {/* Hedef referans line — turuncu kesik */}
          {hedefAylik !== undefined && (
            <ReferenceLine
              y={hedefAylik}
              stroke={TEMA.altin}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.7}
            />
          )}

          {/* SHADOW COPY — kalın siyah çizgi, blur + translateY → 3D depth */}
          <Line
            type="monotone"
            dataKey="ciro"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={4}
            dot={false}
            connectNulls={false}
            animationDuration={1500}
            style={{ filter: "blur(3px)", transform: "translateY(7px)" }}
            legendType="none"
          />

          {/* ANA AREA — gradient fill */}
          <Area
            type="monotone"
            dataKey="ciro"
            stroke="none"
            fill={`url(#fill-${uid})`}
            animationDuration={1500}
            animationEasing="ease-out"
          />

          {/* ANA LINE — gradient stroke + glow */}
          <Line
            type="monotone"
            dataKey="ciro"
            stroke={`url(#stroke-${uid})`}
            strokeWidth={3}
            connectNulls={false}
            animationDuration={1500}
            animationEasing="ease-out"
            filter={`url(#glow-${uid})`}
            dot={{ r: 3.5, fill: accent, stroke: TEMA.bg, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: accentLight, stroke: TEMA.bg, strokeWidth: 2 }}
          >
            <LabelList
              dataKey="ciro"
              position="top"
              offset={12}
              fill={TEMA.ink}
              fontSize={10}
              fontWeight={600}
              fontFamily={FONT.ana}
              formatter={(v: number) => {
                if (!Number.isFinite(v)) return "";
                return fmtTL(v);
              }}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>

      {/* Alt info bar — en yüksek nokta etiketi */}
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
          Yıl içi en yüksek: <strong style={{ color: accent }}>{data[enYukIdx]?.ay}</strong>{" "}
          ·{" "}
          <span style={{ color: TEMA.inkSoft, fontVariantNumeric: "tabular-nums" }}>
            {fmtTL(data[enYukIdx]?.ciro ?? 0)}
          </span>
        </span>
        {hoverIdx !== null && data[hoverIdx] && (
          <span style={{ color: accent, fontWeight: 600 }}>
            {data[hoverIdx].ay} · {fmtTL(data[hoverIdx].ciro)}
          </span>
        )}
      </div>
    </div>
  );
}
