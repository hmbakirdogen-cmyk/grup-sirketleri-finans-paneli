import { useMemo } from "react";
import { HandshakeIcon, Package, Users, TrendingUp } from "lucide-react";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { MEBA_FINANS } from "@/data/gercek-finans";
import { TEMA, fmtTL } from "@/lib/tema";

export function IsBirligiSayfasi() {
  const ozet = useMemo(() => {
    const gelirler = MEBA_FINANS.paraHaritasi
      .filter((kalem) => kalem.tip === "gelir")
      .sort((a, b) => b.tutar - a.tutar);
    const musteri = MEBA_FINANS.cariler
      .filter((cari) => cari.tip === "musteri")
      .sort((a, b) => b.toplamCiro - a.toplamCiro);
    return {
      ilkGelir: gelirler[0],
      ikinciGelir: gelirler[1],
      ilkMusteri: musteri[0],
      ikinciMusteri: musteri[1],
      musteriSayisi: musteri.length,
    };
  }, []);

  const aiMaddeler = useMemo<AiYorumMaddesi[]>(
    () => [
      {
        ton: "firsat",
        baslik: `${ozet.ilkGelir?.ad ?? "Ana sektör"} tarafı ilişki genişletmeye uygun`,
        detay: `${ozet.ilkGelir?.ad ?? "Ana sektör"} şu an en büyük gelir havuzu. Aynı sektördeki benzer firmaları hedef listesine almak satış ekibine en temiz büyüme zeminini verir.`,
        vurguSayi: fmtTL(ozet.ilkGelir?.tutar ?? 0),
      },
      {
        ton: "pozitif",
        baslik: "Gerçek cari havuzu artık ilişki çalışmasına açıldı",
        detay: `${ozet.musteriSayisi} müşteri gerçek veriyle görünür durumda. En güçlü iki müşteri ${ozet.ilkMusteri?.ad ?? "—"} ve ${ozet.ikinciMusteri?.ad ?? "—"}; referans genişleme için ilk temas halkası bunlar olabilir.`,
        vurguSayi: `${ozet.musteriSayisi} cari`,
      },
    ],
    [ozet],
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#14b8a6",
            fontWeight: 600,
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          Gelişim Fırsatları
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
          MEBA müşteri ve sektör büyüme zemini
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
          etiket="Ana Sektör"
          numerikDeger={ozet.ilkGelir?.tutar ?? 0}
          ondalik={0}
          sonek=" ₺"
          tone="#14b8a6"
          ikon={HandshakeIcon}
          vurgu
        />
        <KpiKart
          etiket="2. Sektör"
          numerikDeger={ozet.ikinciGelir?.tutar ?? 0}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.altin}
          ikon={Package}
        />
        <KpiKart
          etiket="Top Müşteri"
          numerikDeger={ozet.ilkMusteri?.toplamCiro ?? 0}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.yesil}
          ikon={Users}
        />
        <KpiKart
          etiket="Aktif Portföy"
          numerikDeger={ozet.musteriSayisi}
          ondalik={0}
          sonek=" cari"
          tone="#60a5fa"
          ikon={TrendingUp}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <OzetKart
          etiket="Sektör Odağı"
          deger={ozet.ilkGelir?.ad ?? "—"}
          baglam={`Hacim ${fmtTL(ozet.ilkGelir?.tutar ?? 0)}`}
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="Referans Müşteri"
          deger={ozet.ilkMusteri?.ad ?? "—"}
          baglam={`Ciro ${fmtTL(ozet.ilkMusteri?.toplamCiro ?? 0)}`}
          baglamRengi="notr"
        />
      </section>

      <AiYorumKart sayfaBasligi="İş Birliği" maddeler={aiMaddeler} />
    </>
  );
}
