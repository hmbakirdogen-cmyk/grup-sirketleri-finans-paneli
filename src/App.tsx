// App — Grup Şirketleri Finans Paneli.
// Mehmet Bey direktifi 2026-05-26: "diğer programdaki yapıyı al da çek" +
// "renkler ve tonları hep farklı olsun".
//
// MEBA Komuta Merkezi'nden adapte edilen EliteHeader (Spatial Command Bar v3.1)
// kullanılır; aktif firma rengine göre tüm vurgu rengi dinamik kayar
// (CSS variable `--accent` root'tan set edilir, alt component'ler okur).

import { useMemo, useState } from "react";
import { FIRMALAR } from "./data/firmalar";
import { FINANS_VERISI } from "./data/mock-finans";
import { KULLANICILAR } from "./data/kullanicilar";
import { KpiKart } from "./components/dash/KpiKart";
import { AnaGrafik } from "./components/dash/AnaGrafik";
import { OzetKart } from "./components/dash/OzetKart";
import { MaliTakvimRozetMini } from "./components/dash/MaliTakvimRozetMini";
import { YoneticiOzeti } from "./components/dash/YoneticiOzeti";
import { EliteHeader } from "./components/dash/EliteHeader";
import type { Sekme } from "./components/dash/SekmeNav";
import { TEMA, FONT, fmtTL, fmtYuzde } from "./lib/tema";
import type { FirmaId } from "./types/domain";

// Şimdilik mock aktif kullanıcı; v2'de useAuth'a bağlanır.
const aktifKullanici = KULLANICILAR["mehmet-maras"]!; // Çekirdek ortak — 4 firma görür

export function App() {
  const [aktif, setAktif] = useState<FirmaId>("meba");
  const [sekme, setSekme] = useState<Sekme>("nabiz");

  const firma = FIRMALAR[aktif];
  const finans = FINANS_VERISI[aktif];

  // Yıllık özet — mevcut hesap mantığı korundu
  const ozet = useMemo(() => {
    const son12 = finans.son12Ay;
    const son = son12[son12.length - 1]!;
    const ilk = son12[0]!;

    const yillikCiro = son12.reduce((s, a) => s + a.ciro, 0);
    const ortalamaMarj = son12.reduce((s, a) => s + a.brutMarj, 0) / son12.length;
    const brutKarYillik = Math.round(yillikCiro * (ortalamaMarj / 100));
    const netKarYillik = son12.reduce((s, a) => s + a.netKar, 0);
    const nakitAylik = son.nakit;

    const ciroYilDelta = ((son.ciro - ilk.ciro) / ilk.ciro) * 100;
    const marjYilDelta = son.brutMarj - ilk.brutMarj;

    const aylikHedef = (yillikCiro / 12) * 1.04;
    const yillikHedef = aylikHedef * 12;
    const hedefGerceklesme = (yillikCiro / yillikHedef) * 100;

    const son3Ay = son12.slice(-3);
    const tahmin3Ay = Math.round((son3Ay.reduce((s, a) => s + a.ciro, 0) / 3) * 3);

    const operasyonel = Math.min(100, ortalamaMarj * 5 + 35);
    const aylikOrtGider = (yillikCiro - netKarYillik) / 12;
    const nakitYeterliligi = Math.min(100, (nakitAylik / Math.max(aylikOrtGider, 1)) * 100);

    return {
      yillikCiro,
      brutKarYillik,
      netKarYillik,
      nakitAylik,
      ortalamaMarj,
      ciroYilDelta,
      marjYilDelta,
      aylikHedef,
      tahmin3Ay,
      hedefGerceklesme,
      operasyonel,
      nakitYeterliligi,
    };
  }, [finans]);

  const durumRengi: "iyi" | "dikkat" | "kotu" =
    ozet.hedefGerceklesme >= 95 && ozet.ortalamaMarj > 15 ? "iyi" :
    ozet.hedefGerceklesme >= 80 ? "dikkat" : "kotu";

  const durumMetni =
    ozet.hedefGerceklesme >= 95
      ? `Ciro hedefin ${ozet.hedefGerceklesme >= 100 ? "üstünde" : "yakınında"}, nakit pozisyonu sağlam. Marjı korumak için maliyet tarafı izlenmeli.`
      : ozet.hedefGerceklesme >= 80
        ? `Hedefe ${(100 - ozet.hedefGerceklesme).toFixed(0)} puan uzaktayız; son çeyrekte ivme yakalanırsa kapanabilir. Açık alacaklar takipte tutulmalı.`
        : `Hedefin altında seyrediyoruz; tahsilat hızı ve marj baskısı gözden geçirilmeli. Bayilerle mutabakat tazelenirse toparlanma olası.`;

  // Çekirdek ortak için 4 firma; tek firma yöneticisi için sadece izinli olanlar
  const erisilebilirFirmalar = aktifKullanici.firmaIzin;

  return (
    <div
      style={{
        // Aktif firma rengini tüm sayfa scope'una CSS var olarak set et
        // Alt componentler `var(--accent, fallback)` ile okur
        ["--accent" as never]: firma.renk,
        background: TEMA.bg,
        color: TEMA.ink,
        minHeight: "100vh",
        fontFamily: FONT.ana,
        WebkitFontSmoothing: "antialiased",
      } as React.CSSProperties}
    >
      <EliteHeader
        aktifSekme={sekme}
        onSekmeSec={setSekme}
        aktifFirma={aktif}
        erisilebilirFirmalar={erisilebilirFirmalar}
        onFirmaSec={setAktif}
        aktifKullanici={aktifKullanici}
      />

      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "28px 24px 80px",
        }}
      >
        {/* Mali Takvim üst rozet */}
        <MaliTakvimRozetMini />

        {/* Sayfa başlığı */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: firma.renk,
              fontWeight: 600,
              marginBottom: 6,
              opacity: 0.85,
            }}
          >
            Finansal Nabız · {firma.konum.split(" ")[0]}
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
              color: TEMA.ink,
            }}
          >
            {firma.unvan}
          </h1>
        </div>

        {sekme === "nabiz" && (
          <>
            {/* ÜST — 4 KPI */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <KpiKart
                etiket="Toplam Ciro"
                deger={fmtTL(ozet.yillikCiro)}
                delta={ozet.ciroYilDelta}
                deltaEtiketi="geçen döneme göre"
                vurgu
              />
              <KpiKart
                etiket="Brüt Kâr"
                deger={fmtTL(ozet.brutKarYillik)}
                delta={ozet.marjYilDelta}
                deltaEtiketi="marj puanı"
              />
              <KpiKart
                etiket="Net Kâr"
                deger={fmtTL(ozet.netKarYillik)}
                delta={ozet.ciroYilDelta * 0.62}
                deltaEtiketi="geçen döneme göre"
              />
              <KpiKart
                etiket="Nakit Akışı"
                deger={fmtTL(ozet.nakitAylik)}
                delta={4.2}
                deltaEtiketi="son ay"
              />
            </section>

            {/* ORTA — büyük grafik (sol 2/3) + Yönetici Özeti (sağ 1/3) */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <AnaGrafik
                veri={finans.son12Ay.map((a) => ({ ay: a.ay, ciro: a.ciro }))}
                hedefAylik={ozet.aylikHedef}
                baslik="Gelir ve Kâr Trendi"
                altBaslik={`Aylık karşılaştırmalı performans · ort ${fmtTL(ozet.yillikCiro / 12)}`}
                accent={firma.renk}
              />

              <YoneticiOzeti
                baslik="Yönetici Özeti"
                altBaslik="Bu dönem performansı"
                accent={firma.renk}
                satirlar={[
                  { etiket: "Hedef Gerçekleşme", yuzde: ozet.hedefGerceklesme, renk: "accent" },
                  { etiket: "Operasyonel Verimlilik", yuzde: ozet.operasyonel, renk: "yesil" },
                  { etiket: "Nakit Yeterliliği", yuzde: ozet.nakitYeterliligi, renk: "altin" },
                ]}
                durumBasligi="Genel Durum"
                durumMetni={durumMetni}
                durumRengi={durumRengi}
              />
            </section>

            {/* ALT — 3 destek kart */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              <OzetKart
                etiket="Kâr Marjı"
                deger={fmtYuzde(ozet.ortalamaMarj)}
                baglam={ozet.ortalamaMarj > 15 ? "Hedef %15 — üstünde" : "Hedef %15 — altında"}
                baglamRengi={ozet.ortalamaMarj > 15 ? "iyi" : "kotu"}
              />
              <OzetKart
                etiket="Tahmin · 3 Ay"
                deger={fmtTL(ozet.tahmin3Ay)}
                baglam="Son 3 ay ortalamasına göre"
                baglamRengi="notr"
              />
              <OzetKart
                etiket="Performans"
                deger={fmtYuzde(ozet.hedefGerceklesme)}
                baglam={
                  ozet.hedefGerceklesme >= 100
                    ? "Yıllık hedef karşılandı"
                    : `Hedefe ${(100 - ozet.hedefGerceklesme).toFixed(0)} puan uzak`
                }
                baglamRengi={ozet.hedefGerceklesme >= 100 ? "iyi" : "notr"}
              />
            </section>
          </>
        )}

        {sekme !== "nabiz" && <SayfaIskelet sekme={sekme} />}

        {/* Alt — minimal byline */}
        <footer
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: `1px solid ${TEMA.border}`,
            fontSize: 11,
            color: TEMA.inkFaded,
            display: "flex",
            justifyContent: "space-between",
            letterSpacing: "0.04em",
          }}
        >
          <span>Veri: Logo Go canlı sync · {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>Grup Şirketleri · MEBA · MESA · ELMOS · ARKON</span>
        </footer>
      </div>

      <style>{`
        [data-anim] {
          animation: fadeUp 280ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        [data-anim='kpi']:nth-of-type(1) { animation-delay: 0ms; }
        [data-anim='kpi']:nth-of-type(2) { animation-delay: 50ms; }
        [data-anim='kpi']:nth-of-type(3) { animation-delay: 100ms; }
        [data-anim='kpi']:nth-of-type(4) { animation-delay: 150ms; }
        [data-anim='grafik'] { animation-delay: 200ms; }
        [data-anim='ozet']:nth-of-type(1) { animation-delay: 280ms; }
        [data-anim='ozet']:nth-of-type(2) { animation-delay: 330ms; }
        [data-anim='ozet']:nth-of-type(3) { animation-delay: 380ms; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1100px) {
          section[style*="2fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          section[style*="repeat(4, 1fr)"],
          section[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          section[style*="repeat(4, 1fr)"],
          section[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-anim] { animation: none; }
        }
      `}</style>
    </div>
  );
}

function SayfaIskelet({ sekme }: { sekme: Sekme }) {
  const baslik =
    sekme === "akis"
      ? "Akış"
      : sekme === "alacaklar"
        ? "Alacaklar"
        : sekme === "raporlar"
          ? "Raporlar"
          : "Ayarlar";

  const aciklama =
    sekme === "akis"
      ? "Gelir ve gider kategori akışı, marj erozyon paneli."
      : sekme === "alacaklar"
        ? "Açık cari takibi, vade dağılımı, riskli müşteriler."
        : sekme === "raporlar"
          ? "Bilanço ve gelir tablosu yönetici özeti, dönem karşılaştırma."
          : "Kullanıcı, firma ve veri kaynağı ayarları.";

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "60px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
          fontWeight: 500,
          marginBottom: 10,
        }}
      >
        Yapım Aşamasında
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
          color: TEMA.ink,
        }}
      >
        {baslik}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: TEMA.inkSoft,
          marginTop: 10,
          marginBottom: 0,
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.5,
        }}
      >
        {aciklama}
      </p>
      <p
        style={{
          fontSize: 12,
          color: TEMA.inkFaded,
          marginTop: 20,
          fontStyle: "italic",
        }}
      >
        Bu sayfa Lovable brief paketinde tanımlı; bir sonraki sprint'te bağlanacak.
      </p>
    </div>
  );
}
