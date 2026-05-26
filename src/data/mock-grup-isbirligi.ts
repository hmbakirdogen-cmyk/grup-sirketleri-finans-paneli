// Grup İçi İş Geliştirme verisi (Katman 3).
// Tüm 5 kullanıcıya açık — finansal değil, ilişki/fırsat odaklı.
// Memory project_dortlu_grup: Katman 3 KATI içerik (çapraz fırsat,
// ortak müşteri, yönlendirme defteri, tedarikçi havuzu).

import type { FirmaId } from "@/types/domain";

export interface CaprazFirsat {
  id: string;
  kaynakFirma: FirmaId;
  hedefFirma: FirmaId;
  musteri: string;
  sektor: string;
  potansiyelTutar: number;
  durum: "yeni" | "değerlendiriliyor" | "iletildi";
  not: string;
  tarih: string;
}

export interface OrtakMusteri {
  ad: string;
  sektor: string;
  firmalar: { firmaId: FirmaId; ciro12Ay: number }[];
  toplam: number;
}

export interface YonlendirmeKaydi {
  id: string;
  tarih: string;
  kaynakFirma: FirmaId;
  hedefFirma: FirmaId;
  musteri: string;
  konu: string;
  sonuc: "açık" | "kapandı" | "iptal";
  tutar?: number;
}

export interface TedarikciOrtak {
  ad: string;
  segmenti: string;
  iskontoOrani: number;
  kullanan: FirmaId[];
  yillikHacim: number;
  not: string;
}

// ===========================================================================
// MOCK VERİ
// ===========================================================================

export const CAPRAZ_FIRSATLAR: CaprazFirsat[] = [
  {
    id: "f1",
    kaynakFirma: "meba",
    hedefFirma: "elmos",
    musteri: "Tekgül Makine A.Ş.",
    sektor: "Endüstriyel makine",
    potansiyelTutar: 2_400_000,
    durum: "yeni",
    not: "SMC pnömatik kullanan firma; ELMOS özel makine talebi var.",
    tarih: "2026-05-25",
  },
  {
    id: "f2",
    kaynakFirma: "mesa",
    hedefFirma: "meba",
    musteri: "Bursa OSB · Tekstil Tesisi",
    sektor: "Tekstil",
    potansiyelTutar: 1_800_000,
    durum: "değerlendiriliyor",
    not: "MESA PLC projesi sırasında pnömatik sistem ihtiyacı görüldü.",
    tarih: "2026-05-22",
  },
  {
    id: "f3",
    kaynakFirma: "arkon",
    hedefFirma: "mesa",
    musteri: "Konya Şeker Sanayi",
    sektor: "Gıda · Şeker üretim",
    potansiyelTutar: 4_500_000,
    durum: "iletildi",
    not: "Konya'da ARKON vision projesi tamamlandı; SCADA güncelleme isteniyor.",
    tarih: "2026-05-18",
  },
  {
    id: "f4",
    kaynakFirma: "elmos",
    hedefFirma: "meba",
    musteri: "Kayseri Demir-Çelik",
    sektor: "Metal",
    potansiyelTutar: 920_000,
    durum: "yeni",
    not: "Makine teslimatı sonrası pnömatik yedek parça talebi geldi.",
    tarih: "2026-05-26",
  },
  {
    id: "f5",
    kaynakFirma: "meba",
    hedefFirma: "arkon",
    musteri: "Niğde Süt Sanayi",
    sektor: "Gıda · Süt",
    potansiyelTutar: 1_350_000,
    durum: "yeni",
    not: "MEBA bayi ziyaretinde vision kontrol ihtiyacı duyuldu.",
    tarih: "2026-05-26",
  },
];

export const ORTAK_MUSTERILER: OrtakMusteri[] = [
  {
    ad: "Tekgül Makine A.Ş.",
    sektor: "Endüstriyel makine",
    firmalar: [
      { firmaId: "meba", ciro12Ay: 8_400_000 },
      { firmaId: "mesa", ciro12Ay: 3_200_000 },
    ],
    toplam: 11_600_000,
  },
  {
    ad: "Konya Şeker Sanayi",
    sektor: "Gıda · Şeker",
    firmalar: [
      { firmaId: "arkon", ciro12Ay: 5_100_000 },
      { firmaId: "mesa", ciro12Ay: 2_400_000 },
    ],
    toplam: 7_500_000,
  },
  {
    ad: "Bursa OSB · Tekstil",
    sektor: "Tekstil",
    firmalar: [
      { firmaId: "mesa", ciro12Ay: 4_200_000 },
      { firmaId: "meba", ciro12Ay: 1_400_000 },
      { firmaId: "elmos", ciro12Ay: 900_000 },
    ],
    toplam: 6_500_000,
  },
  {
    ad: "Sivas Makine Yedek",
    sektor: "Yedek parça",
    firmalar: [
      { firmaId: "elmos", ciro12Ay: 2_100_000 },
      { firmaId: "meba", ciro12Ay: 1_200_000 },
    ],
    toplam: 3_300_000,
  },
];

export const YONLENDIRME_DEFTERI: YonlendirmeKaydi[] = [
  {
    id: "y1",
    tarih: "2026-05-12",
    kaynakFirma: "meba",
    hedefFirma: "arkon",
    musteri: "Konya OSB · Otomotiv yan sanayi",
    konu: "Vision sistem teklifi",
    sonuc: "açık",
    tutar: 1_800_000,
  },
  {
    id: "y2",
    tarih: "2026-04-28",
    kaynakFirma: "arkon",
    hedefFirma: "meba",
    musteri: "Aksaray Sanayi A",
    konu: "Pnömatik silindir tedariki",
    sonuc: "kapandı",
    tutar: 640_000,
  },
  {
    id: "y3",
    tarih: "2026-04-20",
    kaynakFirma: "mesa",
    hedefFirma: "elmos",
    musteri: "Endüstri Tesisleri B",
    konu: "Özel makine üretim teklifi",
    sonuc: "kapandı",
    tutar: 3_200_000,
  },
  {
    id: "y4",
    tarih: "2026-04-15",
    kaynakFirma: "meba",
    hedefFirma: "mesa",
    musteri: "Kayseri OSB · Plastik enj.",
    konu: "PLC entegrasyon danışmanlık",
    sonuc: "açık",
    tutar: 420_000,
  },
  {
    id: "y5",
    tarih: "2026-03-30",
    kaynakFirma: "elmos",
    hedefFirma: "meba",
    musteri: "OSB Sanayi C",
    konu: "Pnömatik komponent kontratı",
    sonuc: "iptal",
  },
];

export const TEDARIKCI_HAVUZU: TedarikciOrtak[] = [
  {
    ad: "SMC Türkiye",
    segmenti: "Pnömatik komponent",
    iskontoOrani: 18,
    kullanan: ["meba", "mesa", "elmos"],
    yillikHacim: 18_400_000,
    not: "MEBA ana distribütör; MESA ve ELMOS dolaylı alım yapıyor.",
  },
  {
    ad: "Lenze TR",
    segmenti: "Motor sürücü / motion",
    iskontoOrani: 12,
    kullanan: ["arkon", "elmos"],
    yillikHacim: 6_800_000,
    not: "ARKON ana satıcı; ELMOS özel makine için kullanıyor.",
  },
  {
    ad: "Phoenix Contact TR",
    segmenti: "Endüstriyel bağlantı",
    iskontoOrani: 14,
    kullanan: ["arkon", "mesa"],
    yillikHacim: 3_200_000,
    not: "Tek tedarikçiden 4 firma birden alım yapsa hacim avantajı oluşur.",
  },
  {
    ad: "Honeywell PMC",
    segmenti: "Süreç kontrol / DCS",
    iskontoOrani: 10,
    kullanan: ["arkon"],
    yillikHacim: 2_100_000,
    not: "ARKON özel; MESA ve ELMOS için ortak kontrat değerlendirilebilir.",
  },
];
