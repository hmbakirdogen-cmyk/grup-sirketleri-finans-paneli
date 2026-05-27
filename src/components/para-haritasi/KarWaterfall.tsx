// KarWaterfall — Gelir → SMM → Brüt Kâr → Faaliyet Gider → Faaliyet Kâr →
// Finansman → Vergi → Net Kâr akışı, finansal bridge (waterfall) görseliyle.
//
// Bu, Para Haritası'nın "akış" görselidir — Sankey'in finansal versiyonu.
// Pigment + Mosaic kar bridge'inden esinlendi.
//
// Estetik: solda yeşil giriş (gelir) → ortada kırmızı düşümler (gider) →
// son barda büyük yeşil/kırmızı net kâr. Her bar üzerinde tutar ve oran.

import { GlassCard } from "@/components/shared/GlassCard";
import CountUp from "react-countup";
import type { MaliTabloKalemi } from "@/types/domain";

interface KarWaterfallProps {
  gelirTablosu: MaliTabloKalemi[];
}

function formatTL(n: number): string {
  const abs = Math.abs(n);
  const isaret = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${isaret}${(abs / 1_000_000).toFixed(1)}M ₺`;
  if (abs >= 1_000) return `${isaret}${(abs / 1_000).toFixed(0)}K ₺`;
  return `${isaret}${abs.toFixed(0)} ₺`;
}

interface BarVeri {
  ad: string;
  // Bar alt baz (en alttan ne kadar yukarıda başlıyor)
  taban: number;
  // Bar uzunluğu (görsel yükseklik)
  uzunluk: number;
  // Tutar (etiket için)
  tutar: number;
  // "giris" başlangıç + ara birikim · "dusus" gider · "sonuc" net kar
  tip: "giris" | "dusus" | "ara" | "sonuc";
}

function bridgeUret(gt: MaliTabloKalemi[]): BarVeri[] {
  // gelirTablosu satır sırası veri katmanında sabit:
  // 0: Net Satışlar, 1: SMM, 2: Brüt, 3: Faaliyet Gid, 4: Faaliyet Kâr,
  // 5: Finansman, 6: Vergi Öncesi, 7: Vergi, 8: Net Dönem Kârı
  const net = gt[0]?.tutar ?? 0;
  const smm = Math.abs(gt[1]?.tutar ?? 0);
  const brut = gt[2]?.tutar ?? 0;
  const fp = Math.abs(gt[3]?.tutar ?? 0);
  const faaliyet = gt[4]?.tutar ?? 0;
  const finansman = Math.abs(gt[5]?.tutar ?? 0);
  const vergi = Math.abs(gt[7]?.tutar ?? 0);
  const sonuc = gt[8]?.tutar ?? 0;

  return [
    { ad: "Net Satışlar", taban: 0, uzunluk: net, tutar: net, tip: "giris" },
    { ad: "Satışların Maliyeti", taban: brut, uzunluk: smm, tutar: -smm, tip: "dusus" },
    { ad: "Brüt Kâr", taban: 0, uzunluk: brut, tutar: brut, tip: "ara" },
    { ad: "Faaliyet Giderleri", taban: faaliyet, uzunluk: fp, tutar: -fp, tip: "dusus" },
    { ad: "Faaliyet Kârı", taban: 0, uzunluk: faaliyet, tutar: faaliyet, tip: "ara" },
    { ad: "Finansman + Vergi", taban: sonuc, uzunluk: finansman + vergi, tutar: -(finansman + vergi), tip: "dusus" },
    { ad: "Net Kâr", taban: 0, uzunluk: sonuc, tutar: sonuc, tip: "sonuc" },
  ];
}

const TIP_RENK: Record<BarVeri["tip"], { dolu: string; hafif: string }> = {
  giris: { dolu: "rgb(34,197,94)", hafif: "rgba(34,197,94,0.18)" },
  ara: { dolu: "rgb(14,165,233)", hafif: "rgba(14,165,233,0.18)" },
  dusus: { dolu: "rgb(239,68,68)", hafif: "rgba(239,68,68,0.18)" },
  sonuc: { dolu: "rgb(34,197,94)", hafif: "rgba(34,197,94,0.28)" },
};

export function KarWaterfall({ gelirTablosu }: KarWaterfallProps) {
  const barlar = bridgeUret(gelirTablosu);
  const enYuksek = Math.max(...barlar.map((b) => b.taban + b.uzunluk));
  const oran = (deger: number) => (deger / enYuksek) * 100;

  return (
    <GlassCard hero parallax className="p-5">
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
          Kâr Akış Köprüsü
        </div>
        <div className="text-[13px] text-zinc-300 mt-0.5">
          Net satıştan net kâra · gider düşümleri görünür
        </div>
      </div>

      {/* Bridge — yatay barlar, her bar farklı yükseklikte (taban + uzunluk) */}
      <div className="relative" style={{ height: 220 }}>
        <div className="absolute inset-0 flex items-end gap-1.5">
          {barlar.map((b, i) => {
            const renk = TIP_RENK[b.tip];
            const tabanYuzde = oran(b.taban);
            const uzunlukYuzde = oran(b.uzunluk);
            return (
              <div key={i} className="flex-1 relative h-full min-w-0">
                {/* Bar */}
                <div
                  className="absolute left-0 right-0 rounded-md transition-all duration-700"
                  style={{
                    bottom: `${tabanYuzde}%`,
                    height: `${uzunlukYuzde}%`,
                    background: `linear-gradient(180deg, ${renk.dolu}, ${renk.hafif})`,
                    boxShadow: `0 0 0 1px ${renk.dolu}66, inset 0 1px 0 rgba(255,255,255,0.10)`,
                    minHeight: 4,
                  }}
                />
                {/* Düşüm okunu işaretle */}
                {b.tip === "dusus" && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono tabular-nums whitespace-nowrap"
                    style={{
                      bottom: `${tabanYuzde + uzunlukYuzde + 2}%`,
                      color: renk.dolu,
                    }}
                  >
                    {formatTL(b.tutar)}
                  </div>
                )}
                {/* Üst etiket — giris/ara/sonuc */}
                {b.tip !== "dusus" && (
                  <div
                    className="absolute left-0 right-0 text-center text-[11px] font-mono tabular-nums font-semibold text-zinc-100 whitespace-nowrap"
                    style={{
                      bottom: `${tabanYuzde + uzunlukYuzde + 2}%`,
                    }}
                  >
                    <CountUp
                      end={b.tutar}
                      duration={1.4}
                      separator="."
                      formattingFn={(n) => formatTL(n)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alt etiketler */}
      <div className="flex items-start gap-1.5 mt-3">
        {barlar.map((b, i) => (
          <div key={i} className="flex-1 text-center text-[10px] leading-snug text-zinc-500 min-w-0">
            <div className="truncate" title={b.ad}>{b.ad}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
