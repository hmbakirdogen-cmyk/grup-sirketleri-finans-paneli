// KpiKart — üst 4'lü grid'in ana kartı.
// Tek mesaj: bir büyük rakam + küçük etiket + tek satır delta.
// Sparkline / dekoratif ikon / glow yok (brief KATİ).

import { TEMA, FONT } from "@/lib/tema";

interface Props {
  etiket: string;          // ör. "TOPLAM CİRO"
  deger: string;           // ör. "147,3M ₺" — önceden formatlanmış
  delta?: number;          // % geçen yıla göre
  deltaEtiketi?: string;   // ör. "yıllık" / "12 ay"
  vurgu?: boolean;         // tek bir kartı belirgin yapmak için (max 1)
}

export function KpiKart({ etiket, deger, delta, deltaEtiketi = "yıllık", vurgu = false }: Props) {
  const renk = delta === undefined ? undefined : delta > 0 ? TEMA.yesil : delta < 0 ? TEMA.kirmizi : TEMA.inkMuted;

  return (
    <div
      data-anim="kpi"
      style={{
        position: "relative",
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${vurgu ? TEMA.borderAktif : TEMA.border}`,
        borderRadius: 14,
        padding: "26px 24px 22px",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "border-color 180ms ease, transform 180ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = TEMA.borderAktif;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = vurgu ? TEMA.borderAktif : TEMA.border;
      }}
    >
      {/* Etiket */}
      <div
        style={{
          fontFamily: FONT.ana,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
        }}
      >
        {etiket}
      </div>

      {/* Büyük sayı */}
      <div
        style={{
          fontFamily: FONT.num,
          fontSize: 38,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: TEMA.ink,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.05,
          marginTop: 14,
          marginBottom: 12,
        }}
      >
        {deger}
      </div>

      {/* Alt — delta */}
      {delta !== undefined && (
        <div
          style={{
            fontFamily: FONT.ana,
            fontSize: 12,
            color: TEMA.inkFaded,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: renk, fontWeight: 600 }}>
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          <span style={{ color: TEMA.inkFaded }}>{deltaEtiketi}</span>
        </div>
      )}
    </div>
  );
}
