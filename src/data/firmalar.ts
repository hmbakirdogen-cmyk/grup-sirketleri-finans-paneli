import type { Firma, FirmaId, OrtaklikPay } from "@/types/domain";

export const FIRMALAR: Record<FirmaId, Firma> = {
  meba: {
    id: "meba",
    unvan: "MEBA Mekanik Sanayi ve Ticaret A.Ş.",
    kisaAd: "MEBA",
    isKolu: "SMC pnömatik komponent distribütörlüğü",
    konum: "Kayseri",
    web: "mebamekanik.com.tr",
    renk: "#0ea5e9",
    kurulus: 2015,
    logoDosya: "logo-meba.png",
  },
  mesa: {
    id: "mesa",
    unvan: "MESA Enerji ve Otomasyon Mühendislik A.Ş.",
    kisaAd: "MESA",
    isKolu: "Elektrik + otomasyon mühendislik (PLC/HMI/SCADA)",
    konum: "Kayseri Melikgazi OSB 12. cad. 5/9",
    web: "mesaenerji.com.tr",
    // Mehmet Bey direktifi 2026-05-26: MESA imza rengi mor (#8b5cf6) → kırmızı (#dc2626).
    // Kurumsal kırmızı, saf bayrak çağrışımı yok (red-600); MESA güçlü/ciddi kimlik.
    renk: "#dc2626",
    kurulus: 2008,
    logoDosya: "logo-mesa.png",
  },
  elmos: {
    id: "elmos",
    unvan: "ELMOS Otomasyon Sanayi A.Ş.",
    kisaAd: "ELMOS",
    isKolu: "Makine tasarım + üretim, mekatronik",
    konum: "Kayseri Melikgazi OSB 12. cad. No:45 (1000 m²)",
    web: "elmos.com.tr",
    renk: "#10b981",
    kurulus: 2014,
    logoDosya: "logo-elmos.png",
  },
  arkon: {
    id: "arkon",
    unvan: "ARKON Otomasyon Sanayi ve Ticaret Ltd. Şti.",
    kisaAd: "ARKON",
    isKolu: "Otomasyon (PC yazılım, vision, motion · Lenze/Honeywell/Phoenix)",
    konum: "Konya Karatay Fevziçakmak Mah.",
    web: "arkonotomasyon.com.tr",
    renk: "#f59e0b",
    kurulus: 2010,
    logoDosya: "logo-arkon.svg",
  },
};

/** Helper: firma için logo URL'i veya null */
export function firmaLogoUrl(firmaId: FirmaId): string | null {
  const f = FIRMALAR[firmaId];
  return f.logoDosya ? `/firma-logo/${f.logoDosya}` : null;
}

export const ORTAKLIK_MATRISI: Record<FirmaId, OrtaklikPay[]> = {
  mesa: [
    { ortak: "fatih-lazoglu", pay: 1 / 3 },
    { ortak: "mehmet-maras", pay: 1 / 3 },
    { ortak: "ahmet-esmeray", pay: 1 / 3 },
  ],
  elmos: [
    { ortak: "fatih-lazoglu", pay: 1 / 3 },
    { ortak: "mehmet-maras", pay: 1 / 3 },
    { ortak: "ahmet-esmeray", pay: 1 / 3 },
  ],
  meba: [
    { ortak: "mesa", pay: 1 / 2 },
    { ortak: "mehmet-bakirdogen", pay: 1 / 2 },
  ],
  arkon: [
    { ortak: "mesa", pay: 1 / 2 },
    { ortak: "konya-fatih", pay: 1 / 2 },
  ],
};

export const FIRMA_LISTESI = Object.values(FIRMALAR);
