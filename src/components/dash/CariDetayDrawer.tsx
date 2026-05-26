// CariDetayDrawer — Alacaklar sayfasında satır tıklamasında açılan detay.
// Cari özet KPI + fatura listesi + her faturada kalem genişletme.

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Phone, MessageSquare } from "lucide-react";
import { Drawer } from "./Drawer";
import { TEMA, FONT, fmtTL } from "@/lib/tema";
import type { Cari } from "@/types/domain";

interface Props {
  cari: Cari | null;
  onClose: () => void;
  accent: string;
}

export function CariDetayDrawer({ cari, onClose, accent }: Props) {
  const [acikFatura, setAcikFatura] = useState<string | null>(null);

  if (!cari) {
    return <Drawer open={false} onClose={onClose} title="" children={null} />;
  }

  const tarihFormat = (iso: string) =>
    new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Drawer
      open={!!cari}
      onClose={onClose}
      title={cari.ad}
      subtitle={`${cari.tip === "musteri" ? "Müşteri" : "Tedarikçi"} · ${cari.faturalar.length} açık fatura · Vade ${cari.vadesi} gün`}
      accent={accent}
      footer={
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: `linear-gradient(180deg, ${accent}, ${accent}cc)`,
              color: "white",
              border: "none",
              fontFamily: FONT.ana,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.20), 0 6px 16px ${accent}40`,
            }}
          >
            <Phone size={14} />
            Hatırlatma yap
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              color: TEMA.ink,
              border: `1px solid ${TEMA.border}`,
              fontFamily: FONT.ana,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <MessageSquare size={14} />
            WhatsApp mesajı
          </button>
        </div>
      }
    >
      {/* Cari özet KPI'lar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <OzetMiniKart etiket="Toplam Ciro" deger={fmtTL(cari.toplamCiro)} />
        <OzetMiniKart etiket="Açık Bakiye" deger={fmtTL(cari.acikBakiye)} accent={accent} />
        <OzetMiniKart etiket="Vade Süresi" deger={`${cari.vadesi} gün`} />
        <OzetMiniKart
          etiket="Doluluk Oranı"
          deger={`%${((cari.acikBakiye / Math.max(cari.toplamCiro, 1)) * 100).toFixed(0)}`}
        />
      </div>

      {/* Fatura listesi */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
          marginBottom: 10,
        }}
      >
        Açık Faturalar ({cari.faturalar.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cari.faturalar.map((f) => {
          const acik = acikFatura === f.no;
          const vadeTarih = new Date(f.vade);
          const bugun = new Date();
          const kalanGun = Math.ceil(
            (vadeTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24),
          );
          const vadeAcil = kalanGun <= 7 && kalanGun >= 0;
          const vadeGecmis = kalanGun < 0;

          return (
            <div
              key={f.no}
              style={{
                background: TEMA.bgKart,
                border: `1px solid ${TEMA.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setAcikFatura(acik ? null : f.no)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: TEMA.ink,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <FileText size={16} color={TEMA.inkMuted} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: TEMA.ink,
                        fontFamily: FONT.num,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {f.no}
                    </div>
                    <div style={{ fontSize: 11, color: TEMA.inkMuted, marginTop: 2 }}>
                      Tarih {tarihFormat(f.tarih)} · Vade {tarihFormat(f.vade)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: FONT.num,
                      fontSize: 14,
                      fontWeight: 700,
                      color: TEMA.ink,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtTL(f.kalan)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: vadeGecmis ? TEMA.kirmizi : vadeAcil ? TEMA.altin : TEMA.inkMuted,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {vadeGecmis
                      ? `${Math.abs(kalanGun)} gün gecikti`
                      : vadeAcil
                        ? `${kalanGun} gün kaldı`
                        : `${kalanGun} gün`}
                  </div>
                </div>
                {acik ? (
                  <ChevronDown size={16} color={TEMA.inkMuted} />
                ) : (
                  <ChevronRight size={16} color={TEMA.inkMuted} />
                )}
              </button>

              {acik && (
                <div
                  style={{
                    borderTop: `1px solid ${TEMA.border}`,
                    padding: "12px 14px",
                    background: TEMA.bgKartAlt,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: TEMA.inkFaded,
                      marginBottom: 8,
                    }}
                  >
                    Kalem detayı ({f.kalemler.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {f.kalemler.map((k, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          fontSize: 12,
                          borderBottom:
                            i === f.kalemler.length - 1
                              ? "none"
                              : `1px solid rgba(255,255,255,0.03)`,
                        }}
                      >
                        <span style={{ color: TEMA.inkSoft, flex: 1 }}>{k.ad}</span>
                        <span
                          style={{
                            color: TEMA.inkMuted,
                            fontFamily: FONT.num,
                            fontVariantNumeric: "tabular-nums",
                            marginRight: 10,
                          }}
                        >
                          {k.miktar} × {fmtTL(k.birimFiyat)}
                        </span>
                        <span
                          style={{
                            color: TEMA.ink,
                            fontWeight: 600,
                            fontFamily: FONT.num,
                            fontVariantNumeric: "tabular-nums",
                            minWidth: 100,
                            textAlign: "right",
                          }}
                        >
                          {fmtTL(k.tutar)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      marginTop: 6,
                      borderTop: `1px solid ${TEMA.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: TEMA.inkMuted, fontWeight: 600 }}>Fatura Toplam</span>
                    <span
                      style={{
                        color: accent,
                        fontWeight: 700,
                        fontFamily: FONT.num,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmtTL(f.tutar)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}

function OzetMiniKart({
  etiket,
  deger,
  accent,
}: {
  etiket: string;
  deger: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: TEMA.bgKart,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: TEMA.inkMuted,
          marginBottom: 6,
        }}
      >
        {etiket}
      </div>
      <div
        style={{
          fontFamily: FONT.num,
          fontSize: 16,
          fontWeight: 600,
          color: accent ?? TEMA.ink,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.015em",
        }}
      >
        {deger}
      </div>
    </div>
  );
}
