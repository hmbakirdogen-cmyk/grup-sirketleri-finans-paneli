// OzetKart — alt 3'lü grid'in destek kartı.
// KpiKart'tan daha küçük, ek olarak bir bağlam satırı taşır (örn. hedefle kıyas).

import { TEMA, FONT } from "@/lib/tema";

interface Props {
  etiket: string;
  deger: string;
  baglam?: string;         // örn. "Hedef %15.0 — üstünde"
  baglamRengi?: "iyi" | "kotu" | "notr";
}

export function OzetKart({ etiket, deger, baglam, baglamRengi = "notr" }: Props) {
  const renk =
    baglamRengi === "iyi" ? TEMA.yesil :
    baglamRengi === "kotu" ? TEMA.kirmizi :
    TEMA.inkFaded;

  return (
    <div
      data-anim="ozet"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 12,
        padding: "22px 22px 20px",
        transition: "border-color 180ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = TEMA.borderAktif;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = TEMA.border;
      }}
    >
      <div
        style={{
          fontFamily: FONT.ana,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
          marginBottom: 12,
        }}
      >
        {etiket}
      </div>

      <div
        style={{
          fontFamily: FONT.num,
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "-0.015em",
          color: TEMA.ink,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.05,
          marginBottom: 10,
        }}
      >
        {deger}
      </div>

      {baglam && (
        <div
          style={{
            fontFamily: FONT.ana,
            fontSize: 12,
            color: renk,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {baglam}
        </div>
      )}
    </div>
  );
}
