// Drawer — sağdan kayan sheet panel
// MEBA Komuta Merkezi'nden aktarıldı (2026-05-26 Sprint 1).
// Swipe-to-close (drag x), ESC kapatma, role=dialog aria-modal, footer slot, spring.
//
// Kullanım örnekleri (Grup Şirketleri Finans Paneli):
// - Cari Detay drill-down (kategori → cari → fatura → kalem)
// - Logo Go bayi entegrasyon ayar paneli
// - Kullanıcı/firma ayar paneli
// - Fatura kalem detayı
//
// Bağımlılık: framer-motion + lucide-react (X ikonu için).

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const DRAWER_EASE = [0.22, 0.61, 0.36, 1] as const;

export function Drawer({ open, onClose, title, subtitle, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 500) onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.4 }}
            onDragEnd={handleDragEnd}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-zinc-800 p-5">
              <div className="min-w-0">
                <h2 id="drawer-title" className="truncate text-base font-semibold text-zinc-100">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
              >
                <X size={20} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer ? (
              <footer className="border-t border-zinc-800 p-4">{footer}</footer>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
