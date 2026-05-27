// AkisSayfasi — "Para nereden geldi, nereye gitti".
// Mehmet Bey 2026-05-27 direktifi: grafik stili her sayfada KATİ aynı.
//
// Yapı:
//   ÜST    : 4 KPI (Aylık Ort Gelir / Aylık Ort Gider / Net Akış / Marj)
//   ORTA   : Sol 2/3 = AnaGrafik 3 yıl ciro · Sağ 1/3 = Gelir + Gider kategori dağılımı
//   ALT    : 3 destek kart (en hızlı büyüyen gelir / en hızlı artan gider / marj trendi)

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
} from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { AnaGrafik } from "@/components/dash/AnaGrafik";
import { OzetKart } from "@/components/dash/OzetKart";
import { Chart3DBackdrop } from "@/components/dash/Chart3DBackdrop";
import { KategoriDagilim } from "@/components/dash/KategoriDagilim";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { TEMA, FONT, fmtTL, fmtYuzde } from "@/lib/tema";
import type { Firma, FirmaFinans } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

export function AkisSayfasi({ firma, finans }: Props) {
  const ozet = useMemo(() => {
    const gelirler = finans.paraHaritasi.filter((k) => k.tip === "gelir");
    const giderler = finans.paraHaritasi.filter((k) => k.tip === "gider");
    const yillikGelir = gelirler.reduce((s, k) => s + k.tutar, 0);
    const yillikGider = giderler.reduce((s, k) => s + k.tutar, 0);
    const aylikOrtGelir = yillikGelir / 12;
    const aylikOrtGider = yillikGider / 12;
    const aylikNetAkis = aylikOrtGelir - aylikOrtGider;
    const operasyonMarji = yillikGelir > 0 ? ((yillikGelir - yillikGider) / yillikGelir) * 100 : 0;

    const enBuyuyenGelir = [...gelirler].sort((a, b) => b.trend - a.trend)[0];
    const enArtanGider = [...giderler].sort((a, b) => b.trend - a.trend)[0];

    const son12 = finans.son12Ay;
    const ilkMarj = son12[0]?.brutMarj ?? 0;
    const sonMarj = son12[son12.length - 1]?.brutMarj ?? 0;
    const marjDelta = sonMarj - ilkMarj;

    return {
      yillikGelir,
      yillikGider,
      aylikOrtGelir,
      aylikOrtGider,
      aylikNetAkis,
      operasyonMarji,
      enBuyuyenGelir,
      enArtanGider,
      sonMarj,
      marjDelta,
    };
  }, [finans]);

  const sparkGelir = finans.yillarTrend.map((y) => y.y2026);
  const sparkGider = finans.yillarTrend.map((y) => Math.round(y.y2026 * 0.78));

  const aiMaddeler = useMemo<AiYorumMaddesi[]>(() => {
    const list: AiYorumMaddesi[] = [];

    // 1) Net akış pozitif/negatif
    if (ozet.aylikNetAkis > 0) {
      list.push({
        ton: "pozitif",
        baslik: "Aylık net akış pozitif",
        detay: `Her ay ortalama ${fmtTL(ozet.aylikNetAkis)} kasada birikiyor. Bu tampon, büyük SMC siparişlerinde peşin avantajı için biriktirilebilir.`,
        vurguSayi: fmtTL(ozet.aylikNetAkis),
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Aylık net akış negatif",
        detay: `Her ay ortalama ${fmtTL(Math.abs(ozet.aylikNetAkis))} kasadan eksiliyor. Gider tarafı sadeleştirilmeli; Furkan Bey'le bir oturum konuşulmalı.`,
        vurguSayi: fmtTL(ozet.aylikNetAkis),
      });
    }

    // 2) En hızlı büyüyen gelir
    if (ozet.enBuyuyenGelir) {
      list.push({
        ton: "firsat",
        baslik: `${ozet.enBuyuyenGelir.ad} öne çıkıyor`,
        detay: `Yıllık +${ozet.enBuyuyenGelir.trend.toFixed(1)}% büyüme. Bu kanala özel ekstra çaba (ekip yönlendirmesi, stok rezervi, kampanya) düşünülebilir.`,
        vurguSayi: `+%${ozet.enBuyuyenGelir.trend.toFixed(1)}`,
      });
    }

    // 3) En hızlı artan gider
    if (ozet.enArtanGider && ozet.enArtanGider.trend > 5) {
      list.push({
        ton: "dikkat",
        baslik: `${ozet.enArtanGider.ad} kalemi şişiyor`,
        detay: `Yıllık +${ozet.enArtanGider.trend.toFixed(1)}% artış. Maliyet sözleşmeleri masada gözden geçirilmeli; alternatif tedarikçi araştırılabilir.`,
        vurguSayi: `+%${ozet.enArtanGider.trend.toFixed(1)}`,
      });
    }

    // 4) Operasyon marjı durumu
    if (ozet.operasyonMarji >= 18) {
      list.push({
        ton: "pozitif",
        baslik: "Operasyon marjı sağlıklı",
        detay: `%${ozet.operasyonMarji.toFixed(1)} ile pnömatik dağıtım sektörü için iyi seviyede. Bu konfor SaaS/eğitim gibi yan girişimlere imkân tanır.`,
        vurguSayi: `%${ozet.operasyonMarji.toFixed(1)}`,
      });
    } else if (ozet.operasyonMarji >= 10) {
      list.push({
        ton: "firsat",
        baslik: "Operasyon marjı orta",
        detay: `%${ozet.operasyonMarji.toFixed(1)} marjı sektör ortalamasının üstünde ama hedef %18+ olmalı. Servis/eğitim gelirleri eklemek tampon yaratır.`,
        vurguSayi: `%${ozet.operasyonMarji.toFixed(1)}`,
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Operasyon marjı dar",
        detay: `%${ozet.operasyonMarji.toFixed(1)} ile tampon ince. Sabit gider tarafında kira/personel/yakıt kalemlerine sıkı bakmak gerekir.`,
        vurguSayi: `%${ozet.operasyonMarji.toFixed(1)}`,
      });
    }

    return list;
  }, [ozet]);

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
          Para Akışı · {firma.konum.split(" ")[0]}
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
          Nereden geldi, nereye gitti
        </h1>
        <p
          style={{
            fontSize: 13,
            color: TEMA.inkMuted,
            marginTop: 6,
            marginBottom: 0,
            fontFamily: FONT.ana,
          }}
        >
          Yıllık gelir <strong style={{ color: TEMA.ink }}>{fmtTL(ozet.yillikGelir)}</strong>;
          gider <strong style={{ color: TEMA.ink }}>{fmtTL(ozet.yillikGider)}</strong>;
          operasyon marjı{" "}
          <strong style={{ color: ozet.operasyonMarji > 15 ? TEMA.yesil : TEMA.altin }}>
            {fmtYuzde(ozet.operasyonMarji)}
          </strong>
          .
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
          etiket="Aylık Ort. Gelir"
          numerikDeger={ozet.aylikOrtGelir}
          ondalik={0}
          sonek=" ₺"
          delta={ozet.enBuyuyenGelir?.trend ?? 0}
          deltaEtiketi="büyüyen kalem"
          sparkline={sparkGelir}
          tone={firma.renk}
          ikon={TrendingUp}
          vurgu
        />
        <KpiKart
          etiket="Aylık Ort. Gider"
          numerikDeger={ozet.aylikOrtGider}
          ondalik={0}
          sonek=" ₺"
          delta={-(ozet.enArtanGider?.trend ?? 0)}
          deltaEtiketi="(düşük iyi)"
          sparkline={sparkGider}
          tone={TEMA.altin}
          ikon={TrendingDown}
        />
        <KpiKart
          etiket="Net Aylık Akış"
          numerikDeger={ozet.aylikNetAkis}
          ondalik={0}
          sonek=" ₺"
          delta={ozet.marjDelta}
          deltaEtiketi="marj puanı"
          tone={ozet.aylikNetAkis > 0 ? TEMA.yesil : TEMA.kirmizi}
          ikon={Activity}
        />
        <KpiKart
          etiket="Operasyon Marjı"
          numerikDeger={ozet.operasyonMarji}
          ondalik={1}
          sonek="%"
          delta={ozet.marjDelta}
          deltaEtiketi="yıllık"
          tone="#60a5fa"
          ikon={Percent}
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
        <Chart3DBackdrop tint={firma.renk} style={{ background: TEMA.bgKart }}>
          <AnaGrafik
            veri={finans.yillarTrend}
            baslik="Ciro Akışı · 3 Yıl"
            altBaslik="Kategori bazlı detay sağ panelde · yıllık kıyaslama"
            accent={firma.renk}
          />
        </Chart3DBackdrop>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <KategoriDagilim
            baslik="Hangi kalemlerden geliyor"
            kategoriler={finans.paraHaritasi.filter((k) => k.tip === "gelir")}
            accent={firma.renk}
            mod="gelir"
            limit={5}
          />
          <KategoriDagilim
            baslik="Nereye gidiyor"
            kategoriler={finans.paraHaritasi.filter((k) => k.tip === "gider")}
            mod="gider"
            limit={5}
          />
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
          etiket="En Hızlı Büyüyen Gelir"
          deger={ozet.enBuyuyenGelir?.ad ?? "—"}
          baglam={
            ozet.enBuyuyenGelir
              ? `${ozet.enBuyuyenGelir.trend > 0 ? "+" : ""}${ozet.enBuyuyenGelir.trend.toFixed(1)}% · ${fmtTL(ozet.enBuyuyenGelir.tutar)}`
              : "—"
          }
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="En Hızlı Artan Gider"
          deger={ozet.enArtanGider?.ad ?? "—"}
          baglam={
            ozet.enArtanGider
              ? `+${ozet.enArtanGider.trend.toFixed(1)}% · ${fmtTL(ozet.enArtanGider.tutar)} · maliyet baskısı`
              : "—"
          }
          baglamRengi="kotu"
        />
        <OzetKart
          etiket="Marj Trendi (12 ay)"
          deger={`${ozet.marjDelta > 0 ? "+" : ""}${ozet.marjDelta.toFixed(1)} puan`}
          baglam={
            ozet.marjDelta > 0
              ? `Marj iyileşiyor · şu an %${ozet.sonMarj.toFixed(1)}`
              : `Marj eriyor · şu an %${ozet.sonMarj.toFixed(1)} · maliyet izle`
          }
          baglamRengi={ozet.marjDelta > 0 ? "iyi" : "kotu"}
        />
      </section>

      {/* AI Yorum — para akışı verisinden Anadolu iş dili çıkarımlar */}
      <section style={{ marginTop: 20 }}>
        <AiYorumKart sayfaBasligi="Para Akışı" maddeler={aiMaddeler} />
      </section>
    </>
  );
}
