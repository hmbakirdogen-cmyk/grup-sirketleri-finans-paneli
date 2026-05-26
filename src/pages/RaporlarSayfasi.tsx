// RaporlarSayfasi — Bilanço + Gelir Tablosu yönetici özeti.

import { useMemo } from "react";
import { FileText, Coins, Wallet, TrendingUp } from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { TEMA, FONT, fmtTL, fmtYuzde } from "@/lib/tema";
import type { Firma, FirmaFinans, MaliTabloKalemi } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

export function RaporlarSayfasi({ firma, finans }: Props) {
  const ozet = useMemo(() => {
    const aktifToplam = finans.bilanco.aktif.reduce((s, k) => s + k.tutar, 0);
    const pasifToplam = finans.bilanco.pasif.reduce((s, k) => s + k.tutar, 0);
    const ozKaynak = finans.bilanco.pasif.find((k) => k.ad.includes("Öz Kaynaklar"))?.tutar ?? 0;
    const kvBorc = finans.bilanco.pasif.find((k) => k.ad.includes("Kısa Vadeli"))?.tutar ?? 0;
    const donenVarlik = finans.bilanco.aktif.find((k) => k.ad.includes("Dönen"))?.tutar ?? 0;
    const nakitVeBenzeri =
      finans.bilanco.aktif
        .find((k) => k.ad.includes("Dönen"))
        ?.alt?.find((a) => a.ad.includes("Nakit"))?.tutar ?? 0;

    const netSatis = finans.gelirTablosu.find((k) => k.ad.includes("Net Satışlar"))?.tutar ?? 0;
    const brutKar = finans.gelirTablosu.find((k) => k.ad.includes("Brüt Satış Karı"))?.tutar ?? 0;
    const netKar = finans.gelirTablosu.find((k) => k.ad.includes("Net Dönem Karı"))?.tutar ?? 0;

    // Finansal oranlar
    const cariOran = kvBorc > 0 ? donenVarlik / kvBorc : 0;
    const likiditeOrani = kvBorc > 0 ? nakitVeBenzeri / kvBorc : 0;
    const borcOzKaynak = ozKaynak > 0 ? (aktifToplam - ozKaynak) / ozKaynak : 0;
    const netMarj = netSatis > 0 ? (netKar / netSatis) * 100 : 0;

    return {
      aktifToplam,
      pasifToplam,
      ozKaynak,
      netSatis,
      brutKar,
      netKar,
      cariOran,
      likiditeOrani,
      borcOzKaynak,
      netMarj,
    };
  }, [finans]);

  return (
    <>
      <div style={{ marginBottom: 20 }}>
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
          Mali Raporlar · {firma.konum.split(" ")[0]}
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
          Bilanço ve Gelir Tablosu
        </h1>
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
          etiket="Aktif Toplam"
          numerikDeger={ozet.aktifToplam}
          ondalik={0}
          sonek=" ₺"
          tone={firma.renk}
          ikon={Wallet}
          vurgu
        />
        <KpiKart
          etiket="Öz Kaynak"
          numerikDeger={ozet.ozKaynak}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.yesil}
          ikon={Coins}
        />
        <KpiKart
          etiket="Net Satış"
          numerikDeger={ozet.netSatis}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.altin}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="Net Dönem Kârı"
          numerikDeger={ozet.netKar}
          ondalik={0}
          sonek=" ₺"
          tone="#60a5fa"
          ikon={FileText}
        />
      </section>

      {/* İki yan yana tablo — Bilanço (Aktif) + Gelir Tablosu */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <MaliTabloKart
          baslik="Bilanço — Aktif"
          altBaslik={`Toplam ${fmtTL(ozet.aktifToplam)}`}
          kalemler={finans.bilanco.aktif}
          accent={firma.renk}
        />
        <MaliTabloKart
          baslik="Gelir Tablosu"
          altBaslik={`Net dönem kârı ${fmtTL(ozet.netKar)}`}
          kalemler={finans.gelirTablosu}
          accent={firma.renk}
        />
      </section>

      {/* Finansal oranlar */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <OzetKart
          etiket="Cari Oran"
          deger={ozet.cariOran.toFixed(2)}
          baglam={ozet.cariOran >= 1.5 ? "Sağlıklı (≥1.5)" : ozet.cariOran >= 1 ? "Sınırda" : "Zayıf"}
          baglamRengi={ozet.cariOran >= 1.5 ? "iyi" : ozet.cariOran >= 1 ? "notr" : "kotu"}
        />
        <OzetKart
          etiket="Borç / Öz Kaynak"
          deger={ozet.borcOzKaynak.toFixed(2)}
          baglam={ozet.borcOzKaynak <= 1 ? "Düşük kaldıraç" : ozet.borcOzKaynak <= 2 ? "Orta" : "Yüksek"}
          baglamRengi={ozet.borcOzKaynak <= 1 ? "iyi" : ozet.borcOzKaynak <= 2 ? "notr" : "kotu"}
        />
        <OzetKart
          etiket="Net Kâr Marjı"
          deger={fmtYuzde(ozet.netMarj)}
          baglam={ozet.netMarj > 10 ? "Güçlü" : ozet.netMarj > 5 ? "Orta" : "Zayıf"}
          baglamRengi={ozet.netMarj > 10 ? "iyi" : ozet.netMarj > 5 ? "notr" : "kotu"}
        />
      </section>
    </>
  );
}

function MaliTabloKart({
  baslik,
  altBaslik,
  kalemler,
  accent,
}: {
  baslik: string;
  altBaslik: string;
  kalemler: MaliTabloKalemi[];
  accent: string;
}) {
  return (
    <div
      data-anim="grafik"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "22px 22px 20px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accent,
            marginBottom: 4,
          }}
        >
          {baslik}
        </div>
        <div style={{ fontSize: 13, color: TEMA.inkSoft }}>{altBaslik}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {kalemler.map((k, i) => (
          <KalemSatir key={i} kalem={k} derinlik={0} />
        ))}
      </div>
    </div>
  );
}

function KalemSatir({ kalem, derinlik }: { kalem: MaliTabloKalemi; derinlik: number }) {
  const negatif = kalem.tutar < 0;
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          paddingLeft: derinlik * 16,
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
          fontSize: 13,
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            color: derinlik === 0 ? TEMA.ink : TEMA.inkSoft,
            fontWeight: derinlik === 0 ? 600 : 500,
          }}
        >
          {kalem.ad}
        </span>
        <span
          style={{
            fontFamily: FONT.num,
            fontWeight: derinlik === 0 ? 600 : 500,
            color: negatif ? TEMA.kirmizi : derinlik === 0 ? TEMA.ink : TEMA.inkSoft,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtTL(kalem.tutar)}
        </span>
      </div>
      {kalem.alt?.map((alt, ai) => (
        <KalemSatir key={ai} kalem={alt} derinlik={derinlik + 1} />
      ))}
    </>
  );
}
