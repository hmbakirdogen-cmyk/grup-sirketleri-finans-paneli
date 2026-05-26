// NakitIsiHaritasi — 13 haftalık ısı haritası
// Her hücre: 1 gün, renk = net nakit (giriş - çıkış). Yeşil ton = pozitif,
// kırmızı ton = negatif. Tooltip + tıklanınca alt panele detay.
//
// Görsel referans: GitHub commit calendar + Pigment cash heatmap.
// Mehmet Bey: "13 haftalık ısı haritası — her gün için net nakit."

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import type { NakitGun } from "@/types/domain";

interface NakitIsiHaritasiProps {
  gunler: NakitGun[];
  /** Senaryo katsayıları — slider'lardan etkilenir */
  tahsilatHizi?: number;
  yeniAlim?: number;
  vergiErtelemesi?: boolean;
}

function gunNakit(g: NakitGun): number {
  const giris = g.girisler.reduce((s, x) => s + x.tutar, 0);
  const cikis = g.cikislar.reduce((s, x) => s + x.tutar, 0);
  return giris - cikis;
}

function formatTL(n: number): string {
  const abs = Math.abs(n);
  const isaret = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${isaret}${(abs / 1_000_000).toFixed(2)}M ₺`;
  if (abs >= 1_000) return `${isaret}${(abs / 1_000).toFixed(0)}K ₺`;
  return `${isaret}${abs.toFixed(0)} ₺`;
}

function netRenk(net: number, maxAbs: number): string {
  if (maxAbs === 0) return "rgba(82,82,91,0.20)";
  const yogunluk = Math.min(1, Math.abs(net) / maxAbs);
  if (net > 0) {
    // yeşil tonları
    const opak = 0.10 + yogunluk * 0.60;
    return `rgba(34,197,94,${opak})`;
  }
  if (net < 0) {
    const opak = 0.10 + yogunluk * 0.60;
    return `rgba(239,68,68,${opak})`;
  }
  return "rgba(82,82,91,0.18)";
}

const GUN_BASLIK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function NakitIsiHaritasi({
  gunler,
  tahsilatHizi = 1,
  yeniAlim = 0,
  vergiErtelemesi = false,
}: NakitIsiHaritasiProps) {
  const [seciliGun, setSeciliGun] = useState<NakitGun | null>(null);

  // Senaryo uygulanmış günler — orijinal veriyi mutate etmiyor
  const islenmis = useMemo(
    () =>
      gunler.map((g) => {
        const yeniGirisler = g.girisler.map((x) => ({
          ...x,
          tutar: Math.round(x.tutar * tahsilatHizi),
        }));
        const yeniCikislar = g.cikislar
          .filter((x) => !(vergiErtelemesi && x.cari === "Devlet"))
          .map((x) => ({ ...x, tutar: x.tutar + Math.round(yeniAlim * 0.012) }));
        return { ...g, girisler: yeniGirisler, cikislar: yeniCikislar };
      }),
    [gunler, tahsilatHizi, yeniAlim, vergiErtelemesi],
  );

  const maxAbs = useMemo(
    () => Math.max(...islenmis.map((g) => Math.abs(gunNakit(g)))),
    [islenmis],
  );

  // Haftalara böl (her hafta 7 gün)
  const haftalar: NakitGun[][] = [];
  for (let i = 0; i < islenmis.length; i += 7) {
    haftalar.push(islenmis.slice(i, i + 7));
  }

  // Kümülatif net (90 gün toplam)
  const kumulatif = islenmis.reduce((s, g) => s + gunNakit(g), 0);

  return (
    <GlassCard hero className="p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
            13 Haftalık Nakit Isı Haritası
          </div>
          <div className="text-[13px] text-zinc-300 mt-0.5">
            Bugünden 90 gün ileri · senaryo slider'ları canlı uygulanır
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
            90 Gün Net
          </div>
          <div
            className="text-[18px] font-mono tabular-nums font-bold mt-0.5"
            style={{ color: kumulatif >= 0 ? "rgb(34,197,94)" : "rgb(239,68,68)" }}
          >
            {formatTL(kumulatif)}
          </div>
        </div>
      </div>

      {/* Grid: gün başlıkları + haftalar */}
      <div className="flex gap-1">
        {/* Sol gün başlıkları */}
        <div className="flex flex-col gap-1 pr-1">
          {GUN_BASLIK.map((g) => (
            <div
              key={g}
              className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider w-7 text-right pt-0.5"
              style={{ height: 18 }}
            >
              {g}
            </div>
          ))}
        </div>

        {/* Haftalar */}
        <div className="flex-1 flex gap-1 overflow-x-auto">
          {haftalar.map((hafta, hi) => (
            <div key={hi} className="flex flex-col gap-1 shrink-0">
              {Array.from({ length: 7 }).map((_, di) => {
                const g = hafta[di];
                if (!g) {
                  return <div key={di} style={{ width: 18, height: 18 }} />;
                }
                const net = gunNakit(g);
                const renk = netRenk(net, maxAbs);
                const tarih = new Date(g.tarih);
                const isToday =
                  tarih.toDateString() === new Date("2026-05-26").toDateString();
                return (
                  <motion.button
                    key={di}
                    type="button"
                    onClick={() => setSeciliGun(g)}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: hi * 0.015 + di * 0.005, duration: 0.25 }}
                    whileHover={{ scale: 1.4, zIndex: 10 }}
                    className="rounded-[3px] cursor-pointer"
                    style={{
                      width: 18,
                      height: 18,
                      background: renk,
                      border: isToday ? "1.5px solid rgb(244,244,245)" : "1px solid rgba(255,255,255,0.04)",
                    }}
                    title={`${tarih.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} · ${formatTL(net)}`}
                    aria-label={`${g.tarih} ${formatTL(net)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Renk skalası */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-500">
        <span>Az</span>
        <div className="flex gap-0.5">
          {[0.15, 0.30, 0.50, 0.70].map((o, i) => (
            <div
              key={i}
              className="rounded-[3px]"
              style={{ width: 12, height: 12, background: `rgba(239,68,68,${o})` }}
            />
          ))}
          <div className="rounded-[3px] mx-1" style={{ width: 12, height: 12, background: "rgba(82,82,91,0.18)" }} />
          {[0.15, 0.30, 0.50, 0.70].map((o, i) => (
            <div
              key={i}
              className="rounded-[3px]"
              style={{ width: 12, height: 12, background: `rgba(34,197,94,${o})` }}
            />
          ))}
        </div>
        <span>Çok</span>
        <span className="ml-auto">Bugün: çerçeveli</span>
      </div>

      {/* Seçili gün detay */}
      {seciliGun && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-zinc-900"
        >
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                Gün Detayı
              </div>
              <div className="text-[13px] font-semibold text-zinc-100 mt-0.5">
                {new Date(seciliGun.tarih).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSeciliGun(null)}
              className="text-[11px] text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 mb-1.5">
                Giriş · {formatTL(seciliGun.girisler.reduce((s, x) => s + x.tutar, 0))}
              </div>
              {seciliGun.girisler.length === 0 ? (
                <div className="text-[11px] text-zinc-600">Bu gün giriş yok.</div>
              ) : (
                <div className="space-y-1">
                  {seciliGun.girisler.map((x, i) => (
                    <div key={i} className="flex items-center justify-between text-[11.5px]">
                      <span className="text-zinc-300 truncate">{x.cari}</span>
                      <span className="font-mono tabular-nums text-emerald-400 shrink-0">
                        +{formatTL(x.tutar)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-red-400 mb-1.5">
                Çıkış · {formatTL(seciliGun.cikislar.reduce((s, x) => s + x.tutar, 0))}
              </div>
              {seciliGun.cikislar.length === 0 ? (
                <div className="text-[11px] text-zinc-600">Bu gün çıkış yok.</div>
              ) : (
                <div className="space-y-1">
                  {seciliGun.cikislar.map((x, i) => (
                    <div key={i} className="flex items-center justify-between text-[11.5px]">
                      <span className="text-zinc-300 truncate">{x.cari}</span>
                      <span className="font-mono tabular-nums text-red-400 shrink-0">
                        -{formatTL(x.tutar)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
