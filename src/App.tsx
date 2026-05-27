// App — Grup Şirketleri Finans Paneli ana orkestratör.
// 7 sayfa: Nabız / Akış / Alacaklar / Raporlar / Vergi / Konsolide / Ayarlar.
// + Toaster (sonner), CommandPalette (Cmd+K), MansetBandi.
// Aktif firmaya göre CSS var --accent dinamik kayar.

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { FIRMALAR } from "./data/firmalar";
import {
  FINANS_VERISI,
  MEVCUT_FIRMALAR,
  PANEL_MANSETLERI,
  PANEL_VERI_OZETI,
} from "./data/gercek-finans";
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

  const erisilebilirFirmalar = aktifKullanici.firmaIzin.filter((id) =>
    MEVCUT_FIRMALAR.includes(id),
  );
  const gecerliFirma: FirmaId = erisilebilirFirmalar.includes(aktif)
    ? aktif
    : (erisilebilirFirmalar[0] ?? "meba");

  const firma = FIRMALAR[gecerliFirma];
  const finans = FINANS_VERISI[gecerliFirma];

  useEffect(() => {
    if (gecerliFirma !== aktif) {
      setAktif(gecerliFirma);
    }
  }, [aktif, gecerliFirma]);

  useEffect(() => {
    if (sekme === "grup" || sekme === "isbirligi") {
      setSekme("nabiz");
    }
  }, [sekme]);

  function kullaniciSec(id: KullaniciId) {
    setGoruntulenenId(id);
    const yeniK = KULLANICILAR[id]!;
    const izinli = yeniK.firmaIzin.filter((firmaId) => MEVCUT_FIRMALAR.includes(firmaId));
    if (!izinli.includes(aktif)) {
      setAktif(izinli[0] ?? "meba");
    }
    if (sekme === "grup" || sekme === "isbirligi") setSekme("nabiz");
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
    notify.info("Veri yenileme hattı hazır", {
      description:
        "Bu sürüm masaüstündeki MEBA klasöründen üretilen gerçek kesitle çalışıyor. Canlı Logo Go bağlantısı açılınca bu düğme gerçek senkron başlatacak.",
    });
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
        erisilebilirFirmalar={erisilebilirFirmalar}
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
        erisilebilirFirmalar={erisilebilirFirmalar}
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
        <MansetBandi mansetler={PANEL_MANSETLERI} />

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
            Veri: {PANEL_VERI_OZETI.kaynakEtiketi} ·{" "}
            {new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>MEBA Mekanik · Son kesit {PANEL_VERI_OZETI.sonGuncelleme}</span>
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
