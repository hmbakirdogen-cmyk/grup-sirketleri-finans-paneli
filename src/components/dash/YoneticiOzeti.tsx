// YoneticiOzeti — sağ kolon dikey panel.
// Lovable AI'nın çıkardığı standart: 3-4 progress bar + alt "GENEL DURUM" özet.

import { TEMA, FONT } from "@/lib/tema";

interface SatirVeri {
  etiket: string;
  yuzde: number;            // 0-100 arası
  /** "accent" → aktif firma rengi (App.tsx'ten prop ile gelir) */
  renk?: "accent" | "yesil" | "altin" | "kirmizi";
}

interface Props {
  baslik: string;
  altBaslik: string;
  satirlar: SatirVeri[];
  durumBasligi: string;     // "GENEL DURUM"
  durumMetni: string;       // AI yorum, Anadolu iş dili
  durumRengi?: "iyi" | "dikkat" | "kotu";
  /** Aktif firmanın signature rengi; "accent" satırı bu renkte çizilir */
  accent?: string;
}

function renkCozumle(r: SatirVeri["renk"], accent: string): string {
  if (r === "yesil") return TEMA.yesil;
  if (r === "altin") return TEMA.altin;
  if (r === "kirmizi") return TEMA.kirmizi;
  return accent;
}

function durumNoktasi(d?: "iyi" | "dikkat" | "kotu"): string {
  if (d === "iyi") return TEMA.yesil;
  if (d === "dikkat") return TEMA.altin;
  if (d === "kotu") return TEMA.kirmizi;
  return TEMA.yesil;
}

export function YoneticiOzeti({
  baslik,
  altBaslik,
  satirlar,
  durumBasligi,
  durumMetni,
  durumRengi = "iyi",
  accent = TEMA.mavi,
}: Props) {
  return (
    <div
      data-anim="ozet"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "28px 26px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {/* Üst başlık */}
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: TEMA.ink,
            letterSpacing: "-0.01em",
            marginBottom: 4,
          }}
        >
          {baslik}
        </div>
        <div style={{ fontSize: 12, color: TEMA.inkMuted }}>{altBaslik}</div>
      </div>

      {/* Progress bar satırlar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {satirlar.map((s, i) => {
          const renk = renkCozumle(s.renk, accent);
          const y = Math.max(0, Math.min(100, s.yuzde));
          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONT.ana,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                <span style={{ color: TEMA.inkSoft }}>{s.etiket}</span>
                <span
                  style={{
                    color: TEMA.ink,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {y.toFixed(0)}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${y}%`,
                    background: renk,
                    borderRadius: 999,
                    transition: "width 600ms cubic-bezier(0.22,0.61,0.36,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* GENEL DURUM kutusu */}
      <div
        style={{
          paddingTop: 18,
          borderTop: `1px solid ${TEMA.border}`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: TEMA.inkMuted,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: durumNoktasi(durumRengi),
              boxShadow: `0 0 8px ${durumNoktasi(durumRengi)}80`,
            }}
          />
          {durumBasligi}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: TEMA.inkSoft,
            lineHeight: 1.55,
          }}
        >
          {durumMetni}
        </p>
      </div>
    </div>
  );
}
