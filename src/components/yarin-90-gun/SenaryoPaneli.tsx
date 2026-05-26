// SenaryoPaneli — "şu olursa ne olur" 3 slider'lık atölye.
//
// Slider'lar:
//   1. Tahsilat hızı katsayısı (0.7 - 1.3) → girişler bu kat ile çarpılır
//   2. Yeni alım baskısı (₺0 - ₺5M) → çıkışlara yayılı eklenir
//   3. Vergi ertelemesi toggle → "Devlet" çıkışları kaldırılır
//
// Anadolu iş dili: "diyelim ki SMC bayisi 2 ay sonra ödeyecek..." gibi
// senaryolar mock'ta 3 senaryo butonuna sığar (default + sıkışık + rahat).

import { Sliders, RotateCcw, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface SenaryoPaneliProps {
  tahsilatHizi: number;
  setTahsilatHizi: (v: number) => void;
  yeniAlim: number;
  setYeniAlim: (v: number) => void;
  vergiErtelemesi: boolean;
  setVergiErtelemesi: (v: boolean) => void;
}

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₺`;
  return `${n} ₺`;
}

export function SenaryoPaneli({
  tahsilatHizi,
  setTahsilatHizi,
  yeniAlim,
  setYeniAlim,
  vergiErtelemesi,
  setVergiErtelemesi,
}: SenaryoPaneliProps) {
  function sifirla() {
    setTahsilatHizi(1);
    setYeniAlim(0);
    setVergiErtelemesi(false);
  }

  function sikismakSenaryo() {
    setTahsilatHizi(0.8);
    setYeniAlim(2_500_000);
    setVergiErtelemesi(false);
  }

  function rahatSenaryo() {
    setTahsilatHizi(1.2);
    setYeniAlim(0);
    setVergiErtelemesi(true);
  }

  return (
    <GlassCard hero className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: "rgba(139,92,246,0.18)", color: "rgb(167,139,250)" }}
          >
            <Sliders size={15} />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
              Senaryo Atölyesi
            </div>
            <div className="text-[12.5px] text-zinc-300">Sliderları çek, ısı haritası güncellensin</div>
          </div>
        </div>
        <button
          type="button"
          onClick={sifirla}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-100 transition-colors"
        >
          <RotateCcw size={11} />
          Sıfırla
        </button>
      </div>

      <div className="space-y-4">
        {/* Tahsilat hızı slider */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label className="text-[11.5px] text-zinc-300">
              Tahsilat hızı
            </label>
            <span
              className="text-[11px] font-mono tabular-nums font-bold"
              style={{ color: tahsilatHizi >= 1 ? "rgb(34,197,94)" : "rgb(239,68,68)" }}
            >
              ×{tahsilatHizi.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.7}
            max={1.3}
            step={0.05}
            value={tahsilatHizi}
            onChange={(e) => setTahsilatHizi(Number(e.target.value))}
            className="w-full accent-cyan-500"
            aria-label="Tahsilat hızı"
          />
          <div className="flex justify-between text-[9px] text-zinc-600 mt-0.5">
            <span>Sıkışık (%70)</span>
            <span>Normal</span>
            <span>Rahat (%130)</span>
          </div>
        </div>

        {/* Yeni alım baskısı slider */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label className="text-[11.5px] text-zinc-300">
              Yeni alım baskısı
            </label>
            <span className="text-[11px] font-mono tabular-nums font-bold text-amber-400">
              {formatTL(yeniAlim)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5_000_000}
            step={250_000}
            value={yeniAlim}
            onChange={(e) => setYeniAlim(Number(e.target.value))}
            className="w-full accent-amber-500"
            aria-label="Yeni alım baskısı"
          />
          <div className="flex justify-between text-[9px] text-zinc-600 mt-0.5">
            <span>0 ₺</span>
            <span>2.5M ₺</span>
            <span>5M ₺</span>
          </div>
        </div>

        {/* Vergi ertelemesi toggle */}
        <label
          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-zinc-900/50"
          style={{ background: vergiErtelemesi ? "rgba(34,197,94,0.10)" : "transparent" }}
        >
          <input
            type="checkbox"
            checked={vergiErtelemesi}
            onChange={(e) => setVergiErtelemesi(e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-zinc-100">
              Vergi/SGK ödemesi ertelendi
            </div>
            <div className="text-[10px] text-zinc-500">
              Devlet çıkışları 90 günde görünmesin (yasal uzatma varsayımı)
            </div>
          </div>
        </label>
      </div>

      {/* Hızlı senaryo butonları */}
      <div className="mt-4 pt-4 border-t border-zinc-900">
        <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-2">
          Hızlı Senaryo
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={sikismakSenaryo}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <Sparkles size={12} />
            Sıkışık ay
          </button>
          <button
            type="button"
            onClick={rahatSenaryo}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
          >
            <Sparkles size={12} />
            Rahat ay
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
