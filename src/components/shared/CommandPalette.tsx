// CommandPalette — Cmd+K + AI doğal dil sorgu
// MEBA Komuta Merkezi'nden sade adaptasyon (2026-05-26 Sprint 2).
//
// Özellikler (Pigment + Linear esinli):
// - Cmd+K (Mac) / Ctrl+K (Windows) ile açılır
// - Hızlı sayfa erişimi (5 sayfa)
// - Firma değiştirme (çekirdek ortaklar için)
// - AI doğal dil sorgu placeholder — "MESA Mayıs nakit", "MEBA top 10 cari"
//   (gerçek AI sorgu Sprint 3'te bağlanacak)
// - ↑↓ ok tuşları, Enter, ESC

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search,
  Activity,
  Map as MapIcon,
  Calendar,
  Users,
  FileText,
  LayoutGrid,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FIRMALAR } from "@/data/firmalar";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { aktifFirma, firmaSec, konsolideErisim, erisilebilirFirmalar } = useAuth();
  const routerState = useRouterState();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  // Global Cmd+K kısayolu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    setTimeout(() => navigate({ to }), 50);
  };

  const sayfaLink = (sayfa: string) => `/${aktifFirma}/${sayfa}`;

  // AI sorgu önerileri (q.length > 1 ile dinamik) — gerçek AI bağlantısı Sprint 3
  const aiOnerileri = useMemo(() => {
    if (q.trim().length < 2) {
      return [
        "MEBA bu ay nakit",
        "MESA top 10 cari",
        "ELMOS marj sapması",
        "ARKON 90 gün simülasyon",
      ];
    }
    return [
      `"${q}" için chart üret`,
      `"${q}" için detay raporu hazırla`,
      `"${q}" cari listesinde ara`,
    ];
  }, [q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Komuta paleti"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={() => onOpenChange(false)}
      />
      <Command
        className="relative w-full max-w-[640px] rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden"
        style={{
          boxShadow: "0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.05)",
          backdropFilter: "blur(28px) saturate(180%)",
        }}
        filter={() => 1}
        loop
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <Search size={18} className="text-zinc-500" />
          <Command.Input
            value={q}
            onValueChange={setQ}
            placeholder="Sayfa, firma, AI sorgu ara…"
            className="flex-1 bg-transparent outline-none text-[14px] text-zinc-100 placeholder:text-zinc-500"
          />
          <kbd className="font-mono text-[10px] text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-800">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="px-4 py-8 text-center text-[13px] text-zinc-500">
            Eşleşen sonuç yok.
          </Command.Empty>

          {/* AI Hızlı Sorgu */}
          <Command.Group
            heading="AI Hızlı Sorgu"
            className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 px-2 py-1.5"
          >
            {aiOnerileri.map((oneri) => (
              <Command.Item
                key={oneri}
                value={`ai-${oneri}`}
                onSelect={() => {
                  // Sprint 3: gerçek AI çağrısı yapılacak
                  console.log("AI sorgu:", oneri);
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-900"
              >
                <Sparkles size={14} className="text-violet-400 shrink-0" />
                <span className="text-[13px] flex-1">{oneri}</span>
                <ArrowRight size={12} className="text-zinc-600" />
              </Command.Item>
            ))}
          </Command.Group>

          {/* Sayfalar */}
          <Command.Group
            heading="Sayfalar"
            className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 px-2 py-1.5 mt-2"
          >
            {[
              { ad: "Nabız", path: sayfaLink("nabiz"), Icon: Activity, renk: "#22c55e" },
              {
                ad: "Para Haritası",
                path: sayfaLink("para-haritasi"),
                Icon: MapIcon,
                renk: "#f59e0b",
              },
              {
                ad: "Yarın 90 Gün",
                path: sayfaLink("yarin-90-gun"),
                Icon: Calendar,
                renk: "#ef4444",
              },
              { ad: "Cari Detay", path: sayfaLink("cari-detay"), Icon: Users, renk: "#0ea5e9" },
              {
                ad: "Mali Tablo",
                path: sayfaLink("mali-tablo"),
                Icon: FileText,
                renk: "#06b6d4",
              },
              ...(konsolideErisim
                ? [
                    {
                      ad: "Konsolide Grup",
                      path: "/konsolide",
                      Icon: LayoutGrid,
                      renk: "#8b5cf6",
                    },
                  ]
                : []),
            ].map((s) => (
              <Command.Item
                key={s.path}
                value={`sayfa-${s.ad}`}
                onSelect={() => go(s.path)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-900"
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-lg shrink-0"
                  style={{ background: `${s.renk}20`, color: s.renk }}
                >
                  <s.Icon size={14} />
                </span>
                <span className="text-[13px] flex-1">{s.ad}</span>
                <span className="text-[10px] text-zinc-500">{FIRMALAR[aktifFirma].kisaAd}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Firma Değiştir (sadece çekirdek ortaklar için) */}
          {erisilebilirFirmalar.length > 1 && (
            <Command.Group
              heading="Firma Değiştir"
              className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 px-2 py-1.5 mt-2"
            >
              {erisilebilirFirmalar.map((fId) => {
                const f = FIRMALAR[fId];
                const aktif = fId === aktifFirma;
                return (
                  <Command.Item
                    key={fId}
                    value={`firma-${f.kisaAd}`}
                    onSelect={() => {
                      firmaSec(fId);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-900"
                  >
                    <Building2 size={14} style={{ color: f.renk }} className="shrink-0" />
                    <div className="flex-1">
                      <div className="text-[13px]">{f.kisaAd}</div>
                      <div className="text-[10px] text-zinc-500">{f.isKolu}</div>
                    </div>
                    {aktif && <span className="text-[10px] text-cyan-400">●</span>}
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}
        </Command.List>

        {/* Alt footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-zinc-800 bg-zinc-900/40 text-[10px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded border border-zinc-800">↑↓</kbd>
              dolaş
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded border border-zinc-800">↵</kbd>
              seç
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded border border-zinc-800">ESC</kbd>
              kapat
            </span>
          </div>
          <span className="hidden md:inline">
            Aktif: <span className="text-zinc-300">{routerState.location.pathname}</span>
          </span>
        </div>
      </Command>
    </div>
  );
}
