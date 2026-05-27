// PersonelSayfasi — verimlilik + bordro analiz.
// V1 muhasebe sınırı: Logo Go bordro modülü + satış modülünden türetilir.

import { useMemo, useState } from "react";
import { Users, Coins, TrendingUp, Briefcase } from "lucide-react";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { Firma, FirmaFinans, Personel } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

type Sira = "ciro" | "maas" | "kidem" | "verim";

const BOLUM_RENGI: Record<Personel["bolum"], string> = {
  Yönetim: "#a78bfa",
  Satış: "#5b9dff",
  Operasyon: "#4ade80",
  "Mali İşler": "#d4af7a",
  Üretim: "#f59e0b",
};

export function PersonelSayfasi({ firma, finans }: Props) {
  const [sira, setSira] = useState<Sira>("verim");
  const bordroVerisiEksik = useMemo(
    () => finans.personel.length > 0 && finans.personel.every((p) => p.brutMaas === 0 && p.sgkIsveren === 0),
    [finans.personel],
  );

  const ozet = useMemo(() => {
    const p = finans.personel;
    const personelSayisi = p.length;
    const aylikBordro = p.reduce((s, x) => s + x.brutMaas + x.sgkIsveren, 0);
    const yillikBordro = aylikBordro * 12;
    const ortBrutMaas = p.length > 0 ? p.reduce((s, x) => s + x.brutMaas, 0) / p.length : 0;

    const yillikCiro = finans.son12Ay.reduce((s, a) => s + a.ciro, 0);
    const kisiBasiCiro = personelSayisi > 0 ? yillikCiro / personelSayisi : 0;
    const bordroOrani = yillikCiro > 0 ? (yillikBordro / yillikCiro) * 100 : 0;

    // Bölüm dağılımı
    const bolumMap: Record<string, { adet: number; bordro: number }> = {};
    p.forEach((x) => {
      const b = x.bolum;
      if (!bolumMap[b]) bolumMap[b] = { adet: 0, bordro: 0 };
      bolumMap[b]!.adet += 1;
      bolumMap[b]!.bordro += x.brutMaas + x.sgkIsveren;
    });
    const bolumler = Object.entries(bolumMap)
      .map(([ad, v]) => ({ ad, adet: v.adet, bordro: v.bordro }))
      .sort((a, b) => b.adet - a.adet);

    // Satış ekibi performansı
    const satisEkibi = p.filter((x) => x.bolum === "Satış" && x.yillikSatis);
    const enIyiSatis = [...satisEkibi].sort(
      (a, b) => (b.yillikSatis ?? 0) - (a.yillikSatis ?? 0),
    )[0];

    return {
      personelSayisi,
      aylikBordro,
      yillikBordro,
      ortBrutMaas,
      yillikCiro,
      kisiBasiCiro,
      bordroOrani,
      bolumler,
      satisEkibi,
      enIyiSatis,
    };
  }, [finans]);

  // Kıdem hesaplama
  function kidemYil(baslangic: string): number {
    const bas = new Date(baslangic);
    const bugun = new Date("2026-05-27");
    return Math.floor((bugun.getTime() - bas.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  // Verim oranı (satış ekibi için): yıllık satış / yıllık brüt maliyet
  function verim(p: Personel): number {
    const yillikMaliyet = (p.brutMaas + p.sgkIsveren) * 12;
    if (!p.yillikSatis || yillikMaliyet === 0) return 0;
    return p.yillikSatis / yillikMaliyet;
  }

  if (bordroVerisiEksik) {
    const satisToplami = finans.personel.reduce((sum, p) => sum + (p.yillikSatis ?? 0), 0);
    const satisEkibi = finans.personel.filter((p) => p.bolum === "Satış");
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
            Personel · Rol Dağılımı · {firma.konum.split(" ")[0]}
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
            Bordro değil, ekip sahipliği görünümü aktif
          </h1>
          <p
            style={{
              fontSize: 13,
              color: TEMA.inkMuted,
              marginTop: 6,
              marginBottom: 0,
              maxWidth: 760,
              lineHeight: 1.5,
            }}
          >
            Bu ekranda şu an gerçek bordro exportu yok. Buna rağmen rol, kıdem ve 2026 satış
            sahipliği bilgisini kullanarak ekibin saha dağılımını dürüstçe gösteriyoruz.
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
            etiket="Kayıtlı Kişi"
            numerikDeger={finans.personel.length}
            ondalik={0}
            sonek=" kişi"
            tone={firma.renk}
            ikon={Users}
            vurgu
          />
          <KpiKart
            etiket="Satış Sahipliği"
            numerikDeger={satisToplami}
            ondalik={0}
            sonek=" ₺"
            tone={TEMA.yesil}
            ikon={TrendingUp}
          />
          <KpiKart
            etiket="Satış Ekibi"
            numerikDeger={satisEkibi.length}
            ondalik={0}
            sonek=" kişi"
            tone={TEMA.altin}
            ikon={Briefcase}
          />
          <KpiKart
            etiket="Bordro Verisi"
            numerikDeger={0}
            ondalik={0}
            sonek=" ₺"
            deltaEtiketi="Logo Go bordro exportu bekleniyor"
            tone="#60a5fa"
            ikon={Coins}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {finans.personel.map((p) => (
            <div
              key={p.id}
              style={{
                background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
                border: `1px solid ${TEMA.border}`,
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: TEMA.ink }}>{p.ad}</div>
                  <div style={{ fontSize: 12, color: TEMA.inkMuted, marginTop: 4 }}>{p.rol}</div>
                </div>
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: BOLUM_RENGI[p.bolum],
                  }}
                >
                  {p.bolum}
                </span>
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: TEMA.inkSoft, lineHeight: 1.7 }}>
                <div>Başlangıç: {p.baslangic}</div>
                <div>2026 satış sahipliği: {fmtTL(p.yillikSatis ?? 0)}</div>
                <div>Aylık hedef izi: {fmtTL(p.aylikHedef ?? 0)}</div>
              </div>
            </div>
          ))}
        </section>

        <AiYorumKart
          sayfaBasligi="Personel"
          maddeler={[
            {
              ton: "dikkat",
              baslik: "Bordro tarafı bilinçli olarak hesap dışı bırakıldı",
              detay:
                "Maaş ve SGK exportu gelmeden verim katsayısı üretmiyoruz. Böylece sahte verimlilik yorumundan kaçınmış oluyoruz.",
              vurguSayi: "0 bordro",
            },
            {
              ton: "firsat",
              baslik: "Satış sahipliği görünürlüğü şimdiden faydalı",
              detay:
                "Mehmet, Yusuf ve Furkan hattında hangi portföyün kimde durduğu görünüyor. Bordro geldiğinde bu ekran doğrudan tam verimlilik paneline dönecek.",
              vurguSayi: `${satisEkibi.length} kişi`,
            },
          ]}
        />
      </>
    );
  }

  const siraliPersonel = useMemo(() => {
    let liste = [...finans.personel];
    if (sira === "ciro")
      liste.sort((a, b) => (b.yillikSatis ?? 0) - (a.yillikSatis ?? 0));
    if (sira === "maas") liste.sort((a, b) => b.brutMaas - a.brutMaas);
    if (sira === "kidem")
      liste.sort((a, b) => kidemYil(b.baslangic) - kidemYil(a.baslangic));
    if (sira === "verim") liste.sort((a, b) => verim(b) - verim(a));
    return liste;
  }, [finans.personel, sira]);

  const maxBolumAdet = Math.max(...ozet.bolumler.map((b) => b.adet), 1);

  const aiMaddeler = useMemo<AiYorumMaddesi[]>(() => {
    const list: AiYorumMaddesi[] = [];
    const satisVerimli = ozet.satisEkibi.filter((p) => verim(p) >= 8).length;
    const kidemliAdet = finans.personel.filter((p) => kidemYil(p.baslangic) >= 5).length;

    list.push({
      ton: ozet.bordroOrani < 22 ? "pozitif" : ozet.bordroOrani < 30 ? "dikkat" : "kritik",
      baslik: "Bordro yükü ciroya göre okunuyor",
      detay:
        ozet.bordroOrani < 22
          ? `Bordro/ciro oranı %${ozet.bordroOrani.toFixed(1)} seviyesinde; ekip yükü satış hacmi tarafından taşınıyor.`
          : ozet.bordroOrani < 30
            ? `Bordro/ciro oranı %${ozet.bordroOrani.toFixed(1)}. Yeni işe alım öncesi bölüm verimi tekrar bakılmalı.`
            : `Bordro/ciro oranı %${ozet.bordroOrani.toFixed(1)} ile yüksek. Verimsiz rol dağılımı varsa sadeleştirme düşünülmeli.`,
      vurguSayi: `%${ozet.bordroOrani.toFixed(1)}`,
    });

    list.push({
      ton: satisVerimli >= Math.max(1, ozet.satisEkibi.length / 2) ? "pozitif" : "firsat",
      baslik: "Satış ekibi üretkenliği izleniyor",
      detay:
        ozet.satisEkibi.length === 0
          ? "Bu firmada satış kadrosu görünmüyor. Operasyon ve idari ekip verimi kişi başı ciro üzerinden izlenmeli."
          : `${satisVerimli} satış çalışanı 8× verim bandında. Hedef gerisinde kalanlara aylık koçluk ve portföy dağıtımı iyi gelir.`,
      vurguSayi: `${satisVerimli} kişi`,
    });

    list.push({
      ton: kidemliAdet >= Math.ceil(ozet.personelSayisi / 3) ? "pozitif" : "dikkat",
      baslik: "Kıdem omurgası korunuyor",
      detay:
        kidemliAdet >= Math.ceil(ozet.personelSayisi / 3)
          ? `${kidemliAdet} çalışan 5 yıl ve üzeri kıdeme sahip. Bilgi transferi tarafı güçlü.`
          : `5 yıl üstü kıdeme sahip çalışan sayısı ${kidemliAdet}. Devir riski varsa süreç dokümantasyonu hızlanmalı.`,
      vurguSayi: `${kidemliAdet} kişi`,
    });

    list.push({
      ton: ozet.kisiBasiCiro > ozet.ortBrutMaas * 40 ? "firsat" : "dikkat",
      baslik: "Kişi başı ciro çıtası net",
      detay:
        ozet.kisiBasiCiro > ozet.ortBrutMaas * 40
          ? `Kişi başı yıllık ciro ${fmtTL(ozet.kisiBasiCiro)} ile bordro maliyetini rahat karşılıyor. Büyüme için seçici işe alım düşünülebilir.`
          : `Kişi başı ciro ${fmtTL(ozet.kisiBasiCiro)} seviyesinde. Yeni alım yerine mevcut ekipte verim artışı önce denenmeli.`,
      vurguSayi: fmtTL(ozet.kisiBasiCiro),
    });

    return list;
  }, [finans.personel, ozet]);

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
          Personel · Verimlilik · {firma.konum.split(" ")[0]}
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
          Ekip Bordrosu ve Kişi Başı Verimlilik
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
          Logo Go bordro modülünden gelen ekip bilgisi.{" "}
          <strong style={{ color: TEMA.ink }}>{ozet.personelSayisi} kişi</strong> · aylık bordro yükü{" "}
          <strong style={{ color: TEMA.altin }}>{fmtTL(ozet.aylikBordro)}</strong>;
          ciroya oran <strong>%{ozet.bordroOrani.toFixed(1)}</strong>
          {ozet.enIyiSatis && (
            <>
              {" · "}En verimli: <strong style={{ color: TEMA.yesil }}>{ozet.enIyiSatis.ad}</strong>
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
          etiket="Personel Sayısı"
          numerikDeger={ozet.personelSayisi}
          ondalik={0}
          sonek=" kişi"
          tone={firma.renk}
          ikon={Users}
          vurgu
        />
        <KpiKart
          etiket="Aylık Bordro"
          numerikDeger={ozet.aylikBordro}
          ondalik={0}
          sonek=" ₺"
          deltaEtiketi="brüt + SGK işveren"
          tone={TEMA.altin}
          ikon={Coins}
        />
        <KpiKart
          etiket="Kişi Başı Yıllık Ciro"
          numerikDeger={ozet.kisiBasiCiro}
          ondalik={0}
          sonek=" ₺"
          delta={ozet.bordroOrani < 20 ? 5 : -5}
          deltaEtiketi="bordro/ciro oranı"
          tone={TEMA.yesil}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="Ortalama Brüt"
          numerikDeger={ozet.ortBrutMaas}
          ondalik={0}
          sonek=" ₺"
          tone="#60a5fa"
          ikon={Briefcase}
        />
      </section>

      {/* Bölüm dağılımı + verim mesajı */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Bölüm 3D bar */}
        <div
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 14,
            padding: "20px 22px 18px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
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
            Bölüm Dağılımı
          </div>
          <div style={{ fontSize: 13, color: TEMA.inkSoft, marginBottom: 14 }}>
            Kişi sayısı ve aylık bordro yükü
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ozet.bolumler.map((b) => {
              const renk = BOLUM_RENGI[b.ad as Personel["bolum"]] ?? firma.renk;
              const oran = (b.adet / maxBolumAdet) * 100;
              return (
                <div key={b.ad}>
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
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: TEMA.ink,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: renk,
                          boxShadow: `0 0 8px ${renk}90`,
                        }}
                      />
                      {b.ad}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: TEMA.inkMuted,
                        fontFamily: FONT.num,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {b.adet} kişi · {fmtTL(b.bordro)}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 8,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
                      borderRadius: 999,
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
                          `0 0 10px ${renk}50`,
                        ].join(", "),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Satış ekibi performansı */}
        <div
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 14,
            padding: "20px 22px 18px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
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
            Satış Ekibi Performansı
          </div>
          <div style={{ fontSize: 13, color: TEMA.inkSoft, marginBottom: 16 }}>
            Yıllık satış katkısı (Logo Go satış modülü)
          </div>

          {ozet.satisEkibi.length === 0 ? (
            <div style={{ fontSize: 13, color: TEMA.inkFaded, padding: "20px 0", textAlign: "center" }}>
              Bu firmada satış ekibi tanımlanmamış.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ozet.satisEkibi.map((p) => {
                const aylikOrt = (p.yillikSatis ?? 0) / 12;
                const hedefGerc = p.aylikHedef ? (aylikOrt / p.aylikHedef) * 100 : 0;
                const verimOran = verim(p);
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${TEMA.border}`,
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: TEMA.ink }}>
                        {p.ad}
                      </span>
                      <span
                        style={{
                          fontFamily: FONT.num,
                          fontSize: 14,
                          fontWeight: 700,
                          color: TEMA.yesil,
                          fontVariantNumeric: "tabular-nums",
                          textShadow: `0 0 10px ${TEMA.yesil}50`,
                        }}
                      >
                        {fmtTL(p.yillikSatis ?? 0)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        fontSize: 11,
                        color: TEMA.inkMuted,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <span>
                        Hedef gerçekleşme:{" "}
                        <strong
                          style={{
                            color: hedefGerc >= 100 ? TEMA.yesil : hedefGerc >= 85 ? TEMA.altin : TEMA.kirmizi,
                          }}
                        >
                          %{hedefGerc.toFixed(0)}
                        </strong>
                      </span>
                      <span>
                        Verim oranı:{" "}
                        <strong style={{ color: verimOran > 8 ? TEMA.yesil : TEMA.altin }}>
                          {verimOran.toFixed(1)}×
                        </strong>{" "}
                        <span style={{ color: TEMA.inkFaded }}>(satış / maliyet)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Personel tablosu */}
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
            Personel Tablosu
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(
              [
                { id: "verim", ad: "Verime Göre" },
                { id: "ciro", ad: "Ciroya Göre" },
                { id: "maas", ad: "Maaşa Göre" },
                { id: "kidem", ad: "Kıdeme Göre" },
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
            gridTemplateColumns: "1.6fr 1.2fr 90px 110px 1.2fr 80px",
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
          <span>Personel</span>
          <span>Bölüm</span>
          <span style={{ textAlign: "right" }}>Kıdem</span>
          <span style={{ textAlign: "right" }}>Brüt Maaş</span>
          <span style={{ textAlign: "right" }}>Yıllık Satış / Verim</span>
          <span style={{ textAlign: "right" }}>Toplam</span>
        </div>

        {siraliPersonel.map((p) => {
          const renk = BOLUM_RENGI[p.bolum];
          const kidem = kidemYil(p.baslangic);
          const verimOran = verim(p);
          const aylikToplam = p.brutMaas + p.sgkIsveren;
          return (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1.2fr 90px 110px 1.2fr 80px",
                gap: 12,
                padding: "12px 0",
                borderBottom: `1px solid rgba(255,255,255,0.03)`,
                fontSize: 13,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: TEMA.ink, fontWeight: 500 }}>{p.ad}</div>
                <div style={{ fontSize: 11, color: TEMA.inkFaded, marginTop: 2 }}>{p.rol}</div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: `${renk}1f`,
                  color: renk,
                  border: `1px solid ${renk}40`,
                  width: "fit-content",
                  letterSpacing: "0.06em",
                }}
              >
                {p.bolum}
              </span>
              <span
                style={{
                  fontFamily: FONT.num,
                  fontVariantNumeric: "tabular-nums",
                  color: TEMA.inkSoft,
                  textAlign: "right",
                  fontSize: 12,
                }}
              >
                {kidem} yıl
              </span>
              <span
                style={{
                  fontFamily: FONT.num,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: TEMA.ink,
                  textAlign: "right",
                }}
              >
                {fmtTL(p.brutMaas)}
              </span>
              <div style={{ textAlign: "right" }}>
                {p.yillikSatis ? (
                  <>
                    <div
                      style={{
                        fontFamily: FONT.num,
                        fontWeight: 600,
                        color: TEMA.yesil,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 13,
                      }}
                    >
                      {fmtTL(p.yillikSatis)}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT.num,
                        fontSize: 10.5,
                        color: verimOran > 8 ? TEMA.yesil : TEMA.altin,
                        marginTop: 2,
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 700,
                      }}
                    >
                      verim {verimOran.toFixed(1)}×
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: TEMA.inkFaded }}>—</span>
                )}
              </div>
              <span
                style={{
                  fontFamily: FONT.num,
                  fontVariantNumeric: "tabular-nums",
                  color: TEMA.inkSoft,
                  textAlign: "right",
                  fontSize: 12,
                }}
                title="Aylık brüt + SGK işveren"
              >
                {fmtTL(aylikToplam)}
              </span>
            </div>
          );
        })}
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
          etiket="Yıllık Bordro Yükü"
          deger={fmtTL(ozet.yillikBordro)}
          baglam={`Ciroya oran %${ozet.bordroOrani.toFixed(1)}`}
          baglamRengi={ozet.bordroOrani < 22 ? "iyi" : ozet.bordroOrani < 30 ? "notr" : "kotu"}
        />
        <OzetKart
          etiket="En Verimli Personel"
          deger={ozet.enIyiSatis?.ad ?? "—"}
          baglam={
            ozet.enIyiSatis
              ? `${fmtTL(ozet.enIyiSatis.yillikSatis ?? 0)} · verim ${verim(ozet.enIyiSatis).toFixed(1)}×`
              : "—"
          }
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="Kıdemli Çalışan"
          deger={
            ozet.personelSayisi > 0
              ? [...finans.personel].sort(
                  (a, b) => kidemYil(b.baslangic) - kidemYil(a.baslangic),
                )[0]!.ad
              : "—"
          }
          baglam={`${
            ozet.personelSayisi > 0
              ? kidemYil([...finans.personel].sort(
                  (a, b) => kidemYil(b.baslangic) - kidemYil(a.baslangic),
                )[0]!.baslangic)
              : 0
          } yıl tecrübe`}
          baglamRengi="notr"
        />
      </section>

      <section style={{ marginTop: 20 }}>
        <AiYorumKart sayfaBasligi="Personel" maddeler={aiMaddeler} />
      </section>
    </>
  );
}
