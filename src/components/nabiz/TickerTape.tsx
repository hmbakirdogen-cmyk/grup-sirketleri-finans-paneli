// TickerTape — CNBC tarzı yatay scroll KPI şeridi
// Sadece çekirdek 3 ortak için (4 firma toplam KPI canlı akış)
//
// Estetik: Bloomberg HT / CNBC alt bant — finansal ciddiyet + akıcı hareket
// Mehmet Bey direktifi: "Haberlerde alt yazılar, ticker tape — bunlara bayılıyorum"

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FINANS_VERISI } from "@/data/mock-finans";
import { FIRMALAR } from "@/data/firmalar";
import type { FirmaId } from "@/types/domain";

interface TickerItem {
  firmaId: FirmaId;
  firmaAd: string;
  firmaRenk: string;
  metrik: string;
  deger: string;
  delta: number;
}

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function uretItems(): TickerItem[] {
  const items: TickerItem[] = [];
  const firmaIds: FirmaId[] = ["meba", "mesa", "elmos", "arkon"];

  firmaIds.forEach((fId) => {
    const firma = FIRMALAR[fId];
    const finans = FINANS_VERISI[fId];
    const son = finans.son12Ay[finans.son12Ay.length - 1]!;
    const onceki = finans.son12Ay[finans.son12Ay.length - 2]!;

    items.push({
      firmaId: fId,
      firmaAd: firma.kisaAd,
      firmaRenk: firma.renk,
      metrik: "CIRO",
      deger: `${formatTL(son.ciro)} ₺`,
      delta: ((son.ciro - onceki.ciro) / onceki.ciro) * 100,
    });
    items.push({
      firmaId: fId,
      firmaAd: firma.kisaAd,
      firmaRenk: firma.renk,
      metrik: "MARJ",
      deger: `%${son.brutMarj.toFixed(1)}`,
      delta: son.brutMarj - onceki.brutMarj,
    });
    items.push({
      firmaId: fId,
      firmaAd: firma.kisaAd,
      firmaRenk: firma.renk,
      metrik: "NAKİT",
      deger: `${formatTL(son.nakit)} ₺`,
      delta: ((son.nakit - onceki.nakit) / onceki.nakit) * 100,
    });
  });

  return items;
}

export function TickerTape() {
  const items = useMemo(() => uretItems(), []);
  // Sonsuz scroll için 2x render — CSS animasyonu seamless loop
  const duplicate = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y border-zinc-900/80 bg-black/60"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Gradient kenar fade */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.95), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
        style={{
          background: "linear-gradient(270deg, rgba(0,0,0,0.95), transparent)",
        }}
      />

      <div
        className="flex items-center gap-8 py-2.5 whitespace-nowrap"
        style={{
          animation: "ticker-scroll 60s linear infinite",
        }}
      >
        {duplicate.map((item, i) => {
          const yukari = item.delta > 0;
          const renk = yukari ? "rgb(34,197,94)" : "rgb(239,68,68)";
          return (
            <div key={i} className="inline-flex items-center gap-2 text-[12px] shrink-0">
              <span
                className="inline-flex items-center gap-1.5 font-bold text-zinc-100"
                style={{ color: item.firmaRenk }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: item.firmaRenk }}
                />
                {item.firmaAd}
              </span>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                {item.metrik}
              </span>
              <span className="font-mono tabular-nums text-zinc-100 font-semibold">
                {item.deger}
              </span>
              <span
                className="inline-flex items-center gap-0.5 font-mono text-[11px] font-bold tabular-nums"
                style={{ color: renk }}
              >
                {yukari ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {yukari && "+"}
                {item.delta.toFixed(1)}%
              </span>
              <span className="text-zinc-700 mx-2">·</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
