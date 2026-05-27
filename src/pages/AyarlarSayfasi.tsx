// AyarlarSayfasi — kullanıcı + firma + bildirim + veri kaynağı.
// Sade tek sayfa, sol nav + sağ form yerine üst-alt blok yığını.

import { useMemo, useState } from "react";
import { User, Building2, Bell, Database, LogOut } from "lucide-react";
import { AiYorumKart, type AiYorumMaddesi } from "@/components/dash/AiYorumKart";
import {
  PANEL_VERI_KAPSAMI,
  PANEL_VERI_OZETI,
  PANEL_YETENEKLERI,
} from "@/data/gercek-finans";
import { notify } from "@/lib/notify";
import { TEMA, FONT } from "@/lib/tema";
import type { Firma, Kullanici } from "@/types/domain";

interface Props {
  firma: Firma;
  aktifKullanici: Kullanici;
  onSyncClick?: () => void;
  onSignOutClick?: () => void;
}

type Bolum = "profil" | "firma" | "bildirim" | "veri" | "cikis";

export function AyarlarSayfasi({
  firma,
  aktifKullanici,
  onSyncClick,
  onSignOutClick,
}: Props) {
  const [bolum, setBolum] = useState<Bolum>("profil");
  const aiMaddeler = useMemo<AiYorumMaddesi[]>(() => {
    const cokluFirma = aktifKullanici.firmaIzin.length > 1;

    return [
      {
        ton: cokluFirma ? "pozitif" : "dikkat",
        baslik: cokluFirma ? "Yetki kapsami geniş, merkez tek elde" : "Erişim dar ama odağı net",
        detay: cokluFirma
          ? `${aktifKullanici.hitap} şu an ${aktifKullanici.firmaIzin.length} firmaya ve ${aktifKullanici.konsolideGorur ? "konsolide görünüme" : "tekil görünümlere"} erişebiliyor. Bu yapı merkezî kontrol için güçlü, ama firma geçiş disiplinini canlı tutmak önemli.`
          : `${aktifKullanici.hitap} yalnızca ${firma.kisaAd} tarafını görüyor. V1 için bu sınır iyi; yanlış ekran, yanlış veri riski daha baştan kapanmış oluyor.`,
        vurguSayi: `${aktifKullanici.firmaIzin.length} firma`,
      },
      {
        ton: "pozitif",
        baslik: "Gerçek veri hattı yerel import ile akıyor",
        detay: `Şu an ${PANEL_VERI_OZETI.sonGuncelleme} tarihli XML ve PDF kesitleri üstünden çalışıyoruz. Canlı Logo Go bağlantısı bir sonraki katman; mevcut panel ise dürüst biçimde dosya tabanlı veri gösteriyor.`,
        vurguSayi: PANEL_VERI_OZETI.sonGuncelleme,
      },
      {
        ton: "dikkat",
        baslik: "Veri kapsamı modül modül izlenmeli",
        detay: "Alacak, ciro ve vade tarafı güçlü; bordro, çek/senet ve net ürün maliyeti ise hâlâ ek export bekliyor. Bu ekran o boşlukları gizlemek yerine görünür tutmalı.",
        vurguSayi: `${PANEL_VERI_KAPSAMI.length} modül`,
      },
      {
        ton: "firsat",
        baslik: "Ayarlar sayfası ekip standardını taşıyabilir",
        detay: `${firma.kisaAd} renkleri, yetki sınırları ve veri kapsamı burada net. Mehmet Bey, bu netliği diğer ortaklara kısa onboarding akışı gibi göstermek kullanıcı alışmasını hızlandırır.`,
        vurguSayi: firma.kisaAd,
      },
    ];
  }, [aktifKullanici, firma]);

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
          Ayarlar
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
          Hesabınız ve Tercihleriniz
        </h1>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 20,
        }}
      >
        {/* Sol — bölüm nav */}
        <nav
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 12,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "fit-content",
          }}
        >
          {(
            [
              { id: "profil", ad: "Profil", icon: User },
              { id: "firma", ad: "Firma & Yetki", icon: Building2 },
              { id: "bildirim", ad: "Bildirim", icon: Bell },
              { id: "veri", ad: "Veri Kaynağı", icon: Database },
              { id: "cikis", ad: "Çıkış", icon: LogOut },
            ] as { id: Bolum; ad: string; icon: typeof User }[]
          ).map((b) => {
            const aktif = b.id === bolum;
            const Ic = b.icon;
            const tehlikeli = b.id === "cikis";
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBolum(b.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: aktif ? "rgba(255,255,255,0.06)" : "transparent",
                  border: "none",
                  color: aktif
                    ? TEMA.ink
                    : tehlikeli
                      ? TEMA.kirmizi
                      : TEMA.inkMuted,
                  fontFamily: FONT.ana,
                  fontSize: 13,
                  fontWeight: aktif ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 180ms ease, background 180ms ease",
                }}
              >
                <Ic size={15} />
                {b.ad}
              </button>
            );
          })}
        </nav>

        {/* Sağ — bölüm içeriği */}
        <div
          style={{
            background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
            border: `1px solid ${TEMA.border}`,
            borderRadius: 16,
            padding: "26px 28px 24px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          {bolum === "profil" && <ProfilBolum kullanici={aktifKullanici} accent={firma.renk} />}
          {bolum === "firma" && <FirmaBolum kullanici={aktifKullanici} firma={firma} />}
          {bolum === "bildirim" && <BildirimBolum />}
          {bolum === "veri" && <VeriBolum onSyncClick={onSyncClick} />}
          {bolum === "cikis" && <CikisBolum onSignOutClick={onSignOutClick} />}
        </div>
      </section>

      <div style={{ marginTop: 24 }}>
        <AiYorumKart
          sayfaBasligi="Ayarlar"
          maddeler={aiMaddeler}
          ctaMetni="Mehmet Bey, bu kullanım disiplinini kısa ekip notuna çevirip herkesin aynı panel alışkanlığıyla ilerlemesini sağlayalım mı?"
          ctaButonMetni="Notu işle"
          ctaAksiyonu={() =>
            notify.success("Ayar disiplini not edildi", {
              description: `${aktifKullanici.hitap} için yetki kapsamı, sync ritmi ve manuel veri hattı ekip notuna işlendi.`,
            })
          }
        />
      </div>
    </>
  );
}

function BaslikBlok({ baslik, alt }: { baslik: string; alt: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: TEMA.ink,
          margin: 0,
          letterSpacing: "-0.015em",
        }}
      >
        {baslik}
      </h2>
      <p style={{ fontSize: 13, color: TEMA.inkMuted, margin: "4px 0 0" }}>{alt}</p>
    </div>
  );
}

function SatirEtiketDeger({
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: `1px solid ${TEMA.border}`,
        fontSize: 13.5,
      }}
    >
      <span style={{ color: TEMA.inkMuted }}>{etiket}</span>
      <span style={{ color: accent ?? TEMA.ink, fontWeight: 500 }}>{deger}</span>
    </div>
  );
}

function ProfilBolum({ kullanici, accent }: { kullanici: Kullanici; accent: string }) {
  return (
    <>
      <BaslikBlok baslik="Profil" alt="Hesap bilgileriniz ve hitap tercihiniz" />
      <SatirEtiketDeger etiket="Ad Soyad" deger={kullanici.ad} />
      <SatirEtiketDeger etiket="Hitap" deger={kullanici.hitap} accent={accent} />
      <SatirEtiketDeger
        etiket="Rol"
        deger={kullanici.rol === "cekirdek-ortak" ? "Çekirdek Ortak (4 firma + Konsolide)" : "Tek Firma Yöneticisi"}
      />
      <SatirEtiketDeger
        etiket="Erişim"
        deger={`${kullanici.firmaIzin.length} firma`}
      />
    </>
  );
}

function FirmaBolum({ kullanici, firma }: { kullanici: Kullanici; firma: Firma }) {
  return (
    <>
      <BaslikBlok baslik="Firma & Yetki" alt="Aktif firma ve erişim matrisiniz" />
      <SatirEtiketDeger etiket="Aktif Firma" deger={firma.kisaAd} accent={firma.renk} />
      <SatirEtiketDeger etiket="Unvan" deger={firma.unvan} />
      <SatirEtiketDeger etiket="Konum" deger={firma.konum} />
      <SatirEtiketDeger etiket="İş Kolu" deger={firma.isKolu} />
      <SatirEtiketDeger
        etiket="Yetkili Olduğun Firmalar"
        deger={kullanici.firmaIzin.map((f) => f.toUpperCase()).join(" · ")}
      />
      <SatirEtiketDeger
        etiket="Konsolide Erişim"
        deger={kullanici.konsolideGorur ? "Açık" : "Kapalı"}
        accent={kullanici.konsolideGorur ? TEMA.yesil : TEMA.inkMuted}
      />
    </>
  );
}

function BildirimBolum() {
  return (
    <>
      <BaslikBlok baslik="Bildirim" alt="Hangi olaylarda hatırlatma istersiniz" />
      {[
        { ad: "Mali Takvim · 3 gün öncesi", varsayilan: true },
        { ad: "Vade geçen alacaklar", varsayilan: true },
        { ad: "Aylık AI brief (her ayın 1'i)", varsayilan: true },
        { ad: "Kritik nakit eşiği altına düştü", varsayilan: true },
        { ad: "Yeni Logo Go sync tamamlandı", varsayilan: false },
      ].map((b, i) => (
        <ToggleSatir key={i} ad={b.ad} varsayilan={b.varsayilan} />
      ))}
    </>
  );
}

function ToggleSatir({ ad, varsayilan }: { ad: string; varsayilan: boolean }) {
  const [acik, setAcik] = useState(varsayilan);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: `1px solid ${TEMA.border}`,
        fontSize: 13.5,
      }}
    >
      <span style={{ color: TEMA.inkSoft }}>{ad}</span>
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        style={{
          position: "relative",
          width: 38,
          height: 22,
          borderRadius: 999,
          background: acik ? TEMA.yesil : "rgba(255,255,255,0.08)",
          border: "none",
          cursor: "pointer",
          transition: "background 180ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: acik ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "white",
            transition: "left 180ms ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.30)",
          }}
        />
      </button>
    </div>
  );
}

function VeriBolum({ onSyncClick }: { onSyncClick?: () => void }) {
  return (
    <>
      <BaslikBlok baslik="Veri Kaynağı" alt="Yerel import akışı, kapsam ve sonraki entegrasyon katmanı" />

      <div
        style={{
          padding: "16px 18px",
          borderRadius: 12,
          background: `linear-gradient(180deg, ${TEMA.altin}12, transparent)`,
          border: `1px solid ${TEMA.altin}30`,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `${TEMA.yesil}1f`,
            display: "grid",
            placeItems: "center",
            position: "relative",
            flexShrink: 0,
          }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: TEMA.altin,
                boxShadow: `0 0 12px ${TEMA.altin}80`,
              }}
            />
            <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: `2px solid ${TEMA.altin}40`,
              animation: "pulse-soft 2s infinite",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink }}>
            Canlı Logo Go hattı henüz açık değil
          </div>
          <div style={{ fontSize: 12, color: TEMA.inkMuted, marginTop: 2 }}>
            Son gerçek kesit: {PANEL_VERI_OZETI.sonGuncelleme} · masaüstü klasörü + XML/PDF importu
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onSyncClick) {
              onSyncClick();
              return;
            }
            notify.info("Veri hattı hazır", {
              description: "Canlı bağlantı açılana kadar bu alan son import kesitini ve kapsam durumunu gösterir.",
            });
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: `linear-gradient(180deg, ${TEMA.altin}, ${TEMA.altin}cc)`,
            color: "white",
            border: "none",
            fontFamily: FONT.ana,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: `0 4px 12px ${TEMA.altin}40`,
          }}
        >
          Durumu Yenile
        </button>
      </div>

      <SatirEtiketDeger etiket="2026 XML Kesiti" deger={`${PANEL_VERI_OZETI.faturaSayisi2026} fatura · ${PANEL_VERI_OZETI.cariSayisi2026} cari`} />
      <SatirEtiketDeger etiket="Q1 2026 Büyüme" deger={`+%${PANEL_VERI_OZETI.q1BuyumeYuzde.toFixed(1)}`} accent={TEMA.yesil} />
      <SatirEtiketDeger etiket="Açık Alacak" deger={`${PANEL_VERI_OZETI.toplamAcikAlacak.toLocaleString("tr-TR")} TL`} />
      <SatirEtiketDeger
        etiket="Canlı Entegrasyon"
        deger={PANEL_YETENEKLERI.konsolideAcik ? "Açık" : "Kapalı · yerel import modu"}
        accent={PANEL_YETENEKLERI.konsolideAcik ? TEMA.yesil : TEMA.altin}
      />

      <div style={{ marginTop: 24, marginBottom: 12 }}>
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
          Veri Kapsamı
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PANEL_VERI_KAPSAMI.map((kalem) => (
            <SyncLogSatir
              key={kalem.alan}
              zaman={kalem.durum === "canli" ? "hazır" : kalem.durum === "tahmini" ? "tahmini" : "bekliyor"}
              tarih={PANEL_VERI_OZETI.sonGuncelleme}
              kim="veri katmanı"
              sonuc={kalem.durum === "bekliyor" ? "hata" : "başarılı"}
              detay={`${kalem.alan} · ${kalem.not}`}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
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
          Muhasebeci'den Manuel Veri Yükleme
        </div>
        <div
          role="button"
          tabIndex={0}
          style={{
            padding: "26px 24px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: `1.5px dashed ${TEMA.border}`,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 180ms ease, background 180ms ease",
          }}
          onClick={() =>
            notify.info("Manuel veri yükleme merkezi hazır", {
              description:
                "Muhasebeciden gelen PDF, Excel ve CSV dosyalari bu alandan alinip gerçek veri katmanina yeniden işlenecek.",
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              notify.info("Manuel veri yükleme merkezi hazır", {
                description:
                  "Muhasebeciden gelen PDF, Excel ve CSV dosyalari bu alandan alinip gerçek veri katmanina yeniden işlenecek.",
              });
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = TEMA.borderAktif;
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = TEMA.border;
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          }}
        >
          <div style={{ fontSize: 32, color: TEMA.inkMuted, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEMA.ink, marginBottom: 4 }}>
            Osman Bey'den gelen PDF / Excel / CSV
          </div>
          <div style={{ fontSize: 12, color: TEMA.inkMuted, lineHeight: 1.5, maxWidth: 480, margin: "0 auto" }}>
            E-Defter, yıllık kurumlar vergisi beyannamesi, Bağkur dekontu vb.
            buraya sürükleyip bırakın. AI parse edip Mali Takvim'e ekler.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
      `}</style>
    </>
  );
}

function SyncLogSatir({
  zaman,
  tarih,
  kim,
  sonuc,
  detay,
}: {
  zaman: string;
  tarih: string;
  kim: string;
  sonuc: "başarılı" | "hata";
  detay: string;
}) {
  const sonucRengi = sonuc === "başarılı" ? TEMA.yesil : TEMA.kirmizi;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr 80px 1.4fr",
        gap: 12,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${TEMA.border}`,
        borderRadius: 8,
        fontSize: 12,
        alignItems: "center",
      }}
    >
      <span
        style={{
          color: TEMA.inkSoft,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {zaman}
      </span>
      <span style={{ color: TEMA.inkMuted, fontFamily: FONT.ana, fontSize: 11 }}>{tarih}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: sonucRengi,
        }}
      >
        ● {sonuc}
      </span>
      <span style={{ color: TEMA.inkSoft, fontSize: 11.5 }}>
        {detay}
        <span style={{ color: TEMA.inkFaded, marginLeft: 8 }}>· {kim}</span>
      </span>
    </div>
  );
}

function CikisBolum({ onSignOutClick }: { onSignOutClick?: () => void }) {
  return (
    <>
      <BaslikBlok baslik="Çıkış" alt="Oturumu kapat ve giriş ekranına dön" />
      <p style={{ fontSize: 13, color: TEMA.inkSoft, marginBottom: 20 }}>
        Bilgilerinizi kaydederek çıkış yaparsanız bir sonraki girişinizde panele aynı yerden devam edebilirsiniz.
      </p>
      <button
        type="button"
        onClick={() => {
          if (onSignOutClick) {
            onSignOutClick();
            return;
          }
          notify.info("Cikis akisi hazir", {
            description: "Gerçek kimlik doğrulama bağlı değil; bu butonun yeri ve davranışı netleştirildi.",
          });
        }}
        style={{
          padding: "10px 18px",
          borderRadius: 10,
          background: "rgba(248,113,113,0.12)",
          color: TEMA.kirmizi,
          border: `1px solid ${TEMA.kirmizi}40`,
          fontFamily: FONT.ana,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Oturumu Kapat
      </button>
    </>
  );
}
