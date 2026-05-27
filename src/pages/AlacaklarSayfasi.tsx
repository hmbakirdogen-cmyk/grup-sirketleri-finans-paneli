// AlacaklarSayfasi — açık cari takibi, vade dağılımı, riskli müşteriler.
// Aynı 3D dil: KPI + 3D progress bar + tablo + AI yorum.

import { useMemo, useState } from "react";
import { Users, AlertTriangle, Wallet, Clock } from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { YoneticiOzeti } from "@/components/dash/YoneticiOzeti";
import { CariDetayDrawer } from "@/components/dash/CariDetayDrawer";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { TEMA, FONT, fmtTL } from "@/lib/tema";
import type { Cari, Firma, FirmaFinans } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

export function AlacaklarSayfasi({ firma, finans }: Props) {
  const [seciliCari, setSeciliCari] = useState<Cari | null>(null);

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

  const aiMaddeler = useMemo<AiYorumMaddesi[]>(() => {
    const list: AiYorumMaddesi[] = [];
    const gecmisOran =
      ozet.toplamAlacak > 0
        ? (ozet.dagilim.vadeGecmis / ozet.toplamAlacak) * 100
        : 0;
    const kisaOran =
      ozet.toplamAlacak > 0
        ? (ozet.dagilim.kisaVade / ozet.toplamAlacak) * 100
        : 0;

    // 1) Vade geçmiş durumu
    if (ozet.dagilim.vadeGecmis === 0) {
      list.push({
        ton: "pozitif",
        baslik: "Vade geçmiş alacak yok",
        detay: `Mehmet Bey, tüm açık alacaklar vade içinde. ${firma.kisaAd} tahsilat disiplini bu ay net çalışıyor.`,
        vurguSayi: "0 ₺",
      });
    } else if (gecmisOran < 5) {
      list.push({
        ton: "dikkat",
        baslik: "Vade geçmiş küçük ama var",
        detay: `${fmtTL(ozet.dagilim.vadeGecmis)} (%${gecmisOran.toFixed(1)}) 90+ günde takıldı. Bir hatırlatma turuyla kapanabilir.`,
        vurguSayi: fmtTL(ozet.dagilim.vadeGecmis),
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Vade geçmiş yığını büyüyor",
        detay: `${fmtTL(ozet.dagilim.vadeGecmis)} (%${gecmisOran.toFixed(1)}) 90+ gün geride. Mutabakat + ödeme planı acil masaya gelmeli.`,
        vurguSayi: fmtTL(ozet.dagilim.vadeGecmis),
      });
    }

    // 2) En riskli cari
    if (ozet.enRiskli[0] && ozet.enRiskli[0].vadesi > 60) {
      const r = ozet.enRiskli[0];
      list.push({
        ton: "dikkat",
        baslik: `${r.ad} en geç vadeli`,
        detay: `${r.vadesi} gün vadede ${fmtTL(r.acikBakiye)} bekliyor. Telefonda nazikçe hatırlatma + ödeme planı önerisi uygun olur.`,
        vurguSayi: `${r.vadesi} gün`,
      });
    }

    // 3) Net pozisyon
    if (ozet.netPozisyon > 0) {
      list.push({
        ton: "firsat",
        baslik: "Net pozisyon olumlu",
        detay: `Tahsilat tarafı borçtan ${fmtTL(ozet.netPozisyon)} fazla. Erken ödeme indirimleri için bu tampon iyi kullanılabilir.`,
        vurguSayi: fmtTL(ozet.netPozisyon),
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Net pozisyon negatif",
        detay: `Borç alacağı ${fmtTL(Math.abs(ozet.netPozisyon))} aşıyor. SMC ödeme planı + bayilerden hızlandırma birlikte düşünülmeli.`,
        vurguSayi: fmtTL(ozet.netPozisyon),
      });
    }

    // 4) Kısa vade konsantrasyonu
    if (kisaOran >= 60) {
      list.push({
        ton: "pozitif",
        baslik: "Tahsilatın çoğu kısa vadede",
        detay: `Açık alacağın %${kisaOran.toFixed(0)}'ı 30 gün içinde gelecek. Nakit planı rahat kuruluyor.`,
        vurguSayi: `%${kisaOran.toFixed(0)}`,
      });
    } else {
      list.push({
        ton: "firsat",
        baslik: "Vade dağılımı uzuna kayık",
        detay: `Kısa vade payı %${kisaOran.toFixed(0)}. Erken ödeme iskontosu (örn. 15 günde %1) teklif edilirse tahsilat hızı artar.`,
        vurguSayi: `%${kisaOran.toFixed(0)}`,
      });
    }

    return list;
  }, [ozet, firma.kisaAd]);

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
              <button
                key={c.id}
                type="button"
                onClick={() => setSeciliCari(c)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 80px",
                  gap: 12,
                  padding: "10px 8px",
                  borderBottom:
                    i === ozet.enBuyuk.length - 1 ? "none" : `1px solid rgba(255,255,255,0.03)`,
                  fontSize: 13,
                  alignItems: "center",
                  transition: "background 180ms ease, border-color 180ms ease",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "transparent",
                  border: "1px solid transparent",
                  borderLeftWidth: 0,
                  borderRightWidth: 0,
                  color: TEMA.ink,
                  textAlign: "left",
                  width: "100%",
                  fontFamily: FONT.ana,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
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
              </button>
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

      {/* AI Yorum — alacak/vade verisinden Anadolu iş dili çıkarımlar */}
      <section style={{ marginTop: 20 }}>
        <AiYorumKart sayfaBasligi="Alacaklar" maddeler={aiMaddeler} />
      </section>

      <CariDetayDrawer
        cari={seciliCari}
        onClose={() => setSeciliCari(null)}
        accent={firma.renk}
      />
    </>
  );
}

function oran(parca: number, toplam: number): number {
  return toplam > 0 ? (parca / toplam) * 100 : 0;
}
