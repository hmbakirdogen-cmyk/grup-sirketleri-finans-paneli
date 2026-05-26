// MansetBandi — bugünün önemli olayları şeridi.
// Mali Takvim altı, sayfa başlığı üstü. 2-3 manşet kart (statik mock şu an,
// V2'de "olaylar" feed'inden — Logo Go sync sonrası, mali takvim, AI bulgu).

import { Newspaper, AlertTriangle, TrendingUp, Sparkles, type LucideIcon } from "lucide-react";
import { TEMA, FONT } from "@/lib/tema";

interface Manset {
  ad: string;
  baslik: string;
  alt: string;
  ikon: LucideIcon;
  renk: string;
}

const MANSETLER: Manset[] = [
  {
    ad: "Bugün",
    baslik: "Logo Go sync tamamlandı",
    alt: "47 yeni fatura · 12 yeni cari · 02:14",
    ikon: Newspaper,
    renk: "#4ade80",
  },
  {
    ad: "Uyarı",
    baslik: "ELMOS açık alacağı %18 arttı",
    alt: "Son 30 günde 8 cari yeni eklendi — hatırlatma fırsatı",
    ikon: AlertTriangle,
    renk: "#d4af7a",
  },
  {
    ad: "Fırsat",
    baslik: "MESA marj 2 puan iyileşti",
    alt: "Tedarik pazarlığı meyvesini veriyor · son 90 gün",
    ikon: TrendingUp,
    renk: "#5b9dff",
  },
];

export function MansetBandi() {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: "12px 14px",
        background: TEMA.bgKart,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 12,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
          fontFamily: FONT.ana,
        }}
      >
        <Sparkles size={11} color={TEMA.inkFaded} />
        Bugünün Manşetleri · AI Editör
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {MANSETLER.map((m, i) => {
          const Ic = m.ikon;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${TEMA.border}`,
                transition: "background 180ms ease, border-color 180ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = TEMA.borderAktif;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = TEMA.border;
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: `${m.renk}1f`,
                  color: m.renk,
                  boxShadow: `0 0 12px ${m.renk}30`,
                }}
              >
                <Ic size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: m.renk,
                    marginBottom: 3,
                  }}
                >
                  {m.ad}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEMA.ink,
                    lineHeight: 1.3,
                    marginBottom: 2,
                    fontFamily: FONT.ana,
                  }}
                >
                  {m.baslik}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: TEMA.inkMuted,
                    lineHeight: 1.45,
                  }}
                >
                  {m.alt}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
