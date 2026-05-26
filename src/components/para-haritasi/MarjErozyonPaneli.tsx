// MarjErozyonPaneli — 12 ay brüt marj trendi + en çok eriyen gider kategorisi.
//
// Görsel: Recharts AreaChart (marj %) + alt panelde en hızlı büyüyen gider
// kategorisi (trend pozitif → marj baskısı).
//
// Mehmet Bey direktifi: "Marj erozyon paneli hangi kategoride kayıp olduğunu yakalar."

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { AylikKpi, ParaHaritasiKategori } from "@/types/domain";

interface MarjErozyonPaneliProps {
  son12Ay: AylikKpi[];
  paraHaritasi: ParaHaritasiKategori[];
}

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n.toFixed(0)} ₺`;
}

export function MarjErozyonPaneli({ son12Ay, paraHaritasi }: MarjErozyonPaneliProps) {
  const son = son12Ay[son12Ay.length - 1];
  const ilk = son12Ay[0];
  if (!son || !ilk) return null;

  const marjDelta = son.brutMarj - ilk.brutMarj;
  const eriyor = marjDelta < 0;

  // En çok büyüyen gider (marj baskısının ana sorumlusu)
  const giderler = paraHaritasi.filter((k) => k.tip === "gider");
  const enHizliArtanGider = [...giderler].sort((a, b) => b.trend - a.trend)[0];

  const ortalama = son12Ay.reduce((s, a) => s + a.brutMarj, 0) / son12Ay.length;

  return (
    <GlassCard hero parallax className="p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
            Marj Erozyon Paneli
          </div>
          <div className="text-[13px] text-zinc-300 mt-0.5">
            12 ay brüt marj trendi · ortalama %{ortalama.toFixed(1)}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums"
          style={{
            background: eriyor ? "rgba(239,68,68,0.14)" : "rgba(34,197,94,0.14)",
            color: eriyor ? "rgb(239,68,68)" : "rgb(34,197,94)",
          }}
        >
          {eriyor ? <TrendingDown size={12} /> : <AlertTriangle size={12} />}
          {marjDelta > 0 && "+"}
          {marjDelta.toFixed(1)} puan
        </span>
      </div>

      {/* Marj area chart */}
      <div className="h-40 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={son12Ay}>
            <defs>
              <linearGradient id="marj-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={eriyor ? "#ef4444" : "#22c55e"} stopOpacity={0.45} />
                <stop offset="100%" stopColor={eriyor ? "#ef4444" : "#22c55e"} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="ay"
              tick={{ fontSize: 10, fill: "rgb(113,113,122)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => `%${v}`}
              tick={{ fontSize: 10, fill: "rgb(113,113,122)" }}
              tickLine={false}
              axisLine={false}
              width={36}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(9,9,11,0.95)",
                border: "1px solid rgb(39,39,42)",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v: number) => [`%${v.toFixed(1)}`, "Brüt marj"]}
              labelStyle={{ color: "rgb(244,244,245)" }}
            />
            <ReferenceLine
              y={ortalama}
              stroke="rgb(113,113,122)"
              strokeDasharray="3 3"
              label={{ value: "ort", fill: "rgb(113,113,122)", fontSize: 9, position: "right" }}
            />
            <Area
              type="monotone"
              dataKey="brutMarj"
              stroke={eriyor ? "#ef4444" : "#22c55e"}
              strokeWidth={2}
              fill="url(#marj-fill)"
              isAnimationActive
              animationDuration={1400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sorumlu gider kategorisi */}
      {enHizliArtanGider && enHizliArtanGider.trend > 0 && (
        <div
          className="mt-4 p-3 rounded-xl flex items-center gap-3"
          style={{
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.30)",
          }}
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-lg shrink-0"
            style={{ background: "rgba(245,158,11,0.18)", color: "rgb(245,158,11)" }}
          >
            <AlertTriangle size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-zinc-100">
              Marj baskısının ana kaynağı: {enHizliArtanGider.ad}
            </div>
            <div className="text-[10.5px] text-zinc-500 mt-0.5">
              12 ayda +{enHizliArtanGider.trend.toFixed(1)}% büyüdü · şu an{" "}
              <span className="font-mono">{formatTL(enHizliArtanGider.tutar)}</span>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
