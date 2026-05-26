// IsBirligiSayfasi — Grup İçi İş Geliştirme (Katman 3).
// Memory project_dortlu_grup KATI: Tüm 5 kullanıcıya açık, finansal değil
// ilişki/fırsat odaklı; çapraz fırsat panosu + ortak müşteri haritası +
// yönlendirme defteri + tedarikçi havuzu.

import { useState } from "react";
import {
  Sparkles,
  Users,
  ArrowRight,
  Network,
  HandshakeIcon,
} from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { FIRMALAR } from "@/data/firmalar";
import {
  CAPRAZ_FIRSATLAR,
  ORTAK_MUSTERILER,
  YONLENDIRME_DEFTERI,
  TEDARIKCI_HAVUZU,
} from "@/data/mock-grup-isbirligi";
import { TEMA, FONT, fmtTL } from "@/lib/tema";

type Sekme = "firsat" | "musteri" | "yonlendirme" | "tedarikci";

export function IsBirligiSayfasi() {
  const [sekme, setSekme] = useState<Sekme>("firsat");

  const ozet = {
    firsatSayisi: CAPRAZ_FIRSATLAR.length,
    firsatPotansiyel: CAPRAZ_FIRSATLAR.reduce((s, f) => s + f.potansiyelTutar, 0),
    ortakMusteri: ORTAK_MUSTERILER.length,
    aktifYonlendirme: YONLENDIRME_DEFTERI.filter((y) => y.sonuc === "açık").length,
    tedarikciSayisi: TEDARIKCI_HAVUZU.length,
  };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#a78bfa", // Grup için violet
            fontWeight: 600,
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          Grup İçi İş Birliği · Katman 3
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: 0,
            color: TEMA.ink,
          }}
        >
          Çapraz Fırsat ve Yönlendirme Defteri
        </h1>
        <p
          style={{
            fontSize: 13,
            color: TEMA.inkMuted,
            marginTop: 6,
            marginBottom: 0,
            maxWidth: 740,
            lineHeight: 1.5,
          }}
        >
          4 firma arasında bilgi/fırsat akışı. Finansal mahremiyet korunur —
          burada paylaşılanlar sektör, müşteri ilişkisi, tedarikçi avantajı
          ve yönlendirme kayıtları. Tüm yöneticilere açık.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <KpiKart
          etiket="Çapraz Fırsat"
          numerikDeger={ozet.firsatPotansiyel}
          ondalik={0}
          sonek=" ₺"
          delta={42}
          deltaEtiketi={`${ozet.firsatSayisi} fırsat`}
          tone="#a78bfa"
          ikon={Sparkles}
          vurgu
        />
        <KpiKart
          etiket="Ortak Müşteri"
          numerikDeger={ozet.ortakMusteri}
          ondalik={0}
          sonek=" cari"
          tone={TEMA.yesil}
          ikon={Users}
        />
        <KpiKart
          etiket="Aktif Yönlendirme"
          numerikDeger={ozet.aktifYonlendirme}
          ondalik={0}
          sonek=" açık"
          tone={TEMA.altin}
          ikon={ArrowRight}
        />
        <KpiKart
          etiket="Tedarikçi Havuzu"
          numerikDeger={ozet.tedarikciSayisi}
          ondalik={0}
          sonek=" ortak"
          tone="#60a5fa"
          ikon={Network}
        />
      </section>

      {/* Alt sekme nav */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${TEMA.border}`,
          marginBottom: 16,
        }}
      >
        {(
          [
            { id: "firsat", ad: "Çapraz Fırsatlar" },
            { id: "musteri", ad: "Ortak Müşteriler" },
            { id: "yonlendirme", ad: "Yönlendirme Defteri" },
            { id: "tedarikci", ad: "Tedarikçi Havuzu" },
          ] as { id: Sekme; ad: string }[]
        ).map((s) => {
          const aktif = s.id === sekme;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSekme(s.id)}
              style={{
                background: "transparent",
                border: "none",
                color: aktif ? TEMA.ink : TEMA.inkMuted,
                fontFamily: FONT.ana,
                fontSize: 13,
                fontWeight: aktif ? 600 : 500,
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom: aktif ? `2px solid #a78bfa` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 180ms ease, border-color 180ms ease",
              }}
            >
              {s.ad}
            </button>
          );
        })}
      </div>

      {sekme === "firsat" && <CaprazFirsatPanosu />}
      {sekme === "musteri" && <OrtakMusteriPanosu />}
      {sekme === "yonlendirme" && <YonlendirmePanosu />}
      {sekme === "tedarikci" && <TedarikciPanosu />}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginTop: 24,
        }}
      >
        <OzetKart
          etiket="En Aktif Yönlendiren"
          deger="MEBA · 8 yön"
          baglam="Son 90 günde çapraz fırsat üretimi"
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="En Çok Ortak Müşteri"
          deger="MEBA-MESA"
          baglam="3 ortak cari · toplam 22M ₺ ciro"
          baglamRengi="notr"
        />
        <OzetKart
          etiket="En Yüksek İskonto"
          deger="SMC · %18"
          baglam="3 firma birlikte alım yapıyor"
          baglamRengi="iyi"
        />
      </section>
    </>
  );
}

// ===========================================================================
// SEKMELER
// ===========================================================================

function CaprazFirsatPanosu() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
      {CAPRAZ_FIRSATLAR.map((f) => {
        const kaynak = FIRMALAR[f.kaynakFirma];
        const hedef = FIRMALAR[f.hedefFirma];
        const durumRengi =
          f.durum === "iletildi"
            ? TEMA.yesil
            : f.durum === "değerlendiriliyor"
              ? TEMA.altin
              : "#a78bfa";
        return (
          <div
            key={f.id}
            style={{
              background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
              border: `1px solid ${TEMA.border}`,
              borderRadius: 14,
              padding: "16px 18px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.20)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FirmaPip firmaId={f.kaynakFirma} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEMA.ink }}>
                {kaynak.kisaAd}
              </span>
              <ArrowRight size={14} color={TEMA.inkFaded} />
              <FirmaPip firmaId={f.hedefFirma} />
              <span style={{ fontSize: 13, fontWeight: 600, color: TEMA.ink }}>
                {hedef.kisaAd}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: `${durumRengi}1f`,
                  color: durumRengi,
                }}
              >
                {f.durum}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink, marginBottom: 2 }}>
                {f.musteri}
              </div>
              <div style={{ fontSize: 11, color: TEMA.inkMuted }}>{f.sektor}</div>
            </div>

            <p style={{ fontSize: 12.5, color: TEMA.inkSoft, lineHeight: 1.5, margin: 0 }}>
              {f.not}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 10,
                borderTop: `1px solid ${TEMA.border}`,
                fontSize: 11,
                color: TEMA.inkFaded,
              }}
            >
              <span>
                Tahmini potansiyel:{" "}
                <strong style={{ color: TEMA.ink, fontFamily: FONT.num, fontVariantNumeric: "tabular-nums" }}>
                  {fmtTL(f.potansiyelTutar)}
                </strong>
              </span>
              <span>{new Date(f.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrtakMusteriPanosu() {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1.6fr 1fr",
          gap: 12,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: TEMA.inkFaded,
          padding: "0 0 10px",
          borderBottom: `1px solid ${TEMA.border}`,
        }}
      >
        <span>Müşteri</span>
        <span>Sektör</span>
        <span>Firmalar (12 ay ciro)</span>
        <span style={{ textAlign: "right" }}>Toplam</span>
      </div>
      {ORTAK_MUSTERILER.map((m, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1.6fr 1fr",
            gap: 12,
            padding: "12px 0",
            borderBottom:
              i === ORTAK_MUSTERILER.length - 1
                ? "none"
                : `1px solid rgba(255,255,255,0.03)`,
            fontSize: 13,
            alignItems: "center",
          }}
        >
          <span style={{ color: TEMA.ink, fontWeight: 500 }}>{m.ad}</span>
          <span style={{ color: TEMA.inkMuted, fontSize: 12 }}>{m.sektor}</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {m.firmalar.map((f) => {
              const firma = FIRMALAR[f.firmaId];
              return (
                <span
                  key={f.firmaId}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: `${firma.renk}1f`,
                    border: `1px solid ${firma.renk}40`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: firma.renk,
                  }}
                  title={fmtTL(f.ciro12Ay)}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: firma.renk,
                    }}
                  />
                  {firma.kisaAd}{" "}
                  <span
                    style={{
                      color: TEMA.inkSoft,
                      fontFamily: FONT.num,
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 500,
                    }}
                  >
                    {fmtTL(f.ciro12Ay)}
                  </span>
                </span>
              );
            })}
          </div>
          <span
            style={{
              fontFamily: FONT.num,
              fontWeight: 600,
              color: TEMA.ink,
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            }}
          >
            {fmtTL(m.toplam)}
          </span>
        </div>
      ))}
    </div>
  );
}

function YonlendirmePanosu() {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 1.6fr 100px 100px",
          gap: 12,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: TEMA.inkFaded,
          padding: "0 0 10px",
          borderBottom: `1px solid ${TEMA.border}`,
        }}
      >
        <span>Tarih</span>
        <span>Yönlendirme</span>
        <span>Müşteri / Konu</span>
        <span style={{ textAlign: "right" }}>Tutar</span>
        <span style={{ textAlign: "right" }}>Sonuç</span>
      </div>
      {YONLENDIRME_DEFTERI.map((y, i) => {
        const sonucRengi =
          y.sonuc === "kapandı"
            ? TEMA.yesil
            : y.sonuc === "açık"
              ? TEMA.altin
              : TEMA.kirmizi;
        return (
          <div
            key={y.id}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 1.6fr 100px 100px",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                i === YONLENDIRME_DEFTERI.length - 1
                  ? "none"
                  : `1px solid rgba(255,255,255,0.03)`,
              fontSize: 13,
              alignItems: "center",
            }}
          >
            <span style={{ color: TEMA.inkMuted, fontFamily: FONT.num, fontSize: 12 }}>
              {new Date(y.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <FirmaPip firmaId={y.kaynakFirma} />
              <span style={{ color: TEMA.inkSoft }}>{FIRMALAR[y.kaynakFirma].kisaAd}</span>
              <ArrowRight size={11} color={TEMA.inkFaded} />
              <FirmaPip firmaId={y.hedefFirma} />
              <span style={{ color: TEMA.ink, fontWeight: 600 }}>{FIRMALAR[y.hedefFirma].kisaAd}</span>
            </span>
            <div>
              <div style={{ color: TEMA.ink, fontWeight: 500 }}>{y.musteri}</div>
              <div style={{ color: TEMA.inkMuted, fontSize: 11, marginTop: 2 }}>{y.konu}</div>
            </div>
            <span
              style={{
                fontFamily: FONT.num,
                fontVariantNumeric: "tabular-nums",
                fontWeight: 500,
                color: TEMA.inkSoft,
                textAlign: "right",
              }}
            >
              {y.tutar ? fmtTL(y.tutar) : "—"}
            </span>
            <span
              style={{
                textAlign: "right",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: sonucRengi,
              }}
            >
              {y.sonuc}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TedarikciPanosu() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: 14,
      }}
    >
      {TEDARIKCI_HAVUZU.map((t, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink }}>{t.ad}</div>
              <div style={{ fontSize: 11, color: TEMA.inkMuted, marginTop: 2 }}>{t.segmenti}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: FONT.num,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#a78bfa",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                  textShadow: "0 0 12px rgba(167,139,250,0.40)",
                }}
              >
                %{t.iskontoOrani}
              </div>
              <div style={{ fontSize: 10, color: TEMA.inkFaded, letterSpacing: "0.10em" }}>iskonto</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {t.kullanan.map((fId) => {
              const firma = FIRMALAR[fId];
              return (
                <span
                  key={fId}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: `${firma.renk}1f`,
                    border: `1px solid ${firma.renk}40`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: firma.renk,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: firma.renk,
                    }}
                  />
                  {firma.kisaAd}
                </span>
              );
            })}
          </div>

          <p style={{ fontSize: 12, color: TEMA.inkSoft, lineHeight: 1.5, margin: 0 }}>
            {t.not}
          </p>

          <div
            style={{
              paddingTop: 10,
              borderTop: `1px solid ${TEMA.border}`,
              fontSize: 11,
              color: TEMA.inkFaded,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Yıllık hacim:</span>
            <span
              style={{
                color: TEMA.ink,
                fontWeight: 600,
                fontFamily: FONT.num,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtTL(t.yillikHacim)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FirmaPip({ firmaId }: { firmaId: keyof typeof FIRMALAR }) {
  const firma = FIRMALAR[firmaId];
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: firma.renk,
        boxShadow: `0 0 6px ${firma.renk}80`,
      }}
    />
  );
}

// Bilinmeyen ikon — Lucide'a HandshakeIcon var ama bazı sürümlerde yok; guard:
void HandshakeIcon;
