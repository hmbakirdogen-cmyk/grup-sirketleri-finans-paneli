// AyarlarSayfasi — kullanıcı + firma + bildirim + veri kaynağı.
// Sade tek sayfa, sol nav + sağ form yerine üst-alt blok yığını.

import { useState } from "react";
import { User, Building2, Bell, Database, LogOut } from "lucide-react";
import { TEMA, FONT } from "@/lib/tema";
import type { Firma, Kullanici } from "@/types/domain";

interface Props {
  firma: Firma;
  aktifKullanici: Kullanici;
}

type Bolum = "profil" | "firma" | "bildirim" | "veri" | "cikis";

export function AyarlarSayfasi({ firma, aktifKullanici }: Props) {
  const [bolum, setBolum] = useState<Bolum>("profil");

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
          {bolum === "veri" && <VeriBolum />}
          {bolum === "cikis" && <CikisBolum />}
        </div>
      </section>
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

function VeriBolum() {
  return (
    <>
      <BaslikBlok baslik="Veri Kaynağı" alt="Logo Go bağlantısı ve sync durumu" />
      <SatirEtiketDeger etiket="Logo Go Server" deger="MESA · 192.168.1.10" accent={TEMA.yesil} />
      <SatirEtiketDeger etiket="Sync Durumu" deger="Bağlı · son sync 12 saniye önce" accent={TEMA.yesil} />
      <SatirEtiketDeger etiket="Sync Frekansı" deger="Her gece 02:00" />
      <SatirEtiketDeger etiket="e-Defter / GİB API" deger="Yapılandırılmadı" accent={TEMA.altin} />
      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: `linear-gradient(180deg, ${TEMA.mavi}, #4178d4)`,
            color: "white",
            border: "none",
            fontFamily: FONT.ana,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.20), 0 6px 16px rgba(91,157,255,0.40)",
          }}
        >
          Şimdi Sync Et
        </button>
      </div>
    </>
  );
}

function CikisBolum() {
  return (
    <>
      <BaslikBlok baslik="Çıkış" alt="Oturumu kapat ve giriş ekranına dön" />
      <p style={{ fontSize: 13, color: TEMA.inkSoft, marginBottom: 20 }}>
        Bilgilerinizi kaydederek çıkış yaparsanız bir sonraki girişinizde panele aynı yerden devam edebilirsiniz.
      </p>
      <button
        type="button"
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
