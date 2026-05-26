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

/** Türk B2B çek/senet portföyü — Logo Go cari modülünde mevcut veri.
 *  Mehmet Bey vurgu: Türk muhasebede kritik modül. */
export type CekSenetTip = "cek" | "senet";
export type CekSenetYon = "gelen" | "verilen";
export type CekSenetDurum =
  | "portfoyde"        // henüz vadesi gelmedi
  | "tahsilatta"        // bankaya verildi, tahsil edilecek
  | "tahsil-edildi"     // tahsil edildi (kapalı)
  | "karsiliksiz"       // karşılıksız çıktı (sorun)
  | "iade";             // iade edildi

export interface CekSenet {
  id: string;
  tip: CekSenetTip;
  yon: CekSenetYon;
  /** Çek/senedi veren veya verilen cari */
  cari: string;
  banka: string;
  /** Çek numarası veya senet referansı */
  belgeNo: string;
  tutar: number;
  /** ISO date — vade tarihi */
  vade: string;
  durum: CekSenetDurum;
  not?: string;
}

/** Ürün marjı analizi — Logo Go fatura kalemlerinden türetilir.
 *  V1 muhasebe odaklı: ciro = satış fatura kalemleri, maliyet = alış kalemleri. */
export interface UrunMarji {
  kod: string;
  ad: string;
  segment: string;
  /** Yıllık satılan adet */
  yillikSatisAdet: number;
  yillikCiro: number;
  yillikMaliyet: number;
  /** Brüt marj % */
  marj: number;
  /** En çok alan ilk 3 cari */
  topMusteriler: string[];
  /** Geçen yıla göre satış değişim (%) */
  trend: number;
}

export interface FirmaFinans {
  firmaId: FirmaId;
  son12Ay: AylikKpi[];
  /** Takvim yılı bazlı 3 yıl × 12 ay karşılaştırma */
  yillarTrend: YilTrendNoktasi[];
  paraHaritasi: ParaHaritasiKategori[];
  nakit90Gun: NakitGun[];
  cariler: Cari[];
  /** Çek/senet portföyü (alacak + verilen) */
  cekSenet: CekSenet[];
  /** Ürün/segment marjı analiz — Logo Go fatura kalemlerinden */
  urunMarji: UrunMarji[];
  bilanco: { aktif: MaliTabloKalemi[]; pasif: MaliTabloKalemi[] };
  gelirTablosu: MaliTabloKalemi[];
}
