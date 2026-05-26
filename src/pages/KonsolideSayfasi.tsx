// KonsolideSayfasi — 4 firma grup özeti.
// Sadece Çekirdek Ortaklar (Mehmet Maraş + Fatih Lazoğlu + Ahmet Esmeray Bey) görür.
// Grup içi alım-satım düşülmüş net konsolide ciro.

import { useMemo } from "react";
import {
  Layers,
  Wallet,
  TrendingUp,
  Coins,
  Banknote,
} from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { AnaGrafik } from "@/components/dash/AnaGrafik";
import { OzetKart } from "@/components/dash/OzetKart";
import { Chart3DBackdrop } from "@/components/dash/Chart3DBackdrop";
import { FIRMALAR } from "@/data/firmalar";
import { FINANS_VERISI, konsolideOzetUret } from "@/data/mock-finans";
import { TEMA, FONT, fmtTL, fmtYuzde, rengiKaristir } from "@/lib/tema";
import type { FirmaId, YilTrendNoktasi } from "@/types/domain";

const FIRMA_LISTE: FirmaId[] = ["meba", "mesa", "elmos", "arkon"];

// Grup için ayrı kimlik rengi: violet — firmadan bağımsız "grup" kimliği
const GRUP_RENK = "#8b5cf6";

export function KonsolideSayfasi() {
  const ozet = konsolideOzetUret();

  const firmaToplamlari = useMemo(() => {
    return FIRMA_LISTE.map((f) => {
      const finans = FINANS_VERISI[f];
      const yillik = finans.son12Ay.reduce((s, a) => s + a.ciro, 0);
      const sparkline = finans.son12Ay.map((a) => a.ciro);
      const son = finans.son12Ay[finans.son12Ay.length - 1]!;
      const ilk = finans.son12Ay[0]!;
      const delta = ((son.ciro - ilk.ciro) / ilk.ciro) * 100;
      return {
        firma: FIRMALAR[f],
        yillikCiro: yillik,
        sparkline,
        delta,
        netKar: son.netKar * 12,
      };
    }).sort((a, b) => b.yillikCiro - a.yillikCiro);
  }, []);

  const konsolideTrend: YilTrendNoktasi[] = useMemo(() => {
    const meba = FINANS_VERISI.meba.yillarTrend;
    return meba.map((_, i) => {
      const ay = meba[i]!.ay;
      let y2024 = 0, y2025 = 0, y2026 = 0, hedef = 0;
      FIRMA_LISTE.forEach((f) => {
        const n = FINANS_VERISI[f].yillarTrend[i]!;
        y2024 += n.y2024;
        y2025 += n.y2025;
        y2026 += n.y2026;
        hedef += n.hedef;
      });
      const grupIciAylik = 14_500_000 / 12;
      return {
        ay,
        y2024: y2024 - Math.round(grupIciAylik * 0.68),
        y2025: y2025 - Math.round(grupIciAylik * 0.82),
        y2026: y2026 - Math.round(grupIciAylik),
        hedef,
      };
    });
  }, []);

  const enBuyuk = firmaToplamlari[0]!;
  const enHizliBuyuyen = [...firmaToplamlari].sort((a, b) => b.delta - a.delta)[0]!;
  const maxYillik = Math.max(...firmaToplamlari.map((f) => f.yillikCiro));

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: GRUP_RENK,
            fontWeight: 600,
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          Konsolide Grup Paneli
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
          4 Firma Birlikte — Çekirdek Ortak Görünümü
        </h1>
        <p
          style={{
            fontSize: 13,
            color: TEMA.inkMuted,
            marginTop: 6,
            marginBottom: 0,
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          MEBA · MESA · ELMOS · ARKON yıllık toplamları — grup içi alım-satım{" "}
          <strong style={{ color: TEMA.altin }}>{fmtTL(ozet.grupIciDüsulen)}</strong>{" "}
          düşülerek konsolide edilmiştir. Sadece Çekirdek Ortak rolüne açık.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <KpiKart
          etiket="Konsolide Ciro"
          numerikDeger={ozet.toplamCiro}
          ondalik={0}
          sonek=" ₺"
          tone={GRUP_RENK}
          ikon={Wallet}
          vurgu
        />
        <KpiKart
          etiket="Brüt Kâr Toplamı"
          numerikDeger={ozet.toplamBrutKar}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.altin}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="Net Kâr Toplamı"
          numerikDeger={ozet.toplamNetKar}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.yesil}
          ikon={Coins}
        />
        <KpiKart
          etiket="Grup Nakit"
          numerikDeger={ozet.toplamNakit}
          ondalik={0}
          sonek=" ₺"
          tone="#60a5fa"
          ikon={Banknote}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Chart3DBackdrop tint={GRUP_RENK} style={{ background: TEMA.bgKart }}>
          <AnaGrafik
            veri={konsolideTrend}
            baslik="Konsolide 3 Yıllık Ciro"
            altBaslik="4 firma toplam · grup içi alım düşülmüş"
            accent={GRUP_RENK}
          />
        </Chart3DBackdrop>

        <div
          data-anim="ozet"
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 16,
            padding: "22px 22px 20px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: TEMA.inkMuted,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Layers size={11} />
              Firma Karşılaştırması
            </div>
            <div style={{ fontSize: 14, color: TEMA.inkSoft }}>
              Yıllık ciro · büyükten küçüğe
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {firmaToplamlari.map((f) => {
              const oran = (f.yillikCiro / maxYillik) * 100;
              return (
                <div key={f.firma.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 6,
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: FONT.ana,
                        fontSize: 13,
                        fontWeight: 600,
                        color: TEMA.ink,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: f.firma.renk,
                          boxShadow: `0 0 8px ${f.firma.renk}90`,
                        }}
                      />
                      {f.firma.kisaAd}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT.num,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: TEMA.ink,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmtTL(f.yillikCiro)}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT.ana,
                        fontSize: 11,
                        fontWeight: 700,
                        color: f.delta > 0 ? TEMA.yesil : TEMA.kirmizi,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 44,
                        textAlign: "right",
                      }}
                    >
                      {f.delta > 0 ? "+" : ""}
                      {f.delta.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 8,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
                      borderRadius: 999,
                      boxShadow:
                        "inset 0 1px 2px rgba(0,0,0,0.50), inset 0 -1px 0 rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: `${oran}%`,
                        background: `linear-gradient(90deg, ${rengiKaristir(f.firma.renk, 0.25, "darker")}, ${f.firma.renk} 55%, ${rengiKaristir(f.firma.renk, 0.35, "lighter")})`,
                        borderRadius: 999,
                        transition: "width 1200ms cubic-bezier(0.22,0.61,0.36,1)",
                        boxShadow: [
                          "inset 0 1px 0 rgba(255,255,255,0.35)",
                          "inset 0 -1px 0 rgba(0,0,0,0.20)",
                          `0 0 10px ${f.firma.renk}60`,
                        ].join(", "),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: `1px solid ${TEMA.border}`,
              fontSize: 12,
              color: TEMA.inkSoft,
              lineHeight: 1.5,
            }}
          >
            En büyük: <strong style={{ color: enBuyuk.firma.renk }}>{enBuyuk.firma.kisaAd}</strong> ({fmtTL(enBuyuk.yillikCiro)}).
            En hızlı büyüyen: <strong style={{ color: enHizliBuyuyen.firma.renk }}>{enHizliBuyuyen.firma.kisaAd}</strong>{" "}
            ({enHizliBuyuyen.delta > 0 ? "+" : ""}{enHizliBuyuyen.delta.toFixed(0)}%).
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <OzetKart
          etiket="Ortalama Marj"
          deger={fmtYuzde(ozet.ortalamaMarj)}
          baglam={`Konsolide bazda · grup ortalaması`}
          baglamRengi={ozet.ortalamaMarj > 18 ? "iyi" : ozet.ortalamaMarj > 14 ? "notr" : "kotu"}
        />
        <OzetKart
          etiket="Grup İçi Alım"
          deger={fmtTL(ozet.grupIciDüsulen)}
          baglam="Konsolideden düşülen tutar"
          baglamRengi="notr"
        />
        <OzetKart
          etiket="Net Açık Pozisyon"
          deger={fmtTL(ozet.toplamAlacak - ozet.toplamBorc)}
          baglam={`Alacak ${fmtTL(ozet.toplamAlacak)} · Borç ${fmtTL(ozet.toplamBorc)}`}
          baglamRengi={ozet.toplamAlacak > ozet.toplamBorc ? "iyi" : "kotu"}
        />
      </section>
    </>
  );
}
