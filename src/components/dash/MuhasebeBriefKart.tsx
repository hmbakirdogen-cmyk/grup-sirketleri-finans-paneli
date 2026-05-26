// MuhasebeBriefKart — muhasebeci Osman Bey'den her ay gelen ödeme brief'i.
//
// Mehmet Bey 2026-05-27 örnek mesajı:
//   "iyi günler abi, arefeniz mübarek olsun. 42.770 kdv 13.920 muhtasar
//    46.715 ssk 10.155 bağkur 9.000 muhasebe ödemelerimiz var, şimdiden
//    hayrlı bayramlar olsun abi"
//
// V1 (şimdi): Mehmet Bey'in gerçek aylık tutarları statik, ödendi/ödenmedi
// toggle, toplam, hayırlı bayramlar şeridi.
// V2: Cloudflare Workers + WhatsApp Business API + Claude Sonnet parse →
// muhasebecinin mesajı geldiğinde otomatik bu kart doldurulur.

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, MessageSquare, Sparkles } from "lucide-react";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import { notify } from "@/lib/notify";

interface OdemeKalemi {
  id: string;
  ad: string;
  tip: "vergi" | "sgk" | "muhasebe";
  tutar: number;
  ozelNot?: string;
}

// Mehmet Bey'in 2026-05-27 muhasebeci mesajındaki gerçek tutarlar
const OSMAN_BEY_KALEMLERI: OdemeKalemi[] = [
  { id: "kdv", ad: "KDV", tip: "vergi", tutar: 42_770, ozelNot: "Beyanname + ödeme aynı dönem" },
  { id: "muhtasar", ad: "Muhtasar", tip: "vergi", tutar: 13_920, ozelNot: "Stopaj kesintileri" },
  { id: "ssk", ad: "SSK Primi", tip: "sgk", tutar: 46_715, ozelNot: "İşveren + işçi paylı" },
  { id: "bagkur", ad: "Bağkur", tip: "sgk", tutar: 10_155, ozelNot: "Şahsi prim" },
  { id: "muhasebe", ad: "Muhasebe Hizmet", tip: "muhasebe", tutar: 9_000, ozelNot: "Osman Bey aylık" },
];

const ACCENT = "#a78bfa"; // Muhasebe için violet (grup içi servis kimliği)

export function MuhasebeBriefKart() {
  const [odendi, setOdendi] = useState<Record<string, boolean>>({});

  const toplam = useMemo(
    () => OSMAN_BEY_KALEMLERI.reduce((s, k) => s + k.tutar, 0),
    [],
  );
  const odenenToplam = useMemo(
    () =>
      OSMAN_BEY_KALEMLERI.reduce((s, k) => (odendi[k.id] ? s + k.tutar : s), 0),
    [odendi],
  );
  const kalanToplam = toplam - odenenToplam;

  function toggle(id: string) {
    setOdendi((m) => ({ ...m, [id]: !m[id] }));
  }

  return (
    <div
      data-anim="ozet"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "22px 24px 20px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Üst başlık — mesaj kaynağı */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: `1px solid ${TEMA.border}`,
        }}
      >
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: 10,
              background: `${ACCENT}1f`,
              color: ACCENT,
              boxShadow: `0 0 14px ${ACCENT}30`,
            }}
          >
            <MessageSquare size={18} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: ACCENT,
                marginBottom: 3,
              }}
            >
              Aylık Muhasebe Brief · Mayıs 2026
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink }}>
              Osman Bey'den ödeme listesi geldi
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: TEMA.inkMuted,
                fontStyle: "italic",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              "İyi günler abi, arefeniz mübarek olsun. Ödemelerimiz var,
              şimdiden hayırlı bayramlar olsun abi." — 2026-05-27 sabah
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: FONT.num,
              fontSize: 22,
              fontWeight: 700,
              color: TEMA.ink,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
              textShadow: `0 0 16px ${ACCENT}40`,
            }}
          >
            {fmtTL(toplam)}
          </div>
          <div style={{ fontSize: 10.5, color: TEMA.inkFaded, letterSpacing: "0.06em", marginTop: 2 }}>
            Toplam aylık yük
          </div>
        </div>
      </div>

      {/* Kalem listesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {OSMAN_BEY_KALEMLERI.map((k) => {
          const aktif = !!odendi[k.id];
          const tipRengi =
            k.tip === "vergi" ? "#5b9dff" : k.tip === "sgk" ? "#a78bfa" : "#d4af7a";
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => toggle(k.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 1.4fr 130px",
                gap: 12,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 10,
                background: aktif ? `${TEMA.yesil}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${aktif ? TEMA.yesil + "40" : TEMA.border}`,
                cursor: "pointer",
                transition: "all 180ms ease",
                fontFamily: FONT.ana,
                fontSize: 13,
                color: TEMA.ink,
                textAlign: "left",
                width: "100%",
              }}
            >
              {aktif ? (
                <CheckCircle2 size={20} color={TEMA.yesil} />
              ) : (
                <Circle size={20} color={TEMA.inkFaded} />
              )}
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: aktif ? TEMA.inkMuted : TEMA.ink,
                    textDecoration: aktif ? "line-through" : "none",
                  }}
                >
                  {k.ad}
                </div>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: tipRengi,
                    opacity: 0.85,
                  }}
                >
                  {k.tip === "vergi" ? "Vergi" : k.tip === "sgk" ? "SGK / Bağkur" : "Hizmet"}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: TEMA.inkMuted }}>{k.ozelNot}</div>
              <div
                style={{
                  fontFamily: FONT.num,
                  fontWeight: 600,
                  fontSize: 14,
                  color: aktif ? TEMA.inkMuted : TEMA.ink,
                  textDecoration: aktif ? "line-through" : "none",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {fmtTL(k.tutar)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Toplam + AI bayram tebrik */}
      <div
        style={{
          marginTop: 16,
          padding: "14px 16px",
          borderRadius: 12,
          background: `linear-gradient(90deg, ${ACCENT}10, ${TEMA.altin}10)`,
          border: `1px solid ${ACCENT}30`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: TEMA.inkFaded,
                marginBottom: 4,
              }}
            >
              Ödendi
            </div>
            <div
              style={{
                fontFamily: FONT.num,
                fontSize: 18,
                fontWeight: 700,
                color: TEMA.yesil,
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 12px ${TEMA.yesil}50`,
              }}
            >
              {fmtTL(odenenToplam)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: TEMA.inkFaded,
                marginBottom: 4,
              }}
            >
              Kalan
            </div>
            <div
              style={{
                fontFamily: FONT.num,
                fontSize: 18,
                fontWeight: 700,
                color: kalanToplam > 0 ? TEMA.altin : TEMA.yesil,
                fontVariantNumeric: "tabular-nums",
                textShadow: kalanToplam > 0 ? `0 0 12px ${TEMA.altin}50` : "none",
              }}
            >
              {fmtTL(kalanToplam)}
            </div>
          </div>
        </div>

        {/* Progress bar 3D — ödenen oranı */}
        <div
          style={{
            position: "relative",
            height: 8,
            background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
            borderRadius: 999,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.50), inset 0 -1px 0 rgba(255,255,255,0.03)",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${(odenenToplam / toplam) * 100}%`,
              background: `linear-gradient(90deg, ${rengiKaristir(TEMA.yesil, 0.25, "darker")}, ${TEMA.yesil} 55%, ${rengiKaristir(TEMA.yesil, 0.35, "lighter")})`,
              borderRadius: 999,
              transition: "width 800ms cubic-bezier(0.22,0.61,0.36,1)",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.35)",
                "inset 0 -1px 0 rgba(0,0,0,0.20)",
                `0 0 10px ${TEMA.yesil}60`,
              ].join(", "),
            }}
          />
        </div>

        {/* AI bayram tebrik şeridi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
            color: TEMA.inkSoft,
            lineHeight: 1.5,
          }}
        >
          <Sparkles size={14} color={TEMA.altin} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <strong style={{ color: TEMA.altin }}>Arefeniz mübarek olsun</strong> · Bayram öncesi
            ödemeleri tamamlayıp gönlünüz rahat tatile gidin. Osman Bey'e ricamızı iletmek için
            tek tuş yeter.
          </span>
          <button
            type="button"
            onClick={() =>
              notify.success("Osman Bey'e teşekkür mesajı hazırlandı", {
                description:
                  "WhatsApp Business gönderme aktive edildiğinde otomatik yollanacak.",
              })
            }
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
              color: "white",
              border: "none",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: `0 4px 12px ${ACCENT}40`,
            }}
          >
            Osman Bey'e teşekkür gönder
          </button>
        </div>
      </div>
    </div>
  );
}
