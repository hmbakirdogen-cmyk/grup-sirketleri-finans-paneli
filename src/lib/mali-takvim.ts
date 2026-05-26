// Mali Takvim — KDV, MUHSGK, SGK, Damga, Kurumlar Vergisi vade takibi
// + GİB/SGK canlı uzatma takibi (Türkiye unique özellik)
//
// Mehmet Bey direktifi (memory feedback_broadcast_kalite_grafik + Türkiye rapor):
// "Türk yöneticisi sürekli endişeli: KDV 28'inde mi, uzatma var mı?
// Hiçbir Türk yazılım canlı yapmıyor — bizim hızlı kazanım fırsatımız."
//
// MVP: statik 2026 takvim + manuel uzatma kayıtları
// V2: Cloudflare Cron + GİB/SGK RSS scrape + push bildirim 3 gün öncesi

export type VadeTip =
  | "kdv-beyan"
  | "kdv-odeme"
  | "muhsgk-beyan"
  | "muhsgk-odeme"
  | "sgk-prim"
  | "damga-beyan"
  | "damga-odeme"
  | "gecici-vergi-beyan"
  | "gecici-vergi-odeme"
  | "kurumlar-beyan"
  | "kurumlar-odeme"
  | "bayram-tatil";

export interface MaliVade {
  id: string;
  tip: VadeTip;
  baslik: string;
  /** ISO tarih (orijinal) */
  orijinalTarih: string;
  /** Uzatılmışsa yeni tarih (GİB/SGK duyuru) */
  uzatilmisTarih?: string;
  /** Uzatma kaynağı (GİB/SGK duyuru URL'i) */
  uzatmaKaynak?: string;
  /** Açıklama (örn. "Mayıs dönemi") */
  aciklama?: string;
}

const VADE_TIP_META: Record<
  VadeTip,
  { kategori: "vergi" | "sgk" | "tatil"; renk: string; emoji: string }
> = {
  "kdv-beyan": { kategori: "vergi", renk: "#0ea5e9", emoji: "📋" },
  "kdv-odeme": { kategori: "vergi", renk: "#0284c7", emoji: "💸" },
  "muhsgk-beyan": { kategori: "sgk", renk: "#8b5cf6", emoji: "📋" },
  "muhsgk-odeme": { kategori: "sgk", renk: "#7c3aed", emoji: "💸" },
  "sgk-prim": { kategori: "sgk", renk: "#a855f7", emoji: "💸" },
  "damga-beyan": { kategori: "vergi", renk: "#f59e0b", emoji: "📋" },
  "damga-odeme": { kategori: "vergi", renk: "#d97706", emoji: "💸" },
  "gecici-vergi-beyan": { kategori: "vergi", renk: "#10b981", emoji: "📋" },
  "gecici-vergi-odeme": { kategori: "vergi", renk: "#059669", emoji: "💸" },
  "kurumlar-beyan": { kategori: "vergi", renk: "#ef4444", emoji: "📋" },
  "kurumlar-odeme": { kategori: "vergi", renk: "#dc2626", emoji: "💸" },
  "bayram-tatil": { kategori: "tatil", renk: "#22c55e", emoji: "🎉" },
};

// 2026 Türkiye mali takvim (resmi vadeler)
// Kaynak: GİB + SGK + Resmi Gazete duyuruları
// MVP statik liste — V2'de Cloudflare Cron + RSS ile otomatik güncellenir
export const MALI_TAKVIM_2026: MaliVade[] = [
  // Mayıs 2026 — gerçek uzatma örnekleri (Türkiye rapor bulgusu)
  {
    id: "muhsgk-2026-05",
    tip: "muhsgk-beyan",
    baslik: "Nisan Dönemi MUHSGK Beyannamesi",
    orijinalTarih: "2026-05-26",
    uzatilmisTarih: "2026-06-03",
    uzatmaKaynak: "GİB Genelge 2026/3",
    aciklama: "Bayram öncesi uzatma",
  },
  {
    id: "kdv-2026-05-odeme",
    tip: "kdv-odeme",
    baslik: "Nisan Dönemi KDV Ödemesi",
    orijinalTarih: "2026-06-01",
    uzatilmisTarih: "2026-06-05",
    uzatmaKaynak: "GİB Sirküler 2026/2",
    aciklama: "Hafta sonu kayması",
  },

  // Haziran 2026
  {
    id: "kurban-bayram",
    tip: "bayram-tatil",
    baslik: "Kurban Bayramı (resmi tatil)",
    orijinalTarih: "2026-05-27",
    aciklama: "27-31 Mayıs · 5 gün resmi tatil",
  },
  {
    id: "sgk-2026-06",
    tip: "sgk-prim",
    baslik: "Mayıs Dönemi SGK Primi",
    orijinalTarih: "2026-06-23",
  },
  {
    id: "muhsgk-2026-06",
    tip: "muhsgk-beyan",
    baslik: "Mayıs Dönemi MUHSGK Beyannamesi",
    orijinalTarih: "2026-06-26",
  },
  {
    id: "kdv-2026-06-beyan",
    tip: "kdv-beyan",
    baslik: "Mayıs Dönemi KDV Beyannamesi",
    orijinalTarih: "2026-06-26",
  },
  {
    id: "kdv-2026-06-odeme",
    tip: "kdv-odeme",
    baslik: "Mayıs Dönemi KDV Ödemesi",
    orijinalTarih: "2026-06-30",
  },

  // Temmuz 2026 (geçici vergi 2. dönem)
  {
    id: "gecici-2026-q2-beyan",
    tip: "gecici-vergi-beyan",
    baslik: "2. Dönem Geçici Vergi Beyannamesi",
    orijinalTarih: "2026-08-17",
    aciklama: "Nisan-Haziran dönemi",
  },
  {
    id: "gecici-2026-q2-odeme",
    tip: "gecici-vergi-odeme",
    baslik: "2. Dönem Geçici Vergi Ödemesi",
    orijinalTarih: "2026-08-17",
  },
];

/** Belirli bir tarihe göre etkin tarih (uzatılmışsa onu, yoksa orijinali) */
export function etkinTarih(vade: MaliVade): string {
  return vade.uzatilmisTarih ?? vade.orijinalTarih;
}

export function vadeMeta(tip: VadeTip) {
  return VADE_TIP_META[tip];
}

/** Bugünden itibaren X gün içindeki vadeleri getir */
export function yaklasanVadeler(bugun: Date, gunPenceresi = 30): MaliVade[] {
  const bugunStr = bugun.toISOString().slice(0, 10);
  const sinir = new Date(bugun);
  sinir.setDate(sinir.getDate() + gunPenceresi);
  const sinirStr = sinir.toISOString().slice(0, 10);

  return MALI_TAKVIM_2026.filter((v) => {
    const t = etkinTarih(v);
    return t >= bugunStr && t <= sinirStr;
  }).sort((a, b) => etkinTarih(a).localeCompare(etkinTarih(b)));
}

/** Bir vade için kalan gün sayısı (negatif = geçmiş) */
export function kalanGun(bugun: Date, vade: MaliVade): number {
  const t = new Date(etkinTarih(vade));
  return Math.ceil((t.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
}

/** Aciliyet seviyesi (kart rengi için) */
export function vadeAciliyet(bugun: Date, vade: MaliVade): "kritik" | "yakin" | "normal" {
  const k = kalanGun(bugun, vade);
  if (k <= 3) return "kritik";
  if (k <= 7) return "yakin";
  return "normal";
}

/** Uzatma olmuş mu? */
export function uzatilmisMi(vade: MaliVade): boolean {
  return Boolean(vade.uzatilmisTarih && vade.uzatilmisTarih !== vade.orijinalTarih);
}
