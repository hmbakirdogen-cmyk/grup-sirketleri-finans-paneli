// ParaHaritasiSayfasi — "Nereden geliyor, nereye gidiyor"
//
// 3 ana bölüm:
//   1. Kâr Akış Köprüsü (Net Satış → Net Kâr waterfall) — üstte tek geniş kart
//   2. Gelir kategorileri (sol grid) + Gider kategorileri (sağ grid) — KategoriKart
//   3. Marj Erozyon Paneli — son satır, full width
//
// Mehmet Bey direktifi (memory):
// - "Bir kategoriye tıkla, Cari Detay'a o filtreyle git" → şimdilik
//   onTikla console.log, v2'de useNavigate ile Cari Detay'a yönlendirme + filtre param.
// - Broadcast quality: count-up + smooth area + gradient bar.

import { useMemo } from "react";
import { Map as MapIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FINANS_VERISI } from "@/data/gercek-finans";
import { FIRMALAR } from "@/data/firmalar";
import { KategoriKart } from "@/components/para-haritasi/KategoriKart";
import { MarjErozyonPaneli } from "@/components/para-haritasi/MarjErozyonPaneli";
import { KarWaterfall } from "@/components/para-haritasi/KarWaterfall";
import { notify } from "@/lib/notify";
import type { ParaHaritasiKategori } from "@/types/domain";

export function ParaHaritasiSayfasi() {
  const { aktifFirma } = useAuth();
  const firma = FIRMALAR[aktifFirma];
  const finans = FINANS_VERISI[aktifFirma];

  const gelirler = useMemo(
    () => finans.paraHaritasi.filter((k) => k.tip === "gelir").sort((a, b) => b.tutar - a.tutar),
    [finans.paraHaritasi],
  );
  const giderler = useMemo(
    () => finans.paraHaritasi.filter((k) => k.tip === "gider").sort((a, b) => b.tutar - a.tutar),
    [finans.paraHaritasi],
  );

  function kategoriTiklandi(k: ParaHaritasiKategori) {
    // v2: navigate(`/${aktifFirma}/cari-detay?kategori=${encodeURIComponent(k.ad)}`)
    console.log("[ParaHaritasi] kategori tıklandı:", k.ad);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 space-y-5">
      {/* Sayfa başlığı */}
      <header className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${firma.renk}, ${firma.renk}aa)`,
            boxShadow: `0 8px 20px ${firma.renk}55`,
          }}
        >
          <MapIcon size={20} />
        </span>
        <div className="flex-1">
          <h1
            className="text-2xl font-bold text-zinc-100 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Para Haritası
          </h1>
          <p className="text-[12.5px] text-zinc-500 mt-1">
            {firma.kisaAd} · Nereden geliyor, nereye gidiyor — yıllık akış
          </p>
        </div>
      </header>

      {/* Kâr akış köprüsü — full width */}
      <KarWaterfall gelirTablosu={finans.gelirTablosu} />

      {/* Gelir + Gider kategori grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sol — Gelirler */}
        <section>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              Gelir Kategorileri
            </h2>
            <span className="text-[10px] text-zinc-500">{gelirler.length} kalem</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {gelirler.map((k) => (
              <KategoriKart key={k.ad} kategori={k} onTikla={kategoriTiklandi} />
            ))}
          </div>
        </section>

        {/* Sağ — Giderler */}
        <section>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
              Gider Kategorileri
            </h2>
            <span className="text-[10px] text-zinc-500">{giderler.length} kalem</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {giderler.map((k) => (
              <KategoriKart key={k.ad} kategori={k} onTikla={kategoriTiklandi} />
            ))}
          </div>
        </section>
      </div>

      {/* Marj erozyon paneli */}
      <MarjErozyonPaneli son12Ay={finans.son12Ay} paraHaritasi={finans.paraHaritasi} />
    </div>
  );
}
