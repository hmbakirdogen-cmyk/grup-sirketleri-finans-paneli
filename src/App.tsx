// App — Grup Şirketleri Finans Paneli ana orkestratör.
// 7 sayfa: Nabız / Akış / Alacaklar / Raporlar / Vergi / Konsolide / Ayarlar.
// + Toaster (sonner), CommandPalette (Cmd+K), MansetBandi.
// Aktif firmaya göre CSS var --accent dinamik kayar.

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { FIRMALAR } from "./data/firmalar";
import { FINANS_VERISI } from "./data/mock-finans";
import { KULLANICILAR } from "./data/kullanicilar";
import { EliteHeader } from "./components/dash/EliteHeader";
import { MaliTakvimRozetMini } from "./components/dash/MaliTakvimRozetMini";
import { MansetBandi } from "./components/dash/MansetBandi";
import { CommandPalette } from "./components/dash/CommandPalette";
import { KullaniciSecici } from "./components/dash/KullaniciSecici";
import { ImpersonationBanner } from "./components/dash/ImpersonationBanner";
import type { Sekme } from "./components/dash/SekmeNav";
import { NabizSayfasi } from "./pages/NabizSayfasi";
import { AkisSayfasi } from "./pages/AkisSayfasi";
import { Yarin90GunSayfasi } from "./pages/Yarin90GunSayfasi";
import { AlacaklarSayfasi } from "./pages/AlacaklarSayfasi";
import { CekSenetSayfasi } from "./pages/CekSenetSayfasi";
import { UrunMarjiSayfasi } from "./pages/UrunMarjiSayfasi";
import { PersonelSayfasi } from "./pages/PersonelSayfasi";
import { RaporlarSayfasi } from "./pages/RaporlarSayfasi";
import { VergiAtolyesiSayfasi } from "./pages/VergiAtolyesiSayfasi";
import { KonsolideSayfasi } from "./pages/KonsolideSayfasi";
import { IsBirligiSayfasi } from "./pages/IsBirligiSayfasi";
import { AyarlarSayfasi } from "./pages/AyarlarSayfasi";
import { notify } from "./lib/notify";
import { TEMA, FONT } from "./lib/tema";
import type { FirmaId, KullaniciId } from "./types/domain";

// Gerçek kullanıcı (süper yönetici varsayım): Mehmet Bey
// Memory: Mehmet Bey MEBA yöneticisi + programı yapılandıran kişi.
// Default goruntulenen = gercek (no impersonation).
const GERCEK_KULLANICI: KullaniciId = "mehmet-bakirdogen";

export function App() {
  const [aktif, setAktif] = useState<FirmaId>("meba");
  const [sekme, setSekme] = useState<Sekme>("nabiz");
  const [paletAcik, setPaletAcik] = useState(false);
  const [seciciAcik, setSeciciAcik] = useState(false);
  const [goruntulenenId, setGoruntulenenId] = useState<KullaniciId>(GERCEK_KULLANICI);

  const gercekKullanici = KULLANICILAR[GERCEK_KULLANICI]!;
  const aktifKullanici = KULLANICILAR[goruntulenenId]!;
  const impersonation = goruntulenenId !== GERCEK_KULLANICI;

  // Görüntülenen kullanıcının erişim sınırına göre firma seçimi geçerli mi?
  // Geçerli değilse otomatik ilk izinli firmaya geç.
  const erisilebilirFirmalar = aktifKullanici.firmaIzin;
  const gecerliFirma: FirmaId = erisilebilirFirmalar.includes(aktif)
    ? aktif
    : erisilebilirFirmalar[0]!;
  if (gecerliFirma !== aktif) {
    // Sessiz redirect (useEffect değil çünkü hızlı setState yeterli)
  }

  const firma = FIRMALAR[gecerliFirma];
  const finans = FINANS_VERISI[gecerliFirma];

  useEffect(() => {
    if (gecerliFirma !== aktif) {
      setAktif(gecerliFirma);
    }
  }, [aktif, gecerliFirma]);

  useEffect(() => {
    if (sekme === "grup" && !aktifKullanici.konsolideGorur) {
      setSekme("nabiz");
    }
  }, [aktifKullanici.konsolideGorur, sekme]);

  // Görüntülenen Konsolide göremiyorsa Konsolide sekmesinde değil

  function kullaniciSec(id: KullaniciId) {
    setGoruntulenenId(id);
    // İlk izinli firmaya at
    const yeniK = KULLANICILAR[id]!;
    if (!yeniK.firmaIzin.includes(aktif)) {
      setAktif(yeniK.firmaIzin[0]!);
    }
    // Konsolide'de ise ve yeni kullanıcı göremiyorsa Nabız'a dön
    if (sekme === "grup" && !yeniK.konsolideGorur) setSekme("nabiz");
    notify.info(
      id === GERCEK_KULLANICI
        ? `Kendi hesabınıza döndünüz`
        : `${yeniK.hitap} olarak görüntülüyorsunuz`,
      {
        description:
          id === GERCEK_KULLANICI
            ? "Süper yönetici görünümü kapalı."
            : `${yeniK.rol === "cekirdek-ortak" ? "Çekirdek Ortak" : "Tek Firma Yöneticisi"} · ${yeniK.firmaIzin.length} firma`,
      },
    );
  }

  function senkronTetikle() {
    const startMs = performance.now();
    notify.info("Logo Go senkronizasyonu başlatıldı", {
      description: "MESA server'a bağlanılıyor…",
    });
    // Simüle: 1.5sn sonra başarı
    setTimeout(() => {
      const sn = ((performance.now() - startMs) / 1000).toFixed(1);
      notify.success(`Senkronizasyon tamam · ${sn} sn`, {
        description: "47 yeni fatura · 12 yeni cari · 3 yeni hareket",
        aiAction: {
          label: "Sapma raporu hazırla",
          onAccept: () =>
            notify.info("AI sapma raporu hazırlanıyor", {
              description: "Anlık marj sapması ve nakit pozisyon analizi tamamlanınca bildirilecek.",
            }),
        },
      });
    }, 1500);
  }

  function demoOturumKapat() {
    notify.info("Oturum kapatma akisi demo modda hazir", {
      description:
        "Gercek kimlik dogrulama baglantisi sonraki asamada eklenecek. Mevcut yapida kullanici tercihleri ve firma kapsami korunuyor.",
    });
  }

  return (
    <div
      style={{
        ["--accent" as never]: firma.renk,
        background: TEMA.bg,
        color: TEMA.ink,
        minHeight: "100vh",
        fontFamily: FONT.ana,
        WebkitFontSmoothing: "antialiased",
      } as React.CSSProperties}
    >
      {/* Impersonation banner — süper yönetici farklı kullanıcı olarak bakarken */}
      <ImpersonationBanner
        goruntulenen={impersonation ? aktifKullanici : null}
        onGercege={() => kullaniciSec(GERCEK_KULLANICI)}
        gercekHitap={gercekKullanici.hitap}
      />

      <EliteHeader
        aktifSekme={sekme}
        onSekmeSec={setSekme}
        aktifFirma={gecerliFirma}
        erisilebilirFirmalar={aktifKullanici.firmaIzin}
        onFirmaSec={setAktif}
        aktifKullanici={aktifKullanici}
        onSearchClick={() => setPaletAcik(true)}
        onSyncClick={senkronTetikle}
        onProfileClick={() => setSeciciAcik(true)}
      />

      <KullaniciSecici
        acik={seciciAcik}
        onClose={() => setSeciciAcik(false)}
        gercekKullaniciId={GERCEK_KULLANICI}
        goruntulenenKullaniciId={goruntulenenId}
        onSec={kullaniciSec}
      />

      <CommandPalette
        open={paletAcik}
        onOpenChange={setPaletAcik}
        aktifFirma={gecerliFirma}
        erisilebilirFirmalar={aktifKullanici.firmaIzin}
        konsolideErisim={aktifKullanici.konsolideGorur}
        onSekmeSec={setSekme}
        onFirmaSec={setAktif}
      />

      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "24px 24px 80px",
        }}
      >
        <MaliTakvimRozetMini />
        <MansetBandi />

        {sekme === "nabiz" && (
          <NabizSayfasi firma={firma} finans={finans} aktifKullanici={aktifKullanici} />
        )}
        {sekme === "akis" && <AkisSayfasi firma={firma} finans={finans} />}
        {sekme === "yarin90" && <Yarin90GunSayfasi firma={firma} finans={finans} />}
        {sekme === "alacaklar" && <AlacaklarSayfasi firma={firma} finans={finans} />}
        {sekme === "ceksenet" && <CekSenetSayfasi firma={firma} finans={finans} />}
        {sekme === "urun" && <UrunMarjiSayfasi firma={firma} finans={finans} />}
        {sekme === "personel" && <PersonelSayfasi firma={firma} finans={finans} />}
        {sekme === "raporlar" && <RaporlarSayfasi firma={firma} finans={finans} />}
        {sekme === "vergi" && <VergiAtolyesiSayfasi firma={firma} finans={finans} />}
        {sekme === "grup" && aktifKullanici.konsolideGorur && <KonsolideSayfasi />}
        {sekme === "grup" && !aktifKullanici.konsolideGorur && (
          <div
            style={{
              padding: "60px 32px",
              textAlign: "center",
              background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
              border: `1px solid ${TEMA.border}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: TEMA.altin,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Erişim Sınırlı
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: TEMA.ink }}>
              Konsolide Grup yalnızca Çekirdek Ortaklara açık
            </h2>
            <p style={{ fontSize: 13, color: TEMA.inkSoft, marginTop: 8 }}>
              Bu görünüm 4 firmanın hepsine yetkili olan ortaklar içindir.
            </p>
          </div>
        )}
        {sekme === "isbirligi" && <IsBirligiSayfasi />}
        {sekme === "ayarlar" && (
          <AyarlarSayfasi
            firma={firma}
            aktifKullanici={aktifKullanici}
            onSyncClick={senkronTetikle}
            onSignOutClick={demoOturumKapat}
          />
        )}

        <footer
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: `1px solid ${TEMA.border}`,
            fontSize: 11,
            color: TEMA.inkFaded,
            display: "flex",
            justifyContent: "space-between",
            letterSpacing: "0.04em",
          }}
        >
          <span>
            Veri: Logo Go canlı sync ·{" "}
            {new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>Grup Şirketleri · MEBA · MESA · ELMOS · ARKON</span>
        </footer>
      </div>

      {/* AI Asistan FAB — sağ alt sabit, Cmd+K */}

      {/* Sonner Toaster mount — notify.* buradan render */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "transparent", border: "none", padding: 0, boxShadow: "none" },
        }}
      />

      <style>{`
        [data-anim] {
          animation: fadeUp 280ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        [data-anim='kpi']:nth-of-type(1) { animation-delay: 0ms; }
        [data-anim='kpi']:nth-of-type(2) { animation-delay: 50ms; }
        [data-anim='kpi']:nth-of-type(3) { animation-delay: 100ms; }
        [data-anim='kpi']:nth-of-type(4) { animation-delay: 150ms; }
        [data-anim='grafik'] { animation-delay: 200ms; }
        [data-anim='ozet']:nth-of-type(1) { animation-delay: 280ms; }
        [data-anim='ozet']:nth-of-type(2) { animation-delay: 330ms; }
        [data-anim='ozet']:nth-of-type(3) { animation-delay: 380ms; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1100px) {
          section[style*="2fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          section[style*="repeat(4, 1fr)"],
          section[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          section[style*="repeat(4, 1fr)"],
          section[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-anim] { animation: none; }
        }
      `}</style>
    </div>
  );
}
