// Yarin90GunSayfasi — 90 günlük nakit projeksiyon.
// V1 muhasebe sınırı: nakit90Gun verisi Logo Go fatura vadeleri + sabit
// giderlerden türetiliyor. Senaryo slider'lar tahsilat hızı / yeni alım /
// vergi ertelemesi ile gelecek nakit ısı haritasını ayarlıyor.
//
// 3D dil korunur: KpiKart + 3D progress bar + Chart3DBackdrop + AnaGrafik
// stilinde grid.

import { useMemo, useState } from "react";
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { Chart3DBackdrop } from "@/components/dash/Chart3DBackdrop";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { Firma, FirmaFinans, NakitGun } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

function gunNetNakit(g: NakitGun): number {
  const giris = g.girisler.reduce((s, x) => s + x.tutar, 0);
  const cikis = g.cikislar.reduce((s, x) => s + x.tutar, 0);
  return giris - cikis;
}

export function Yarin90GunSayfasi({ firma, finans }: Props) {
  const [tahsilatHizi, setTahsilatHizi] = useState(1.0);
  const [yeniAlim, setYeniAlim] = useState(0);
  const [vergiErtelemesi, setVergiErtelemesi] = useState(false);
  const [seciliGunIdx, setSeciliGunIdx] = useState<number | null>(null);

  const islenmis = useMemo(() => {
    return finans.nakit90Gun.map((g) => {
      const yeniGirisler = g.girisler.map((x) => ({
        ...x,
        tutar: Math.round(x.tutar * tahsilatHizi),
      }));
      const yeniCikislar = g.cikislar
        .filter((x) => !(vergiErtelemesi && x.cari === "Devlet"))
        .map((x) => ({
          ...x,
          tutar: x.tutar + Math.round((yeniAlim * 0.012) / Math.max(g.cikislar.length, 1)),
        }));
      return { ...g, girisler: yeniGirisler, cikislar: yeniCikislar };
    });
  }, [finans, tahsilatHizi, yeniAlim, vergiErtelemesi]);

  const ozet = useMemo(() => {
    const netler = islenmis.map(gunNetNakit);
    const toplam = netler.reduce((s, n) => s + n, 0);
    const pozitifGun = netler.filter((n) => n > 0).length;
    const negatifGun = netler.filter((n) => n < 0).length;
    const enBuyukGiris = Math.max(...netler);
    const enBuyukCikis = Math.min(...netler);

    // Kümülatif nakit pozisyon (basit yaklaşım: bugünden başlar, gün gün toplar)
    let kumulatif = 0;
    const kumDizi = netler.map((n) => (kumulatif += n));
    const enDusukKumulatif = Math.min(...kumDizi);
    const enDusukIdx = kumDizi.indexOf(enDusukKumulatif);

    return {
      toplam,
      pozitifGun,
      negatifGun,
      enBuyukGiris,
      enBuyukCikis,
      kumDizi,
      enDusukKumulatif,
      enDusukIdx,
    };
  }, [islenmis]);

  const maxAbs = useMemo(
    () => Math.max(...islenmis.map((g) => Math.abs(gunNetNakit(g)))),
    [islenmis],
  );

  // Haftalara böl — 13 hafta (90 gün)
  const haftalar = useMemo(() => {
    const h: typeof islenmis[] = [];
    for (let i = 0; i < islenmis.length; i += 7) {
      h.push(islenmis.slice(i, i + 7));
    }
    return h;
  }, [islenmis]);

  function sifirla() {
    setTahsilatHizi(1.0);
    setYeniAlim(0);
    setVergiErtelemesi(false);
  }

  function senaryoSikis() {
    setTahsilatHizi(0.8);
    setYeniAlim(2_500_000);
    setVergiErtelemesi(false);
  }

  function senaryoRahat() {
    setTahsilatHizi(1.2);
    setYeniAlim(0);
    setVergiErtelemesi(true);
  }

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
          Yarın 90 Gün · {firma.konum.split(" ")[0]}
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
          Nakit Projeksiyonu ve Senaryo Atölyesi
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
          Logo Go fatura vadeleri + sabit giderler + mali takvim'den türetilmiş
          13 haftalık net nakit haritası. Sağdaki slider'larla "şu olursa ne olur"
          senaryoları kurabilirsiniz.
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
          etiket="90 Gün Net Akış"
          numerikDeger={ozet.toplam}
          ondalik={0}
          sonek=" ₺"
          tone={ozet.toplam > 0 ? TEMA.yesil : TEMA.kirmizi}
          ikon={Banknote}
          vurgu
        />
        <KpiKart
          etiket="Pozitif Gün"
          numerikDeger={ozet.pozitifGun}
          ondalik={0}
          sonek=" gün"
          delta={(ozet.pozitifGun / 90) * 100 - 50}
          deltaEtiketi="oran"
          tone={firma.renk}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="Riskli Gün"
          numerikDeger={ozet.negatifGun}
          ondalik={0}
          sonek=" gün"
          tone={ozet.negatifGun > 20 ? TEMA.kirmizi : TEMA.altin}
          ikon={TrendingDown}
        />
        <KpiKart
          etiket="En Düşük Pozisyon"
          numerikDeger={ozet.enDusukKumulatif}
          ondalik={0}
          sonek=" ₺"
          tone={ozet.enDusukKumulatif > 0 ? TEMA.yesil : TEMA.kirmizi}
          ikon={Calendar}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Sol — Isı haritası (Chart3DBackdrop içinde) */}
        <Chart3DBackdrop tint={firma.renk} style={{ background: TEMA.bgKart }}>
          <div style={{ padding: "24px 24px 18px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18,
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
                    marginBottom: 6,
                  }}
                >
                  13 Haftalık Nakit Isı Haritası
                </div>
                <div style={{ fontSize: 13, color: TEMA.inkSoft }}>
                  Bugünden ileri 90 gün · her hücre 1 gün net nakit
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: FONT.num,
                    fontSize: 22,
                    fontWeight: 700,
                    color: ozet.toplam > 0 ? TEMA.yesil : TEMA.kirmizi,
                    fontVariantNumeric: "tabular-nums",
                    textShadow: `0 0 16px ${ozet.toplam > 0 ? TEMA.yesil : TEMA.kirmizi}50`,
                  }}
                >
                  {fmtTL(ozet.toplam)}
                </div>
                <div style={{ fontSize: 10.5, color: TEMA.inkFaded, marginTop: 2 }}>
                  90 gün net
                </div>
              </div>
            </div>

            {/* Gün gün ısı haritası */}
            <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
              {haftalar.map((hafta, hi) => (
                <div key={hi} style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const idx = hi * 7 + di;
                    const g = hafta[di];
                    if (!g) {
                      return <div key={di} style={{ height: 24, opacity: 0 }} />;
                    }
                    const net = gunNetNakit(g);
                    const yogunluk = maxAbs > 0 ? Math.abs(net) / maxAbs : 0;
                    const renk =
                      net > 0
                        ? `rgba(74, 222, 128, ${0.15 + yogunluk * 0.65})`
                        : net < 0
                          ? `rgba(248, 113, 113, ${0.15 + yogunluk * 0.65})`
                          : "rgba(255,255,255,0.04)";
                    const seçili = seciliGunIdx === idx;
                    return (
                      <button
                        key={di}
                        type="button"
                        onClick={() => setSeciliGunIdx(idx === seciliGunIdx ? null : idx)}
                        style={{
                          height: 24,
                          background: renk,
                          border: seçili
                            ? `2px solid ${firma.renk}`
                            : "1px solid rgba(255,255,255,0.04)",
                          borderRadius: 4,
                          cursor: "pointer",
                          padding: 0,
                          transition: "transform 180ms ease",
                          boxShadow: seçili ? `0 0 12px ${firma.renk}80` : "none",
                        }}
                        title={`${new Date(g.tarih).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })} · ${fmtTL(net)}`}
                        aria-label={`${g.tarih} ${fmtTL(net)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Renk skalası */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 10.5,
                color: TEMA.inkFaded,
              }}
            >
              <span>Az</span>
              <div style={{ display: "flex", gap: 2 }}>
                {[0.15, 0.30, 0.50, 0.70].map((o, i) => (
                  <div
                    key={`n${i}`}
                    style={{
                      width: 14,
                      height: 14,
                      background: `rgba(248, 113, 113, ${o})`,
                      borderRadius: 3,
                    }}
                  />
                ))}
                <div
                  style={{
                    width: 14,
                    height: 14,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 3,
                    margin: "0 3px",
                  }}
                />
                {[0.15, 0.30, 0.50, 0.70].map((o, i) => (
                  <div
                    key={`p${i}`}
                    style={{
                      width: 14,
                      height: 14,
                      background: `rgba(74, 222, 128, ${o})`,
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
              <span>Çok</span>
              <span style={{ marginLeft: "auto" }}>
                Kırmızı: çıkış &gt; giriş · Yeşil: giriş &gt; çıkış
              </span>
            </div>

            {/* Seçili gün detayı */}
            {seciliGunIdx !== null && islenmis[seciliGunIdx] && (
              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${TEMA.border}`,
                }}
              >
                <SeciliGunDetay gun={islenmis[seciliGunIdx]} />
              </div>
            )}
          </div>
        </Chart3DBackdrop>

        {/* Sağ — Senaryo Atölyesi */}
        <div
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 16,
            padding: "22px 22px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: TEMA.inkMuted,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Sliders size={11} />
                Senaryo Atölyesi
              </div>
              <div style={{ fontSize: 13, color: TEMA.inkSoft }}>
                "Şu olursa ne olur" simülasyonu
              </div>
            </div>
            <button
              type="button"
              onClick={sifirla}
              style={{
                background: "transparent",
                border: `1px solid ${TEMA.border}`,
                color: TEMA.inkMuted,
                fontSize: 10.5,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <RotateCcw size={10} />
              Sıfırla
            </button>
          </div>

          {/* Tahsilat hızı slider */}
          <SliderSatir
            etiket="Tahsilat Hızı"
            deger={`×${tahsilatHizi.toFixed(2)}`}
            degerRengi={tahsilatHizi >= 1 ? TEMA.yesil : TEMA.kirmizi}
            min={0.7}
            max={1.3}
            step={0.05}
            value={tahsilatHizi}
            onChange={setTahsilatHizi}
            altSol="Sıkışık (×0.7)"
            altSag="Rahat (×1.3)"
            accent={firma.renk}
          />

          {/* Yeni alım baskısı */}
          <SliderSatir
            etiket="Yeni Alım Baskısı"
            deger={fmtTL(yeniAlim)}
            degerRengi={TEMA.altin}
            min={0}
            max={5_000_000}
            step={250_000}
            value={yeniAlim}
            onChange={setYeniAlim}
            altSol="0 ₺"
            altSag="5M ₺"
            accent={firma.renk}
          />

          {/* Vergi ertelemesi toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: vergiErtelemesi ? `${TEMA.yesil}12` : "rgba(255,255,255,0.02)",
              border: `1px solid ${vergiErtelemesi ? TEMA.yesil + "40" : TEMA.border}`,
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
          >
            <input
              type="checkbox"
              checked={vergiErtelemesi}
              onChange={(e) => setVergiErtelemesi(e.target.checked)}
              style={{ accentColor: TEMA.yesil, width: 16, height: 16 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEMA.ink }}>
                Vergi/SGK ödemesi ertelendi
              </div>
              <div style={{ fontSize: 10.5, color: TEMA.inkMuted, marginTop: 2 }}>
                Devlet çıkışları 90 gün haritada görünmez
              </div>
            </div>
          </label>

          {/* Hızlı senaryolar */}
          <div
            style={{
              paddingTop: 14,
              borderTop: `1px solid ${TEMA.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: TEMA.inkFaded,
                marginBottom: 8,
              }}
            >
              Hazır Senaryo
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                type="button"
                onClick={senaryoSikis}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: `${TEMA.kirmizi}15`,
                  border: `1px solid ${TEMA.kirmizi}40`,
                  color: TEMA.kirmizi,
                  fontFamily: FONT.ana,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sıkışık ay
              </button>
              <button
                type="button"
                onClick={senaryoRahat}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: `${TEMA.yesil}15`,
                  border: `1px solid ${TEMA.yesil}40`,
                  color: TEMA.yesil,
                  fontFamily: FONT.ana,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Rahat ay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ALT — 3 destek kart */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <OzetKart
          etiket="En Riskli Gün"
          deger={
            islenmis[ozet.enDusukIdx]
              ? new Date(islenmis[ozet.enDusukIdx]!.tarih).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })
              : "—"
          }
          baglam={`Kümülatif pozisyon ${fmtTL(ozet.enDusukKumulatif)}`}
          baglamRengi={ozet.enDusukKumulatif > 0 ? "iyi" : "kotu"}
        />
        <OzetKart
          etiket="Nakit Yeterlilik"
          deger={
            ozet.enDusukKumulatif > 0
              ? "Tüm dönem pozitif"
              : `${Math.floor(90 - ozet.negatifGun)} gün rahatta`
          }
          baglam={ozet.enDusukKumulatif > 0 ? "Hedef gerçekleşmesi sağlam" : "Negatife geçiş var"}
          baglamRengi={ozet.enDusukKumulatif > 0 ? "iyi" : "kotu"}
        />
        <OzetKart
          etiket="Önerilen Aksiyon"
          deger={
            ozet.negatifGun > 30
              ? "Tahsilat hızlandır"
              : ozet.toplam < 0
                ? "Maliyet izle"
                : "Devam"
          }
          baglam={
            ozet.negatifGun > 30
              ? "İlk 3 hatırlatma + senet kırma"
              : ozet.toplam < 0
                ? "Alım planı gözden geçir"
                : "Mevcut seyir korunabilir"
          }
          baglamRengi={ozet.negatifGun > 30 ? "kotu" : ozet.toplam < 0 ? "kotu" : "iyi"}
        />
      </section>
    </>
  );
}

function SliderSatir({
  etiket,
  deger,
  degerRengi,
  min,
  max,
  step,
  value,
  onChange,
  altSol,
  altSag,
  accent,
}: {
  etiket: string;
  deger: string;
  degerRengi: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  altSol: string;
  altSag: string;
  accent: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: FONT.ana,
        }}
      >
        <span style={{ fontSize: 12.5, color: TEMA.inkSoft }}>{etiket}</span>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: degerRengi,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {deger}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: accent,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 9.5,
          color: TEMA.inkFaded,
        }}
      >
        <span>{altSol}</span>
        <span>{altSag}</span>
      </div>
    </div>
  );
}

function SeciliGunDetay({ gun }: { gun: NakitGun }) {
  const girisToplam = gun.girisler.reduce((s, x) => s + x.tutar, 0);
  const cikisToplam = gun.cikislar.reduce((s, x) => s + x.tutar, 0);
  const net = girisToplam - cikisToplam;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink }}>
          {new Date(gun.tarih).toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
        <div
          style={{
            fontFamily: FONT.num,
            fontSize: 18,
            fontWeight: 700,
            color: net > 0 ? TEMA.yesil : TEMA.kirmizi,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {net > 0 ? "+" : ""}
          {fmtTL(net)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEMA.yesil,
              marginBottom: 6,
            }}
          >
            Giriş · {fmtTL(girisToplam)}
          </div>
          {gun.girisler.length === 0 ? (
            <div style={{ fontSize: 11, color: TEMA.inkFaded }}>Bu gün giriş yok</div>
          ) : (
            gun.girisler.map((x, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  fontSize: 11.5,
                }}
              >
                <span style={{ color: TEMA.inkSoft }}>{x.cari}</span>
                <span
                  style={{
                    color: TEMA.yesil,
                    fontFamily: FONT.num,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  +{fmtTL(x.tutar)}
                </span>
              </div>
            ))
          )}
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: TEMA.kirmizi,
              marginBottom: 6,
            }}
          >
            Çıkış · {fmtTL(cikisToplam)}
          </div>
          {gun.cikislar.length === 0 ? (
            <div style={{ fontSize: 11, color: TEMA.inkFaded }}>Bu gün çıkış yok</div>
          ) : (
            gun.cikislar.map((x, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  fontSize: 11.5,
                }}
              >
                <span style={{ color: TEMA.inkSoft }}>{x.cari}</span>
                <span
                  style={{
                    color: TEMA.kirmizi,
                    fontFamily: FONT.num,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  -{fmtTL(x.tutar)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// Bilinmeyen referans guard
void rengiKaristir;
