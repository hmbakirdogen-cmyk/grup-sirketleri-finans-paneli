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

export interface FirmaFinans {
  firmaId: FirmaId;
  son12Ay: AylikKpi[];
  paraHaritasi: ParaHaritasiKategori[];
  nakit90Gun: NakitGun[];
  cariler: Cari[];
  bilanco: { aktif: MaliTabloKalemi[]; pasif: MaliTabloKalemi[] };
  gelirTablosu: MaliTabloKalemi[];
}
