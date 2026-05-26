// OnboardingTour — ilk girişte 6 adımlık tanıtım
// MEBA Komuta Merkezi'nden adapte edildi (2026-05-26 Sprint 2).
//
// Grup paneli için 6 adım:
// 1. Hoş geldin (kullanıcının adı + rolü)
// 2. Erişim matrisi (kimi görürsün)
// 3. Nabız + KPI (şirketin kalp atışı)
// 4. Para Haritası (gelir/gider/Sankey)
// 5. Yarın 90 Gün (nakit projeksiyon + simülasyon)
// 6. Mali Tablo (bilanço + gelir tablosu)
//
// localStorage versioned ("gsfp-onboarding-v1") — yeni adım eklenirse v2 yapılır.

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  HandHeart,
  Layers,
  Activity,
  Map as MapIcon,
  Calendar,
  FileText,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const EASE = [0.22, 0.61, 0.36, 1] as const;
const STORAGE_KEY = "gsfp-onboarding-v1";

interface Adim {
  baslik: string;
  altBaslik: string;
  aciklama: string;
  Icon: typeof HandHeart;
  renk: string;
  ipucu?: string;
}

function adimlariUret(hitap: string, konsolide: boolean): Adim[] {
  const erisimMetni = konsolide
    ? "4 firmaya da (MEBA + MESA + ELMOS + ARKON) erişimin var, üst menüden firma seçici ile geçiş yap. Konsolide grup paneli senin için."
    : "Sadece kendi yönettiğin firmanın panelini görüyorsun. Diğer firmaların finansal detayları sana kapalı — operasyonel mahremiyet ilkesi.";

  return [
    {
      baslik: `Hoş geldin ${hitap}`,
      altBaslik: "Grup Şirketleri Finans Paneli · 1/6",
      aciklama:
        "Burası 4 şirketin (MEBA + MESA + ELMOS + ARKON) finansal aynası. Yöneticilerine özel hazırlandı — Logo Go verilerinden otomatik beslenir, anlaşılır kalsın diye az ama derin tasarlandı.",
      Icon: HandHeart,
      renk: "#0ea5e9",
    },
    {
      baslik: "Erişim Matrisi",
      altBaslik: "Kimi görürsün · 2/6",
      aciklama: erisimMetni,
      Icon: Layers,
      renk: "#8b5cf6",
      ipucu:
        "Ortak güveni KATİ — başka kullanıcının ne baktığını izleyen audit log yok, gerek de yok.",
    },
    {
      baslik: "Nabız",
      altBaslik: "Şirketin kalp atışı · 3/6",
      aciklama:
        "Sabah açtığında 5 saniyede her şeyi anlayacaksın. KPI'lar 0'dan değere sayar (CNBC tarzı), üstte ticker tape canlı, AI yorum kartı Anadolu iş dilinde özet veriyor.",
      Icon: Activity,
      renk: "#22c55e",
      ipucu: "AI yorumda 'el sıkışmak', 'söz', 'mutabakat' gibi kavramlar var — biz öyle konuşuruz.",
    },
    {
      baslik: "Para Haritası",
      altBaslik: "Nereden geliyor, nereye gidiyor · 4/6",
      aciklama:
        "Sankey diyagramı ile para akışı: gelir kategorisi → brüt kar → faaliyet karı → net kar. Marj erozyon paneli hangi kategoride kayıp olduğunu yakalar.",
      Icon: MapIcon,
      renk: "#f59e0b",
      ipucu: "Bir kategoriye tıkla, Cari Detay'a o filtreyle git.",
    },
    {
      baslik: "Yarın 90 Gün",
      altBaslik: "Nakit projeksiyonu · 5/6",
      aciklama:
        "13 haftalık ısı haritası — her gün için net nakit. Simülasyon panelinde tahsilat hızı / yeni alım / vergi ertelemesi slider'larıyla 'şu olursa ne olur' senaryosu kurabilirsin.",
      Icon: Calendar,
      renk: "#ef4444",
      ipucu: "Mali takvim canlı uzatma takibi yapılıyor — GİB/SGK rozet üstte.",
    },
    {
      baslik: "Mali Tablo",
      altBaslik: "Bilanço + Gelir Tablosu · 6/6",
      aciklama:
        "Klasik bilanço (Aktif/Pasif T-hesap) + gelir tablosu, ama Tesla Investor Day tarzı satır satır beliriyor. PDF export butonu var, muhasebecine yollayabilirsin.",
      Icon: FileText,
      renk: "#06b6d4",
      ipucu: "Drill-down: KPI → kategori → cari → fatura → kalem.",
    },
  ];
}

export function OnboardingTour() {
  const { aktifKullanici, konsolideErisim } = useAuth();
  const hitap = aktifKullanici.hitap;
  const [acik, setAcik] = useState(false);
  const [adim, setAdim] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gorulen = localStorage.getItem(STORAGE_KEY);
    if (!gorulen) {
      const t = setTimeout(() => setAcik(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  function bitir() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setAcik(false);
  }

  const ad = adimlariUret(hitap, konsolideErisim);
  const aktif = ad[adim];
  const son = adim === ad.length - 1;

  if (!aktif) return null;

  return (
    <AnimatePresence>
      {acik && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={bitir}
          className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-md p-4"
        >
          <motion.div
            key={adim}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden"
            style={{
              boxShadow: "0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Üst ilerleme barı */}
            <div className="flex gap-1 px-5 pt-5">
              {ad.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i <= adim ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="h-full rounded-full"
                    style={{ background: aktif.renk }}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 md:p-7">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${aktif.renk}, ${aktif.renk}aa)`,
                    color: "#fff",
                    boxShadow: `0 8px 20px ${aktif.renk}55`,
                  }}
                >
                  <aktif.Icon size={24} />
                </span>
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
                {aktif.altBaslik}
              </div>
              <h2
                className="font-bold text-zinc-100 mt-1 leading-tight"
                style={{ fontSize: 26, letterSpacing: "-0.02em" }}
              >
                {aktif.baslik}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mt-3">{aktif.aciklama}</p>

              {aktif.ipucu && (
                <div
                  className="mt-4 flex items-start gap-2 rounded-xl p-3"
                  style={{ background: `${aktif.renk}14`, border: `1px solid ${aktif.renk}33` }}
                >
                  <Lightbulb size={16} style={{ color: aktif.renk }} className="shrink-0 mt-0.5" />
                  <span className="text-[12px] text-zinc-400 leading-snug">{aktif.ipucu}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 pb-5">
              <button
                type="button"
                onClick={bitir}
                className="text-[12px] text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
              >
                Atla
              </button>
              <div className="flex items-center gap-2">
                {adim > 0 && (
                  <button
                    type="button"
                    onClick={() => setAdim((a) => Math.max(0, a - 1))}
                    className="text-[12px] text-zinc-400 hover:text-zinc-100 font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                  >
                    Geri
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (son) bitir();
                    else setAdim((a) => a + 1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-white text-[12px] font-semibold shadow-md hover:scale-[1.02] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${aktif.renk}, ${aktif.renk}cc)`,
                  }}
                >
                  {son ? "Tamam, başlayalım" : "Devam"}
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
