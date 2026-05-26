// UrunMarjiSayfasi — Logo Go fatura kalemlerinden ürün/segment marjı analizi.
// V1 muhasebe odaklı: ciro = satış kalemleri, maliyet = alış kalemleri,
// brüt marj %. Yıllık trend (%) geçen yıla göre satış adet değişimi.

import { useMemo, useState } from "react";
import { Package, TrendingUp, Star, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { Firma, FirmaFinans, UrunMarji } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

type Sira = "ciro" | "marj" | "trend";

export function UrunMarjiSayfasi({ firma, finans }: Props) {
  const [sira, setSira] = useState<Sira>("ciro");
  const [seciliSegment, setSeciliSegment] = useState<string | null>(null);

  const ozet = useMemo(() => {
    const u = finans.urunMarji;
    const toplamCiro = u.reduce((s, x) => s + x.yillikCiro, 0);
    const toplamMaliyet = u.reduce((s, x) => s + x.yillikMaliyet, 0);
    const ortMarj = toplamCiro > 0 ? ((toplamCiro - toplamMaliyet) / toplamCiro) * 100 : 0;

    const enYuksekMarj = [...u].sort((a, b) => b.marj - a.marj)[0];
    const enHizliBuyuyen = [...u].sort((a, b) => b.trend - a.trend)[0];
    const enYavasUrun = [...u].sort((a, b) => a.trend - b.trend)[0];

    // Segment grupları
    const segmentMap: Record<string, { ciro: number; maliyet: number; adet: number }> = {};
    u.forEach((x) => {
      if (!segmentMap[x.segment])
        segmentMap[x.segment] = { ciro: 0, maliyet: 0, adet: 0 };
      segmentMap[x.segment]!.ciro += x.yillikCiro;
      segmentMap[x.segment]!.maliyet += x.yillikMaliyet;
      segmentMap[x.segment]!.adet += 1;
    });
    const segmentler = Object.entries(segmentMap)
      .map(([ad, v]) => ({
        ad,
        ciro: v.ciro,
        adet: v.adet,
        marj: v.ciro > 0 ? ((v.ciro - v.maliyet) / v.ciro) * 100 : 0,
        oran: toplamCiro > 0 ? (v.ciro / toplamCiro) * 100 : 0,
      }))
      .sort((a, b) => b.ciro - a.ciro);

    return {
      urunler: u,
      toplamCiro,
      toplamMaliyet,
      ortMarj,
      enYuksekMarj,
      enHizliBuyuyen,
      enYavasUrun,
      segmentler,
    };
  }, [finans]);

  const siraliUrunler = useMemo(() => {
    let liste = [...ozet.urunler];
    if (seciliSegment) liste = liste.filter((u) => u.segment === seciliSegment);
    if (sira === "ciro") liste.sort((a, b) => b.yillikCiro - a.yillikCiro);
    if (sira === "marj") liste.sort((a, b) => b.marj - a.marj);
    if (sira === "trend") liste.sort((a, b) => b.trend - a.trend);
    return liste;
  }, [ozet, sira, seciliSegment]);

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
          Ürün Marjı · {firma.konum.split(" ")[0]}
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
          Hangi Ürün Ne Kâr Getiriyor
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
          Logo Go fatura kalemlerinden türetilmiş ürün/segment marjı analizi.
          Yıllık ciro <strong style={{ color: TEMA.ink }}>{fmtTL(ozet.toplamCiro)}</strong> · ortalama brüt marj{" "}
          <strong style={{ color: ozet.ortMarj > 22 ? TEMA.yesil : TEMA.altin }}>
            %{ozet.ortMarj.toFixed(1)}
          </strong>
          {ozet.enYuksekMarj && (
            <>
              {" · "}En kârlı: <strong style={{ color: TEMA.yesil }}>{ozet.enYuksekMarj.ad}</strong>
            </>
          )}
          .
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
          etiket="Toplam Ciro"
          numerikDeger={ozet.toplamCiro}
          ondalik={0}
          sonek=" ₺"
          tone={firma.renk}
          ikon={Package}
          vurgu
        />
        <KpiKart
          etiket="Ortalama Marj"
          numerikDeger={ozet.ortMarj}
          ondalik={1}
          sonek="%"
          delta={ozet.ortMarj - 22}
          deltaEtiketi="hedef %22"
          tone={TEMA.yesil}
          ikon={Star}
        />
        <KpiKart
          etiket="En Yüksek Marj"
          numerikDeger={ozet.enYuksekMarj?.marj ?? 0}
          ondalik={1}
          sonek="%"
          deltaEtiketi={ozet.enYuksekMarj?.segment ?? "—"}
          tone={TEMA.altin}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="En Yavaş Ürün"
          numerikDeger={ozet.enYavasUrun?.trend ?? 0}
          ondalik={1}
          sonek="%"
          deltaEtiketi={`${ozet.enYavasUrun?.segment ?? "—"} · trend`}
          tone={(ozet.enYavasUrun?.trend ?? 0) < 0 ? TEMA.kirmizi : TEMA.altin}
          ikon={AlertTriangle}
        />
      </section>

      {/* Segment dağılımı 3D bar */}
      <section
        style={{
          background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
          border: `1px solid ${TEMA.border}`,
          borderRadius: 14,
          padding: "20px 22px 18px",
          marginBottom: 20,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
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
              Segment Dağılımı
            </div>
            <div style={{ fontSize: 13, color: TEMA.inkSoft }}>
              Ciro payı + ortalama marj · tıklayıp filtreleyin
            </div>
          </div>
          {seciliSegment && (
            <button
              type="button"
              onClick={() => setSeciliSegment(null)}
              style={{
                background: "transparent",
                border: `1px solid ${TEMA.border}`,
                color: TEMA.inkMuted,
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Filtre kaldır
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ozet.segmentler.map((s) => {
            const aktif = seciliSegment === s.ad;
            return (
              <button
                key={s.ad}
                type="button"
                onClick={() => setSeciliSegment(aktif ? null : s.ad)}
                style={{
                  background: aktif ? `${firma.renk}12` : "transparent",
                  border: `1px solid ${aktif ? firma.renk + "40" : "transparent"}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: FONT.ana,
                  color: TEMA.ink,
                  transition: "all 180ms ease",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 1fr 80px 80px",
                    gap: 12,
                    alignItems: "baseline",
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: TEMA.ink, fontWeight: 600 }}>{s.ad}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: TEMA.inkMuted,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.adet} ürün · %{s.oran.toFixed(0)} pay
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.num,
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                      textAlign: "right",
                      color: TEMA.ink,
                    }}
                  >
                    {fmtTL(s.ciro)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.num,
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 700,
                      textAlign: "right",
                      color: s.marj > 25 ? TEMA.yesil : s.marj > 18 ? TEMA.altin : TEMA.kirmizi,
                      textShadow: `0 0 8px ${s.marj > 25 ? TEMA.yesil : s.marj > 18 ? TEMA.altin : TEMA.kirmizi}40`,
                    }}
                  >
                    %{s.marj.toFixed(1)}
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 6,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
                    borderRadius: 999,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.50)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${s.oran}%`,
                      background: `linear-gradient(90deg, ${rengiKaristir(firma.renk, 0.25, "darker")}, ${firma.renk} 55%, ${rengiKaristir(firma.renk, 0.35, "lighter")})`,
                      borderRadius: 999,
                      transition: "width 1200ms cubic-bezier(0.22,0.61,0.36,1)",
                      boxShadow: [
                        "inset 0 1px 0 rgba(255,255,255,0.35)",
                        "inset 0 -1px 0 rgba(0,0,0,0.20)",
                        `0 0 10px ${firma.renk}50`,
                      ].join(", "),
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ürün listesi — sıralama seçici */}
      <section
        style={{
          background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
          border: `1px solid ${TEMA.border}`,
          borderRadius: 14,
          padding: "8px 22px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEMA.inkMuted,
            }}
          >
            Ürün Tablosu
            {seciliSegment && (
              <span style={{ marginLeft: 8, color: firma.renk }}>
                · {seciliSegment}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(
              [
                { id: "ciro", ad: "Ciroya Göre" },
                { id: "marj", ad: "Marja Göre" },
                { id: "trend", ad: "Trende Göre" },
              ] as { id: Sira; ad: string }[]
            ).map((s) => {
              const aktif = s.id === sira;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSira(s.id)}
                  style={{
                    background: aktif ? `${firma.renk}1f` : "transparent",
                    color: aktif ? firma.renk : TEMA.inkMuted,
                    border: `1px solid ${aktif ? firma.renk + "40" : TEMA.border}`,
                    fontFamily: FONT.ana,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    transition: "all 180ms ease",
                  }}
                >
                  {s.ad}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1fr 90px 90px 90px",
            gap: 12,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: TEMA.inkFaded,
            padding: "10px 0",
            borderBottom: `1px solid ${TEMA.border}`,
          }}
        >
          <span>Ürün</span>
          <span>Segment</span>
          <span style={{ textAlign: "right" }}>Ciro</span>
          <span style={{ textAlign: "right" }}>Adet</span>
          <span style={{ textAlign: "right" }}>Marj</span>
          <span style={{ textAlign: "right" }}>Trend</span>
        </div>

        {siraliUrunler.map((u) => (
          <UrunSatir key={u.kod} urun={u} accent={firma.renk} />
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginTop: 24,
        }}
      >
        <OzetKart
          etiket="En Hızlı Büyüyen"
          deger={ozet.enHizliBuyuyen?.ad ?? "—"}
          baglam={
            ozet.enHizliBuyuyen
              ? `+${ozet.enHizliBuyuyen.trend.toFixed(1)}% · marj %${ozet.enHizliBuyuyen.marj.toFixed(1)}`
              : "—"
          }
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="En Kârlı Ürün"
          deger={ozet.enYuksekMarj?.ad ?? "—"}
          baglam={
            ozet.enYuksekMarj
              ? `Marj %${ozet.enYuksekMarj.marj.toFixed(1)} · ${fmtTL(ozet.enYuksekMarj.yillikCiro)}`
              : "—"
          }
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="Yavaş Hareket Eden"
          deger={ozet.enYavasUrun?.ad ?? "—"}
          baglam={
            ozet.enYavasUrun
              ? `Trend %${ozet.enYavasUrun.trend.toFixed(1)} · gözden geçirme`
              : "—"
          }
          baglamRengi={ozet.enYavasUrun && ozet.enYavasUrun.trend < 0 ? "kotu" : "notr"}
        />
      </section>
    </>
  );
}

function UrunSatir({ urun, accent }: { urun: UrunMarji; accent: string }) {
  const trendIyi = urun.trend > 0;
  const TrendIc = trendIyi ? ArrowUpRight : ArrowDownRight;
  const trendRenk = trendIyi ? TEMA.yesil : urun.trend < -2 ? TEMA.kirmizi : TEMA.altin;
  const marjRenk =
    urun.marj > 30 ? TEMA.yesil : urun.marj > 22 ? accent : urun.marj > 18 ? TEMA.altin : TEMA.kirmizi;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1fr 90px 90px 90px",
        gap: 12,
        padding: "12px 0",
        borderBottom: `1px solid rgba(255,255,255,0.03)`,
        fontSize: 13,
        alignItems: "center",
        transition: "background 180ms ease",
        borderRadius: 4,
      }}
    >
      <div>
        <div style={{ color: TEMA.ink, fontWeight: 500, fontSize: 13 }}>{urun.ad}</div>
        <div
          style={{
            fontFamily: FONT.num,
            fontSize: 10.5,
            color: TEMA.inkFaded,
            marginTop: 2,
            letterSpacing: "0.04em",
          }}
        >
          {urun.kod}
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          color: TEMA.inkMuted,
          padding: "3px 8px",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${TEMA.border}`,
          borderRadius: 999,
          width: "fit-content",
        }}
      >
        {urun.segment}
      </span>
      <span
        style={{
          fontFamily: FONT.num,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
          color: TEMA.ink,
        }}
      >
        {fmtTL(urun.yillikCiro)}
      </span>
      <span
        style={{
          fontFamily: FONT.num,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
          color: TEMA.inkSoft,
          fontSize: 12,
        }}
      >
        {new Intl.NumberFormat("tr-TR").format(urun.yillikSatisAdet)}
      </span>
      <span
        style={{
          fontFamily: FONT.num,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
          color: marjRenk,
          textShadow: `0 0 8px ${marjRenk}40`,
        }}
      >
        %{urun.marj.toFixed(1)}
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          justifyContent: "flex-end",
          fontFamily: FONT.num,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: trendRenk,
        }}
      >
        <TrendIc size={11} />
        {urun.trend > 0 ? "+" : ""}
        {urun.trend.toFixed(1)}%
      </span>
    </div>
  );
}
