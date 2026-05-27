// AiYorumKart — sayfa bazlı AI yorum kartı.
//
// NE: Her sayfanın altında, sayfa verisini Anadolu iş dili ile yorumlayan
// 4 madde + 1 satır CTA içeren kart. Mevcut muhasebe verisini DERİNLEŞTİRİR,
// dış veri çekmez (V1 muhasebe sınırı KATİ — `feedback-v1-muhasebe-sinir`).
//
// NEDEN: Mehmet Bey 2026-05-26: "extra modül yok harikalar yaratacaz".
// Çıplak sayı yerine "Mehmet Bey, marj puanı 2,3 düştü; reçeli reçele
// karıştırmadan önce SMC zam yansımasına bakalım" gibi yorum daha kıymetli.
// Bu kart V1 sınırı içinde her sayfa için en hızlı kazanım — yeni veri
// kaynağı kurmadan yorumu güçlendirir.
//
// NASIL:
//  - Sayfa kendi `madde` listesini hesaplayıp props'a verir
//    (4 madde önerilir, 3-5 esnek)
//  - Her madde: ton (pozitif/dikkat/firsat/kritik), başlık, detay cümlesi,
//    opsiyonel `vurguSayi` (sağ tarafta tabular-nums pill)
//  - Alt CTA satırı: "Mehmet Bey, ister misiniz..." tarzı; tıklayınca
//    notify ile geri bildirim (V2'de AI Asistan FAB'a yönlendirecek)
//  - Tema: violet AI accent (#a78bfa) + multi-stop gradient + glow
//    (MuhasebeBriefKart ile aynı görsel dil)
//
// YAN ETKİ: notify'a bağlı (sonner), AiAsistanFAB'a v2'de bağlanacak.

import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { TEMA, FONT } from "@/lib/tema";
import { notify } from "@/lib/notify";

export type AiYorumTon = "pozitif" | "dikkat" | "firsat" | "kritik";

export interface AiYorumMaddesi {
  ton: AiYorumTon;
  baslik: string;
  detay: string;
  vurguSayi?: string;
}

interface Props {
  sayfaBasligi: string;
  maddeler: AiYorumMaddesi[];
  ctaMetni?: string;
  ctaButonMetni?: string;
  ctaAksiyonu?: () => void;
}

const ACCENT_AI = "#a78bfa";

const TON_AYAR: Record<
  AiYorumTon,
  { renk: string; ikon: LucideIcon; etiket: string }
> = {
  pozitif: { renk: TEMA.yesil, ikon: TrendingUp, etiket: "Olumlu" },
  dikkat: { renk: TEMA.altin, ikon: AlertTriangle, etiket: "Dikkat" },
  firsat: { renk: TEMA.mavi, ikon: Lightbulb, etiket: "Fırsat" },
  kritik: { renk: TEMA.kirmizi, ikon: TrendingDown, etiket: "Kritik" },
};

export function AiYorumKart({
  sayfaBasligi,
  maddeler,
  ctaMetni,
  ctaButonMetni,
  ctaAksiyonu,
}: Props) {
  const varsayilanCta =
    ctaMetni ??
    "Mehmet Bey, bu yorumları aylık brief'e iliştirip ekibe pas verelim mi?";
  const butonMetni = ctaButonMetni ?? "Briefe iliştir";

  const aksiyon =
    ctaAksiyonu ??
    (() =>
      notify.success("AI yorumları briefe iliştirildi", {
        description:
          "Aylık toplantı dosyasına eklendi · Furkan Bey'e bildirim hazır.",
      }));

  return (
    <div
      data-anim="ozet"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "22px 24px 20px",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Üst başlık — AI mührü */}
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
              background: `${ACCENT_AI}1f`,
              color: ACCENT_AI,
              boxShadow: `0 0 14px ${ACCENT_AI}30`,
            }}
          >
            <Sparkles size={18} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: ACCENT_AI,
                marginBottom: 3,
              }}
            >
              AI · {sayfaBasligi} Yorumu
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: TEMA.ink,
              }}
            >
              Bu dönem verisinden çıkan {maddeler.length} okuma
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: TEMA.inkMuted,
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              Logo Go + manuel yüklemelerden çıkarıldı · Anadolu iş dili ·
              Mehmet Bey'e özel
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <span
            style={{
              fontFamily: FONT.num,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: ACCENT_AI,
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${ACCENT_AI}40`,
              background: `${ACCENT_AI}10`,
            }}
          >
            CANLI
          </span>
        </div>
      </div>

      {/* Madde listesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {maddeler.map((m, i) => {
          const ayar = TON_AYAR[m.ton];
          const Ikon = ayar.ikon;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: m.vurguSayi
                  ? "32px 1fr 140px"
                  : "32px 1fr",
                gap: 12,
                alignItems: "start",
                padding: "11px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${TEMA.border}`,
                transition: "all 180ms ease",
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${ayar.renk}18`,
                  color: ayar.renk,
                  marginTop: 1,
                }}
              >
                <Ikon size={14} color={ayar.renk} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: ayar.renk,
                    }}
                  >
                    {ayar.etiket}
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: TEMA.ink,
                    }}
                  >
                    {m.baslik}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: TEMA.inkSoft,
                    lineHeight: 1.5,
                  }}
                >
                  {m.detay}
                </div>
              </div>
              {m.vurguSayi && (
                <div
                  style={{
                    fontFamily: FONT.num,
                    fontSize: 15,
                    fontWeight: 600,
                    color: ayar.renk,
                    fontVariantNumeric: "tabular-nums",
                    textAlign: "right",
                    textShadow: `0 0 10px ${ayar.renk}40`,
                    alignSelf: "center",
                  }}
                >
                  {m.vurguSayi}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA satırı */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 12,
          background: `linear-gradient(90deg, ${ACCENT_AI}10, ${TEMA.altin}08)`,
          border: `1px solid ${ACCENT_AI}30`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Target size={16} color={ACCENT_AI} style={{ flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: 12.5,
            color: TEMA.inkSoft,
            lineHeight: 1.5,
          }}
        >
          {varsayilanCta}
        </span>
        <button
          type="button"
          onClick={aksiyon}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            borderRadius: 8,
            background: `linear-gradient(135deg, ${ACCENT_AI}, #8b5cf6)`,
            color: "white",
            border: "none",
            fontSize: 11.5,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: `0 4px 12px ${ACCENT_AI}40`,
          }}
        >
          {butonMetni}
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
