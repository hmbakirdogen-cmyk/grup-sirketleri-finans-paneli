// VergiAtolyesiKart — Geçici vergi (3 aylık) optimizasyon mini-simülatörü.
//
// Mehmet Bey direktifi (2026-05-26): "Muhasebecimiz Osman ile oturup, 3 ayda
// bir geçici vergiyi resmi stokları yukarı/aşağı çekerek ayarlıyoruz."
//
// MVP: bu kart Yarın 90 Gün sayfasının altında oturur, üç ana parametre:
//   1. Stok değerleme yöntemi (FIFO ↔ Ağırlıklı Ortalama)
//   2. Dönem sonu stok ayarı (₺ slider, ±%20)
//   3. Sonuç: tahmini matrah + geçici vergi (%25 kurumlar)
//
// V2 (memory project_vergi_atolyesi): bağımsız sayfa, Logo Go gerçek stok
// modülü, Osman Bey'e PDF/WhatsApp gönderim.

import { useMemo, useState } from "react";
import { Calculator, Info, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { MaliTabloKalemi } from "@/types/domain";

interface VergiAtolyesiKartProps {
  /** Yıllık gelir tablosu (mock-finans.ts'den) — 4 çeyreğe bölünür */
  gelirTablosu: MaliTabloKalemi[];
  firmaKisaAd: string;
}

type Yontem = "fifo" | "agirlikli";

// Geçici vergi oranı (2026 kurumlar) — sabit
const GECICI_VERGI_ORANI = 0.25;

function formatTL(n: number): string {
  const abs = Math.abs(n);
  const isaret = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${isaret}${(abs / 1_000_000).toFixed(2)}M ₺`;
  if (abs >= 1_000) return `${isaret}${(abs / 1_000).toFixed(0)}K ₺`;
  return `${isaret}${abs.toFixed(0)} ₺`;
}

export function VergiAtolyesiKart({ gelirTablosu, firmaKisaAd }: VergiAtolyesiKartProps) {
  const [yontem, setYontem] = useState<Yontem>("agirlikli");
  // -20% ile +20% arası stok ayarı (₺ olarak SMM'yi etkiler)
  const [stokAyar, setStokAyar] = useState<number>(0);

  // Çeyrek bazlı baz veriler (yıllıktan /4)
  const netSatis = (gelirTablosu[0]?.tutar ?? 0) / 4;
  const smmYillik = Math.abs(gelirTablosu[1]?.tutar ?? 0);
  const fp = Math.abs(gelirTablosu[3]?.tutar ?? 0) / 4;
  const finansman = Math.abs(gelirTablosu[5]?.tutar ?? 0) / 4;

  // Yöntem etkisi — FIFO'da enflasyon ortamında SMM tipik %3-5 daha düşük çıkar
  // (eski düşük maliyet kullanılır → kâr artar → vergi artar). Mock katsayı.
  const yontemKatsayi = yontem === "fifo" ? 0.96 : 1.0;
  const smmCeyrek = (smmYillik / 4) * yontemKatsayi;

  // Senaryo SMM (stok ayarı SMM'yi DOĞRUDAN değiştirir — stok artarsa SMM düşer)
  const senaryoSMM = Math.max(0, smmCeyrek - stokAyar);

  const sonuc = useMemo(() => {
    const brutKar = netSatis - senaryoSMM;
    const faaliyetKar = brutKar - fp;
    const matrah = Math.max(0, faaliyetKar - finansman);
    const vergi = matrah * GECICI_VERGI_ORANI;
    return { brutKar, faaliyetKar, matrah, vergi };
  }, [netSatis, senaryoSMM, fp, finansman]);

  // Baz senaryo (stokAyar = 0, ağırlıklı ortalama) ile fark
  const bazMatrah = Math.max(0, netSatis - smmYillik / 4 - fp - finansman);
  const bazVergi = bazMatrah * GECICI_VERGI_ORANI;
  const vergiDelta = sonuc.vergi - bazVergi;

  return (
    <GlassCard hero className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #d946ef, #ec4899)",
            boxShadow: "0 6px 16px rgba(217,70,239,0.35)",
          }}
        >
          <Calculator size={18} />
        </span>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-fuchsia-400">
            Vergi Atölyesi · Mini
          </div>
          <div className="text-[14px] font-semibold text-zinc-100 mt-0.5">
            Geçici Vergi Hesabı — {firmaKisaAd} · Q dönemi tahmini
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 leading-snug">
            Osman Bey ile oturmadan önce 3 senaryo deneyin. Yasal sınırlar
            içinde stok değerlemesi ile matrah esnekliği görülür.
          </div>
        </div>
      </div>

      {/* Yöntem toggle */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1.5">
          Stok Değerleme Yöntemi
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["agirlikli", "fifo"] as Yontem[]).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYontem(y)}
              className="px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              style={{
                background: yontem === y ? "rgba(217,70,239,0.18)" : "rgba(39,39,42,0.40)",
                border: `1px solid ${yontem === y ? "rgba(217,70,239,0.50)" : "rgba(255,255,255,0.06)"}`,
                color: yontem === y ? "rgb(232,121,249)" : "rgb(161,161,170)",
              }}
            >
              {y === "fifo" ? "FIFO" : "Ağırlıklı Ortalama"}
            </button>
          ))}
        </div>
      </div>

      {/* Stok ayar slider */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-[11.5px] text-zinc-300">
            Dönem sonu stok ayarı
          </label>
          <span
            className="text-[11.5px] font-mono tabular-nums font-bold"
            style={{ color: stokAyar > 0 ? "rgb(34,197,94)" : stokAyar < 0 ? "rgb(239,68,68)" : "rgb(161,161,170)" }}
          >
            {stokAyar > 0 ? "+" : ""}
            {formatTL(stokAyar)}
          </span>
        </div>
        <input
          type="range"
          min={-smmCeyrek * 0.2}
          max={smmCeyrek * 0.2}
          step={smmCeyrek * 0.01}
          value={stokAyar}
          onChange={(e) => setStokAyar(Number(e.target.value))}
          className="w-full accent-fuchsia-500"
          aria-label="Stok ayarı"
        />
        <div className="flex justify-between text-[9px] text-zinc-600 mt-0.5">
          <span>Stok düştü (SMM ↑, vergi ↓)</span>
          <span>Stok arttı (SMM ↓, vergi ↑)</span>
        </div>
      </div>

      {/* Sonuç grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <SonucKart etiket="Net Satış (Q)" deger={netSatis} />
        <SonucKart etiket="SMM (senaryo)" deger={-senaryoSMM} />
        <SonucKart etiket="Matrah" deger={sonuc.matrah} />
        <SonucKart
          etiket="Geçici Vergi"
          deger={sonuc.vergi}
          vurgu
          delta={vergiDelta}
        />
      </div>

      {/* Hukuki not + Osman Bey gönder */}
      <div className="flex items-start gap-2 p-3 rounded-xl text-[11px] leading-snug bg-zinc-900/50 border border-zinc-800">
        <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
        <div className="flex-1 text-zinc-400">
          Bu simülasyon yasal sınırlar içinde stok değerleme esnekliğini
          gösterir. VUK madde 274'e göre yöntem değişimi yıl başında beyan ister;
          stok sayım ayarı gerçek envanterle tutarlı olmalı. Kesin karar Osman Bey
          ile mutabakat sonrası verilir.
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold text-fuchsia-300 border border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-colors shrink-0"
        >
          <Send size={11} />
          Osman Bey'e gönder
        </button>
      </div>
    </GlassCard>
  );
}

function SonucKart({
  etiket,
  deger,
  vurgu,
  delta,
}: {
  etiket: string;
  deger: number;
  vurgu?: boolean;
  delta?: number;
}) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: vurgu ? "rgba(217,70,239,0.10)" : "rgba(39,39,42,0.40)",
        border: `1px solid ${vurgu ? "rgba(217,70,239,0.30)" : "rgba(255,255,255,0.04)"}`,
      }}
    >
      <div className="text-[9.5px] uppercase tracking-wider font-bold text-zinc-500">
        {etiket}
      </div>
      <div
        className="font-mono tabular-nums font-bold mt-1"
        style={{
          fontSize: 16,
          color: vurgu ? "rgb(232,121,249)" : "rgb(244,244,245)",
        }}
      >
        {formatTL(Math.abs(deger))}
      </div>
      {delta !== undefined && Math.abs(delta) > 100 && (
        <div
          className="text-[10px] font-mono tabular-nums font-semibold mt-0.5"
          style={{ color: delta > 0 ? "rgb(239,68,68)" : "rgb(34,197,94)" }}
        >
          {delta > 0 ? "+" : ""}
          {formatTL(delta)} · baz senaryoya göre
        </div>
      )}
    </div>
  );
}
