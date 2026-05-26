// NabizKpiKart — şirket nabzı KPI kartı
// CNBC tarzı count-up + Recharts sparkline + delta rozet
//
// Görsel referans: Mercury Bank luxury banking + Pigment KPI grid
// Estetik: dark glass, ferah whitespace, count-up "vay be!" anı

import CountUp from "react-countup";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface NabizKpiKartProps {
  baslik: string;
  deger: number;
  /** Para mı yoksa adet mi (formatlama için) */
  format?: "para" | "yuzde" | "adet";
  /** Geçen ay/dönem değeri (delta hesabı için) */
  oncekiDeger?: number;
  /** 12 ay trend datası (sparkline için) */
  trend?: number[];
  /** Renk (firma signature accent) */
  accentRenk?: string;
  /** Ek bilgi (alt sağ köşede küçük) */
  altBilgi?: string;
}

function formatla(deger: number, tip: "para" | "yuzde" | "adet"): string {
  if (tip === "yuzde") return `%${deger.toFixed(1)}`;
  if (tip === "adet") return new Intl.NumberFormat("tr-TR").format(deger);
  // Para — kısaltma mantığı (CNBC tarzı)
  if (deger >= 1_000_000) return `${(deger / 1_000_000).toFixed(1)}M ₺`;
  if (deger >= 1_000) return `${(deger / 1_000).toFixed(0)}K ₺`;
  return `${deger.toFixed(0)} ₺`;
}

function deltaYuzde(yeni: number, eski: number): number {
  if (eski === 0) return 0;
  return ((yeni - eski) / Math.abs(eski)) * 100;
}

export function NabizKpiKart({
  baslik,
  deger,
  format = "para",
  oncekiDeger,
  trend,
  accentRenk = "#0ea5e9",
  altBilgi,
}: NabizKpiKartProps) {
  const delta = oncekiDeger !== undefined ? deltaYuzde(deger, oncekiDeger) : undefined;
  const yon = delta === undefined ? "yatay" : delta > 0.5 ? "yukari" : delta < -0.5 ? "asagi" : "yatay";
  const deltaRenk =
    yon === "yukari" ? "rgb(34,197,94)" : yon === "asagi" ? "rgb(239,68,68)" : "rgb(161,161,170)";
  const TrendIcon = yon === "yukari" ? TrendingUp : yon === "asagi" ? TrendingDown : Minus;

  const sparkData = trend ? trend.map((v, i) => ({ i, v })) : [];

  return (
    <GlassCard hero parallax className="p-5">
      {/* Başlık + delta rozet */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
          {baslik}
        </div>
        {delta !== undefined && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums"
            style={{
              background: `${deltaRenk}1f`,
              color: deltaRenk,
            }}
          >
            <TrendIcon size={10} />
            {delta > 0 && "+"}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Büyük sayı — count-up */}
      <div
        className="font-bold text-zinc-100 tabular-nums leading-none mb-2"
        style={{
          fontSize: 28,
          letterSpacing: "-0.02em",
          fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
        }}
      >
        <CountUp
          end={deger}
          duration={1.8}
          separator="."
          decimal=","
          decimals={format === "yuzde" ? 1 : 0}
          prefix={format === "yuzde" ? "%" : ""}
          suffix={format === "para" ? " ₺" : ""}
          formattingFn={format === "para" ? (n) => formatla(n, "para") : undefined}
        />
      </div>

      {/* Alt bilgi */}
      {altBilgi && <div className="text-[11px] text-zinc-500 mb-3">{altBilgi}</div>}

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div className="h-12 -mx-2 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${baslik}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={accentRenk} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accentRenk} stopOpacity={1} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="v"
                stroke={`url(#spark-${baslik})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={1800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
