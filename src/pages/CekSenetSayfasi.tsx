// CekSenetSayfasi — Türk B2B çek/senet portföyü.
// V1 muhasebe sınırı: Logo Go cari modülünden gelen veri.
// Alacak (gelen) + verilen ayrımı, vade takvimi, karşılıksız uyarı.

import { useMemo, useState } from "react";
import {
  FileSignature,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { OzetKart } from "@/components/dash/OzetKart";
import { TEMA, FONT, fmtTL, rengiKaristir } from "@/lib/tema";
import type { CekSenet, CekSenetDurum, Firma, FirmaFinans } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
}

type AltSekme = "tumu" | "gelen" | "verilen" | "tahsil" | "karsiliksiz";

const DURUM_RENGI: Record<CekSenetDurum, string> = {
  portfoyde: "#5b9dff",
  tahsilatta: "#d4af7a",
  "tahsil-edildi": "#4ade80",
  karsiliksiz: "#f87171",
  iade: "#94a3b8",
};

const DURUM_ETIKET: Record<CekSenetDurum, string> = {
  portfoyde: "Portföyde",
  tahsilatta: "Tahsilatta",
  "tahsil-edildi": "Tahsil edildi",
  karsiliksiz: "Karşılıksız",
  iade: "İade",
};

export function CekSenetSayfasi({ firma, finans }: Props) {
  const [altSekme, setAltSekme] = useState<AltSekme>("tumu");

  const ozet = useMemo(() => {
    const portfoy = finans.cekSenet;
    const aktifGelen = portfoy.filter(
      (c) => c.yon === "gelen" && c.durum === "portfoyde",
    );
    const aktifVerilen = portfoy.filter(
      (c) => c.yon === "verilen" && c.durum === "portfoyde",
    );
    const karsiliksiz = portfoy.filter((c) => c.durum === "karsiliksiz");
    const tahsilEdilen = portfoy.filter((c) => c.durum === "tahsil-edildi");

    const toplamAlacak = aktifGelen.reduce((s, c) => s + c.tutar, 0);
    const toplamBorc = aktifVerilen.reduce((s, c) => s + c.tutar, 0);
    const netPozisyon = toplamAlacak - toplamBorc;

    const bugun = new Date("2026-05-27");
    const buAy30Gun = aktifGelen.filter((c) => {
      const vade = new Date(c.vade);
      const fark = (vade.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24);
      return fark <= 30 && fark >= 0;
    });
    const buAyTutar = buAy30Gun.reduce((s, c) => s + c.tutar, 0);
    const karsiliksizRisk = karsiliksiz.reduce((s, c) => s + c.tutar, 0);

    return {
      portfoy,
      aktifGelen,
      aktifVerilen,
      karsiliksiz,
      tahsilEdilen,
      toplamAlacak,
      toplamBorc,
      netPozisyon,
      buAy30Gun,
      buAyTutar,
      karsiliksizRisk,
    };
  }, [finans]);

  const filtreli = useMemo(() => {
    if (altSekme === "tumu") return ozet.portfoy;
    if (altSekme === "gelen") return ozet.aktifGelen;
    if (altSekme === "verilen") return ozet.aktifVerilen;
    if (altSekme === "tahsil") return ozet.tahsilEdilen;
    return ozet.karsiliksiz;
  }, [altSekme, ozet]);

  const sirali = useMemo(
    () => [...filtreli].sort((a, b) => new Date(a.vade).getTime() - new Date(b.vade).getTime()),
    [filtreli],
  );

  // Vade timeline gruplama (önümüzdeki 90 gün, 30'ar günlük dilim)
  const vadeGrup = useMemo(() => {
    const bugun = new Date("2026-05-27");
    const grup = { kisa: 0, orta: 0, uzun: 0, gec: 0 };
    ozet.aktifGelen.forEach((c) => {
      const fark = (new Date(c.vade).getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24);
      if (fark < 0) grup.gec += c.tutar;
      else if (fark <= 30) grup.kisa += c.tutar;
      else if (fark <= 60) grup.orta += c.tutar;
      else grup.uzun += c.tutar;
    });
    return grup;
  }, [ozet]);

  const vadeMaks = Math.max(vadeGrup.kisa, vadeGrup.orta, vadeGrup.uzun, vadeGrup.gec, 1);

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
          Çek/Senet Portföyü · {firma.konum.split(" ")[0]}
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
          Alacak ve Borç Çek/Senetleri
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
          Logo Go cari modülünden gelen portföy. Net pozisyon{" "}
          <strong style={{ color: ozet.netPozisyon > 0 ? TEMA.yesil : TEMA.kirmizi }}>
            {fmtTL(ozet.netPozisyon)}
          </strong>
          {ozet.karsiliksiz.length > 0 && (
            <>
              {" · "}
              <strong style={{ color: TEMA.kirmizi }}>
                {ozet.karsiliksiz.length} karşılıksız
              </strong>{" "}
              risk
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
          etiket="Alacak Portföy"
          numerikDeger={ozet.toplamAlacak}
          ondalik={0}
          sonek=" ₺"
          delta={(ozet.aktifGelen.length / Math.max(ozet.portfoy.length, 1)) * 100 - 60}
          deltaEtiketi={`${ozet.aktifGelen.length} adet`}
          tone={firma.renk}
          ikon={ArrowDownCircle}
          vurgu
        />
        <KpiKart
          etiket="Borç Portföy"
          numerikDeger={ozet.toplamBorc}
          ondalik={0}
          sonek=" ₺"
          deltaEtiketi={`${ozet.aktifVerilen.length} adet · verilen`}
          tone={TEMA.altin}
          ikon={ArrowUpCircle}
        />
        <KpiKart
          etiket="Bu Ay Vadeli Alacak"
          numerikDeger={ozet.buAyTutar}
          ondalik={0}
          sonek=" ₺"
          deltaEtiketi={`${ozet.buAy30Gun.length} adet · 30 gün içinde`}
          tone={TEMA.yesil}
          ikon={Clock}
        />
        <KpiKart
          etiket="Karşılıksız Risk"
          numerikDeger={ozet.karsiliksizRisk}
          ondalik={0}
          sonek=" ₺"
          deltaEtiketi={`${ozet.karsiliksiz.length} adet risk`}
          tone={ozet.karsiliksiz.length > 0 ? TEMA.kirmizi : TEMA.inkFaded}
          ikon={AlertTriangle}
        />
      </section>

      {/* Vade dağılımı bar */}
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
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: TEMA.inkMuted,
            marginBottom: 14,
          }}
        >
          Alacak Çek/Senet Vade Dağılımı
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <VadeBar
            etiket="Vade Geçti"
            tutar={vadeGrup.gec}
            renk={TEMA.kirmizi}
            maks={vadeMaks}
          />
          <VadeBar
            etiket="0-30 gün"
            tutar={vadeGrup.kisa}
            renk={firma.renk}
            maks={vadeMaks}
          />
          <VadeBar
            etiket="30-60 gün"
            tutar={vadeGrup.orta}
            renk={TEMA.altin}
            maks={vadeMaks}
          />
          <VadeBar
            etiket="60-90+ gün"
            tutar={vadeGrup.uzun}
            renk={TEMA.yesil}
            maks={vadeMaks}
          />
        </div>
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
            { id: "tumu", ad: `Tümü (${ozet.portfoy.length})` },
            { id: "gelen", ad: `Alacak (${ozet.aktifGelen.length})` },
            { id: "verilen", ad: `Borç (${ozet.aktifVerilen.length})` },
            { id: "tahsil", ad: `Tahsil Edildi (${ozet.tahsilEdilen.length})` },
            ozet.karsiliksiz.length > 0
              ? { id: "karsiliksiz", ad: `Karşılıksız (${ozet.karsiliksiz.length})` }
              : null,
          ].filter(Boolean) as { id: AltSekme; ad: string }[]
        ).map((s) => {
          const aktif = s.id === altSekme;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setAltSekme(s.id)}
              style={{
                background: "transparent",
                border: "none",
                color: aktif ? TEMA.ink : TEMA.inkMuted,
                fontFamily: FONT.ana,
                fontSize: 13,
                fontWeight: aktif ? 600 : 500,
                padding: "10px 14px",
                cursor: "pointer",
                borderBottom: aktif ? `2px solid ${firma.renk}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 180ms ease",
              }}
            >
              {s.ad}
            </button>
          );
        })}
      </div>

      {/* Çek/Senet listesi */}
      <div
        style={{
          background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
          border: `1px solid ${TEMA.border}`,
          borderRadius: 14,
          padding: "8px 22px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1.4fr 1.4fr 0.8fr 1fr 1fr 100px",
            gap: 12,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: TEMA.inkFaded,
            padding: "12px 0",
            borderBottom: `1px solid ${TEMA.border}`,
          }}
        >
          <span></span>
          <span>Cari</span>
          <span>Banka / Belge No</span>
          <span style={{ textAlign: "right" }}>Tutar</span>
          <span>Vade</span>
          <span>Durum</span>
          <span style={{ textAlign: "right" }}>Tip</span>
        </div>

        {sirali.map((cs) => {
          const bugun = new Date("2026-05-27");
          const vadeTarih = new Date(cs.vade);
          const kalan = Math.ceil(
            (vadeTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24),
          );
          const acil = kalan >= 0 && kalan <= 7;
          const gecmis = kalan < 0;
          return (
            <div
              key={cs.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1.4fr 1.4fr 0.8fr 1fr 1fr 100px",
                gap: 12,
                padding: "12px 0",
                borderBottom: `1px solid rgba(255,255,255,0.03)`,
                fontSize: 13,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${
                    cs.yon === "gelen" ? TEMA.yesil : TEMA.altin
                  }1f`,
                  color: cs.yon === "gelen" ? TEMA.yesil : TEMA.altin,
                }}
              >
                {cs.yon === "gelen" ? (
                  <ArrowDownCircle size={16} />
                ) : (
                  <ArrowUpCircle size={16} />
                )}
              </span>
              <div>
                <div style={{ color: TEMA.ink, fontWeight: 500 }}>{cs.cari}</div>
                <div style={{ fontSize: 10.5, color: TEMA.inkFaded, marginTop: 2 }}>
                  {cs.yon === "gelen" ? "Alacak" : "Borç"} ·{" "}
                  {cs.tip === "cek" ? "Çek" : "Senet"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: TEMA.inkSoft }}>{cs.banka}</div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: TEMA.inkFaded,
                    fontFamily: FONT.num,
                    marginTop: 2,
                  }}
                >
                  {cs.belgeNo}
                </div>
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
                {fmtTL(cs.tutar)}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: gecmis ? TEMA.kirmizi : acil ? TEMA.altin : TEMA.inkSoft,
                    fontWeight: gecmis || acil ? 600 : 500,
                    fontFamily: FONT.num,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {vadeTarih.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: gecmis ? TEMA.kirmizi : acil ? TEMA.altin : TEMA.inkFaded,
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  {cs.durum === "tahsil-edildi"
                    ? "kapalı"
                    : gecmis
                      ? `${Math.abs(kalan)} gün geçti`
                      : acil
                        ? `${kalan} gün kaldı`
                        : `${kalan} gün`}
                </div>
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: `${DURUM_RENGI[cs.durum]}1f`,
                  color: DURUM_RENGI[cs.durum],
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  width: "fit-content",
                }}
              >
                {DURUM_ETIKET[cs.durum]}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  textAlign: "right",
                  color: cs.tip === "cek" ? "#60a5fa" : "#a78bfa",
                }}
              >
                {cs.tip}
              </span>
            </div>
          );
        })}

        {sirali.length === 0 && (
          <div
            style={{
              padding: "30px 16px",
              textAlign: "center",
              color: TEMA.inkFaded,
              fontSize: 13,
            }}
          >
            Bu kategoride kayıt yok.
          </div>
        )}
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginTop: 24,
        }}
      >
        <OzetKart
          etiket="En Yakın Vade"
          deger={
            ozet.aktifGelen.length > 0
              ? new Date(
                  [...ozet.aktifGelen].sort(
                    (a, b) => new Date(a.vade).getTime() - new Date(b.vade).getTime(),
                  )[0]!.vade,
                ).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
              : "—"
          }
          baglam={ozet.buAyTutar > 0 ? `Bu ay ${fmtTL(ozet.buAyTutar)}` : "Bu ay vadeli yok"}
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="Tahsil Edilen (Yakın)"
          deger={`${ozet.tahsilEdilen.length} adet`}
          baglam={`Toplam ${fmtTL(ozet.tahsilEdilen.reduce((s, c) => s + c.tutar, 0))}`}
          baglamRengi="iyi"
        />
        <OzetKart
          etiket="Önerilen Aksiyon"
          deger={
            ozet.karsiliksiz.length > 0
              ? "İcra takip"
              : ozet.buAyTutar > ozet.toplamBorc
                ? "Tahsilatı bekle"
                : "Devam"
          }
          baglam={
            ozet.karsiliksiz.length > 0
              ? `${fmtTL(ozet.karsiliksizRisk)} risk`
              : ozet.buAyTutar > ozet.toplamBorc
                ? "30 günde nakit girişi yeterli"
                : "Mevcut seyir korunur"
          }
          baglamRengi={ozet.karsiliksiz.length > 0 ? "kotu" : "iyi"}
        />
      </section>
    </>
  );
}

function VadeBar({
  etiket,
  tutar,
  renk,
  maks,
}: {
  etiket: string;
  tutar: number;
  renk: string;
  maks: number;
}) {
  const oran = maks > 0 ? (tutar / maks) * 100 : 0;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontFamily: FONT.ana,
        }}
      >
        <span style={{ fontSize: 11, color: TEMA.inkMuted }}>{etiket}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: renk,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 8px ${renk}40`,
          }}
        >
          {fmtTL(tutar)}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 8,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
          borderRadius: 999,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.50), inset 0 -1px 0 rgba(255,255,255,0.03)",
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
      </div>
    </div>
  );
}

// Bilinmeyen ikon guard
void FileSignature;
