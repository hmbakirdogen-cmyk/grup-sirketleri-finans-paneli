// KategoriKart — Para Haritası'nda her gelir/gider kategorisi için kart.
//
// Görsel: GlassCard + sol renkli bar (gelir = yeşil, gider = amber)
// + büyük tutar (count-up) + oran progress + trend rozet + üst cari isimleri.
//
// Mehmet Bey direktifi: "Bir kategoriye tıkla, Cari Detay'a o filtreyle git."
// MVP: tıklama console.log; v2'de useNavigate ile Cari Detay sayfasına yönlendirme.

import CountUp from "react-countup";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ParaHaritasiKategori } from "@/types/domain";

interface KategoriKartProps {
  kategori: ParaHaritasiKategori;
  onTikla?: (kategori: ParaHaritasiKategori) => void;
}

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n.toFixed(0)} ₺`;
}

export function KategoriKart({ kategori, onTikla }: KategoriKartProps) {
  const gelir = kategori.tip === "gelir";
  const renk = gelir ? "rgb(34,197,94)" : "rgb(245,158,11)";
  // Trend yön: gelir için yukarı iyidir, gider için aşağı iyidir.
  const trendIyi = gelir ? kategori.trend > 0 : kategori.trend < 0;
  const trendRenk = trendIyi ? "rgb(34,197,94)" : "rgb(239,68,68)";
  const TrendIcon = kategori.trend > 0 ? TrendingUp : TrendingDown;

  // En büyük 3 cari (görsel sade kalsın)
  const enBuyukCariler = [...kategori.cariler]
    .sort((a, b) => b.tutar - a.tutar)
    .slice(0, 3);

  return (
    <GlassCard
      hero
      parallax
      onClick={() => onTikla?.(kategori)}
      className="p-5 cursor-pointer group"
    >
      {/* Sol renkli bar */}
      <span
        aria-hidden
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ background: renk }}
      />

      <div className="pl-2">
        {/* Başlık + tip rozeti */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: renk }}>
              {gelir ? "GELİR" : "GİDER"}
            </div>
            <div className="text-[14px] font-semibold text-zinc-100 truncate">
              {kategori.ad}
            </div>
          </div>
          <ChevronRight
            size={14}
            className="text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0"
          />
        </div>

        {/* Büyük tutar — count-up */}
        <div
          className="font-bold text-zinc-100 tabular-nums leading-none mb-2"
          style={{
            fontSize: 24,
            letterSpacing: "-0.02em",
            fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
          }}
        >
          <CountUp
            end={kategori.tutar}
            duration={1.6}
            separator="."
            formattingFn={formatTL}
          />
        </div>

        {/* Oran progress + trend rozet */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, kategori.oran)}%`, background: renk }}
            />
          </div>
          <span className="text-[11px] tabular-nums font-semibold text-zinc-400 shrink-0">
            %{kategori.oran}
          </span>
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums shrink-0"
            style={{ background: `${trendRenk}1f`, color: trendRenk }}
          >
            <TrendIcon size={10} />
            {kategori.trend > 0 && "+"}
            {kategori.trend.toFixed(1)}%
          </span>
        </div>

        {/* Üst cariler */}
        {enBuyukCariler.length > 0 && (
          <div className="space-y-1 pt-3 border-t border-zinc-900">
            {enBuyukCariler.map((c) => (
              <div key={c.ad} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-400 truncate">{c.ad}</span>
                <span className="text-zinc-300 font-mono tabular-nums shrink-0">
                  {formatTL(c.tutar)}
                </span>
              </div>
            ))}
            {kategori.cariler.length > 3 && (
              <div className="text-[10px] text-zinc-600 pt-0.5">
                +{kategori.cariler.length - 3} cari daha
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
