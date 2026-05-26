import type { Kullanici, KullaniciId } from "@/types/domain";

export const KULLANICILAR: Record<KullaniciId, Kullanici> = {
  "mehmet-bakirdogen": {
    id: "mehmet-bakirdogen",
    ad: "Mehmet Bakırdöğen",
    hitap: "Mehmet Bakırdöğen Bey",
    rol: "tek-firma-yoneticisi",
    firmaIzin: ["meba"],
    konsolideGorur: false,
    yonettigi: ["meba"],
  },
  "mehmet-maras": {
    id: "mehmet-maras",
    ad: "Mehmet Maraş",
    hitap: "Mehmet Maraş Bey",
    rol: "cekirdek-ortak",
    firmaIzin: ["meba", "mesa", "elmos", "arkon"],
    konsolideGorur: true,
    yonettigi: ["mesa"],
  },
  "fatih-lazoglu": {
    id: "fatih-lazoglu",
    ad: "Fatih Lazoğlu",
    hitap: "Fatih Lazoğlu Bey",
    rol: "cekirdek-ortak",
    firmaIzin: ["meba", "mesa", "elmos", "arkon"],
    konsolideGorur: true,
    yonettigi: ["mesa"],
  },
  "ahmet-esmeray": {
    id: "ahmet-esmeray",
    ad: "Ahmet Esmeray",
    hitap: "Ahmet Esmeray Bey",
    rol: "cekirdek-ortak",
    firmaIzin: ["meba", "mesa", "elmos", "arkon"],
    konsolideGorur: true,
    yonettigi: ["elmos"],
  },
  "konya-fatih": {
    id: "konya-fatih",
    ad: "Fatih (Konya)",
    hitap: "Fatih Bey",
    rol: "tek-firma-yoneticisi",
    firmaIzin: ["arkon"],
    konsolideGorur: false,
    yonettigi: ["arkon"],
  },
};

export const KULLANICI_LISTESI = Object.values(KULLANICILAR);

export function firmayaErisebilir(
  kullanici: Kullanici,
  firmaId: import("@/types/domain").FirmaId,
): boolean {
  return kullanici.firmaIzin.includes(firmaId);
}
