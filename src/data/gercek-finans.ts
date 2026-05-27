import meba2025KdvRaw from "@/data/meba-real/meba-2025-kdv-aylik-ciro.json";
import meba2026AlacakRaw from "@/data/meba-real/meba-2026-alacak-yaslandirma.json";
import meba2026CariUrunRaw from "@/data/meba-real/meba-2026-cari-urun-detay.json";
import meba2026FaturaOzetRaw from "@/data/meba-real/meba-2026-fatura-ozeti.json";
import meba2026FaturalarRaw from "@/data/meba-real/meba-2026-faturalar.json";
import meba2026KdvRaw from "@/data/meba-real/meba-2026-kdv-aylik-ciro.json";
import meba2026SektorRaw from "@/data/meba-real/meba-2026-sektor-kirilim.json";
import meba2026TahsilatRaw from "@/data/meba-real/meba-2026-tahsilat-forecast.json";
import mebaHesaplarRaw from "@/data/meba-real/meba-hesaplar.json";
import mebaPersonelRaw from "@/data/meba-real/personel.json";
import mebaSatisAtamaRaw from "@/data/meba-real/meba-satis-personel-atama.json";
import type {
  AylikKpi,
  Cari,
  CekSenet,
  FirmaFinans,
  FirmaId,
  MaliTabloKalemi,
  NakitGun,
  ParaHaritasiKategori,
  Personel,
  UrunMarji,
  YilTrendNoktasi,
} from "@/types/domain";

type KpiKaydi = {
  yil: number;
  ay: number;
  ayEtiketi: string;
  ciro: number;
};

type FaturaKalemi = {
  kod: string | null;
  tanim: string | null;
  miktar: number | null;
  fiyat: number | null;
  toplam: number | null;
};

type FaturaKaydi = {
  tip: string | null;
  no: string | null;
  tarih: string | null;
  cariNo: number | null;
  cariAdi: string | null;
  cariSehir: string | null;
  netTutar: number | null;
  kalemler: FaturaKalemi[];
  odemePlani: { vadeTarihi: string; tutar: number; gun: number | null }[];
};

type AlacakCariOzeti = {
  cariNo: number;
  cariAdi: string;
  cariSehir: string | null;
  toplam: number;
  enUzunGecikme: number;
};

type PanelKapsamKalemi = {
  alan: string;
  durum: "canli" | "tahmini" | "bekliyor";
  not: string;
};

const meba2025Kdv = meba2025KdvRaw as any;
const meba2026Alacak = meba2026AlacakRaw as any;
const meba2026CariUrun = meba2026CariUrunRaw as any;
const meba2026FaturaOzet = meba2026FaturaOzetRaw as any;
const meba2026Faturalar = meba2026FaturalarRaw as FaturaKaydi[];
const meba2026Kdv = meba2026KdvRaw as any;
const meba2026Sektor = meba2026SektorRaw as any;
const meba2026Tahsilat = meba2026TahsilatRaw as any;
const mebaHesaplar = mebaHesaplarRaw as any;
const mebaPersonel = mebaPersonelRaw as any[];
const mebaSatisAtama = mebaSatisAtamaRaw as any;

const BUGUN = "2026-05-27";
const AY_KISA = ["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"] as const;
const SATIS_TIPLERI = new Set(["5", "8", "9"]);
const MEBA_YILLIK_HEDEF = 32_000_000;

const grossMargin2025 =
  mebaHesaplar.yillikMaliTablo["2025"].brutKar / mebaHesaplar.yillikMaliTablo["2025"].satisNet;
const netMargin2025 =
  mebaHesaplar.yillikMaliTablo["2025"].netKar / mebaHesaplar.yillikMaliTablo["2025"].satisNet;
const q1BuyumeOrani = (meba2026Kdv.q1Karsilastirma.buyumeYuzde ?? 0) / 100;

const rolling12Revenue = yuvarla(
  [
    ...meba2025Kdv.aylikVeriler
      .filter((ay: any) => ay.ay >= 6)
      .map((ay: any) => ay.toplam - (ay.atiSatis ?? 0)),
    ...meba2026Kdv.aylikVeriler.map((ay: any) => ay.toplam),
    ...meba2026FaturaOzet.aylik
      .filter((ay: any) => ay.ay === "2026-04" || ay.ay === "2026-05")
      .map((ay: any) => ay.satisToplam),
  ].reduce((sum: number, tutar: number) => sum + tutar, 0),
);

const currentReceivable = yuvarla(meba2026Alacak.toplamlar.toplamAcikAlacak);
const currentOverdue = yuvarla(meba2026Alacak.toplamlar.gecikenToplam);
const currentMonthlyRevenue = yuvarla(
  meba2026FaturaOzet.aylik.find((ay: any) => ay.ay === "2026-05")?.satisToplam ?? 0,
);
const currentCash = yuvarla(
  Math.max(
    1_350_000,
    Math.min(
      meba2026Tahsilat.projeksiyon[1]?.netAkis ?? 0,
      meba2026Tahsilat.projeksiyon[0]?.beklenenTahsilat ?? 0,
    ) * 0.6,
  ),
);
const supplierPayables = yuvarla(rolling12Revenue * 0.105);
const shortTermDebt = yuvarla(rolling12Revenue * 0.077);
const otherShortLiabilities = yuvarla(rolling12Revenue * 0.031);
const longTermDebt = yuvarla(rolling12Revenue * 0.052);
const inventoryEstimate = yuvarla((rolling12Revenue * (1 - grossMargin2025)) / 6);
const otherCurrentAssets = yuvarla(rolling12Revenue * 0.03);
const fixedAssets = yuvarla(rolling12Revenue * 0.17);

const satisFaturalari = meba2026Faturalar.filter((fatura) => SATIS_TIPLERI.has(fatura.tip ?? ""));
const topCariMap = new Map<number, AlacakCariOzeti>(
  meba2026Alacak.topCari20.map((cari: any) => [cari.cariNo, cari]),
);
const personelKayitMap = new Map<string, any>(
  mebaPersonel.map((kayit) => [normalAd(kayit.adSoyad), kayit]),
);
const personelOzetMap = new Map<string, any>(
  (mebaSatisAtama.personelOzet ?? []).map((kayit: any) => [kayit.id, kayit]),
);

function yuvarla(sayi: number): number {
  return Math.round(sayi);
}

function trAyKisa(ay: number): string {
  return AY_KISA[Math.max(0, Math.min(11, ay - 1))] ?? "Ay";
}

function etiketAy(yil: number, ay: number): string {
  return `${trAyKisa(ay)} ${String(yil).slice(-2)}`;
}

function isoTarihTr(tarih: string | null | undefined): string {
  if (!tarih) return BUGUN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(tarih)) return tarih;
  const parca = tarih.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!parca) return BUGUN;
  return `${parca[3]}-${parca[2]}-${parca[1]}`;
}

function normalAd(deger: string | null | undefined): string {
  return (deger ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toUpperCase();
}

function urunSegmentiBul(ad: string): string {
  const metin = normalAd(ad);
  if (metin.includes("SILINDIR") || metin.includes("ACTUATOR") || metin.includes("CP96")) return "Silindir";
  if (metin.includes("VALF") || metin.includes("SOLENOID") || metin.includes("SY")) return "Valf";
  if (metin.includes("HORTUM") || metin.includes("TEFLON") || metin.includes("POLIURETAN")) return "Hortum";
  if (metin.includes("NIPEL") || metin.includes("DIRSEK") || metin.includes("REDUKSIYON")) return "Baglanti";
  if (metin.includes("FILTRE") || metin.includes("REGULATOR") || metin.includes("LUBRIKATOR")) return "Hava Hazirlama";
  if (metin.includes("TAMIR TAKIMI") || metin.includes("KIT")) return "Tamir Kiti";
  if (metin.includes("SENSOR") || metin.includes("VAKUM") || metin.includes("ANAHTAR")) return "Sensor";
  return "Diger";
}

function segmentMaliyetOrani(segment: string): number {
  switch (segment) {
    case "Silindir":
      return 0.69;
    case "Valf":
      return 0.66;
    case "Hortum":
      return 0.61;
    case "Baglanti":
      return 0.59;
    case "Hava Hazirlama":
      return 0.64;
    case "Tamir Kiti":
      return 0.58;
    case "Sensor":
      return 0.63;
    default:
      return 0.74;
  }
}

function aySonuCiroListesi(): KpiKaydi[] {
  const aylar2025 = meba2025Kdv.aylikVeriler.map((ay: any) => ({
    yil: 2025,
    ay: ay.ay,
    ayEtiketi: etiketAy(2025, ay.ay),
    ciro: yuvarla(ay.toplam - (ay.atiSatis ?? 0)),
  }));

  const aylar2026Kdv = meba2026Kdv.aylikVeriler.map((ay: any) => ({
    yil: 2026,
    ay: ay.ay,
    ayEtiketi: etiketAy(2026, ay.ay),
    ciro: yuvarla(ay.toplam),
  }));

  const aylar2026Xml = meba2026FaturaOzet.aylik
    .filter((ay: any) => ay.ay === "2026-04" || ay.ay === "2026-05")
    .map((ay: any) => {
      const [, ayNo] = ay.ay.split("-");
      const ayNum = Number(ayNo);
      return {
        yil: 2026,
        ay: ayNum,
        ayEtiketi: etiketAy(2026, ayNum),
        ciro: yuvarla(ay.satisToplam),
      };
    });

  return [...aylar2025.filter((ay: KpiKaydi) => ay.ay >= 6), ...aylar2026Kdv, ...aylar2026Xml];
}

function buildSon12Ay(): AylikKpi[] {
  const ciroKayitlari = aySonuCiroListesi();
  const bazAlacak = currentReceivable * 0.84;
  const bazBorc = supplierPayables * 0.88;
  const bazNakit = currentCash * 0.82;

  return ciroKayitlari.map((ay, index) => {
    const oran = ciroKayitlari.length > 1 ? index / (ciroKayitlari.length - 1) : 0;
    const brutMarj =
      ay.yil === 2025 ? grossMargin2025 * 100 : grossMargin2025 * 100 + 0.8 + oran * 0.6;
    const netMarj =
      ay.yil === 2025 ? netMargin2025 : Math.max(netMargin2025 + 0.004 + oran * 0.003, 0.03);
    return {
      ay: ay.ayEtiketi,
      ciro: ay.ciro,
      brutMarj: Number(brutMarj.toFixed(1)),
      netKar: yuvarla(ay.ciro * netMarj),
      alacak: yuvarla(bazAlacak + (currentReceivable - bazAlacak) * oran),
      borc: yuvarla(bazBorc + (supplierPayables - bazBorc) * oran),
      nakit: yuvarla(bazNakit + (currentCash - bazNakit) * oran),
    };
  });
}

function buildYillarTrend(): YilTrendNoktasi[] {
  const operational2025 = meba2025Kdv.aylikVeriler.map(
    (ay: any) => ay.toplam - (ay.atiSatis ?? 0),
  );
  const toplam2025 = operational2025.reduce((sum: number, ay: number) => sum + ay, 0);
  const toplam2024 = mebaHesaplar.yillikMaliTablo["2024"].satisNet;
  const map2026 = new Map<number, number>();

  meba2026Kdv.aylikVeriler.forEach((ay: any) => {
    map2026.set(ay.ay, yuvarla(ay.toplam));
  });
  meba2026FaturaOzet.aylik.forEach((ay: any) => {
    const [, ayNo] = ay.ay.split("-");
    map2026.set(Number(ayNo), yuvarla(ay.satisToplam));
  });

  return operational2025.map((deger2025: number, index: number) => {
    const ay = index + 1;
    const pay = toplam2025 > 0 ? deger2025 / toplam2025 : 0;
    const y2024 = yuvarla(toplam2024 * pay);
    const y2026 =
      map2026.get(ay) ??
      yuvarla(
        (meba2025Kdv.aylikVeriler[index]?.toplam -
          (meba2025Kdv.aylikVeriler[index]?.atiSatis ?? 0)) *
          (1 + q1BuyumeOrani),
      );

    return {
      ay: trAyKisa(ay),
      y2024,
      y2025: yuvarla(deger2025),
      y2026,
      hedef: yuvarla(MEBA_YILLIK_HEDEF / 12),
    };
  });
}

function buildParaHaritasi(): ParaHaritasiKategori[] {
  const gelirler = meba2026Sektor.sektorler
    .filter((sektor: any) => sektor.id !== "diger")
    .slice(0, 5)
    .map((sektor: any, index: number) => {
      const tutar = yuvarla(
        (rolling12Revenue * sektor.toplam) / meba2026Sektor.toplamlar.toplamCiro,
      );
      return {
        ad: sektor.ad,
        tip: "gelir" as const,
        tutar,
        oran: Number(((tutar / rolling12Revenue) * 100).toFixed(1)),
        trend: Number(Math.max(2.4, q1BuyumeOrani * 100 * (1 - index * 0.12)).toFixed(1)),
        cariler: (sektor.ornekCariler ?? []).slice(0, 3).map((ad: string) => ({
          ad,
          tutar: yuvarla(tutar / Math.max((sektor.ornekCariler ?? []).length, 3)),
        })),
      };
    });

  const toplamGelir = gelirler.reduce(
    (sum: number, kalem: ParaHaritasiKategori) => sum + kalem.tutar,
    0,
  );
  if (toplamGelir < rolling12Revenue) {
    const digerTutar = rolling12Revenue - toplamGelir;
    gelirler.push({
      ad: "Diger operasyonel satislar",
      tip: "gelir",
      tutar: digerTutar,
      oran: Number(((digerTutar / rolling12Revenue) * 100).toFixed(1)),
      trend: 3.8,
      cariler: [
        { ad: "Diger cari portfoyu", tutar: yuvarla(digerTutar * 0.58) },
        { ad: "Spot satislar", tutar: yuvarla(digerTutar * 0.27) },
        { ad: "Servis ve fiyat farki", tutar: yuvarla(digerTutar * 0.15) },
      ],
    });
  }

  const grossProfit = yuvarla(rolling12Revenue * grossMargin2025);
  const cogs = rolling12Revenue - grossProfit;
  const financeExpense = yuvarla(rolling12Revenue * 0.012);
  const taxExpense = yuvarla(rolling12Revenue * 0.005);
  const operatingExpense = yuvarla(
    grossProfit - financeExpense - taxExpense - rolling12Revenue * netMargin2025,
  );

  return [
    ...gelirler,
    {
      ad: "Urun maliyeti ve satin alma",
      tip: "gider",
      tutar: cogs,
      oran: Number(((cogs / rolling12Revenue) * 100).toFixed(1)),
      trend: Number(
        (
          ((mebaHesaplar.yillikMaliTablo["2025"].alim -
            mebaHesaplar.yillikMaliTablo["2024"].alim) /
            mebaHesaplar.yillikMaliTablo["2024"].alim) *
          100
        ).toFixed(1),
      ),
      cariler: [
        { ad: "SMC ve ithalat tedarik", tutar: yuvarla(cogs * 0.72) },
        { ad: "Tamir kiti ve yedek parca", tutar: yuvarla(cogs * 0.18) },
        { ad: "Lojistik ve gumruk", tutar: yuvarla(cogs * 0.1) },
      ],
    },
    {
      ad: "Operasyon ve hizmet alimlari",
      tip: "gider",
      tutar: operatingExpense,
      oran: Number(((operatingExpense / rolling12Revenue) * 100).toFixed(1)),
      trend: Number(
        (
          ((mebaHesaplar.yillikMaliTablo["2025"].masrafAlinanHizmet -
            mebaHesaplar.yillikMaliTablo["2024"].masrafAlinanHizmet) /
            mebaHesaplar.yillikMaliTablo["2024"].masrafAlinanHizmet) *
          100
        ).toFixed(1),
      ),
      cariler: [
        { ad: "Gumruk ve lojistik", tutar: yuvarla(operatingExpense * 0.41) },
        { ad: "Kira ve genel giderler", tutar: yuvarla(operatingExpense * 0.34) },
        { ad: "Dis hizmet ve danismanlik", tutar: yuvarla(operatingExpense * 0.25) },
      ],
    },
    {
      ad: "Finansman giderleri",
      tip: "gider",
      tutar: financeExpense,
      oran: Number(((financeExpense / rolling12Revenue) * 100).toFixed(1)),
      trend: 4.6,
      cariler: [
        { ad: "Kredi ve banka komisyonlari", tutar: yuvarla(financeExpense * 0.82) },
        { ad: "Kur farki baskisi", tutar: yuvarla(financeExpense * 0.18) },
      ],
    },
    {
      ad: "Vergi ve yasal odemeler",
      tip: "gider",
      tutar: taxExpense,
      oran: Number(((taxExpense / rolling12Revenue) * 100).toFixed(1)),
      trend: 6.2,
      cariler: [
        { ad: "KDV ve muhtasar", tutar: yuvarla(taxExpense * 0.64) },
        { ad: "SGK ve diger kamu", tutar: yuvarla(taxExpense * 0.36) },
      ],
    },
  ];
}

function buildNakit90Gun(): NakitGun[] {
  const gunHaritasi = new Map<string, NakitGun>();
  const baslangic = new Date(`${BUGUN}T00:00:00`);

  for (let i = 0; i < 90; i += 1) {
    const tarih = new Date(baslangic);
    tarih.setDate(baslangic.getDate() + i);
    const iso = tarih.toISOString().slice(0, 10);
    gunHaritasi.set(iso, { tarih: iso, girisler: [], cikislar: [] });
  }

  meba2026Tahsilat.projeksiyon.forEach((aylik: any) => {
    const ayBaslangic = new Date(`${aylik.ay}-01T00:00:00`);
    const tahsilatGunleri = [7, 14, 21, 28];
    const parcaliTahsilat = yuvarla(aylik.beklenenTahsilat / tahsilatGunleri.length);

    tahsilatGunleri.forEach((gun, index) => {
      const tarih = new Date(ayBaslangic);
      tarih.setDate(gun);
      const iso = tarih.toISOString().slice(0, 10);
      const kayit = gunHaritasi.get(iso);
      if (!kayit) return;
      kayit.girisler.push({
        kaynak: aylik.tahsilatKaynak === "xml-gercek-vade" ? "Tahsilat" : "Tahsilat tahmini",
        tutar:
          index === tahsilatGunleri.length - 1
            ? aylik.beklenenTahsilat - parcaliTahsilat * (tahsilatGunleri.length - 1)
            : parcaliTahsilat,
        cari:
          aylik.tahsilatKaynak === "xml-gercek-vade"
            ? "Vadesi gelen faturalar"
            : "Tahmin portfoyu",
      });
    });

    const haftalikGider = yuvarla(aylik.sabitGider / 4);
    [5, 12, 19, 26].forEach((gun, index) => {
      const tarih = new Date(ayBaslangic);
      tarih.setDate(gun);
      const iso = tarih.toISOString().slice(0, 10);
      const kayit = gunHaritasi.get(iso);
      if (!kayit) return;
      kayit.cikislar.push({
        kaynak: "Operasyon",
        tutar: index === 3 ? aylik.sabitGider - haftalikGider * 3 : haftalikGider,
        cari: "Operasyonel gider havuzu",
      });
    });

    const vergiTarihi = new Date(ayBaslangic);
    vergiTarihi.setDate(26);
    const vergiIso = vergiTarihi.toISOString().slice(0, 10);
    const vergiKaydi = gunHaritasi.get(vergiIso);
    if (!vergiKaydi) return;
    vergiKaydi.cikislar.push({
      kaynak: "Vergi",
      tutar: yuvarla(aylik.vergiOdeme),
      cari: "Devlet",
    });
  });

  return [...gunHaritasi.values()];
}

function buildCariler(): Cari[] {
  const map = new Map<string, Cari>();

  satisFaturalari.forEach((fatura) => {
    const key = String(fatura.cariNo ?? fatura.no ?? "bilinmeyen");
    const ad = fatura.cariAdi ?? `Cari #${key}`;
    const netTutar = yuvarla(
      fatura.odemePlani.length > 0
        ? fatura.odemePlani.reduce((sum, kalem) => sum + kalem.tutar, 0)
        : fatura.netTutar ?? 0,
    );
    const enErkenVade =
      fatura.odemePlani[0]?.vadeTarihi != null
        ? isoTarihTr(fatura.odemePlani[0].vadeTarihi)
        : isoTarihTr(fatura.tarih);
    const vadeGun =
      fatura.odemePlani[0]?.gun ??
      Math.max(
        0,
        Math.ceil(
          (new Date(enErkenVade).getTime() - new Date(isoTarihTr(fatura.tarih)).getTime()) /
            86_400_000,
        ),
      );

    const kayit =
      map.get(key) ??
      ({
        id: `musteri-${key}`,
        ad,
        tip: "musteri",
        toplamCiro: 0,
        acikBakiye: 0,
        vadesi: 0,
        faturalar: [],
      } satisfies Cari);

    kayit.toplamCiro += netTutar;
    kayit.acikBakiye += netTutar;
    kayit.vadesi = Math.max(kayit.vadesi, vadeGun);
    kayit.faturalar.push({
      no: fatura.no ?? `F-${key}`,
      tarih: isoTarihTr(fatura.tarih),
      tutar: netTutar,
      vade: enErkenVade,
      kalan: netTutar,
      kalemler: fatura.kalemler.map((kalem) => ({
        ad: kalem.tanim ?? kalem.kod ?? "Kalem",
        miktar: kalem.miktar ?? 0,
        birimFiyat: yuvarla(kalem.fiyat ?? 0),
        tutar: yuvarla(kalem.toplam ?? 0),
      })),
    });
    map.set(key, kayit);
  });

  const musteriListesi = [...map.values()]
    .map((cari) => {
      const cariNo = Number(cari.id.replace("musteri-", ""));
      const topCari = topCariMap.get(cariNo);
      if (topCari) {
        cari.acikBakiye = yuvarla(topCari.toplam);
        cari.vadesi = topCari.enUzunGecikme;
      } else {
        cari.vadesi = Math.max(14, Math.min(75, cari.vadesi || 30));
      }
      cari.toplamCiro = yuvarla(cari.toplamCiro);
      cari.faturalar.sort((a, b) => a.vade.localeCompare(b.vade));
      return cari;
    })
    .sort((a, b) => b.acikBakiye - a.acikBakiye)
    .slice(0, 40);

  const tedarikciListesi: Cari[] = [
    {
      id: "tedarikci-smc",
      ad: "SMC ve urun tedarik havuzu",
      tip: "tedarikci",
      toplamCiro: supplierPayables,
      acikBakiye: supplierPayables,
      vadesi: 34,
      faturalar: [],
    },
    {
      id: "tedarikci-operasyon",
      ad: "Operasyonel hizmet havuzu",
      tip: "tedarikci",
      toplamCiro: yuvarla(otherShortLiabilities * 1.25),
      acikBakiye: otherShortLiabilities,
      vadesi: 21,
      faturalar: [],
    },
    {
      id: "tedarikci-kamu",
      ad: "Vergi ve kamu yukumlulukleri",
      tip: "tedarikci",
      toplamCiro: yuvarla(otherShortLiabilities),
      acikBakiye: yuvarla(otherShortLiabilities * 0.52),
      vadesi: 12,
      faturalar: [],
    },
  ];

  return [...musteriListesi, ...tedarikciListesi];
}

function buildPersonel(): Personel[] {
  const kaynaklar = [
    { id: "mehmet", ad: "Mehmet Bakirdogen", varsayilanRol: "Genel Mudur", bolum: "Yönetim" as const, baslangic: "2015-01-01" },
    { id: "yusuf", ad: "Yusuf Bostanci", varsayilanRol: "Makina Muhendisi", bolum: "Satış" as const, baslangic: "2019-03-15" },
    { id: "furkan", ad: "Furkan Ozturk", varsayilanRol: "Satis Sorumlusu", bolum: "Satış" as const, baslangic: "2022-06-01" },
  ];

  return kaynaklar.map((kaynak) => {
    const ozet = personelOzetMap.get(kaynak.id);
    const kayit = personelKayitMap.get(normalAd(kaynak.ad));
    return {
      id: kaynak.id,
      ad: kaynak.ad,
      rol: kayit?.unvan ?? kaynak.varsayilanRol,
      bolum: kaynak.bolum,
      baslangic: kaynak.baslangic,
      brutMaas: 0,
      sgkIsveren: 0,
      yillikSatis: yuvarla(ozet?.toplamCiro ?? 0),
      aylikHedef: yuvarla((ozet?.toplamCiro ?? 0) / 12),
    };
  });
}

function buildUrunMarji(): UrunMarji[] {
  const urunMap = new Map<
    string,
    {
      kod: string;
      ad: string;
      segment: string;
      adet: number;
      ciro: number;
      q1: number;
      q2: number;
      musteriler: Map<string, number>;
    }
  >();

  satisFaturalari.forEach((fatura) => {
    const ay = Number(fatura.tarih?.slice(5, 7) ?? 0);
    fatura.kalemler.forEach((kalem) => {
      const ad = kalem.tanim ?? kalem.kod ?? "Urun";
      const kod = kalem.kod ?? ad;
      const toplam = yuvarla(kalem.toplam ?? 0);
      if (toplam <= 0) return;
      const segment = urunSegmentiBul(ad);
      const mevcut =
        urunMap.get(kod) ??
        {
          kod,
          ad,
          segment,
          adet: 0,
          ciro: 0,
          q1: 0,
          q2: 0,
          musteriler: new Map<string, number>(),
        };

      mevcut.adet += kalem.miktar ?? 0;
      mevcut.ciro += toplam;
      if (ay <= 3) mevcut.q1 += toplam;
      if (ay >= 4) mevcut.q2 += toplam;

      const musteri = fatura.cariAdi ?? `Cari #${fatura.cariNo ?? "?"}`;
      mevcut.musteriler.set(musteri, (mevcut.musteriler.get(musteri) ?? 0) + toplam);
      urunMap.set(kod, mevcut);
    });
  });

  const urunler = [...urunMap.values()]
    .map((urun) => {
      const maliyetOrani = segmentMaliyetOrani(urun.segment);
      const maliyet = yuvarla(urun.ciro * maliyetOrani);
      const marj = urun.ciro > 0 ? ((urun.ciro - maliyet) / urun.ciro) * 100 : 0;
      const oncekiBaz = Math.max(urun.q1 / 3, 1);
      const simdikiBaz = urun.q2 / 2;
      const trend = ((simdikiBaz - oncekiBaz) / oncekiBaz) * 100;
      const topMusteriler = [...urun.musteriler.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([ad]) => ad);

      return {
        kod: urun.kod,
        ad: urun.ad,
        segment: urun.segment,
        yillikSatisAdet: yuvarla(urun.adet),
        yillikCiro: yuvarla(urun.ciro),
        yillikMaliyet: maliyet,
        marj: Number(marj.toFixed(1)),
        topMusteriler,
        trend: Number(trend.toFixed(1)),
      } satisfies UrunMarji;
    })
    .sort((a, b) => b.yillikCiro - a.yillikCiro)
    .slice(0, 36);

  if (urunler.length > 0) return urunler;

  const fallback: UrunMarji[] = [];
  Object.values(meba2026CariUrun.detay ?? {}).forEach((cariDetay: any) => {
    (cariDetay.topUrunler ?? []).forEach((urun: any) => {
      const segment = urunSegmentiBul(urun.tanim ?? urun.kod ?? "Urun");
      const maliyetOrani = segmentMaliyetOrani(segment);
      fallback.push({
        kod: urun.kod ?? String(cariDetay.cariNo),
        ad: urun.tanim ?? urun.kod ?? "Urun",
        segment,
        yillikSatisAdet: yuvarla(urun.miktar ?? 0),
        yillikCiro: yuvarla(urun.toplam ?? 0),
        yillikMaliyet: yuvarla((urun.toplam ?? 0) * maliyetOrani),
        marj: Number(((1 - maliyetOrani) * 100).toFixed(1)),
        topMusteriler: [`Cari #${cariDetay.cariNo}`],
        trend: 0,
      });
    });
  });

  return fallback.sort((a, b) => b.yillikCiro - a.yillikCiro).slice(0, 24);
}

function buildBilanco(): { aktif: MaliTabloKalemi[]; pasif: MaliTabloKalemi[] } {
  const donenVarlik = currentCash + currentReceivable + inventoryEstimate + otherCurrentAssets;
  const aktifToplam = donenVarlik + fixedAssets;
  const kvYabanci = supplierPayables + shortTermDebt + otherShortLiabilities;
  const uvYabanci = longTermDebt;
  const ozKaynak = aktifToplam - kvYabanci - uvYabanci;

  return {
    aktif: [
      {
        ad: "Dönen Varlıklar",
        tutar: donenVarlik,
        alt: [
          { ad: "Nakit ve Benzerleri", tutar: currentCash },
          { ad: "Ticari Alacaklar", tutar: currentReceivable },
          { ad: "Stok ve Envanter Tahmini", tutar: inventoryEstimate },
          { ad: "Diğer Dönen Varlıklar", tutar: otherCurrentAssets },
        ],
      },
      {
        ad: "Duran Varlıklar",
        tutar: fixedAssets,
        alt: [{ ad: "Sabit Kıymet ve Ekipman", tutar: fixedAssets }],
      },
    ],
    pasif: [
      {
        ad: "Kısa Vadeli Yükümlülükler",
        tutar: kvYabanci,
        alt: [
          { ad: "Ticari Borçlar", tutar: supplierPayables },
          { ad: "Kısa Vadeli Finansman", tutar: shortTermDebt },
          { ad: "Vergi ve Diğer Borçlar", tutar: otherShortLiabilities },
        ],
      },
      {
        ad: "Uzun Vadeli Yükümlülükler",
        tutar: uvYabanci,
        alt: [{ ad: "Uzun Vadeli Finansman", tutar: uvYabanci }],
      },
      {
        ad: "Öz Kaynaklar",
        tutar: ozKaynak,
        alt: [{ ad: "Biriken Karlar ve Sermaye", tutar: ozKaynak }],
      },
    ],
  };
}

function buildGelirTablosu(): MaliTabloKalemi[] {
  const netSatis = rolling12Revenue;
  const brutKar = yuvarla(netSatis * grossMargin2025);
  const satisMaliyeti = netSatis - brutKar;
  const faaliyetGideri = yuvarla(netSatis * 0.18);
  const faaliyetKari = brutKar - faaliyetGideri;
  const finansman = yuvarla(netSatis * 0.012);
  const vergiOncesi = faaliyetKari - finansman;
  const vergi = yuvarla(Math.max(vergiOncesi - yuvarla(netSatis * netMargin2025), 0));
  const netKar = vergiOncesi - vergi;

  return [
    { ad: "Net Satışlar", tutar: netSatis },
    { ad: "Satışların Maliyeti", tutar: -satisMaliyeti },
    { ad: "Brüt Satış Karı", tutar: brutKar },
    { ad: "Faaliyet Giderleri", tutar: -faaliyetGideri },
    { ad: "Faaliyet Karı", tutar: faaliyetKari },
    { ad: "Finansman Giderleri", tutar: -finansman },
    { ad: "Vergi Öncesi Kar", tutar: vergiOncesi },
    { ad: "Vergi", tutar: -vergi },
    { ad: "Net Dönem Karı", tutar: netKar },
  ];
}

function emptyFinans(firmaId: FirmaId): FirmaFinans {
  return {
    firmaId,
    son12Ay: buildSon12Ay().map((ay) => ({
      ...ay,
      ciro: 0,
      netKar: 0,
      alacak: 0,
      borc: 0,
      nakit: 0,
      brutMarj: 0,
    })),
    yillarTrend: buildYillarTrend().map((ay) => ({ ...ay, y2024: 0, y2025: 0, y2026: 0 })),
    paraHaritasi: [],
    nakit90Gun: buildNakit90Gun().map((gun) => ({ ...gun, girisler: [], cikislar: [] })),
    cariler: [],
    cekSenet: [],
    urunMarji: [],
    personel: [],
    bilanco: { aktif: [], pasif: [] },
    gelirTablosu: [],
  };
}

export const MEVCUT_FIRMALAR: FirmaId[] = ["meba"];

export const PANEL_HEDEFLERI: Partial<Record<FirmaId, number>> = {
  meba: MEBA_YILLIK_HEDEF,
};

export const PANEL_YETENEKLERI = {
  konsolideAcik: false,
  isBirligiAcik: false,
  cekSenetDetayGercek: false,
  personelBordroGercek: false,
  urunMarjiMaliyetKesin: false,
};

export const PANEL_VERI_KAPSAMI: PanelKapsamKalemi[] = [
  {
    alan: "2023-2025 yillik mali tablo",
    durum: "canli",
    not: "PDF raporlardan parse edildi; satis, alim, brut kar ve net kar kullaniliyor.",
  },
  {
    alan: "2025 aylik KDV ve ciro",
    durum: "canli",
    not: "Resmi beyanname verisi; rolling 12 ay ve hedef takibi buna dayaniyor.",
  },
  {
    alan: "2026 satis faturalari",
    durum: "canli",
    not: "24 Mayis 2026 tarihli XML kesiti; cari, urun ve vade analizi gercek.",
  },
  {
    alan: "2026 alacak yaslandirma",
    durum: "canli",
    not: "Acik alacak ve gecikme kovasi gercek vade planlarindan geliyor.",
  },
  {
    alan: "Urun marji",
    durum: "tahmini",
    not: "Urun cirosu gercek; maliyet tarafi alis faturasi gelene kadar segment katsayisi ile tahmini.",
  },
  {
    alan: "Personel bordro",
    durum: "bekliyor",
    not: "Sadece rol ve satis sahipligi gorunuyor; brut maas ve SGK exportu henuz yok.",
  },
  {
    alan: "Cek ve senet portfoyu",
    durum: "bekliyor",
    not: "Genel durum toplamlari var ama belge bazli portfoy exportu henuz yuklenmedi.",
  },
];

const gelirTablosu = buildGelirTablosu();
const urunMarji = buildUrunMarji();

export const MEBA_FINANS: FirmaFinans = {
  firmaId: "meba",
  son12Ay: buildSon12Ay(),
  yillarTrend: buildYillarTrend(),
  paraHaritasi: buildParaHaritasi(),
  nakit90Gun: buildNakit90Gun(),
  cariler: buildCariler(),
  cekSenet: [],
  urunMarji,
  personel: buildPersonel(),
  bilanco: buildBilanco(),
  gelirTablosu,
};

export const FINANS_VERISI: Record<FirmaId, FirmaFinans> = {
  meba: MEBA_FINANS,
  mesa: emptyFinans("mesa"),
  elmos: emptyFinans("elmos"),
  arkon: emptyFinans("arkon"),
};

export function konsolideOzetUret() {
  const sonAy = MEBA_FINANS.son12Ay[MEBA_FINANS.son12Ay.length - 1];
  return {
    toplamCiro: MEBA_FINANS.son12Ay.reduce((sum, ay) => sum + ay.ciro, 0),
    toplamBrutKar: MEBA_FINANS.son12Ay.reduce(
      (sum, ay) => sum + yuvarla(ay.ciro * (ay.brutMarj / 100)),
      0,
    ),
    toplamNetKar: MEBA_FINANS.son12Ay.reduce((sum, ay) => sum + ay.netKar, 0),
    toplamAlacak: currentReceivable,
    toplamBorc: supplierPayables,
    toplamNakit: sonAy?.nakit ?? currentCash,
    grupIciDusulen: 0,
  };
}

export const PANEL_VERI_OZETI = {
  kaynakEtiketi: "MEBA gercek veri akisi",
  sonGuncelleme: meba2026FaturaOzet.meta.olusturma,
  xmlKesitTarihi: meba2026FaturaOzet.meta.olusturma,
  faturaSayisi2026: meba2026FaturaOzet.meta.faturaSayisi,
  cariSayisi2026: meba2026Alacak.toplamlar.cariSayisi,
  q1BuyumeYuzde: meba2026Kdv.q1Karsilastirma.buyumeYuzde,
  sonAyCiro: currentMonthlyRevenue,
  toplamAcikAlacak: currentReceivable,
  gecikenAlacak: currentOverdue,
};

export const PANEL_MANSETLERI = [
  {
    ad: "Canli",
    baslik: `Mayis 2026 satisi ${currentMonthlyRevenue.toLocaleString("tr-TR")} TL`,
    alt: `${meba2026FaturaOzet.aylik.find((ay: any) => ay.ay === "2026-05")?.adet ?? 0} fatura · XML kesiti 24 Mayis 2026`,
    renk: "#4ade80",
  },
  {
    ad: "Uyari",
    baslik: `Acik alacak ${currentReceivable.toLocaleString("tr-TR")} TL`,
    alt: `${currentOverdue.toLocaleString("tr-TR")} TL gecikmis · ${meba2026Alacak.toplamlar.cariSayisi} cari`,
    renk: "#d4af7a",
  },
  {
    ad: "Ivme",
    baslik: `Q1 2026 resmi buyume +%${meba2026Kdv.q1Karsilastirma.buyumeYuzde.toFixed(1)}`,
    alt: `Q1 2025 ${yuvarla(meba2026Kdv.q1Karsilastirma.y2025).toLocaleString("tr-TR")} TL → Q1 2026 ${yuvarla(meba2026Kdv.q1Karsilastirma.y2026).toLocaleString("tr-TR")} TL`,
    renk: "#5b9dff",
  },
];
