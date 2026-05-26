// CommandPalette — Cmd+K hızlı erişim.
// Sayfa atlama + firma değişimi + AI sorgu placeholder.
// MEBA CommandPalette'ten sade adaptasyon (iconify → lucide).

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Calculator,
  Layers,
  Search,
  Sparkles,
  ArrowRight,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { FIRMALAR } from "@/data/firmalar";
import { TEMA, FONT } from "@/lib/tema";
import type { FirmaId } from "@/types/domain";
import type { Sekme } from "./SekmeNav";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  aktifFirma: FirmaId;
  erisilebilirFirmalar: FirmaId[];
  konsolideErisim: boolean;
  onSekmeSec: (s: Sekme) => void;
  onFirmaSec: (f: FirmaId) => void;
}

interface SekmeOgesi {
  id: Sekme;
  ad: string;
  icon: LucideIcon;
  renk: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  aktifFirma,
  erisilebilirFirmalar,
  konsolideErisim,
  onSekmeSec,
  onFirmaSec,
}: Props) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  // Cmd+K global kısayol
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const sekmeler: SekmeOgesi[] = useMemo(() => {
    const base: SekmeOgesi[] = [
      { id: "nabiz", ad: "Nabız", icon: Activity, renk: "#22c55e" },
      { id: "akis", ad: "Akış", icon: TrendingUp, renk: "#f59e0b" },
      { id: "alacaklar", ad: "Alacaklar", icon: Users, renk: "#0ea5e9" },
      { id: "raporlar", ad: "Raporlar", icon: FileText, renk: "#06b6d4" },
      { id: "vergi", ad: "Vergi Atölyesi", icon: Calculator, renk: "#d946ef" },
      { id: "ayarlar", ad: "Ayarlar", icon: Settings, renk: "#94a3b8" },
    ];
    if (konsolideErisim) {
      base.push({ id: "grup", ad: "Konsolide Grup", icon: Layers, renk: "#8b5cf6" });
    }
    return base;
  }, [konsolideErisim]);

  const aiOnerileri = useMemo(() => {
    if (q.trim().length < 2) {
      return [
        "MEBA bu ay nakit pozisyon",
        "MESA top 10 cari",
        "ELMOS marj sapması analizi",
        "Konsolide grup yıllık kâr",
      ];
    }
    return [
      `"${q}" için detay raporu hazırla`,
      `"${q}" cari listesinde ara`,
      `"${q}" hakkında AI yorumu`,
    ];
  }, [q]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Komuta paleti"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        padding: "12vh 16px 16px",
      }}
    >
      <button
        type="button"
        aria-label="Kapat"
        onClick={() => onOpenChange(false)}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(8px)",
          border: "none",
          cursor: "pointer",
        }}
      />
      <Command
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 640,
          borderRadius: 16,
          border: `1px solid ${TEMA.border}`,
          background: "rgba(15,17,22,0.92)",
          backdropFilter: "blur(28px) saturate(180%)",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.05)",
          fontFamily: FONT.ana,
        }}
        filter={() => 1}
        loop
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${TEMA.border}`,
            padding: "14px 18px",
          }}
        >
          <Search size={18} color={TEMA.inkMuted} />
          <Command.Input
            value={q}
            onValueChange={setQ}
            placeholder="Sayfa, firma, AI sorgu ara…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: TEMA.ink,
              fontFamily: FONT.ana,
            }}
          />
          <kbd
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10,
              color: TEMA.inkFaded,
              padding: "2px 8px",
              borderRadius: 5,
              border: `1px solid ${TEMA.border}`,
            }}
          >
            ESC
          </kbd>
        </div>

        <Command.List
          style={{
            maxHeight: 420,
            overflowY: "auto",
            padding: 8,
          }}
        >
          <Command.Empty
            style={{
              padding: "30px 16px",
              textAlign: "center",
              fontSize: 13,
              color: TEMA.inkMuted,
            }}
          >
            Eşleşen sonuç yok.
          </Command.Empty>

          {/* AI Hızlı Sorgu */}
          <GrupBaslik>AI Hızlı Sorgu</GrupBaslik>
          {aiOnerileri.map((oneri) => (
            <Command.Item
              key={oneri}
              value={`ai-${oneri}`}
              onSelect={() => {
                console.log("AI sorgu:", oneri);
                onOpenChange(false);
              }}
              style={ogeStili}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(139,92,246,0.15)",
                  color: "#a78bfa",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={14} />
              </span>
              <span style={{ flex: 1, color: TEMA.ink }}>{oneri}</span>
              <ArrowRight size={12} color={TEMA.inkFaded} />
            </Command.Item>
          ))}

          {/* Sayfalar */}
          <GrupBaslik style={{ marginTop: 12 }}>Sayfalar</GrupBaslik>
          {sekmeler.map((s) => {
            const Ic = s.icon;
            return (
              <Command.Item
                key={s.id}
                value={`sayfa-${s.ad}`}
                onSelect={() => {
                  onSekmeSec(s.id);
                  onOpenChange(false);
                }}
                style={ogeStili}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${s.renk}1f`,
                    color: s.renk,
                    flexShrink: 0,
                  }}
                >
                  <Ic size={14} />
                </span>
                <span style={{ flex: 1, color: TEMA.ink }}>{s.ad}</span>
                <span style={{ fontSize: 11, color: TEMA.inkFaded }}>
                  {FIRMALAR[aktifFirma].kisaAd}
                </span>
              </Command.Item>
            );
          })}

          {/* Firma değiştir */}
          {erisilebilirFirmalar.length > 1 && (
            <>
              <GrupBaslik style={{ marginTop: 12 }}>Firma Değiştir</GrupBaslik>
              {erisilebilirFirmalar.map((fId) => {
                const f = FIRMALAR[fId];
                const aktif = fId === aktifFirma;
                return (
                  <Command.Item
                    key={fId}
                    value={`firma-${f.kisaAd}`}
                    onSelect={() => {
                      onFirmaSec(fId);
                      onOpenChange(false);
                    }}
                    style={ogeStili}
                  >
                    <Building2 size={14} color={f.renk} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: TEMA.ink }}>{f.kisaAd}</div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: TEMA.inkFaded,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f.isKolu}
                      </div>
                    </div>
                    {aktif && (
                      <span style={{ fontSize: 10, color: f.renk, fontWeight: 700 }}>● aktif</span>
                    )}
                  </Command.Item>
                );
              })}
            </>
          )}
        </Command.List>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderTop: `1px solid ${TEMA.border}`,
            background: "rgba(0,0,0,0.30)",
            fontSize: 10.5,
            color: TEMA.inkFaded,
          }}
        >
          <KisayolEtiket k="↑↓" ad="dolaş" />
          <KisayolEtiket k="↵" ad="seç" />
          <KisayolEtiket k="ESC" ad="kapat" />
        </div>
      </Command>
    </div>
  );
}

const ogeStili: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
  color: TEMA.ink,
};

function GrupBaslik({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: TEMA.inkFaded,
        padding: "6px 12px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function KisayolEtiket({ k, ad }: { k: string; ad: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <kbd
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 10,
          padding: "1px 5px",
          borderRadius: 4,
          border: `1px solid ${TEMA.border}`,
        }}
      >
        {k}
      </kbd>
      {ad}
    </span>
  );
}
