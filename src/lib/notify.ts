// notify — Sonner üzerinde grup paneli için sade toast altyapısı.
// MEBA notify.ts'ten adapte; iconify → lucide, Anadolu iş dili.
//
// Kullanım:
//   notify.success("Logo Go senkronize edildi");
//   notify.warning("Açık alacaklar yüksek", { description: "ELMOS Otomasyon 4.4M ₺" });
//   notify.info("Yeni mali takvim girdisi", { aiAction: { label: "Detay", onAccept: () => ... } });

import { toast as sonnerToast } from "sonner";
import { createElement } from "react";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  X,
} from "lucide-react";

interface NotifyOpts {
  description?: string;
  /** AI önerisi — küçük buton; kabul edilirse onAccept çağrılır */
  aiAction?: {
    label: string;
    onAccept: () => void;
  };
  /** Süre — ms, default 6 sn */
  duration?: number;
}

type Seviye = "success" | "info" | "warning" | "error";

const SEVIYE_AYAR: Record<Seviye, { renk: string; Icon: typeof CheckCircle2 }> = {
  success: { renk: "#4ade80", Icon: CheckCircle2 },
  info: { renk: "#5b9dff", Icon: Info },
  warning: { renk: "#d4af7a", Icon: AlertTriangle },
  error: { renk: "#f87171", Icon: AlertOctagon },
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
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: "white",
        cursor: "pointer",
        border: "none",
        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
        boxShadow: "0 2px 6px rgba(139, 92, 246, 0.3)",
      },
    },
    createElement(Sparkles, { size: 11 }),
    ai.label,
  );
}

function build(level: Seviye, message: string, opts?: NotifyOpts) {
  const { renk, Icon: Ic } = SEVIYE_AYAR[level];
  const id = sonnerToast.custom(
    (t) => {
      const dismiss = () => sonnerToast.dismiss(t);
      return createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            borderRadius: 14,
            border: `1px solid rgba(255,255,255,0.06)`,
            background: "rgba(15, 17, 22, 0.92)",
            backdropFilter: "blur(20px) saturate(170%)",
            padding: 14,
            minWidth: 320,
            maxWidth: 420,
            boxShadow: "0 12px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.05)",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        },
        createElement(
          "div",
          {
            style: {
              display: "flex",
              width: 32,
              height: 32,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              background: `${renk}1f`,
              color: renk,
            },
          },
          createElement(Ic, { size: 18 }),
        ),
        createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          createElement(
            "div",
            {
              style: {
                fontWeight: 600,
                color: "#f3f4f6",
                fontSize: 13,
                lineHeight: 1.4,
              },
            },
            message,
          ),
          opts?.description &&
            createElement(
              "div",
              { style: { fontSize: 11.5, color: "#94a3b8", marginTop: 3, lineHeight: 1.45 } },
              opts.description,
            ),
          opts?.aiAction &&
            createElement(
              "div",
              { style: { display: "flex", gap: 6, marginTop: 10 } },
              aiActionRender(opts.aiAction, dismiss),
            ),
        ),
        createElement(
          "button",
          {
            type: "button",
            onClick: dismiss,
            style: {
              flexShrink: 0,
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              padding: 0,
              transition: "color 180ms ease",
            },
            "aria-label": "Bildirimi kapat",
          },
          createElement(X, { size: 16 }),
        ),
      );
    },
    {
      duration: opts?.duration ?? 6000,
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
