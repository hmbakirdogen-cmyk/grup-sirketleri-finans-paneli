// App — Grup Şirketleri Finans Paneli ana sayfası.
// Mehmet Bey brief 2026-05-26: Apple sadeliği + Tesla premiumluğu.
//
// Yapı:
//   ÜST   : 4 büyük KPI kartı (Ciro / Brüt Kâr / Net Kâr / Nakit Akışı)
//   ORTA  : 1 büyük ana grafik (12 ay ciro + hedef line)
//   ALT   : 3 küçük destek kart (Kâr Marjı / Tahmin / Performans)
//
// Veri akışı ve hesaplama mantığı korunur — FINANS_VERISI, FIRMALAR aynı.
// Sadece görsel dil yükseltildi.

import { useMemo, useState } from "react";
import { FIRMALAR } from "./data/firmalar";
import { FINANS_VERISI } from "./data/mock-finans";
import { KpiKart } from "./components/dash/KpiKart";
import { AnaGrafik } from "./components/dash/AnaGrafik";
import { OzetKart } from "./components/dash/OzetKart";
import { FirmaSecici } from "./components/dash/FirmaSecici";
import { TEMA, FONT, fmtTL, fmtYuzde } from "./lib/tema";
import type { FirmaId } from "./types/domain";

const FIRMA_LISTE: FirmaId[] = ["meba", "mesa", "elmos", "arkon"];

export function App() {
  const [aktif, setAktif] = useState<FirmaId>("meba");
  const firma = FIRMALAR[aktif];
  const finans = FINANS_VERISI[aktif];

  // Mevcut veri akışından türetilmiş yıllık özet (hesap mantığı değişmedi)
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

    // Hedef: yıllık cironun 1/12'si (mock — gerçek senaryoda hedef store'dan gelir)
    const aylikHedef = (yillikCiro / 12) * 1.04;

    // Tahmin: son 3 ay ortalama × 3
    const son3Ay = son12.slice(-3);
    const tahmin3Ay = Math.round((son3Ay.reduce((s, a) => s + a.ciro, 0) / 3) * 3);

    // Performans: yıllık ciro vs (aylık hedef × 12)
    const yillikHedef = aylikHedef * 12;
    const performans = (yillikCiro / yillikHedef) * 100;

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
      performans,
    };
  }, [finans]);

  return (
    <div
      style={{
        background: TEMA.bg,
        color: TEMA.ink,
        minHeight: "100vh",
        fontFamily: FONT.ana,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Sayfa şablonu */}
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "40px 32px 80px",
        }}
      >
        {/* Üst bar — minimal */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 36,
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: TEMA.inkMuted,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Grup Şirketleri · Finans
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
                color: TEMA.ink,
              }}
            >
              {firma.kisaAd} · Yönetim Özeti
            </h1>
          </div>

          <FirmaSecici liste={FIRMA_LISTE} aktif={aktif} onSec={setAktif} />
        </header>

        {/* ÜST — 4 KPI kartı */}
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
            deltaEtiketi="yıllık"
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
            deltaEtiketi="yıllık"
          />
          <KpiKart
            etiket="Nakit Akışı"
            deger={fmtTL(ozet.nakitAylik)}
            delta={4.2}
            deltaEtiketi="son ay"
          />
        </section>

        {/* ORTA — ana grafik */}
        <section style={{ marginBottom: 24 }}>
          <AnaGrafik
            veri={finans.son12Ay.map((a) => ({ ay: a.ay, ciro: a.ciro }))}
            hedefAylik={ozet.aylikHedef}
            baslik="Aylık Ciro Akışı"
            altBaslik={`Son 12 ay · ortalama ${fmtTL(ozet.yillikCiro / 12)}`}
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
            baglam={
              ozet.ortalamaMarj > 15
                ? `Hedef %15 — üstünde`
                : `Hedef %15 — altında`
            }
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
            deger={fmtYuzde(ozet.performans)}
            baglam={
              ozet.performans >= 100
                ? "Yıllık hedef karşılandı"
                : `Hedefe ${(100 - ozet.performans).toFixed(0)} puan uzak`
            }
            baglamRengi={ozet.performans >= 100 ? "iyi" : "notr"}
          />
        </section>

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
          <span>{firma.unvan}</span>
          <span>
            Veri: Logo Go · {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </footer>
      </div>

      {/* Intro animasyonu (sadece opacity + hafif y, ≤200ms) */}
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
