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
export function fmtTL(n: number, kisalt = true): string {
  const abs = Math.abs(n);
  const isaret = n < 0 ? "-" : "";
  if (kisalt) {
    if (abs >= 1_000_000_000) return `${isaret}${(abs / 1_000_000_000).toFixed(2)} milyar ₺`;
    if (abs >= 1_000_000) return `${isaret}${(abs / 1_000_000).toFixed(1)}M ₺`;
    if (abs >= 1_000) return `${isaret}${(abs / 1_000).toFixed(0)}K ₺`;
    return `${isaret}${abs.toFixed(0)} ₺`;
  }
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺";
}

export function fmtYuzde(n: number, basamak = 1): string {
  return `%${n.toFixed(basamak)}`;
}
