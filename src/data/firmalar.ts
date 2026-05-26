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
  },
  mesa: {
    id: "mesa",
    unvan: "MESA Enerji ve Otomasyon Mühendislik A.Ş.",
    kisaAd: "MESA",
    isKolu: "Elektrik + otomasyon mühendislik (PLC/HMI/SCADA)",
    konum: "Kayseri Melikgazi OSB 12. cad. 5/9",
    web: "mesaenerji.com.tr",
    renk: "#8b5cf6",
    kurulus: 2008,
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
  },
};

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
