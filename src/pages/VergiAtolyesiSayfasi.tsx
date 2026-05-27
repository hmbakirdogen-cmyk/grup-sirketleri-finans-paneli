// VergiAtolyesiSayfasi — Geçici vergi (3 aylık) stok optimizasyon atölyesi.
// Mehmet Bey direktifi: muhasebeci Osman Bey ile yapılan stok ayar pratiği
// dijitalleşsin; FIFO/Ağırlıklı Ortalama + stok slider + canlı vergi delta.
//
// project_vergi_atolyesi.md kati spec.

import { useMemo, useState } from "react";
import { Calculator, FileDown, Info, Send } from "lucide-react";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { KpiKart } from "@/components/dash/KpiKart";
import { notify } from "@/lib/notify";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { Firma, FirmaFinans } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

type Yontem = "agirlikli" | "fifo";

const GECICI_VERGI_ORANI = 0.25; // Kurumlar geçici vergi 2026

export function VergiAtolyesiSayfasi({ firma, finans }: Props) {
  const [yontem, setYontem] = useState<Yontem>("agirlikli");
  const [stokAyar, setStokAyar] = useState<number>(0);

  // Yıllık değerleri çeyrek bazına böl
  const baz = useMemo(() => {
    const yillikNetSatis = finans.gelirTablosu[0]?.tutar ?? 0;
    const yillikSMM = Math.abs(finans.gelirTablosu[1]?.tutar ?? 0);
    const yillikFP = Math.abs(finans.gelirTablosu[3]?.tutar ?? 0);
    const yillikFinansman = Math.abs(finans.gelirTablosu[5]?.tutar ?? 0);

    const netSatisQ = yillikNetSatis / 4;
    const smmQ = yillikSMM / 4;
    const fpQ = yillikFP / 4;
    const finansmanQ = yillikFinansman / 4;

    return { netSatisQ, smmQ, fpQ, finansmanQ };
  }, [finans]);

  // FIFO → enflasyon ortamında SMM tipik ~%4 daha düşük (eski düşük maliyet)
  const yontemKatsayi = yontem === "fifo" ? 0.96 : 1.0;
  const smmYonteme = baz.smmQ * yontemKatsayi;

  // Senaryo: stok artışı → SMM düşer (stok kalan kısmı dönem sonrası)
  // stokAyar pozitif = stok artarken SMM azalır = matrah artar = vergi artar
  const senaryoSMM = Math.max(0, smmYonteme - stokAyar);

  const senaryo = useMemo(() => {
    const brut = baz.netSatisQ - senaryoSMM;
    const faaliyet = brut - baz.fpQ;
    const matrah = Math.max(0, faaliyet - baz.finansmanQ);
    const vergi = matrah * GECICI_VERGI_ORANI;
    return { brut, faaliyet, matrah, vergi };
  }, [baz, senaryoSMM]);

  // Baz senaryo (stokAyar=0, ağırlıklı ortalama)
  const bazSenaryo = useMemo(() => {
    const brut = baz.netSatisQ - baz.smmQ;
    const faaliyet = brut - baz.fpQ;
    const matrah = Math.max(0, faaliyet - baz.finansmanQ);
    return { matrah, vergi: matrah * GECICI_VERGI_ORANI };
  }, [baz]);

  const vergiDelta = senaryo.vergi - bazSenaryo.vergi;
  const stokSinir = baz.smmQ * 0.20; // ±%20 slider sınırı

  const aiMaddeler = useMemo<AiYorumMaddesi[]>(() => {
    const list: AiYorumMaddesi[] = [];

    list.push({
      ton: vergiDelta < 0 ? "pozitif" : vergiDelta > 0 ? "dikkat" : "firsat",
      baslik:
        vergiDelta < 0
          ? "Senaryo vergi tasarrufu üretiyor"
          : vergiDelta > 0
            ? "Senaryo vergiyi yukarı taşıyor"
            : "Senaryo bazla aynı kaldı",
      detay:
        vergiDelta < 0
          ? `${fmtTL(Math.abs(vergiDelta))} daha düşük geçici vergi çıkıyor. Bu farkın dayanağı stok ve yöntem notuyla birlikte saklanmalı.`
          : vergiDelta > 0
            ? `${fmtTL(vergiDelta)} ek vergi baskısı oluşuyor. Stok artışı ya da yöntem tercihi matrahı yukarı taşıdı.`
            : "Mevcut ayar baz senaryoyu değiştirmedi. Muhasebeci görüşmesinde temel referans korunabilir.",
      vurguSayi: fmtTL(vergiDelta),
    });

    list.push({
      ton: yontem === "fifo" ? "firsat" : "dikkat",
      baslik: yontem === "fifo" ? "FIFO etkisi görünür oldu" : "Ağırlıklı ortalama muhafazakâr kaldı",
      detay:
        yontem === "fifo"
          ? "FIFO seçimi enflasyon etkisini daha net gösteriyor. Yöntem değişikliği hukuki zeminde ayrıca teyit edilmeden uygulanmamalı."
          : "Ağırlıklı ortalama daha güvenli baz senaryo sunuyor. Kayıt disiplini açısından savunması daha rahat.",
      vurguSayi: yontem.toUpperCase(),
    });

    list.push({
      ton: stokAyar > 0 ? "dikkat" : stokAyar < 0 ? "firsat" : "pozitif",
      baslik: "Stok ayarı matrahı doğrudan oynatıyor",
      detay:
        stokAyar > 0
          ? "Pozitif stok ayarı SMM'yi aşağı çekip matrahı yükseltti. Sayım farkı gerçekten desteklenmiyorsa risk doğurur."
          : stokAyar < 0
            ? "Negatif stok ayarı SMM'yi yukarı çekip geçici vergi yükünü azalttı. Envanter tutarlılığı mutlaka kontrol edilmeli."
            : "Stok ayarı sıfırda kaldığı için temel maliyet fotoğrafı korunuyor.",
      vurguSayi: fmtTL(stokAyar),
    });

    list.push({
      ton: senaryo.matrah > bazSenaryo.matrah ? "dikkat" : "pozitif",
      baslik: "Matrah etkisi konuşma notuna bağlanmalı",
      detay:
        senaryo.matrah > bazSenaryo.matrah
          ? `Senaryo matrahı ${fmtTL(senaryo.matrah)} seviyesine çıktı. Muhasebeci görüşmesine bu farkın sebebi kısa not olarak eklenmeli.`
          : `Senaryo matrahı ${fmtTL(senaryo.matrah)} seviyesinde kaldı. Uygulama notu ve belge iziyle birlikte savunulabilir görünüyor.`,
      vurguSayi: fmtTL(senaryo.matrah),
    });

    return list;
  }, [bazSenaryo.matrah, senaryo.matrah, stokAyar, vergiDelta, yontem]);

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: firma.renk,
            fontWeight: 600,
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          Vergi Atölyesi · {firma.konum.split(" ")[0]}
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
          Geçici Vergi Senaryo Atölyesi
        </h1>
        <p
          style={{
            fontSize: 13,
            color: TEMA.inkMuted,
            marginTop: 6,
            marginBottom: 0,
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          Çeyrek dönem geçici vergi tahmini · Osman Bey ile oturmadan önce stok değerleme yöntemi ve dönem sonu stok ayarını canlı simüle edin. Yasal sınırlar içinde.
        </p>
      </div>

      {/* ÜST — 4 KPI */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <KpiKart
          etiket="Çeyrek Net Satış"
          numerikDeger={baz.netSatisQ}
          ondalik={0}
          sonek=" ₺"
          tone={firma.renk}
          ikon={Calculator}
        />
        <KpiKart
          etiket="Mevcut Vergi Tahmini"
          numerikDeger={bazSenaryo.vergi}
          ondalik={0}
          sonek=" ₺"
          tone={TEMA.altin}
          ikon={FileDown}
        />
        <KpiKart
          etiket="Senaryo Vergi"
          numerikDeger={senaryo.vergi}
          ondalik={0}
          sonek=" ₺"
          delta={
            bazSenaryo.vergi > 0
              ? ((senaryo.vergi - bazSenaryo.vergi) / bazSenaryo.vergi) * 100
              : 0
          }
          deltaEtiketi="baz vs"
          tone={vergiDelta < 0 ? TEMA.yesil : TEMA.kirmizi}
          ikon={Calculator}
          vurgu
        />
        <KpiKart
          etiket="Vergi Tasarrufu / Artışı"
          numerikDeger={Math.abs(vergiDelta)}
          ondalik={0}
          sonek=" ₺"
          tone={vergiDelta < 0 ? TEMA.yesil : TEMA.kirmizi}
          ikon={vergiDelta < 0 ? FileDown : Calculator}
        />
      </section>

      {/* ORTA — sol Mevcut Durum tablosu + sağ Senaryo Atölyesi */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Sol — Mevcut Durum */}
        <div
          data-anim="grafik"
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 16,
            padding: "22px 22px 20px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEMA.inkMuted,
              marginBottom: 4,
            }}
          >
            Mevcut Durum
          </div>
          <div style={{ fontSize: 14, color: TEMA.inkSoft, marginBottom: 16 }}>
            Yöntem: <strong style={{ color: TEMA.ink }}>Ağırlıklı Ortalama</strong> · Stok ayarı: <strong style={{ color: TEMA.ink }}>0 ₺</strong>
          </div>
          <TabloSatir etiket="Net Satışlar" deger={baz.netSatisQ} />
          <TabloSatir etiket="SMM" deger={-baz.smmQ} negatif />
          <TabloSatir etiket="Brüt Kâr" deger={baz.netSatisQ - baz.smmQ} kalin />
          <TabloSatir etiket="Faaliyet Giderleri" deger={-baz.fpQ} negatif />
          <TabloSatir etiket="Faaliyet Kârı" deger={baz.netSatisQ - baz.smmQ - baz.fpQ} kalin />
          <TabloSatir etiket="Finansman" deger={-baz.finansmanQ} negatif />
          <TabloSatir etiket="Matrah" deger={bazSenaryo.matrah} kalin accent={firma.renk} />
          <TabloSatir
            etiket="Geçici Vergi (%25)"
            deger={bazSenaryo.vergi}
            negatif
            kalin
            accent={TEMA.altin}
          />
        </div>

        {/* Sağ — Senaryo Atölyesi */}
        <div
          data-anim="grafik"
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${firma.renk}40`,
            borderRadius: 16,
            padding: "22px 22px 20px",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px ${firma.renk}26`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: firma.renk,
              marginBottom: 4,
            }}
          >
            Senaryo Atölyesi
          </div>
          <div style={{ fontSize: 14, color: TEMA.inkSoft, marginBottom: 18 }}>
            Yöntem ve stok ayarını çekin, sonuç anında güncellensin
          </div>

          {/* Yöntem toggle */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: TEMA.inkMuted,
                marginBottom: 8,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Stok Değerleme Yöntemi
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["agirlikli", "fifo"] as Yontem[]).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYontem(y)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background:
                      yontem === y
                        ? `linear-gradient(180deg, ${firma.renk}30, ${firma.renk}15)`
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${yontem === y ? firma.renk + "60" : TEMA.border}`,
                    color: yontem === y ? TEMA.ink : TEMA.inkMuted,
                    fontFamily: FONT.ana,
                    fontSize: 13,
                    fontWeight: yontem === y ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 180ms ease",
                  }}
                >
                  {y === "agirlikli" ? "Ağırlıklı Ortalama" : "FIFO"}
                </button>
              ))}
            </div>
          </div>

          {/* Stok slider */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 11,
                color: TEMA.inkMuted,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              <span>Dönem Sonu Stok Ayarı</span>
              <span
                style={{
                  color:
                    stokAyar > 0
                      ? TEMA.yesil
                      : stokAyar < 0
                        ? TEMA.kirmizi
                        : TEMA.inkMuted,
                  fontWeight: 700,
                  fontFamily: FONT.num,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stokAyar > 0 ? "+" : ""}
                {fmtTL(stokAyar)}
              </span>
            </div>
            <input
              type="range"
              min={-stokSinir}
              max={stokSinir}
              step={Math.max(1000, stokSinir / 50)}
              value={stokAyar}
              onChange={(e) => setStokAyar(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: firma.renk,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: TEMA.inkFaded,
                marginTop: 4,
              }}
            >
              <span>Stok azaldı (SMM ↑ vergi ↓)</span>
              <span>Stok arttı (SMM ↓ vergi ↑)</span>
            </div>
          </div>

          {/* Senaryo sonuç tablosu */}
          <div
            style={{
              padding: "14px 0 0",
              borderTop: `1px solid ${TEMA.border}`,
            }}
          >
            <TabloSatir etiket="Senaryo SMM" deger={-senaryoSMM} negatif />
            <TabloSatir etiket="Senaryo Matrah" deger={senaryo.matrah} kalin accent={firma.renk} />
            <TabloSatir
              etiket="Senaryo Geçici Vergi"
              deger={senaryo.vergi}
              kalin
              accent={vergiDelta < 0 ? TEMA.yesil : TEMA.kirmizi}
            />
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 10,
                background:
                  vergiDelta < 0
                    ? `linear-gradient(180deg, ${TEMA.yesil}18, ${TEMA.yesil}08)`
                    : `linear-gradient(180deg, ${TEMA.kirmizi}18, ${TEMA.kirmizi}08)`,
                border: `1px solid ${vergiDelta < 0 ? TEMA.yesil : TEMA.kirmizi}40`,
                fontFamily: FONT.ana,
                fontSize: 13,
                lineHeight: 1.5,
                color: TEMA.inkSoft,
              }}
            >
              <strong style={{ color: vergiDelta < 0 ? TEMA.yesil : TEMA.kirmizi }}>
                {vergiDelta < 0 ? "Tasarruf" : "Artış"}: {fmtTL(Math.abs(vergiDelta))}
              </strong>{" "}
              · Bu senaryo Osman Bey ile mutabık kalındığında uygulanır.
            </div>
          </div>
        </div>
      </section>

      {/* ALT — hukuki not + aksiyon butonları */}
      <section
        style={{
          padding: "18px 22px",
          borderRadius: 14,
          background: TEMA.bgKart,
          border: `1px solid ${TEMA.border}`,
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <Info size={18} color={TEMA.inkMuted} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: 12.5, color: TEMA.inkSoft, lineHeight: 1.55 }}>
          <strong style={{ color: TEMA.ink }}>Hukuki not:</strong> Bu simülasyon yasal sınırlar içinde stok değerleme esnekliğini gösterir. VUK madde 274'e göre değerleme yöntemi değişimi yıl başında beyan ister; stok sayım ayarı gerçek envanterle tutarlı olmalıdır. Kesin karar Osman Bey ile mutabakat sonrası verilir. Yasal sınırların dışına çıkma <strong style={{ color: TEMA.kirmizi }}>kati yasak</strong>.
        </div>
        <button
          type="button"
          onClick={() =>
            notify.success("Vergi senaryosu Osman Bey icin hazirlandi", {
              description: `${yontem === "fifo" ? "FIFO" : "Agirlikli ortalama"} · stok ayari ${fmtTL(stokAyar)} · gecici vergi ${fmtTL(senaryo.vergi)}`,
            })
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 10,
            background: `linear-gradient(180deg, ${rengiKaristir(firma.renk, 0.15, "lighter")}, ${firma.renk})`,
            color: "white",
            border: "none",
            fontFamily: FONT.ana,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.20), 0 6px 16px ${firma.renk}40`,
            flexShrink: 0,
          }}
        >
          <Send size={14} />
          Osman Bey'e Gönder
        </button>
      </section>

      <section style={{ marginTop: 20 }}>
        <AiYorumKart sayfaBasligi="Vergi Atölyesi" maddeler={aiMaddeler} />
      </section>
    </>
  );
}

function TabloSatir({
  etiket,
  deger,
  negatif,
  kalin,
  accent,
}: {
  etiket: string;
  deger: number;
  negatif?: boolean;
  kalin?: boolean;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
        fontSize: 13,
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          color: kalin ? TEMA.ink : TEMA.inkMuted,
          fontWeight: kalin ? 600 : 500,
        }}
      >
        {etiket}
      </span>
      <span
        style={{
          fontFamily: FONT.num,
          fontWeight: kalin ? 700 : 500,
          color: accent ?? (negatif ? TEMA.kirmizi : TEMA.ink),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fmtTL(deger)}
      </span>
    </div>
  );
}
