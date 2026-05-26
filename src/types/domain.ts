export type FirmaId = "meba" | "mesa" | "elmos" | "arkon";

export type KullaniciId =
  | "mehmet-bakirdogen"
  | "mehmet-maras"
  | "fatih-lazoglu"
  | "ahmet-esmeray"
  | "konya-fatih";

export type KullaniciRol = "cekirdek-ortak" | "tek-firma-yoneticisi";

export interface Firma {
  id: FirmaId;
  unvan: string;
  kisaAd: string;
  isKolu: string;
  konum: string;
  web: string;
  renk: string;
  kurulus: number;
  /** public/firma-logo/ altındaki dosya adı (örn: "logo-meba.png") */
  logoDosya?: string;
}

export interface OrtaklikPay {
  ortak: KullaniciId | FirmaId;
  pay: number;
}

export interface Kullanici {
  id: KullaniciId;
  ad: string;
  hitap: string;
  rol: KullaniciRol;
  firmaIzin: FirmaId[];
  konsolideGorur: boolean;
  yonettigi: FirmaId[];
}

export interface AylikKpi {
  ay: string;
  ciro: number;
  brutMarj: number;
  netKar: number;
  alacak: number;
  borc: number;
  nakit: number;
}

export interface ParaHaritasiKategori {
  ad: string;
  tip: "gelir" | "gider";
  tutar: number;
  oran: number;
  trend: number;
  cariler: { ad: string; tutar: number }[];
}

export interface NakitGun {
  tarih: string;
  girisler: { kaynak: string; tutar: number; cari: string }[];
  cikislar: { kaynak: string; tutar: number; cari: string }[];
}

export interface CariFatura {
  no: string;
  tarih: string;
  tutar: number;
  vade: string;
  kalan: number;
  kalemler: { ad: string; miktar: number; birimFiyat: number; tutar: number }[];
}

export interface Cari {
  id: string;
  ad: string;
  tip: "musteri" | "tedarikci";
  toplamCiro: number;
  acikBakiye: number;
  vadesi: number;
  faturalar: CariFatura[];
}

export interface MaliTabloKalemi {
  ad: string;
  tutar: number;
  alt?: MaliTabloKalemi[];
}

/** 3 yıllık karşılaştırma için yıl trendi (Mehmet Bey direktifi 2026-05-26).
 *  Her ay aynı X noktasında 3 yıl üst üste — 2024 sönük, 2025 orta, 2026 accent. */
export interface YilTrendNoktasi {
  /** Türkçe kısa ay adı: "Oca", "Şub", "Mar", "Nis", "May", "Haz", ... */
  ay: string;
  y2024: number;
  y2025: number;
  y2026: number;
  /** Aylık hedef (yıllık hedef / 12), aynı seviyede yatay referans */
  hedef: number;
}

export interface FirmaFinans {
  firmaId: FirmaId;
  son12Ay: AylikKpi[];
  /** Takvim yılı bazlı 3 yıl × 12 ay karşılaştırma */
  yillarTrend: YilTrendNoktasi[];
  paraHaritasi: ParaHaritasiKategori[];
  nakit90Gun: NakitGun[];
  cariler: Cari[];
  bilanco: { aktif: MaliTabloKalemi[]; pasif: MaliTabloKalemi[] };
  gelirTablosu: MaliTabloKalemi[];
}
