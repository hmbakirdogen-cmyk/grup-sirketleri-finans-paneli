// KategoriDagilim — gelir/gider kategorileri için 3D progress bar listesi.
// feedback_3d_grafik_stili_kati: tüm progress bar'lar bu stilde olmalı.

import { useMemo } from "react";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { ParaHaritasiKategori } from "@/types/domain";

interface Props {
  baslik: string;
  kategoriler: ParaHaritasiKategori[];
  /** Aktif firma rengi (gelir paneli için) */
  accent?: string;
  /** "gelir" = accent renk; "gider" = altın renk */
  mod?: "gelir" | "gider";
  /** Maksimum kaç satır göster */
  limit?: number;
}

export function KategoriDagilim({
  baslik,
  kategoriler,
  accent = TEMA.mavi,
  mod = "gelir",
  limit = 5,
}: Props) {
  const renk = mod === "gelir" ? accent : TEMA.altin;

  const siralanmis = useMemo(
    () => [...kategoriler].sort((a, b) => b.tutar - a.tutar).slice(0, limit),
    [kategoriler, limit],
  );

  const maxTutar = siralanmis[0]?.tutar ?? 1;

  return (
    <div
      data-anim="ozet"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "22px 22px 20px",
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.05)",
          "0 8px 24px rgba(0,0,0,0.25)",
        ].join(", "),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: renk,
              marginBottom: 4,
            }}
          >
            {mod === "gelir" ? "GELİR" : "GİDER"} DAĞILIMI
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink }}>{baslik}</div>
        </div>
        <span
          style={{
            fontSize: 11,
            color: TEMA.inkFaded,
            fontFamily: FONT.ana,
          }}
        >
          Top {siralanmis.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {siralanmis.map((k) => {
          const oran = (k.tutar / maxTutar) * 100;
          const trendIyi = mod === "gelir" ? k.trend > 0 : k.trend < 0;
          const trendRenk = trendIyi ? TEMA.yesil : k.trend === 0 ? TEMA.inkMuted : TEMA.kirmizi;
          return (
            <div key={k.ad}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT.ana,
                    fontSize: 12.5,
                    color: TEMA.inkSoft,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                  title={k.ad}
                >
                  {k.ad}
                </span>
                <span
                  style={{
                    fontFamily: FONT.num,
                    fontSize: 12,
                    fontWeight: 600,
                    color: TEMA.ink,
                    fontVariantNumeric: "tabular-nums",
                    textShadow: `0 0 6px ${renk}40`,
                  }}
                >
                  {fmtTL(k.tutar)}
                </span>
                <span
                  style={{
                    fontFamily: FONT.ana,
                    fontSize: 11,
                    fontWeight: 700,
                    color: trendRenk,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 44,
                    textAlign: "right",
                  }}
                >
                  {k.trend > 0 ? "+" : ""}
                  {k.trend.toFixed(1)}%
                </span>
              </div>
              {/* 3D progress bar — feedback_3d_grafik_stili_kati uygun */}
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
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${oran}%`,
                    background: `linear-gradient(90deg, ${rengiKaristir(renk, 0.25, "darker")}, ${renk} 55%, ${rengiKaristir(renk, 0.35, "lighter")})`,
                    borderRadius: 999,
                    transition: "width 1200ms cubic-bezier(0.22,0.61,0.36,1)",
                    boxShadow: [
                      "inset 0 1px 0 rgba(255,255,255,0.35)",
                      "inset 0 -1px 0 rgba(0,0,0,0.20)",
                      `0 0 10px ${renk}60`,
                    ].join(", "),
                  }}
                />
                {oran > 4 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `calc(${oran}% - 6px)`,
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
    </div>
  );
}
