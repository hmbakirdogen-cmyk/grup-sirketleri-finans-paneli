import { useMemo } from "react";
import { Layers, Wallet, TrendingUp, Users } from "lucide-react";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { KpiKart } from "@/components/dash/KpiKart";
import {
  MEBA_FINANS,
  PANEL_VERI_KAPSAMI,
  PANEL_VERI_OZETI,
  PANEL_YETENEKLERI,
} from "@/data/gercek-finans";
import { TEMA, fmtTL } from "@/lib/tema";

export function KonsolideSayfasi() {
  const ozet = useMemo(() => {
    const yillikCiro = MEBA_FINANS.son12Ay.reduce((sum, ay) => sum + ay.ciro, 0);
    const sonAy = MEBA_FINANS.son12Ay[MEBA_FINANS.son12Ay.length - 1];
    const ilkAy = MEBA_FINANS.son12Ay[0];
    const aylikDelta =
      sonAy && ilkAy && ilkAy.ciro > 0 ? ((sonAy.ciro - ilkAy.ciro) / ilkAy.ciro) * 100 : 0;
    return {
      yillikCiro,
      aylikDelta,
      acikAlacak: PANEL_VERI_OZETI.toplamAcikAlacak,
      cariSayisi: PANEL_VERI_OZETI.cariSayisi2026,
    };
  }, []);

  const aiMaddeler = useMemo<AiYorumMaddesi[]>(
    () => [
      {
        ton: "dikkat",
        baslik: "Konsolide mod bilinçli olarak kapalı",
        detay:
          "Şu anda gerçek veri yalnızca MEBA tarafında sağlam. MESA, ELMOS ve ARKON exportları yüklenmeden grup toplamı üretmiyoruz.",
        vurguSayi: "1/4 firma",
      },
      {
        ton: "firsat",
        baslik: "Altyapı grup moduna hazır",
        detay:
          "Veri katmanı artık tek merkezden besleniyor. Diğer firmaların gerçek exportları geldiğinde bu ekran otomatik olarak tekrar konsolide kimliğe dönebilir.",
        vurguSayi: `${PANEL_VERI_KAPSAMI.length} modül`,
      },
      {
        ton: PANEL_YETENEKLERI.konsolideAcik ? "pozitif" : "dikkat",
        baslik: "Kapanan tek eksik veri yükü",
        detay: `MEBA tarafında rolling 12 ciro ${fmtTL(ozet.yillikCiro)}. Grup moduna geçmek için aynı doğruluk seviyesini diğer firmalarda da kurmamız gerekiyor.`,
        vurguSayi: fmtTL(ozet.yillikCiro),
      },
    ],
    [ozet.yillikCiro],
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8b5cf6",
            fontWeight: 600,
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          Konsolide Hazırlık
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
          Grup modu için veri bekleme ekranı
        </h1>
        <p
          style={{
            fontSize: 13,
            color: TEMA.inkMuted,
            marginTop: 6,
            marginBottom: 0,
            maxWidth: 760,
            lineHeight: 1.5,
          }}
        >
          Bu görünüm artık sahte dört firma toplamı göstermiyor. Şimdilik yalnızca MEBA'nın gerçek
          veri olgunluğunu ve konsolideye geçmek için eksik kalan parçaları izliyoruz.
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
          etiket="MEBA Rolling 12"
          numerikDeger={ozet.yillikCiro}
          ondalik={0}
          sonek=" ₺"
          tone="#8b5cf6"
          ikon={Wallet}
          vurgu
        />
        <KpiKart
          etiket="Aylık Delta"
          numerikDeger={ozet.aylikDelta}
          ondalik={1}
          sonek="%"
          tone={TEMA.yesil}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="Açık Alacak"
          numerikDeger={ozet.acikAlacak}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.altin}
          ikon={Users}
        />
        <KpiKart
          etiket="Yüklü Cari"
          numerikDeger={ozet.cariSayisi}
          ondalik={0}
          sonek=" cari"
          tone="#60a5fa"
          ikon={Layers}
        />
      </section>

      <AiYorumKart sayfaBasligi="Konsolide" maddeler={aiMaddeler} />
    </>
  );
}
