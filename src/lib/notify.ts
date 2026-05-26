// Notify — Sonner üzerinde AI aksiyon + Cmd+Z global undo + stacking toast
// MEBA Komuta Merkezi'nden aktarıldı (2026-05-26 Sprint 1).
//
// Özellikler:
// - Sağ-üst stack (Türk evrak protokolü: imza-tarih sağ-üst)
// - AI aksiyon butonu ("MEBA nakit forecast güncellendi — sapma raporu açayım mı?")
// - ⌘Z global undo (son 1 undo callback'i tetiklenir)
// - 8sn auto-dismiss varsayılan
// - 4 seviye: success / info / warning / error
//
// Kullanım:
//   notify.success("MEBA 2026-05 hedef güncellendi");
//   notify.warning("Logo Go sync 4 dakika geç kaldı", {
//     aiAction: { label: "Tekrar dene", onAccept: () => syncTekrar() }
//   });
//   notify.info("Cari silindi", {
//     undo: { onUndo: () => geriAl(silinenId) }
//   });

import { toast as sonnerToast } from "sonner";
import { createElement } from "react";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";

interface NotifyOpts {
  description?: string;
  /** AI önerisi — küçük buton olarak gösterilir, kabul edilirse onAccept tetiklenir */
  aiAction?: {
    label: string;
    onAccept: () => void;
  };
  /** Geri al — ⌘Z ile veya buton tıkla */
  undo?: {
    label?: string;
    onUndo: () => void;
  };
  /** Süre — varsayılan 8sn */
  duration?: number;
}

type Seviye = "success" | "info" | "warning" | "error";

const SEVIYE_AYAR: Record<Seviye, { renk: string; Icon: typeof CheckCircle2 }> = {
  success: { renk: "#22c55e", Icon: CheckCircle2 },
  info: { renk: "#0ea5e9", Icon: Info },
  warning: { renk: "#f59e0b", Icon: AlertTriangle },
  error: { renk: "#ef4444", Icon: AlertOctagon },
};

function aiActionRender(ai: { label: string; onAccept: () => void }, dismiss: () => void) {
  return createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        ai.onAccept();
        dismiss();
      },
      className:
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]",
      style: {
        background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
        boxShadow: "0 2px 6px rgba(139, 92, 246, 0.3)",
      },
    },
    createElement(Sparkles, { size: 12 }),
    ai.label,
  );
}

function undoRender(undo: { label?: string; onUndo: () => void }, dismiss: () => void) {
  return createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        undo.onUndo();
        dismiss();
      },
      className:
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-zinc-400 hover:text-zinc-100 border border-zinc-700 hover:bg-zinc-800 transition-colors uppercase tracking-wider",
    },
    createElement(Undo2, { size: 10 }),
    undo.label ?? "Geri al",
  );
}

function build(level: Seviye, message: string, opts?: NotifyOpts) {
  const { renk, Icon: SeviyeIcon } = SEVIYE_AYAR[level];

  // ⌘Z undo register
  if (opts?.undo) {
    sonUndoCallback = opts.undo.onUndo;
  }

  const id = sonnerToast.custom(
    (t) => {
      const dismiss = () => sonnerToast.dismiss(t);

      return createElement(
        "div",
        {
          className:
            "flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-3.5 min-w-[320px] max-w-[420px]",
          style: {
            boxShadow: "0 12px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
          },
        },
        // İkon
        createElement(
          "div",
          {
            className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            style: { background: `${renk}1f`, color: renk },
          },
          createElement(SeviyeIcon, { size: 18 }),
        ),
        // İçerik
        createElement(
          "div",
          { className: "flex-1 min-w-0" },
          createElement(
            "div",
            {
              className: "font-semibold text-zinc-100 text-[13px] leading-snug",
            },
            message,
          ),
          opts?.description &&
            createElement(
              "div",
              { className: "text-[11px] text-zinc-400 mt-0.5 leading-snug" },
              opts.description,
            ),
          (opts?.aiAction || opts?.undo) &&
            createElement(
              "div",
              { className: "flex items-center gap-1.5 mt-2.5" },
              opts.aiAction ? aiActionRender(opts.aiAction, dismiss) : null,
              opts.undo ? undoRender(opts.undo, dismiss) : null,
            ),
        ),
        // Kapatma butonu
        createElement(
          "button",
          {
            type: "button",
            onClick: dismiss,
            className: "shrink-0 text-zinc-500 hover:text-zinc-100 transition-colors",
            "aria-label": "Bildirimi kapat",
          },
          createElement(X, { size: 16 }),
        ),
      );
    },
    {
      duration: opts?.duration ?? 8000,
      position: "top-right",
    },
  );

  return id;
}

export const notify = {
  success: (m: string, o?: NotifyOpts) => build("success", m, o),
  info: (m: string, o?: NotifyOpts) => build("info", m, o),
  warning: (m: string, o?: NotifyOpts) => build("warning", m, o),
  error: (m: string, o?: NotifyOpts) => build("error", m, o),
  dismiss: (id: string | number) => sonnerToast.dismiss(id),
};

// ⌘Z / Ctrl+Z global undo — son undo callback'i tetiklenir
let sonUndoCallback: (() => void) | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    const cmdZ = (e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey;
    if (cmdZ && sonUndoCallback) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        sonUndoCallback();
        sonUndoCallback = null;
      }
    }
  });
}

export function registerUndo(cb: () => void): void {
  sonUndoCallback = cb;
}
