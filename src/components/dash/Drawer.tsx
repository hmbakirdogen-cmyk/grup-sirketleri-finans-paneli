// Drawer — sağdan kayan sheet panel. MEBA'dan adapte (iconify → lucide).
// Cari detay, ayar paneli, fatura kalem detayı vb. için ortak primitif.

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { TEMA, FONT } from "@/lib/tema";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Üst sol köşede renk şeridi (cari renk gibi) */
  accent?: string;
  /** Panel max genişlik */
  maxWidth?: number;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  accent,
  maxWidth = 520,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x > 80 || info.velocity.x > 500) onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
            }}
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
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              zIndex: 70,
              display: "flex",
              height: "100%",
              width: "100%",
              maxWidth,
              flexDirection: "column",
              borderLeft: `1px solid ${TEMA.border}`,
              background: TEMA.bg,
              boxShadow: "-20px 0 60px rgba(0,0,0,0.50)",
            }}
          >
            {/* Accent şerit */}
            {accent && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "0 auto 0 0",
                  width: 3,
                  background: accent,
                  boxShadow: `0 0 12px ${accent}80`,
                }}
              />
            )}

            <header
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                padding: "20px 24px",
                borderBottom: `1px solid ${TEMA.border}`,
                background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bg})`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2
                  id="drawer-title"
                  style={{
                    fontFamily: FONT.ana,
                    fontSize: 18,
                    fontWeight: 600,
                    color: TEMA.ink,
                    margin: 0,
                    letterSpacing: "-0.015em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p
                    style={{
                      fontSize: 12,
                      color: TEMA.inkMuted,
                      margin: "4px 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                style={{
                  display: "grid",
                  placeItems: "center",
                  height: 36,
                  width: 36,
                  borderRadius: 10,
                  background: "transparent",
                  border: "none",
                  color: TEMA.inkMuted,
                  cursor: "pointer",
                  transition: "color 180ms ease, background 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = TEMA.ink;
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = TEMA.inkMuted;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X size={18} />
              </button>
            </header>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 24,
              }}
            >
              {children}
            </div>

            {footer && (
              <footer
                style={{
                  borderTop: `1px solid ${TEMA.border}`,
                  padding: 16,
                  background: TEMA.bgKart,
                }}
              >
                {footer}
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
