// FirmaHedefDuzenleModal — 4 firma yıllık hedef düzenleme
// MEBA Komuta Merkezi'nin HedefDuzenleModal şablonundan adapte edildi
// (2026-05-26 Sprint 1).
//
// Pattern özellikleri (MEBA'dan korunan):
// - Center-fixed modal (mobile bottom-sheet + desktop center hibrit)
// - Gradient header + ikonlu ID-card
// - Scroll body (max 70vh) + sticky footer
// - Spring scale 0.97 → 1 enter, esc handler
// - **Canlı validation:** firma toplamı vs grup hedefi farkı yeşil/sarı rozet
//
// Grup paneli için adapte: kişi listesi → firma listesi (MEBA + MESA + ELMOS + ARKON)

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Target, X, RefreshCw, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { useGrupHedef } from "@/lib/grup-hedef-store";
import { FIRMALAR } from "@/data/firmalar";
import { MEVCUT_FIRMALAR } from "@/data/gercek-finans";
import { notify } from "@/lib/notify";
import type { FirmaId, Kullanici } from "@/types/domain";

const EASE = [0.22, 0.61, 0.36, 1] as const;

interface Props {
  acik: boolean;
  onClose: () => void;
  /** Aktif kullanıcı (yetki + audit için) */
  aktifKullanici: Kullanici;
}

const FIRMA_SIRA: FirmaId[] = [...MEVCUT_FIRMALAR];

function formatTL(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function FirmaHedefDuzenleModal({ acik, onClose, aktifKullanici }: Props) {
  const konsolideErisim = aktifKullanici.konsolideGorur;
  const { firmaHedefi, varsayilan, setFirmaHedef, sifirla } = useGrupHedef();

  const [grupToplam, setGrupToplam] = useState<string>("0");
  const [firmaInputs, setFirmaInputs] = useState<Record<FirmaId, string>>({
    meba: "0",
    mesa: "0",
    elmos: "0",
    arkon: "0",
  });

  // Modal açıldığında mevcut değerleri yükle
  useEffect(() => {
    if (!acik) return;
    const yeniInputs: Record<FirmaId, string> = {
      meba: String(firmaHedefi("meba")),
      mesa: String(firmaHedefi("mesa")),
      elmos: String(firmaHedefi("elmos")),
      arkon: String(firmaHedefi("arkon")),
    };
    setFirmaInputs(yeniInputs);
    const t = FIRMA_SIRA.reduce((s, f) => s + Number(yeniInputs[f]), 0);
    setGrupToplam(String(t));
    // ESC handler
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [acik, firmaHedefi, onClose]);

  // Toplam canlı hesap
  const firmalarToplami = useMemo(
    () => FIRMA_SIRA.reduce((s, f) => s + Math.max(0, Number(firmaInputs[f].replace(/\D/g, ""))), 0),
    [firmaInputs],
  );
  const grupHedefN = Math.max(0, Number(grupToplam.replace(/\D/g, "")));
  const fark = grupHedefN - firmalarToplami;
  const uyumlu = Math.abs(fark) < 10_000; // 10K TL tolerans

  function kaydet() {
    FIRMA_SIRA.forEach((f) => {
      const v = Math.max(0, Number(firmaInputs[f].replace(/\D/g, "")));
      setFirmaHedef(f, v, aktifKullanici.id);
    });
    notify.success("Hedefler güncellendi", {
      description: `Grup toplam: ${formatTL(firmalarToplami)}`,
    });
    onClose();
  }

  function sifirlaTumu() {
    sifirla();
    notify.info("Hedefler varsayılana döndürüldü", {
      description: "Gerçek veri hedef tablosu varsayılan düzene alındı",
    });
    onClose();
  }

  // Sadece çekirdek ortaklar grup geneli hedef belirleyebilir
  if (!konsolideErisim) {
    return null;
  }

  return (
    <AnimatePresence>
      {acik && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/55 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="firma-hedef-modal-title"
            className="w-full max-w-[560px] rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
          >
            {/* Header — gradient + ikonlu ID-card */}
            <header
              className="flex items-center justify-between px-6 py-4 border-b border-zinc-800"
              style={{
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.10), rgba(24,24,27,1))",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    boxShadow: "0 8px 20px rgba(14,165,233,0.40)",
                  }}
                >
                  <Target size={22} />
                </span>
                <div>
                  <h2
                    id="firma-hedef-modal-title"
                    className="font-bold text-zinc-100 text-lg"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Yıllık Hedefler — 4 Firma
                  </h2>
                  <div className="text-[11px] text-zinc-500">
                    Grup toplam + her firma bazlı · {new Date().getFullYear()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            {/* Body — scroll */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Grup toplam hedef */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2 block">
                  Grup Toplam Hedef (₺)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={grupToplam}
                    onChange={(e) => setGrupToplam(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-zinc-800 bg-zinc-900 text-zinc-100 text-lg font-mono tabular-nums focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="147340000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">
                    ₺
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Tahmini: <span className="font-mono text-zinc-300">{formatTL(grupHedefN)}</span>
                </p>
              </div>

              {/* Firma bazlı hedefler */}
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2 block">
                  Firma Bazlı Hedefler
                </label>
                <div className="space-y-2">
                  {FIRMA_SIRA.map((firmaId) => {
                    const firma = FIRMALAR[firmaId];
                    const v = Math.max(
                      0,
                      Number((firmaInputs[firmaId] ?? "0").replace(/\D/g, "")),
                    );
                    const vars = varsayilan[firmaId];
                    const farkVars = ((v - vars) / vars) * 100;
                    return (
                      <div
                        key={firmaId}
                        className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40"
                      >
                        <div
                          className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${firma.renk}, ${firma.renk}aa)`,
                          }}
                        >
                          {firma.kisaAd.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-zinc-100 truncate">
                            {firma.kisaAd}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {firma.isKolu}
                          </div>
                        </div>
                        <div className="relative w-44 shrink-0">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={firmaInputs[firmaId] ?? ""}
                            onChange={(e) =>
                              setFirmaInputs((s) => ({ ...s, [firmaId]: e.target.value }))
                            }
                            className="w-full px-3 py-2 pr-7 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm font-mono tabular-nums focus:border-cyan-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                            ₺
                          </span>
                          <p
                            className="text-[9px] mt-0.5 font-mono text-right pr-1"
                            style={{
                              color:
                                Math.abs(farkVars) < 5
                                  ? "rgb(113,113,122)"
                                  : farkVars > 0
                                    ? "rgb(34,197,94)"
                                    : "rgb(245,158,11)",
                            }}
                          >
                            {formatTL(v)}
                            {Math.abs(farkVars) >= 5 && (
                              <span className="ml-1">({farkVars > 0 ? "+" : ""}{farkVars.toFixed(1)}%)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Uyum kontrolü — KATİ canlı validation rozet */}
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-xs"
                style={{
                  background: uyumlu ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                  border: `1px solid ${uyumlu ? "rgb(34,197,94)" : "rgb(245,158,11)"}`,
                }}
              >
                {uyumlu ? (
                  <CheckCircle2 size={16} style={{ color: "rgb(34,197,94)" }} />
                ) : (
                  <AlertTriangle size={16} style={{ color: "rgb(245,158,11)" }} />
                )}
                <div className="flex-1 leading-snug text-zinc-300">
                  {uyumlu ? (
                    <>
                      <strong className="text-zinc-100">Uyumlu</strong> · 4 firma toplamı (
                      <span className="font-mono">{formatTL(firmalarToplami)}</span>) grup hedefini
                      karşılıyor.
                    </>
                  ) : (
                    <>
                      4 firma toplamı (<span className="font-mono">{formatTL(firmalarToplami)}</span>)
                      grup hedefinden{" "}
                      <strong style={{ color: "rgb(245,158,11)" }}>
                        {formatTL(Math.abs(fark))} {fark > 0 ? "az" : "fazla"}
                      </strong>
                      .
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer — sticky */}
            <footer className="flex items-center justify-between gap-2 px-6 py-4 border-t border-zinc-800 bg-zinc-900/40">
              <button
                type="button"
                onClick={sifirlaTumu}
                className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 hover:text-red-400 transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw size={13} />
                Varsayılana dön
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-semibold hover:bg-zinc-900 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={kaydet}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg hover:scale-[1.02] transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    boxShadow: "0 8px 20px rgba(14,165,233,0.40)",
                  }}
                >
                  <Save size={14} />
                  Kaydet
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
