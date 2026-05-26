// FirmaSecici — üst yatay minimal segmented control.

import { FIRMALAR } from "@/data/firmalar";
import { TEMA, FONT } from "@/lib/tema";
import type { FirmaId } from "@/types/domain";

interface Props {
  liste: FirmaId[];
  aktif: FirmaId;
  onSec: (f: FirmaId) => void;
}

export function FirmaSecici({ liste, aktif, onSec }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: TEMA.bgKart,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 10,
        padding: 4,
        gap: 2,
      }}
    >
      {liste.map((f) => {
        const sec = f === aktif;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onSec(f)}
            style={{
              background: sec ? "rgba(255,255,255,0.06)" : "transparent",
              border: "none",
              color: sec ? TEMA.ink : TEMA.inkMuted,
              fontFamily: FONT.ana,
              fontSize: 12,
              fontWeight: sec ? 600 : 500,
              letterSpacing: "0.06em",
              padding: "8px 16px",
              borderRadius: 7,
              cursor: "pointer",
              transition: "color 180ms ease, background-color 180ms ease",
            }}
          >
            {FIRMALAR[f].kisaAd}
          </button>
        );
      })}
    </div>
  );
}
