import type {
  AylikKpi,
  Cari,
  FirmaFinans,
  FirmaId,
  MaliTabloKalemi,
  NakitGun,
  ParaHaritasiKategori,
  YilTrendNoktasi,
} from "@/types/domain";

const TAKVIM_AYLAR = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

/**
 * 3 yıllık takvim trendi üretir (2024 / 2025 / 2026).
 * Her ay için 3 yıl × ciro + aylık hedef.
 *
 * Mantık:
 *  - 2026 = mevcut ölçek (bazCiro civarı, mevsim varyans)
 *  - 2025 = 2026'nın ~%82'si (geçen yıl)
 *  - 2024 = 2026'nın ~%68'i (2 yıl önce)
 *  - Hedef = yıllık hedefin aylık eşdeğeri (2026 ortalama × 1.04)
 */
function uretYillarTrend(bazCiro: number, mevsimGenligi = 0.10): YilTrendNoktasi[] {
  return TAKVIM_AYLAR.map((ay, i) => {
    const mevsim = 1 + Math.sin((i / 12) * Math.PI * 2 + 0.6) * mevsimGenligi;
    const y2026 = Math.round(bazCiro * mevsim);
    const y2025 = Math.round(bazCiro * 0.82 * mevsim);
    const y2024 = Math.round(bazCiro * 0.68 * mevsim);
    const hedef = Math.round(bazCiro * 1.04);
    return { ay, y2024, y2025, y2026, hedef };
  });
}

const AYLAR = [
  "Haz 25", "Tem 25", "Ağu 25", "Eyl 25", "Eki 25", "Kas 25",
  "Ara 25", "Oca 26", "Şub 26", "Mar 26", "Nis 26", "May 26",
];

function uretKpi(
  basCiro: number,
  marjBaslangic: number,
  marjEgilimi: number,
): AylikKpi[] {
  return AYLAR.map((ay, i) => {
    const mevsim = 1 + Math.sin((i / 12) * Math.PI * 2) * 0.08;
    const buyume = 1 + i * 0.012;
    const ciro = Math.round(basCiro * mevsim * buyume);
    const marj = marjBaslangic + marjEgilimi * (i / 11);
    const brutKar = Math.round(ciro * (marj / 100));
    const netKar = Math.round(brutKar * 0.62);
    return {
      ay,
      ciro,
      brutMarj: Number(marj.toFixed(2)),
      netKar,
      alacak: Math.round(ciro * 1.45),
      borc: Math.round(ciro * 0.78),
      nakit: Math.round(ciro * 0.34 + i * 25000),
    };
  });
}

function uretNakit90(
  girisOrt: number,
  cikisOrt: number,
  musteriler: string[],
  tedarikciler: string[],
): NakitGun[] {
  const gunler: NakitGun[] = [];
  const bugun = new Date("2026-05-26");
  for (let g = 0; g < 90; g++) {
    const t = new Date(bugun);
    t.setDate(bugun.getDate() + g);
    const tarih = t.toISOString().slice(0, 10);
    const girisler =
      g % 3 === 0
        ? [
            {
              kaynak: "Tahsilat",
              tutar: Math.round(girisOrt * (0.7 + Math.random() * 0.6)),
              cari: musteriler[g % musteriler.length]!,
            },
          ]
        : [];
    const cikislar =
      g % 4 === 0
        ? [
            {
              kaynak: "Ödeme",
              tutar: Math.round(cikisOrt * (0.6 + Math.random() * 0.7)),
              cari: tedarikciler[g % tedarikciler.length]!,
            },
          ]
        : [];
    if (g % 30 === 15) {
      cikislar.push({ kaynak: "SGK + Vergi", tutar: Math.round(cikisOrt * 2.4), cari: "Devlet" });
    }
    gunler.push({ tarih, girisler, cikislar });
  }
  return gunler;
}

function uretCariler(
  musteriAdlari: string[],
  tedarikciAdlari: string[],
  ciroOlcek: number,
): Cari[] {
  const cariler: Cari[] = [];
  musteriAdlari.forEach((ad, i) => {
    const toplam = Math.round(ciroOlcek * (1 - i * 0.08));
    const acik = Math.round(toplam * 0.18);
    cariler.push({
      id: `m${i + 1}`,
      ad,
      tip: "musteri",
      toplamCiro: toplam,
      acikBakiye: acik,
      vadesi: 30 + (i % 4) * 15,
      faturalar: [
        {
          no: `FT-2026-${1000 + i}`,
          tarih: "2026-05-12",
          tutar: Math.round(acik * 0.6),
          vade: "2026-06-11",
          kalan: Math.round(acik * 0.6),
          kalemler: [
            { ad: "Ürün/Hizmet kalemi", miktar: 1, birimFiyat: Math.round(acik * 0.6), tutar: Math.round(acik * 0.6) },
          ],
        },
      ],
    });
  });
  tedarikciAdlari.forEach((ad, i) => {
    const toplam = Math.round(ciroOlcek * 0.7 * (1 - i * 0.08));
    const acik = Math.round(toplam * 0.22);
    cariler.push({
      id: `t${i + 1}`,
      ad,
      tip: "tedarikci",
      toplamCiro: toplam,
      acikBakiye: acik,
      vadesi: 45 + (i % 3) * 15,
      faturalar: [
        {
          no: `AF-2026-${500 + i}`,
          tarih: "2026-05-08",
          tutar: Math.round(acik * 0.55),
          vade: "2026-06-22",
          kalan: Math.round(acik * 0.55),
          kalemler: [
            { ad: "Alım kalemi", miktar: 1, birimFiyat: Math.round(acik * 0.55), tutar: Math.round(acik * 0.55) },
          ],
        },
      ],
    });
  });
  return cariler;
}

function bilancoOrnegi(donen: number, duran: number, kkb: number, ozk: number): {
  aktif: MaliTabloKalemi[]; pasif: MaliTabloKalemi[];
} {
  return {
    aktif: [
      { ad: "Dönen Varlıklar", tutar: donen, alt: [
        { ad: "Nakit ve Nakit Benzerleri", tutar: Math.round(donen * 0.18) },
        { ad: "Ticari Alacaklar", tutar: Math.round(donen * 0.52) },
        { ad: "Stoklar", tutar: Math.round(donen * 0.24) },
        { ad: "Diğer Dönen Varlıklar", tutar: Math.round(donen * 0.06) },
      ] },
      { ad: "Duran Varlıklar", tutar: duran, alt: [
        { ad: "Maddi Duran Varlıklar", tutar: Math.round(duran * 0.82) },
        { ad: "Maddi Olmayan Duran Varlıklar", tutar: Math.round(duran * 0.18) },
      ] },
    ],
    pasif: [
      { ad: "Kısa Vadeli Yabancı Kaynaklar", tutar: kkb, alt: [
        { ad: "Ticari Borçlar", tutar: Math.round(kkb * 0.58) },
        { ad: "Banka Kredileri", tutar: Math.round(kkb * 0.30) },
        { ad: "Diğer KV Borçlar", tutar: Math.round(kkb * 0.12) },
      ] },
      { ad: "Öz Kaynaklar", tutar: ozk, alt: [
        { ad: "Ödenmiş Sermaye", tutar: Math.round(ozk * 0.40) },
        { ad: "Geçmiş Yıl Karları", tutar: Math.round(ozk * 0.45) },
        { ad: "Dönem Net Karı", tutar: Math.round(ozk * 0.15) },
      ] },
    ],
  };
}

function gelirTablosuOrnegi(ciro: number, marj: number): MaliTabloKalemi[] {
  const sms = Math.round(ciro * (1 - marj / 100));
  const brut = ciro - sms;
  const fp = Math.round(brut * 0.45);
  const faaliyetKar = brut - fp;
  const finansman = Math.round(ciro * 0.04);
  const vergiOnceki = faaliyetKar - finansman;
  const vergi = Math.round(vergiOnceki * 0.22);
  return [
    { ad: "Net Satışlar", tutar: ciro },
    { ad: "Satışların Maliyeti", tutar: -sms },
    { ad: "Brüt Satış Karı", tutar: brut },
    { ad: "Faaliyet Giderleri", tutar: -fp, alt: [
      { ad: "Pazarlama Satış Dağıtım", tutar: -Math.round(fp * 0.45) },
      { ad: "Genel Yönetim", tutar: -Math.round(fp * 0.55) },
    ] },
    { ad: "Faaliyet Karı", tutar: faaliyetKar },
    { ad: "Finansman Giderleri", tutar: -finansman },
    { ad: "Vergi Öncesi Kar", tutar: vergiOnceki },
    { ad: "Vergi", tutar: -vergi },
    { ad: "Net Dönem Karı", tutar: vergiOnceki - vergi },
  ];
}

const MEBA_FINANS: FirmaFinans = {
  firmaId: "meba",
  son12Ay: uretKpi(2_400_000, 18.4, -2.1),
  yillarTrend: uretYillarTrend(2_460_000, 0.10),
  paraHaritasi: [
    { ad: "SMC Pnömatik", tip: "gelir", tutar: 18_240_000, oran: 62, trend: -3.2, cariler: [
      { ad: "ELMOS Otomasyon", tutar: 4_320_000 },
      { ad: "MESA Enerji", tutar: 3_180_000 },
      { ad: "Kayseri OSB müşterileri", tutar: 6_840_000 },
      { ad: "Konya/Ankara dağıtım", tutar: 3_900_000 },
    ] },
    { ad: "Mekanik komponent", tip: "gelir", tutar: 7_120_000, oran: 24, trend: +1.4, cariler: [
      { ad: "ELMOS Otomasyon", tutar: 2_840_000 },
      { ad: "Bölge bayileri", tutar: 4_280_000 },
    ] },
    { ad: "Mühendislik danışmanlık", tip: "gelir", tutar: 4_180_000, oran: 14, trend: +6.8, cariler: [
      { ad: "MESA Enerji", tutar: 2_400_000 },
      { ad: "Saha kurulum", tutar: 1_780_000 },
    ] },
    { ad: "Hammadde / İthalat", tip: "gider", tutar: 19_840_000, oran: 56, trend: +4.1, cariler: [
      { ad: "SMC Türkiye", tutar: 14_240_000 },
      { ad: "Ek tedarikçiler", tutar: 5_600_000 },
    ] },
    { ad: "Personel", tip: "gider", tutar: 6_240_000, oran: 18, trend: +2.0, cariler: [
      { ad: "Maaş + SGK", tutar: 6_240_000 },
    ] },
    { ad: "Kira + Genel", tip: "gider", tutar: 2_100_000, oran: 6, trend: +1.2, cariler: [
      { ad: "Depo + ofis", tutar: 2_100_000 },
    ] },
    { ad: "Vergi + Finansman", tip: "gider", tutar: 7_080_000, oran: 20, trend: +3.4, cariler: [
      { ad: "KDV/Stopaj/Vergi", tutar: 4_680_000 },
      { ad: "Banka faiz/komisyon", tutar: 2_400_000 },
    ] },
  ],
  nakit90Gun: uretNakit90(420_000, 380_000,
    ["ELMOS Otomasyon", "MESA Enerji", "Kayseri OSB A", "Konya Bayi"],
    ["SMC Türkiye", "Maaş", "Banka Kredi", "Kira"]),
  cariler: uretCariler(
    ["ELMOS Otomasyon", "MESA Enerji", "Kayseri OSB A", "Konya Bayi", "Ankara Dağıtım"],
    ["SMC Türkiye", "Lojistik A.Ş.", "OSB Ofis Hizmetleri"],
    18_000_000,
  ),
  bilanco: bilancoOrnegi(24_800_000, 8_400_000, 14_200_000, 19_000_000),
  gelirTablosu: gelirTablosuOrnegi(29_540_000, 16.3),
};

const MESA_FINANS: FirmaFinans = {
  firmaId: "mesa",
  son12Ay: uretKpi(3_800_000, 22.8, +0.8),
  yillarTrend: uretYillarTrend(4_380_000, 0.12),
  paraHaritasi: [
    { ad: "PLC / SCADA projeleri", tip: "gelir", tutar: 28_400_000, oran: 54, trend: +5.2, cariler: [
      { ad: "Endüstri Tesisleri", tutar: 18_200_000 },
      { ad: "Su / Enerji Kurumları", tutar: 10_200_000 },
    ] },
    { ad: "Saha kurulum / devreye alma", tip: "gelir", tutar: 14_800_000, oran: 28, trend: +2.4, cariler: [
      { ad: "Proje cariler", tutar: 14_800_000 },
    ] },
    { ad: "Bakım sözleşmeleri", tip: "gelir", tutar: 9_400_000, oran: 18, trend: +8.6, cariler: [
      { ad: "Yıllık kontrat müşterileri", tutar: 9_400_000 },
    ] },
    { ad: "Komponent + ekipman", tip: "gider", tutar: 22_800_000, oran: 48, trend: +3.2, cariler: [
      { ad: "MEBA Mekanik", tutar: 3_180_000 },
      { ad: "ELMOS Otomasyon", tutar: 4_400_000 },
      { ad: "Yurt dışı muhtelif", tutar: 15_220_000 },
    ] },
    { ad: "Mühendislik personel", tip: "gider", tutar: 12_800_000, oran: 27, trend: +4.1, cariler: [
      { ad: "Maaş + SGK", tutar: 12_800_000 },
    ] },
    { ad: "Genel + Operasyon", tip: "gider", tutar: 4_200_000, oran: 9, trend: +1.8, cariler: [
      { ad: "Ofis + araç", tutar: 4_200_000 },
    ] },
    { ad: "Vergi + Finansman", tip: "gider", tutar: 7_600_000, oran: 16, trend: +2.4, cariler: [
      { ad: "Vergi", tutar: 5_200_000 },
      { ad: "Banka", tutar: 2_400_000 },
    ] },
  ],
  nakit90Gun: uretNakit90(680_000, 540_000,
    ["Endüstri Tesisleri A", "Su Kurumu", "Bakım kontratları"],
    ["ELMOS", "MEBA", "Yurt dışı tedarikçi", "Maaş"]),
  cariler: uretCariler(
    ["Endüstri Tesisleri A", "Su Kurumu", "Enerji Dağıtım", "OSB Fabrika B", "Bakım Müşterileri"],
    ["ELMOS Otomasyon", "MEBA Mekanik", "Yurt dışı tedarikçi"],
    32_000_000,
  ),
  bilanco: bilancoOrnegi(38_400_000, 14_200_000, 19_800_000, 32_800_000),
  gelirTablosu: gelirTablosuOrnegi(52_600_000, 23.4),
};

const ELMOS_FINANS: FirmaFinans = {
  firmaId: "elmos",
  son12Ay: uretKpi(3_100_000, 19.6, +1.4),
  yillarTrend: uretYillarTrend(3_600_000, 0.09),
  paraHaritasi: [
    { ad: "Özel makine üretim", tip: "gelir", tutar: 26_800_000, oran: 62, trend: +4.8, cariler: [
      { ad: "OSB Sanayi müşterileri", tutar: 18_400_000 },
      { ad: "Yurt dışı sipariş", tutar: 8_400_000 },
    ] },
    { ad: "Mekatronik proje", tip: "gelir", tutar: 11_200_000, oran: 26, trend: +2.2, cariler: [
      { ad: "MESA Enerji (proje paylaşımı)", tutar: 4_400_000 },
      { ad: "Diğer projeler", tutar: 6_800_000 },
    ] },
    { ad: "Yedek parça + servis", tip: "gelir", tutar: 5_200_000, oran: 12, trend: +5.6, cariler: [
      { ad: "Yıllık servis cariler", tutar: 5_200_000 },
    ] },
    { ad: "Hammadde + komponent", tip: "gider", tutar: 18_400_000, oran: 49, trend: +3.1, cariler: [
      { ad: "MEBA Mekanik", tutar: 4_320_000 },
      { ad: "MEBA Mekanik (komponent)", tutar: 2_840_000 },
      { ad: "Çelik + sac tedarik", tutar: 8_240_000 },
      { ad: "Yurt dışı ithalat", tutar: 3_000_000 },
    ] },
    { ad: "Üretim personel", tip: "gider", tutar: 10_800_000, oran: 29, trend: +3.4, cariler: [
      { ad: "Maaş + SGK", tutar: 10_800_000 },
    ] },
    { ad: "Atölye + enerji", tip: "gider", tutar: 3_400_000, oran: 9, trend: +6.2, cariler: [
      { ad: "Atölye işletme", tutar: 3_400_000 },
    ] },
    { ad: "Vergi + Finansman", tip: "gider", tutar: 5_080_000, oran: 13, trend: +2.0, cariler: [
      { ad: "Vergi", tutar: 3_400_000 },
      { ad: "Banka", tutar: 1_680_000 },
    ] },
  ],
  nakit90Gun: uretNakit90(540_000, 480_000,
    ["OSB Sanayi A", "Yurt dışı sipariş", "MESA Enerji"],
    ["MEBA Mekanik", "Çelik tedarik", "Maaş"]),
  cariler: uretCariler(
    ["OSB Sanayi A", "OSB Sanayi B", "Yurt Dışı Sipariş", "MESA Enerji", "Servis Müşterileri"],
    ["MEBA Mekanik", "Çelik Tedarik", "Yurt dışı komponent"],
    25_000_000,
  ),
  bilanco: bilancoOrnegi(31_200_000, 16_800_000, 18_400_000, 29_600_000),
  gelirTablosu: gelirTablosuOrnegi(43_200_000, 19.8),
};

const ARKON_FINANS: FirmaFinans = {
  firmaId: "arkon",
  son12Ay: uretKpi(1_800_000, 16.8, +0.4),
  yillarTrend: uretYillarTrend(1_830_000, 0.14),
  paraHaritasi: [
    { ad: "Otomasyon proje (Konya bölge)", tip: "gelir", tutar: 14_400_000, oran: 65, trend: +1.8, cariler: [
      { ad: "Konya OSB müşterileri", tutar: 9_200_000 },
      { ad: "Çevre il sanayi", tutar: 5_200_000 },
    ] },
    { ad: "Vision + Motion sistemleri", tip: "gelir", tutar: 5_400_000, oran: 25, trend: +3.6, cariler: [
      { ad: "Vision proje cariler", tutar: 5_400_000 },
    ] },
    { ad: "Yedek parça + servis", tip: "gelir", tutar: 2_200_000, oran: 10, trend: +2.4, cariler: [
      { ad: "Servis cariler", tutar: 2_200_000 },
    ] },
    { ad: "Lenze/Honeywell/Phoenix ithal", tip: "gider", tutar: 10_400_000, oran: 51, trend: +5.4, cariler: [
      { ad: "Lenze TR", tutar: 4_800_000 },
      { ad: "Honeywell", tutar: 3_400_000 },
      { ad: "Phoenix", tutar: 2_200_000 },
    ] },
    { ad: "Personel", tip: "gider", tutar: 5_200_000, oran: 26, trend: +3.0, cariler: [
      { ad: "Maaş + SGK", tutar: 5_200_000 },
    ] },
    { ad: "Ofis + operasyon", tip: "gider", tutar: 1_800_000, oran: 9, trend: +1.4, cariler: [
      { ad: "Konya ofis", tutar: 1_800_000 },
    ] },
    { ad: "Vergi + Finansman", tip: "gider", tutar: 2_800_000, oran: 14, trend: +2.8, cariler: [
      { ad: "Vergi", tutar: 1_800_000 },
      { ad: "Banka", tutar: 1_000_000 },
    ] },
  ],
  nakit90Gun: uretNakit90(280_000, 240_000,
    ["Konya OSB A", "Çevre il sanayi", "Vision müşterileri"],
    ["Lenze TR", "Honeywell", "Maaş"]),
  cariler: uretCariler(
    ["Konya OSB A", "Konya OSB B", "Aksaray Sanayi", "Niğde Müşteri", "Vision Proje"],
    ["Lenze TR", "Honeywell TR", "Phoenix TR"],
    14_000_000,
  ),
  bilanco: bilancoOrnegi(16_800_000, 7_200_000, 11_400_000, 12_600_000),
  gelirTablosu: gelirTablosuOrnegi(22_000_000, 17.2),
};

export const FINANS_VERISI: Record<FirmaId, FirmaFinans> = {
  meba: MEBA_FINANS,
  mesa: MESA_FINANS,
  elmos: ELMOS_FINANS,
  arkon: ARKON_FINANS,
};

export interface KonsolideOzet {
  toplamCiro: number;
  toplamBrutKar: number;
  toplamNetKar: number;
  toplamAlacak: number;
  toplamBorc: number;
  toplamNakit: number;
  ortalamaMarj: number;
  grupIciDüsulen: number;
}

const GRUP_ICI_ALIM_SATIM_TUTARI = 14_500_000;

export function konsolideOzetUret(): KonsolideOzet {
  const firmaIds: FirmaId[] = ["meba", "mesa", "elmos", "arkon"];
  let toplamCiro = 0;
  let toplamBrutKar = 0;
  let toplamNetKar = 0;
  let toplamAlacak = 0;
  let toplamBorc = 0;
  let toplamNakit = 0;
  firmaIds.forEach((f) => {
    const son = FINANS_VERISI[f].son12Ay[FINANS_VERISI[f].son12Ay.length - 1]!;
    toplamCiro += son.ciro * 12;
    toplamBrutKar += son.ciro * 12 * (son.brutMarj / 100);
    toplamNetKar += son.netKar * 12;
    toplamAlacak += son.alacak;
    toplamBorc += son.borc;
    toplamNakit += son.nakit;
  });
  toplamCiro -= GRUP_ICI_ALIM_SATIM_TUTARI;
  return {
    toplamCiro,
    toplamBrutKar: Math.round(toplamBrutKar),
    toplamNetKar,
    toplamAlacak,
    toplamBorc,
    toplamNakit,
    ortalamaMarj: Number(((toplamBrutKar / toplamCiro) * 100).toFixed(2)),
    grupIciDüsulen: GRUP_ICI_ALIM_SATIM_TUTARI,
  };
}
