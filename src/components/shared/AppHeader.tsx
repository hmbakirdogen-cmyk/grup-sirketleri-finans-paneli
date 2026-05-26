// AppHeader — Grup Şirketleri Finans Paneli üst nav
// MEBA ElitHeader şablonundan adapte edildi (2026-05-26 Sprint 2).
//
// Spatial Command Bar tasarımı (Arc/Linear/Vercel/Stripe esinli):
//   [Brand] [Firma seçici pill] ━━ spacer ━━ [Search] [Avatar pill]
//   [Nav sekmeleri — 5 sayfa] · alt katmanda layoutId pill animasyonu
//
// Yetki:
// - Çekirdek 3 ortak (cekirdek-ortak rol) → firma dropdown görünür + Konsolide link
// - Tek firma yöneticisi → dropdown gizli (sabit metin), Konsolide link gizli

import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Activity,
  Map as MapIcon,
  Calendar,
  Users,
  FileText,
  LayoutGrid,
  Search,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FIRMALAR } from "@/data/firmalar";
import type { FirmaId } from "@/types/domain";

interface NavItem {
  to: string;
  label: string;
  Icon: typeof Activity;
}

function navListele(firmaId: FirmaId, konsolide: boolean): NavItem[] {
  const base: NavItem[] = [
    { to: `/${firmaId}/nabiz`, label: "Nabız", Icon: Activity },
    { to: `/${firmaId}/para-haritasi`, label: "Para Haritası", Icon: MapIcon },
    { to: `/${firmaId}/yarin-90-gun`, label: "Yarın 90 Gün", Icon: Calendar },
    { to: `/${firmaId}/cari-detay`, label: "Cari Detay", Icon: Users },
    { to: `/${firmaId}/mali-tablo`, label: "Mali Tablo", Icon: FileText },
  ];
  if (konsolide) {
    base.push({ to: `/konsolide`, label: "Konsolide", Icon: LayoutGrid });
  }
  return base;
}

const GLASS_CHIP_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(39, 39, 42, 0.65), rgba(39, 39, 42, 0.40))",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.20)",
};

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden sm:block h-6 w-px mx-1"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), transparent)",
      }}
    />
  );
}

export function AppHeader() {
  const { aktifKullanici, aktifFirma, firmaSec, konsolideErisim, erisilebilirFirmalar } =
    useAuth();
  const router = useRouterState();
  const aktifPath = router.location.pathname;

  const [firmaSeciciAcik, setFirmaSeciciAcik] = useState(false);

  const aktifFirmaData = FIRMALAR[aktifFirma];
  const navItems = navListele(aktifFirma, konsolideErisim);

  // Çoklu firma erişimi varsa dropdown göster
  const cokluFirma = erisilebilirFirmalar.length > 1;

  return (
    <header
      className="sticky top-0 z-50 border-b border-zinc-900/80 bg-zinc-950/85"
      style={{
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      {/* Üst command bar */}
      <div className="flex h-16 items-center gap-2 px-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 mr-2 transition-opacity hover:opacity-80"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl font-bold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
              boxShadow: "0 4px 12px rgba(14,165,233,0.35)",
            }}
          >
            GŞ
          </span>
          <div className="hidden md:block">
            <div
              className="text-[13px] font-bold text-zinc-100 leading-tight"
              style={{ letterSpacing: "-0.01em" }}
            >
              Grup Şirketleri
            </div>
            <div className="text-[10px] text-zinc-500 leading-tight">Finans Paneli</div>
          </div>
        </Link>

        <Divider />

        {/* Firma seçici pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => cokluFirma && setFirmaSeciciAcik((a) => !a)}
            disabled={!cokluFirma}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-zinc-900/60 disabled:cursor-default"
            style={GLASS_CHIP_STYLE}
            aria-label="Firma seçici"
          >
            <span
              className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-white shrink-0"
              style={{ background: aktifFirmaData.renk }}
            >
              {aktifFirmaData.kisaAd.slice(0, 2)}
            </span>
            <span className="text-[13px] font-semibold text-zinc-100 truncate max-w-[180px]">
              {aktifFirmaData.kisaAd}
            </span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">
              · {aktifFirmaData.konum.split(" ")[0]}
            </span>
            {cokluFirma && (
              <ChevronDown
                size={12}
                className="text-zinc-500 transition-transform"
                style={{ transform: firmaSeciciAcik ? "rotate(180deg)" : "none" }}
              />
            )}
          </button>

          {/* Firma dropdown */}
          {cokluFirma && firmaSeciciAcik && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFirmaSeciciAcik(false)}
                aria-hidden
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute left-0 top-full mt-2 w-72 z-50 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl"
                style={{
                  boxShadow: "0 24px 60px rgba(0,0,0,0.50)",
                }}
              >
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                  Firma Seçici
                </div>
                {erisilebilirFirmalar.map((fId) => {
                  const f = FIRMALAR[fId];
                  const aktif = fId === aktifFirma;
                  return (
                    <button
                      key={fId}
                      type="button"
                      onClick={() => {
                        firmaSec(fId);
                        setFirmaSeciciAcik(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-zinc-900"
                      style={{
                        background: aktif ? "rgba(255,255,255,0.04)" : "transparent",
                      }}
                    >
                      <span
                        className="grid h-8 w-8 place-items-center rounded-lg text-[11px] font-bold text-white shrink-0"
                        style={{ background: f.renk }}
                      >
                        {f.kisaAd.slice(0, 2)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-zinc-100">{f.kisaAd}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{f.isKolu}</div>
                      </div>
                      {aktif && <span className="text-[10px] text-cyan-400">●</span>}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>

        {/* Flex spacer */}
        <div className="flex-1" />

        {/* Search hint */}
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:bg-zinc-900/60 hover:text-zinc-200"
          style={GLASS_CHIP_STYLE}
          aria-label="Komuta paleti (Cmd+K)"
        >
          <Search size={14} />
          <span>Sorgu ara</span>
          <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
        </button>

        <Divider />

        {/* Notif */}
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-900/60 hover:text-zinc-200"
          aria-label="Bildirimler"
        >
          <Bell size={16} />
        </button>

        <Divider />

        {/* Avatar pill */}
        <div
          className="inline-flex items-center gap-2 rounded-xl px-2 py-1"
          style={GLASS_CHIP_STYLE}
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold text-white"
            style={{
              background:
                aktifKullanici.rol === "cekirdek-ortak"
                  ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                  : "linear-gradient(135deg, #22c55e, #06b6d4)",
            }}
          >
            {aktifKullanici.ad
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div className="hidden md:block pr-1">
            <div className="text-[12px] font-semibold text-zinc-100 leading-tight">
              {aktifKullanici.hitap}
            </div>
            <div className="text-[10px] text-zinc-500 leading-tight">
              {aktifKullanici.rol === "cekirdek-ortak" ? "Çekirdek Ortak" : "Tek Firma Yöneticisi"}
            </div>
          </div>
        </div>
      </div>

      {/* Alt nav (5-6 sekme) */}
      <nav className="flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {navItems.map((item) => {
          const aktif =
            aktifPath === item.to || (item.to !== "/" && aktifPath.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors"
              style={{
                color: aktif ? "rgb(244, 244, 245)" : "rgb(161, 161, 170)",
              }}
            >
              {aktif && (
                <motion.div
                  layoutId="header-nav-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.Icon size={14} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
