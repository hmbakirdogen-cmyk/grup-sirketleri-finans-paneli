// YoneticiOzeti — sağ kolon dikey panel.
// Lovable AI'nın çıkardığı standart: 3-4 progress bar + alt "GENEL DURUM" özet.

import { TEMA, FONT, rengiKaristir } from "@/lib/tema";

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

      {/* Progress bar satırlar — 3D glow stili (feedback_3d_grafik_stili_kati) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                    textShadow: `0 0 8px ${renk}55`,
                  }}
                >
                  {y.toFixed(0)}%
                </span>
              </div>
              {/* Track — inset shadow (recessed çukur hissi) */}
              <div
                style={{
                  position: "relative",
                  height: 8,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
                  borderRadius: 999,
                  overflow: "visible",
                  boxShadow:
                    "inset 0 1px 2px rgba(0,0,0,0.50), inset 0 -1px 0 rgba(255,255,255,0.03)",
                }}
              >
                {/* Doluş — multi-stop gradient (darker → tone → lighter) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${y}%`,
                    background: `linear-gradient(90deg, ${rengiKaristir(renk, 0.25, "darker")}, ${renk} 55%, ${rengiKaristir(renk, 0.35, "lighter")})`,
                    borderRadius: 999,
                    transition: "width 1200ms cubic-bezier(0.22,0.61,0.36,1)",
                    boxShadow: [
                      `inset 0 1px 0 rgba(255,255,255,0.35)`,        // top inner highlight
                      `inset 0 -1px 0 rgba(0,0,0,0.20)`,              // bottom inner depth
                      `0 0 12px ${renk}60`,                           // outer accent halo
                    ].join(", "),
                  }}
                />
                {/* Doluş ucunda parıltı topu (her satıra ufak vurgu) */}
                {y > 4 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `calc(${y}% - 6px)`,
                      transform: "translateY(-50%)",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: `radial-gradient(closest-side, ${renk}, ${renk}00)`,
                      filter: "blur(4px)",
                      transition: "left 1200ms cubic-bezier(0.22,0.61,0.36,1)",
                      pointerEvents: "none",
                    }}
                  />
                )}
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
