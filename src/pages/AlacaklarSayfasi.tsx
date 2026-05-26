// AlacaklarSayfasi — açık cari takibi, vade dağılımı, riskli müşteriler.
// Aynı 3D dil: KPI + 3D progress bar + tablo + AI yorum.

import { useMemo } from "react";
import { Users, AlertTriangle, Wallet, Clock } from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { YoneticiOzeti } from "@/components/dash/YoneticiOzeti";
import { TEMA, FONT, fmtTL } from "@/lib/tema";
import type { Firma, FirmaFinans } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

export function AlacaklarSayfasi({ firma, finans }: Props) {
  const ozet = useMemo(() => {
    const musteriler = finans.cariler.filter((c) => c.tip === "musteri");
    const tedarikciler = finans.cariler.filter((c) => c.tip === "tedarikci");
    const toplamAlacak = musteriler.reduce((s, c) => s + c.acikBakiye, 0);
    const toplamBorc = tedarikciler.reduce((s, c) => s + c.acikBakiye, 0);
    const netPozisyon = toplamAlacak - toplamBorc;
    const ortalamaVade = musteriler.length
      ? musteriler.reduce((s, c) => s + c.vadesi, 0) / musteriler.length
      : 0;

    // Vade dağılımı (mock — gerçek vade hesabı için fatura.vade kullanılır)
    const dagilim = {
      kisaVade: 0,   // 0-30 gün
      ortaVade: 0,   // 30-60 gün
      uzunVade: 0,   // 60-90 gün
      vadeGecmis: 0, // 90+ gün
    };
    musteriler.forEach((c) => {
      if (c.vadesi <= 30) dagilim.kisaVade += c.acikBakiye;
      else if (c.vadesi <= 60) dagilim.ortaVade += c.acikBakiye;
      else if (c.vadesi <= 90) dagilim.uzunVade += c.acikBakiye;
      else dagilim.vadeGecmis += c.acikBakiye;
    });

    const enRiskli = [...musteriler].sort((a, b) => b.vadesi - a.vadesi).slice(0, 3);
    const enBuyuk = [...musteriler].sort((a, b) => b.acikBakiye - a.acikBakiye).slice(0, 10);

    return {
      toplamAlacak,
      toplamBorc,
      netPozisyon,
      ortalamaVade,
      dagilim,
      enRiskli,
      enBuyuk,
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
          Açık Cariler · {firma.konum.split(" ")[0]}
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
          Alacaklar ve Vade Dağılımı
        </h1>
        <p
          style={{
            fontSize: 13,
            color: TEMA.inkMuted,
            marginTop: 6,
            marginBottom: 0,
          }}
        >
          Net pozisyon{" "}
          <strong style={{ color: ozet.netPozisyon > 0 ? TEMA.yesil : TEMA.kirmizi }}>
            {fmtTL(ozet.netPozisyon)}
          </strong>
          ; ortalama vade {ozet.ortalamaVade.toFixed(0)} gün.
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
          etiket="Toplam Açık Alacak"
          numerikDeger={ozet.toplamAlacak}
          ondalik={0}
          sonek=" ₺"
          tone={firma.renk}
          ikon={Users}
          vurgu
        />
        <KpiKart
          etiket="Toplam Açık Borç"
          numerikDeger={ozet.toplamBorc}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.altin}
          ikon={Wallet}
        />
        <KpiKart
          etiket="Net Açık Pozisyon"
          numerikDeger={Math.abs(ozet.netPozisyon)}
          ondalik={0}
          sonek=" ₺"
          tone={ozet.netPozisyon > 0 ? TEMA.yesil : TEMA.kirmizi}
          ikon={AlertTriangle}
        />
        <KpiKart
          etiket="Ortalama Vade"
          numerikDeger={ozet.ortalamaVade}
          ondalik={0}
          sonek=" gün"
          tone="#60a5fa"
          ikon={Clock}
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
        {/* Sol — Top 10 Müşteri tablosu */}
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
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEMA.inkMuted,
              marginBottom: 6,
            }}
          >
            En Büyük 10 Açık Alacak
          </div>
          <div style={{ fontSize: 14, color: TEMA.inkSoft, marginBottom: 16 }}>
            Müşteri başına açık bakiye ve vade
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr 80px",
              gap: 12,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: TEMA.inkFaded,
              paddingBottom: 10,
              borderBottom: `1px solid ${TEMA.border}`,
              marginBottom: 6,
            }}
          >
            <span>Cari</span>
            <span style={{ textAlign: "right" }}>Toplam Ciro</span>
            <span style={{ textAlign: "right" }}>Açık Bakiye</span>
            <span style={{ textAlign: "right" }}>Vade</span>
          </div>

          {ozet.enBuyuk.map((c, i) => {
            const vadeAcil = c.vadesi <= 7;
            const vadeUyari = c.vadesi <= 30 && c.vadesi > 7;
            return (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 80px",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom:
                    i === ozet.enBuyuk.length - 1 ? "none" : `1px solid rgba(255,255,255,0.03)`,
                  fontSize: 13,
                  alignItems: "center",
                  transition: "background 180ms ease",
                  borderRadius: 4,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: TEMA.ink,
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 24,
                      background: vadeAcil ? TEMA.kirmizi : vadeUyari ? TEMA.altin : firma.renk,
                      borderRadius: 2,
                      boxShadow: `0 0 6px ${vadeAcil ? TEMA.kirmizi : vadeUyari ? TEMA.altin : firma.renk}80`,
                    }}
                  />
                  {c.ad}
                </span>
                <span
                  style={{
                    fontFamily: FONT.num,
                    textAlign: "right",
                    color: TEMA.inkSoft,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmtTL(c.toplamCiro)}
                </span>
                <span
                  style={{
                    fontFamily: FONT.num,
                    textAlign: "right",
                    color: TEMA.ink,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmtTL(c.acikBakiye)}
                </span>
                <span
                  style={{
                    textAlign: "right",
                    fontFamily: FONT.num,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    color: vadeAcil ? TEMA.kirmizi : vadeUyari ? TEMA.altin : TEMA.inkSoft,
                  }}
                >
                  {c.vadesi} gün
                </span>
              </div>
            );
          })}
        </div>

        {/* Sağ — Yönetici Özeti vade dağılımı */}
        <YoneticiOzeti
          baslik="Vade Dağılımı"
          altBaslik="Açık alacaklar gün aralıklarında"
          accent={firma.renk}
          satirlar={[
            { etiket: "0-30 gün", yuzde: oran(ozet.dagilim.kisaVade, ozet.toplamAlacak), renk: "yesil" },
            { etiket: "30-60 gün", yuzde: oran(ozet.dagilim.ortaVade, ozet.toplamAlacak), renk: "accent" },
            { etiket: "60-90 gün", yuzde: oran(ozet.dagilim.uzunVade, ozet.toplamAlacak), renk: "altin" },
            { etiket: "90+ gün (geç)", yuzde: oran(ozet.dagilim.vadeGecmis, ozet.toplamAlacak), renk: "kirmizi" },
          ]}
          durumBasligi="Riskli Cariler"
          durumMetni={
            ozet.enRiskli.length > 0
              ? `En geç vadeli: ${ozet.enRiskli[0]!.ad} (${ozet.enRiskli[0]!.vadesi} gün, ${fmtTL(ozet.enRiskli[0]!.acikBakiye)}). Hatırlatma yapılması faydalı.`
              : "Tüm cariler vade içinde, denge yerinde."
          }
          durumRengi={ozet.dagilim.vadeGecmis > 0 ? "dikkat" : "iyi"}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <OzetKart
          etiket="Vade Geçmiş"
          deger={fmtTL(ozet.dagilim.vadeGecmis)}
          baglam={ozet.dagilim.vadeGecmis > 0 ? "Hatırlatma yapılmalı" : "Vade içinde"}
          baglamRengi={ozet.dagilim.vadeGecmis > 0 ? "kotu" : "iyi"}
        />
        <OzetKart
          etiket="Müşteri Sayısı"
          deger={String(finans.cariler.filter((c) => c.tip === "musteri").length)}
          baglam="Açık alacağı olan cari"
          baglamRengi="notr"
        />
        <OzetKart
          etiket="Tedarikçi Sayısı"
          deger={String(finans.cariler.filter((c) => c.tip === "tedarikci").length)}
          baglam="Açık borcu olan cari"
          baglamRengi="notr"
        />
      </section>
    </>
  );
}

function oran(parca: number, toplam: number): number {
  return toplam > 0 ? (parca / toplam) * 100 : 0;
}
