// SekmeNav — sayfa üstü 5 sekme: Nabız / Akış / Alacaklar / Raporlar / Ayarlar
// Lovable AI'nın çıkardığı standartla uyumlu.

import { TEMA, FONT } from "@/lib/tema";

export type Sekme = "nabiz" | "akis" | "yarin90" | "alacaklar" | "ceksenet" | "urun" | "personel" | "raporlar" | "vergi" | "grup" | "isbirligi" | "ayarlar";

interface Props {
  aktif: Sekme;
  onSec: (s: Sekme) => void;
}

const SEKMELER: { id: Sekme; ad: string }[] = [
  { id: "nabiz", ad: "Nabız" },
  { id: "akis", ad: "Akış" },
  { id: "alacaklar", ad: "Alacaklar" },
  { id: "raporlar", ad: "Raporlar" },
  { id: "ayarlar", ad: "Ayarlar" },
];

export function SekmeNav({ aktif, onSec }: Props) {
  return (
    <nav
      style={{
        display: "flex",
        gap: 4,
        borderBottom: `1px solid ${TEMA.border}`,
        marginBottom: 24,
      }}
    >
      {SEKMELER.map((s) => {
        const sec = s.id === aktif;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSec(s.id)}
            style={{
              background: "transparent",
              border: "none",
              color: sec ? TEMA.ink : TEMA.inkMuted,
              fontFamily: FONT.ana,
              fontSize: 13,
              fontWeight: sec ? 600 : 500,
              letterSpacing: "0.02em",
              padding: "12px 18px",
              cursor: "pointer",
              borderBottom: sec ? `2px solid ${TEMA.mavi}` : "2px solid transparent",
              marginBottom: -1,
              transition: "color 180ms ease, border-color 180ms ease",
            }}
            onMouseEnter={(e) => {
              if (!sec) e.currentTarget.style.color = TEMA.inkSoft;
            }}
            onMouseLeave={(e) => {
              if (!sec) e.currentTarget.style.color = TEMA.inkMuted;
            }}
          >
            {s.ad}
          </button>
        );
      })}
    </nav>
  );
}
