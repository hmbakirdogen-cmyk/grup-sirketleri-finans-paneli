// MaliTakvimRozet — Türkiye unique özellik
// Yaklaşan vergi/SGK vadelerini AppHeader altında ince bir bant olarak gösterir.
// Uzatma olduysa açıkça belirtir (GİB/SGK genelge linki).
//
// Mehmet Bey direktifi: "Türk yöneticisi sürekli endişeli — KDV 28'inde mi,
// uzatma var mı? Bunu kimse canlı yapmıyor, bizim hızlı kazanım fırsatımız."

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, AlertTriangle, Info, ExternalLink, X, ChevronDown } from "lucide-react";
import {
  yaklasanVadeler,
  kalanGun,
  vadeAciliyet,
  uzatilmisMi,
  vadeMeta,
  etkinTarih,
  type MaliVade,
} from "@/lib/mali-takvim";

function formatTarih(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

function aciliyetRenk(seviye: "kritik" | "yakin" | "normal"): string {
  if (seviye === "kritik") return "#ef4444";
  if (seviye === "yakin") return "#f59e0b";
  return "#0ea5e9";
}

export function MaliTakvimRozet() {
  const [bugun, setBugun] = useState<Date | null>(null);
  const [acik, setAcik] = useState(false);

  // SSR uyumu: bugün'ü client'ta hesapla
  useEffect(() => {
    setBugun(new Date());
  }, []);

  const vadeler = useMemo(() => {
    if (!bugun) return [];
    return yaklasanVadeler(bugun, 30);
  }, [bugun]);

  if (!bugun || vadeler.length === 0) return null;

  const enKritik = vadeler[0];
  const seviye = vadeAciliyet(bugun, enKritik);
  const kalan = kalanGun(bugun, enKritik);
  const renk = aciliyetRenk(seviye);
  const meta = vadeMeta(enKritik.tip);
  const uzatma = uzatilmisMi(enKritik);

  return (
    <div
      className="border-b border-zinc-900/80"
      style={{
        background: `linear-gradient(180deg, ${renk}10, rgba(9,9,11,0.95))`,
      }}
    >
      {/* Compact bant — her zaman görünür */}
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-900/30 transition-colors"
        aria-expanded={acik}
        aria-label="Mali takvim genişlet"
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-lg shrink-0"
          style={{ background: `${renk}20`, color: renk }}
        >
          {seviye === "kritik" ? <AlertTriangle size={14} /> : <Calendar size={14} />}
        </span>

        <div className="flex-1 flex items-center gap-2 text-left min-w-0">
          <span
            className="text-[11px] uppercase tracking-wider font-bold shrink-0"
            style={{ color: renk }}
          >
            {kalan === 0 ? "BUGÜN" : kalan === 1 ? "YARIN" : `${kalan} gün`}
          </span>
          <span className="text-[13px] font-semibold text-zinc-100 truncate">
            {enKritik.baslik}
          </span>
          {uzatma && (
            <span
              className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shrink-0"
              style={{ background: "rgba(34,197,94,0.18)", color: "rgb(34,197,94)" }}
            >
              UZATILDI
            </span>
          )}
        </div>

        <span className="text-[11px] text-zinc-500 font-mono tabular-nums shrink-0">
          {formatTarih(etkinTarih(enKritik))}
        </span>

        <span className="text-[10px] text-zinc-500 shrink-0">
          +{vadeler.length - 1} daha
        </span>

        <ChevronDown
          size={14}
          className="text-zinc-500 shrink-0 transition-transform"
          style={{ transform: acik ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* Genişlemiş panel */}
      <AnimatePresence>
        {acik && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden border-t border-zinc-900/80"
          >
            <div className="p-3 space-y-1.5 max-h-[40vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                  Önümüzdeki 30 Gün — {vadeler.length} vade
                </div>
                <button
                  type="button"
                  onClick={() => setAcik(false)}
                  className="grid h-6 w-6 place-items-center rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  aria-label="Kapat"
                >
                  <X size={12} />
                </button>
              </div>

              {vadeler.map((vade) => (
                <VadeKart key={vade.id} vade={vade} bugun={bugun} />
              ))}

              <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center gap-2 text-[10px] text-zinc-500">
                <Info size={12} />
                <span>
                  Vadeler GİB/SGK kaynaklı. Uzatma kayıtları manuel; v2'de
                  GİB/SGK RSS otomatik takip eklenecek.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VadeKart({ vade, bugun }: { vade: MaliVade; bugun: Date }) {
  const seviye = vadeAciliyet(bugun, vade);
  const kalan = kalanGun(bugun, vade);
  const renk = aciliyetRenk(seviye);
  const meta = vadeMeta(vade.tip);
  const uzatma = uzatilmisMi(vade);

  return (
    <div
      className="flex items-start gap-3 p-2.5 rounded-lg"
      style={{ background: "rgba(39,39,42,0.40)", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-lg shrink-0 text-base"
        style={{ background: `${meta.renk}18` }}
      >
        {meta.emoji}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12.5px] font-semibold text-zinc-100">{vade.baslik}</span>
          {uzatma && (
            <span
              className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(34,197,94,0.18)", color: "rgb(34,197,94)" }}
            >
              UZATILDI
            </span>
          )}
        </div>
        {vade.aciklama && (
          <div className="text-[10.5px] text-zinc-500 mt-0.5">{vade.aciklama}</div>
        )}
        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
          <span className="font-mono tabular-nums">
            {formatTarih(etkinTarih(vade))}
            {uzatma && (
              <>
                <span className="mx-1 line-through opacity-60">
                  {formatTarih(vade.orijinalTarih)}
                </span>
              </>
            )}
          </span>
          {vade.uzatmaKaynak && (
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <ExternalLink size={9} />
              {vade.uzatmaKaynak}
            </span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-bold tabular-nums" style={{ color: renk, fontSize: 18 }}>
          {kalan === 0 ? "BUGÜN" : kalan === 1 ? "YARIN" : kalan}
        </div>
        {kalan > 1 && (
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">gün</div>
        )}
      </div>
    </div>
  );
}
