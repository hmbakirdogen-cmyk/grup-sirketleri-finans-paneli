// Tema sabitleri — Apple sadeliği + Tesla premiumluğu yönetim paneli.
// 5 renk diskini sıkı tutar; component'ler bu nesneden okur.
// Mehmet Bey direktifi 2026-05-26: az bileşen, güçlü bilgi, premium görünüm.

export const TEMA = {
  // Zemin
  bg: "#0a0b0e",            // derin antrasit, neredeyse siyah
  bgKart: "#13151b",        // kart üstü
  bgKartAlt: "#0f1116",     // kart alt (hafif gradient için)
  border: "rgba(255,255,255,0.06)",
  borderAktif: "rgba(255,255,255,0.12)",

  // Metin
  ink: "#f3f4f6",           // ana metin (sayılar)
  inkSoft: "#cbd5e1",       // ikincil metin
  inkMuted: "#94a3b8",      // etiket (uppercase, küçük)
  inkFaded: "#64748b",      // çok soluk (alt bilgi, byline)

  // 5 renk diski (KATİ, brief gereği)
  mavi: "#5b9dff",          // ana vurgu — elektrik mavi
  altin: "#d4af7a",         // sınırlı ikinci accent (1 yerde)
  yesil: "#4ade80",         // pozitif delta — yumuşak
  kirmizi: "#f87171",       // negatif delta — mat
} as const;

// Tipografi
export const FONT = {
  ana: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  num: "'Inter', system-ui, sans-serif", // tabular-nums ile zaten net
} as const;

// Sayı format
// Mehmet Bey direktifi 2026-05-26: "kısaltmalar fln olmasın. rakamlar düzgün okunsun"
// Default: tam Türkçe binlik separator formatı (30.605.000 ₺)
// `kisalt=true` yalnızca dar yerler için (Y axis tick, sparkline aralığı): "30,6 mn ₺"
export function fmtTL(n: number, kisalt = false): string {
  const isaret = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (kisalt) {
    if (abs >= 1_000_000_000) return `${isaret}${(abs / 1_000_000_000).toFixed(2).replace(".", ",")} mlr ₺`;
    if (abs >= 1_000_000) return `${isaret}${(abs / 1_000_000).toFixed(1).replace(".", ",")} mn ₺`;
    if (abs >= 1_000) return `${isaret}${(abs / 1_000).toFixed(0)} b ₺`;
    return `${isaret}${abs.toFixed(0)} ₺`;
  }
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺";
}

/** Sadece sayı kısmı, ₺ sembolü olmadan (CountUp suffix ile ayırmak için) */
export function fmtSayi(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);
}

export function fmtYuzde(n: number, basamak = 1): string {
  return `%${n.toFixed(basamak)}`;
}

/**
 * Hex renk → daha açık veya daha koyu varyant (basit RGB scale).
 * `oran` 0-1 arası: 0.3 → %30 daha açık/koyu.
 * Multi-stop gradient'ler için kullanılır (3D grafik stili).
 */
export function rengiKaristir(renk: string, oran: number, hedef: "lighter" | "darker"): string {
  // "#5b9dff" gibi 7 karakter hex bekleniyor; rgb() string gelirse olduğu gibi döner.
  if (!renk.startsWith("#") || renk.length < 7) return renk;
  const r = parseInt(renk.slice(1, 3), 16);
  const g = parseInt(renk.slice(3, 5), 16);
  const b = parseInt(renk.slice(5, 7), 16);
  const factor = hedef === "lighter" ? 1 + oran : 1 - oran;
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${cl(r)}, ${cl(g)}, ${cl(b)})`;
}
