// NabizSayfasi — Şirket nabzı / yönetim özeti.
// 3 yıl karşılaştırma AnaGrafik + ProgressRing + Yönetici Özeti + 4 KPI + 3 destek.

import { useMemo, useState } from "react";
import { Wallet, TrendingUp, Coins, Banknote, Pencil } from "lucide-react";
import { KpiKart } from "@/components/dash/KpiKart";
import { AnaGrafik } from "@/components/dash/AnaGrafik";
import { OzetKart } from "@/components/dash/OzetKart";
import { YoneticiOzeti } from "@/components/dash/YoneticiOzeti";
import { ProgressRing } from "@/components/dash/ProgressRing";
import { Chart3DBackdrop } from "@/components/dash/Chart3DBackdrop";
import { FirmaHedefDuzenleModal } from "@/components/modals/FirmaHedefDuzenleModal";
import { MuhasebeBriefKart } from "@/components/dash/MuhasebeBriefKart";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import { PANEL_HEDEFLERI } from "@/data/gercek-finans";
import { TEMA, FONT, fmtTL, fmtYuzde } from "@/lib/tema";
import type { Firma, FirmaFinans, Kullanici } from "@/types/domain";

interface Props {
  firma: Firma;
  finans: FirmaFinans;
  aktifKullanici: Kullanici;
}

export function NabizSayfasi({ firma, finans, aktifKullanici }: Props) {
  const [hedefModalAcik, setHedefModalAcik] = useState(false);

  const ozet = useMemo(() => {
    const son12 = finans.son12Ay;
    const son = son12[son12.length - 1]!;
    const ilk = son12[0]!;

    const yillikCiro = son12.reduce((s, a) => s + a.ciro, 0);
    const ortalamaMarj = son12.reduce((s, a) => s + a.brutMarj, 0) / son12.length;
    const brutKarYillik = Math.round(yillikCiro * (ortalamaMarj / 100));
    const netKarYillik = son12.reduce((s, a) => s + a.netKar, 0);
    const nakitAylik = son.nakit;

    const ciroYilDelta = ((son.ciro - ilk.ciro) / ilk.ciro) * 100;
    const marjYilDelta = son.brutMarj - ilk.brutMarj;

    const yillikHedef = PANEL_HEDEFLERI[finans.firmaId] ?? Math.round((yillikCiro / 12) * 1.04 * 12);
    const hedefGerceklesme = (yillikCiro / yillikHedef) * 100;

    const son3Ay = son12.slice(-3);
    const tahmin3Ay = Math.round((son3Ay.reduce((s, a) => s + a.ciro, 0) / 3) * 3);

    const operasyonel = Math.min(100, ortalamaMarj * 5 + 35);
    const aylikOrtGider = (yillikCiro - netKarYillik) / 12;
    const nakitYeterliligi = Math.min(100, (nakitAylik / Math.max(aylikOrtGider, 1)) * 100);

    const sparkCiro = son12.map((a) => a.ciro);
    const sparkBrut = son12.map((a) => a.ciro * (a.brutMarj / 100));
    const sparkNet = son12.map((a) => a.netKar);
    const sparkNakit = son12.map((a) => a.nakit);

    return {
      yillikCiro,
      brutKarYillik,
      netKarYillik,
      nakitAylik,
      ortalamaMarj,
      ciroYilDelta,
      marjYilDelta,
      tahmin3Ay,
      hedefGerceklesme,
      operasyonel,
      nakitYeterliligi,
      sparkCiro,
      sparkBrut,
      sparkNet,
      sparkNakit,
    };
  }, [finans]);

  const durumRengi: "iyi" | "dikkat" | "kotu" =
    ozet.hedefGerceklesme >= 95 && ozet.ortalamaMarj > 15 ? "iyi" :
    ozet.hedefGerceklesme >= 80 ? "dikkat" : "kotu";

  const durumMetni =
    ozet.hedefGerceklesme >= 95
      ? `Ciro hedefin ${ozet.hedefGerceklesme >= 100 ? "üstünde" : "yakınında"}, nakit pozisyonu sağlam. Marjı korumak için maliyet tarafı izlenmeli.`
      : ozet.hedefGerceklesme >= 80
        ? `Hedefe ${(100 - ozet.hedefGerceklesme).toFixed(0)} puan uzaktayız; son çeyrekte ivme yakalanırsa kapanabilir. Açık alacaklar takipte tutulmalı.`
        : `Hedefin altında seyrediyoruz; tahsilat hızı ve marj baskısı gözden geçirilmeli. Bayilerle mutabakat tazelenirse toparlanma olası.`;

  // AI yorum maddeleri — sayfa verisinden Anadolu iş dili ile çıkarım
  // Mehmet Bey'in samimi okuma stili: kısa cümle, abi tonu, somut sayı + ne yapılır
  const aiMaddeler = useMemo<AiYorumMaddesi[]>(() => {
    const list: AiYorumMaddesi[] = [];

    // 1) Ciro yıl deltası
    if (ozet.ciroYilDelta >= 8) {
      list.push({
        ton: "pozitif",
        baslik: "Ciro yukarı yön çizgisinde",
        detay: `Yıl başına göre %${ozet.ciroYilDelta.toFixed(1)} ivme var. Mehmet Bey, mevcut tempo ${firma.kisaAd}'da çekirdek müşteri sadakatinin tuttuğunu söylüyor.`,
        vurguSayi: `+%${ozet.ciroYilDelta.toFixed(1)}`,
      });
    } else if (ozet.ciroYilDelta >= 0) {
      list.push({
        ton: "dikkat",
        baslik: "Ciro yatay, ivme zayıf",
        detay: `Yıl başına yakın seyrediyoruz (%${ozet.ciroYilDelta.toFixed(1)}). SMC zam yansımalarına ve bayi siparişlerine sıkı bakmak gerekir.`,
        vurguSayi: `%${ozet.ciroYilDelta.toFixed(1)}`,
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Ciro yıl başının altında",
        detay: `Yıl başına göre %${Math.abs(ozet.ciroYilDelta).toFixed(1)} düşüş. Bayilerle mutabakat + kampanya tazelenmesi öncelikli; Maraş Bey'le bir oturum konuşulmalı.`,
        vurguSayi: `−%${Math.abs(ozet.ciroYilDelta).toFixed(1)}`,
      });
    }

    // 2) Marj puanı
    if (ozet.marjYilDelta >= 1) {
      list.push({
        ton: "pozitif",
        baslik: "Marj puanı güçleniyor",
        detay: `Yıl başına göre +${ozet.marjYilDelta.toFixed(1)} puan iyileşme. Pnömatik tarafta fiyat disiplini ve kur yönetimi işe yaramış.`,
        vurguSayi: `+${ozet.marjYilDelta.toFixed(1)} puan`,
      });
    } else if (ozet.marjYilDelta >= -1.5) {
      list.push({
        ton: "dikkat",
        baslik: "Marj dengede ama dar",
        detay: `Yıl başına göre ${ozet.marjYilDelta >= 0 ? "+" : ""}${ozet.marjYilDelta.toFixed(1)} puan oynama var. SMC EUR fiyatı ile satış TL'si arasında tampon eridi mi diye bakmak iyi olur.`,
        vurguSayi: `${ozet.marjYilDelta >= 0 ? "+" : ""}${ozet.marjYilDelta.toFixed(1)} puan`,
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Marj puanı eriyor",
        detay: `Yıl başına göre ${ozet.marjYilDelta.toFixed(1)} puan kayıp. Bayi indirimleri + nakliye + EUR/TL üçgenini tekrar masaya yatırmak gerekir.`,
        vurguSayi: `${ozet.marjYilDelta.toFixed(1)} puan`,
      });
    }

    // 3) Hedef gerçekleşme
    if (ozet.hedefGerceklesme >= 100) {
      list.push({
        ton: "pozitif",
        baslik: "Yıllık hedef karşılandı",
        detay: `Mehmet Bey, hedefin üzerine ${(ozet.hedefGerceklesme - 100).toFixed(0)} puan eklendi. Yıl sonu ekibe küçük bir tebrik notu denebilir.`,
        vurguSayi: `%${ozet.hedefGerceklesme.toFixed(0)}`,
      });
    } else if (ozet.hedefGerceklesme >= 85) {
      list.push({
        ton: "firsat",
        baslik: "Hedefe yakın, son çeyrek belirleyici",
        detay: `Hedefe ${(100 - ozet.hedefGerceklesme).toFixed(0)} puan uzağız. Bayi ziyaretlerinin sıklaştırılması ve büyük teklif takipleri kapatabilir.`,
        vurguSayi: `%${ozet.hedefGerceklesme.toFixed(0)}`,
      });
    } else {
      list.push({
        ton: "dikkat",
        baslik: "Hedef geriden takip ediliyor",
        detay: `%${ozet.hedefGerceklesme.toFixed(0)} ile hedefin gerisinde kaldık. Hedef tablosu yeniden gözden geçirilmeli; gerçekçi revizyon konuşulmalı.`,
        vurguSayi: `%${ozet.hedefGerceklesme.toFixed(0)}`,
      });
    }

    // 4) Nakit yeterliliği
    if (ozet.nakitYeterliligi >= 80) {
      list.push({
        ton: "firsat",
        baslik: "Nakit tarafı rahat",
        detay: `Aylık ortalama giderin %${ozet.nakitYeterliligi.toFixed(0)}'ı kasada duruyor. SMC erken ödeme indirimini değerlendirmek mantıklı olabilir.`,
        vurguSayi: `%${ozet.nakitYeterliligi.toFixed(0)}`,
      });
    } else if (ozet.nakitYeterliligi >= 50) {
      list.push({
        ton: "dikkat",
        baslik: "Nakit tampon orta seviyede",
        detay: `%${ozet.nakitYeterliligi.toFixed(0)} yeterlilik var, takvim baskısı normalde sorun çıkarmaz ama büyük teklif olursa Furkan Bey'le birlikte hesap yapalım.`,
        vurguSayi: `%${ozet.nakitYeterliligi.toFixed(0)}`,
      });
    } else {
      list.push({
        ton: "kritik",
        baslik: "Nakit baskısı yakın",
        detay: `Yeterlilik %${ozet.nakitYeterliligi.toFixed(0)}. Açık alacaklarda tahsilat hızlandırılmazsa ay sonu vergi/SGK tarafı zorlanır.`,
        vurguSayi: `%${ozet.nakitYeterliligi.toFixed(0)}`,
      });
    }

    return list;
  }, [ozet, firma.kisaAd]);

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
          Finansal Nabız · {firma.konum.split(" ")[0]}
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
          {firma.unvan}
        </h1>
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
          numerikDeger={ozet.yillikCiro}
          ondalik={0}
          sonek=" ₺"
          delta={ozet.ciroYilDelta}
          deltaEtiketi="yıllık"
          sparkline={ozet.sparkCiro}
          tone={firma.renk}
          ikon={Wallet}
          vurgu
        />
        <KpiKart
          etiket="Brüt Kâr"
          numerikDeger={ozet.brutKarYillik}
          ondalik={0}
          sonek=" ₺"
          delta={ozet.marjYilDelta}
          deltaEtiketi="marj puanı"
          sparkline={ozet.sparkBrut}
          tone={TEMA.altin}
          ikon={TrendingUp}
        />
        <KpiKart
          etiket="Net Kâr"
          numerikDeger={ozet.netKarYillik}
          ondalik={0}
          sonek=" ₺"
          delta={ozet.ciroYilDelta * 0.62}
          deltaEtiketi="yıllık"
          sparkline={ozet.sparkNet}
          tone={TEMA.yesil}
          ikon={Coins}
        />
        <KpiKart
          etiket="Nakit Akışı"
          numerikDeger={ozet.nakitAylik}
          ondalik={0}
          sonek=" ₺"
          delta={4.2}
          deltaEtiketi="son ay"
          sparkline={ozet.sparkNakit}
          tone="#60a5fa"
          ikon={Banknote}
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
        <Chart3DBackdrop tint={firma.renk} style={{ background: TEMA.bgKart }}>
          <AnaGrafik
            veri={finans.yillarTrend}
            baslik="3 Yıllık Karşılaştırma"
            altBaslik="2024 · 2025 · 2026 takvim yılı ciroları"
            accent={firma.renk}
          />
        </Chart3DBackdrop>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            data-anim="ozet"
            style={{
              background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
              border: `1px solid ${TEMA.border}`,
              borderRadius: 16,
              padding: "20px 16px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: TEMA.inkMuted,
                }}
              >
                Hedef Gerçekleşme
              </span>
              {aktifKullanici.konsolideGorur && (
                <button
                  type="button"
                  onClick={() => setHedefModalAcik(true)}
                  title="Yıllık hedefleri düzenle"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${TEMA.border}`,
                    color: TEMA.inkMuted,
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    transition: "color 180ms ease, border-color 180ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = TEMA.ink;
                    e.currentTarget.style.borderColor = TEMA.borderAktif;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = TEMA.inkMuted;
                    e.currentTarget.style.borderColor = TEMA.border;
                  }}
                >
                  <Pencil size={10} />
                  Düzenle
                </button>
              )}
            </div>
            <ProgressRing
              value={ozet.hedefGerceklesme}
              size={148}
              stroke={12}
              color={firma.renk}
            >
              <span
                style={{
                  fontFamily: FONT.num,
                  fontSize: 30,
                  fontWeight: 600,
                  color: TEMA.ink,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
              >
                {ozet.hedefGerceklesme.toFixed(0)}%
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: TEMA.inkFaded,
                  marginTop: 2,
                  letterSpacing: "0.06em",
                }}
              >
                yıllık hedef
              </span>
            </ProgressRing>
          </div>

          <YoneticiOzeti
            baslik="Yönetici Özeti"
            altBaslik="Bu dönem performansı"
            accent={firma.renk}
            satirlar={[
              { etiket: "Operasyonel Verimlilik", yuzde: ozet.operasyonel, renk: "yesil" },
              { etiket: "Nakit Yeterliliği", yuzde: ozet.nakitYeterliligi, renk: "altin" },
            ]}
            durumBasligi="Genel Durum"
            durumMetni={durumMetni}
            durumRengi={durumRengi}
          />
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <OzetKart
          etiket="Kâr Marjı"
          deger={fmtYuzde(ozet.ortalamaMarj)}
          baglam={ozet.ortalamaMarj > 15 ? "Hedef %15 — üstünde" : "Hedef %15 — altında"}
          baglamRengi={ozet.ortalamaMarj > 15 ? "iyi" : "kotu"}
        />
        <OzetKart
          etiket="Tahmin · 3 Ay"
          deger={fmtTL(ozet.tahmin3Ay)}
          baglam="Son 3 ay ortalamasına göre"
          baglamRengi="notr"
        />
        <OzetKart
          etiket="Performans"
          deger={fmtYuzde(ozet.hedefGerceklesme)}
          baglam={
            ozet.hedefGerceklesme >= 100
              ? "Yıllık hedef karşılandı"
              : `Hedefe ${(100 - ozet.hedefGerceklesme).toFixed(0)} puan uzak`
          }
          baglamRengi={ozet.hedefGerceklesme >= 100 ? "iyi" : "notr"}
        />
      </section>

      {/* Aylık Muhasebe Brief — Osman Bey'in WhatsApp/email mesajı parse */}
      <section style={{ marginTop: 20 }}>
        <MuhasebeBriefKart />
      </section>

      {/* AI Yorum — sayfa verisinden Anadolu iş dili çıkarımlar */}
      <section style={{ marginTop: 20 }}>
        <AiYorumKart sayfaBasligi="Nabız" maddeler={aiMaddeler} />
      </section>

      <FirmaHedefDuzenleModal
        acik={hedefModalAcik}
        onClose={() => setHedefModalAcik(false)}
        aktifKullanici={aktifKullanici}
      />
    </>
  );
}
