import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Search,
  ChevronDown,
  Bell,
  Sun,
  Plus,
  Calculator,
  CalendarDays,
  FileSignature,
  Package,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { FIRMALAR } from "@/data/firmalar";
import { TEMA, FONT } from "@/lib/tema";
import type { FirmaId, Kullanici } from "@/types/domain";
import type { Sekme } from "./SekmeNav";

interface NavItem {
  id: Sekme;
  label: string;
  icon: LucideIcon;
  /** V2 rozet — muhasebe defter dışı veri kullanan sayfalar */
  v2?: boolean;
}

const NAV: NavItem[] = [
  { id: "nabiz", label: "Nabız", icon: Activity },
  { id: "akis", label: "Akış", icon: TrendingUp },
  { id: "yarin90", label: "Yarın 90", icon: CalendarDays },
  { id: "alacaklar", label: "Alacaklar", icon: Users },
  { id: "ceksenet", label: "Çek/Senet", icon: FileSignature },
  { id: "urun", label: "Ürün Marjı", icon: Package },
  { id: "personel", label: "Personel", icon: Briefcase },
  { id: "raporlar", label: "Raporlar", icon: FileText },
  { id: "vergi", label: "Vergi Atölyesi", icon: Calculator },
  { id: "ayarlar", label: "Ayarlar", icon: Settings },
];

// 3D bevel preset — visionOS spatial well, MEBA'dan birebir taşıma
const BEVEL_3D = [
  "inset 0 1px 0 rgba(255,255,255,0.10)",
  "inset 0 -1px 0 rgba(0,0,0,0.20)",
  "0 1px 2px rgba(0,0,0,0.30)",
  `0 4px 14px -2px var(--accent, ${TEMA.mavi})55`,
].join(", ");

const GLASS_CHIP_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(31,33,40,0.72), rgba(31,33,40,0.42))",
  border: `1px solid ${TEMA.border}`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.20)",
};

const Divider = () => (
  <span
    aria-hidden
    className="hidden sm:block"
    style={{
      height: 24,
      width: 1,
      margin: "0 4px",
      background:
        "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), transparent)",
    }}
  />
);

interface Props {
  aktifSekme: Sekme;
  onSekmeSec: (s: Sekme) => void;
  aktifFirma: FirmaId;
  erisilebilirFirmalar: FirmaId[];
  onFirmaSec: (f: FirmaId) => void;
  aktifKullanici: Kullanici;
  /** Cmd+K palette açma callback'i */
  onSearchClick?: () => void;
  /** "Senkron" buton tıklama */
  onSyncClick?: () => void;
  /** Profil avatar tıklama → KullaniciSecici aç (impersonation) */
  onProfileClick?: () => void;
}

export function EliteHeader({
  aktifSekme,
  onSekmeSec,
  aktifFirma,
  erisilebilirFirmalar,
  onFirmaSec,
  aktifKullanici,
  onSearchClick,
  onSyncClick,
  onProfileClick,
}: Props) {
  const firma = FIRMALAR[aktifFirma];
  const adKisa = aktifKullanici.hitap;
  const initials = aktifKullanici.ad
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const rolEtiketi =
    aktifKullanici.rol === "cekirdek-ortak" ? "Çekirdek Ortak" : "Tek Firma Yöneticisi";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        width: "100%",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        background:
          "linear-gradient(180deg, rgba(10,11,14,0.85), rgba(10,11,14,0.70))",
        borderBottom: `1px solid ${TEMA.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.40)",
      }}
      role="banner"
    >
      {/* Aurora glow — sol + sağ */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          maskImage: "linear-gradient(180deg, black, transparent 80%)",
          WebkitMaskImage: "linear-gradient(180deg, black, transparent 80%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -96,
            left: "10%",
            height: 192,
            width: 420,
            borderRadius: "50%",
            opacity: 0.30,
            background: `radial-gradient(closest-side, ${TEMA.mavi}aa, transparent)`,
            filter: "blur(48px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: "14%",
            height: 160,
            width: 360,
            borderRadius: "50%",
            opacity: 0.18,
            background: `radial-gradient(closest-side, ${TEMA.altin}aa, transparent)`,
            filter: "blur(56px)",
          }}
        />
      </div>

      {/* ═══ ÜST KAT — Command bar (64px) ═══ */}
      <div
        style={{
          position: "relative",
          borderBottom: `1px solid ${TEMA.border}`,
        }}
      >
        <div
          style={{
            margin: "0 auto",
            display: "flex",
            height: 64,
            maxWidth: 1480,
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
          }}
        >
          {/* SOL — Brand + Org pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <motion.span
              whileHover={{ scale: 1.04, rotate: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                position: "relative",
                display: "flex",
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 11,
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                overflow: "hidden",
                background: `linear-gradient(145deg, #88b8ff 0%, ${TEMA.mavi} 45%, #4178d4 100%)`,
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.30)",
                  "inset 0 -1.5px 0 rgba(0,0,0,0.20)",
                  "0 1px 2px rgba(0,0,0,0.15)",
                  `0 6px 16px -4px ${TEMA.mavi}80`,
                ].join(", "),
                letterSpacing: "-0.02em",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "0 0 50% 0",
                  borderRadius: "11px 11px 0 0",
                  opacity: 0.55,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.42), transparent)",
                }}
              />
              <span style={{ position: "relative" }}>GŞ</span>
            </motion.span>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 2 }}>
              <span
                style={{
                  fontWeight: 600,
                  color: TEMA.ink,
                  fontSize: 14.5,
                  letterSpacing: "-0.018em",
                }}
              >
                MEBA Finans
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.22em",
                  color: TEMA.inkFaded,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Gercek Veri Modu
              </span>
            </div>
          </div>

          {/* Firma seçici — org switcher pill */}
          <FirmaSwitcherPill
            firma={firma}
            erisilebilirFirmalar={erisilebilirFirmalar}
            onFirmaSec={onFirmaSec}
            aktifFirma={aktifFirma}
          />

          {/* ORTA — Search */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <button
              type="button"
              onClick={onSearchClick}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 480,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: 40,
                padding: "0 14px",
                borderRadius: 12,
                transition: "all 180ms ease",
                textAlign: "left",
                cursor: "pointer",
                ...GLASS_CHIP_STYLE,
              }}
              aria-label="Komut paleti (Cmd+K)"
            >
              <Search size={16} color={TEMA.inkMuted} />
              <span
                style={{
                  fontSize: 13,
                  color: TEMA.inkMuted,
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Sorgu, sayfa, firma ara…
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <kbd style={kbdStyle}>⌘</kbd>
                <kbd style={kbdStyle}>K</kbd>
              </span>
            </button>
          </div>

          {/* SAĞ — Utility cluster + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: 2,
                borderRadius: 12,
                ...GLASS_CHIP_STYLE,
              }}
            >
              <IconButton title="Tema" icon={Sun} />
              <span
                aria-hidden
                style={{
                  height: 20,
                  width: 1,
                  background: TEMA.border,
                }}
              />
              <IconButton title="Bildirimler" icon={Bell} />
            </div>

            <Divider />

            {/* Profil capsule — Avatar + ad + rol + chevron, tıklayınca KullaniciSecici */}
            <button
              type="button"
              aria-label="Profil — kullanıcı geçişi (süper yönetici)"
              onClick={onProfileClick}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: 44,
                paddingLeft: 4,
                paddingRight: 12,
                borderRadius: 16,
                cursor: "pointer",
                transition: "all 180ms ease",
                background:
                  "linear-gradient(180deg, rgba(31,33,40,0.65), rgba(31,33,40,0.38))",
                border: `1px solid ${TEMA.border}`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.30)",
              }}
            >
              {/* Avatar */}
              <span style={{ position: "relative", flexShrink: 0 }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: 12,
                    background: `conic-gradient(from 140deg, #88b8ff, ${TEMA.mavi}, ${TEMA.altin}, #88b8ff)`,
                    filter: "blur(0.5px)",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    height: 36,
                    width: 36,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    overflow: "hidden",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "white",
                    background: `linear-gradient(145deg, #88b8ff, ${TEMA.mavi} 50%, #4178d4)`,
                    boxShadow: BEVEL_3D,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: "0 0 50% 0",
                      opacity: 0.50,
                      background: "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
                    }}
                  />
                  <span style={{ position: "relative" }}>{initials}</span>
                </span>
                {/* Online dot */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    height: 12,
                    width: 12,
                    borderRadius: "50%",
                    background: TEMA.yesil,
                    border: `2px solid ${TEMA.bg}`,
                    boxShadow: `0 0 0 1px ${TEMA.yesil}55, 0 0 8px ${TEMA.yesil}55`,
                  }}
                />
              </span>

              {/* Ad + rol */}
              <span
                className="hidden-on-mobile"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.2,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: TEMA.ink,
                    letterSpacing: "-0.012em",
                  }}
                >
                  {adKisa}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      height: 4,
                      width: 4,
                      borderRadius: "50%",
                      background: TEMA.mavi,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: TEMA.inkFaded,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {rolEtiketi}
                  </span>
                </span>
              </span>

              <ChevronDown size={13} color={TEMA.inkFaded} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ ALT KAT — Spatial nav (52px) ═══ */}
      <nav
        style={{
          position: "relative",
          margin: "0 auto",
          display: "flex",
          height: 52,
          maxWidth: 1480,
          alignItems: "center",
          padding: "0 24px",
          gap: 2,
          overflowX: "auto",
        }}
        aria-label="Ana navigasyon"
      >
        {NAV.map((item) => {
          const aktif = item.id === aktifSekme;
          const Ic = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSekmeSec(item.id)}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                padding: "0 12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                color: aktif ? TEMA.ink : TEMA.inkMuted,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 180ms ease",
                fontFamily: FONT.ana,
              }}
              aria-current={aktif ? "page" : undefined}
            >
              {aktif && (
                <motion.span
                  layoutId="elite-nav-capsule"
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    zIndex: -1,
                    background: `linear-gradient(180deg, ${TEMA.mavi}28, ${TEMA.mavi}14)`,
                    boxShadow: BEVEL_3D,
                    border: `1px solid ${TEMA.mavi}40`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Ic
                size={16}
                color={aktif ? TEMA.mavi : TEMA.inkMuted}
                style={{
                  opacity: aktif ? 1 : 0.78,
                  filter: aktif ? `drop-shadow(0 1px 2px ${TEMA.mavi}66)` : undefined,
                }}
              />
              <span style={{ letterSpacing: "-0.005em" }}>{item.label}</span>
              {item.v2 && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.10em",
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: "rgba(167,139,250,0.18)",
                    color: "#a78bfa",
                    border: "1px solid rgba(167,139,250,0.30)",
                    textTransform: "uppercase",
                  }}
                  title="V2 — muhasebe defter dışı, sonraki sürümde"
                >
                  V2
                </span>
              )}
            </button>
          );
        })}

        {/* Sağ — context aksiyon (Hızlı senkron) */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={onSyncClick}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 14px",
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
              background: `linear-gradient(180deg, ${TEMA.mavi}, #4178d4)`,
              border: "none",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.20)",
                "inset 0 -1px 0 rgba(0,0,0,0.16)",
                "0 1px 2px rgba(0,0,0,0.20)",
                `0 6px 16px -4px ${TEMA.mavi}80`,
              ].join(", "),
              transition: "transform 180ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus size={14} />
            <span>Senkron</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

// ─── Yardımcı komponentler ──────────────────────────────────────────────────

const kbdStyle: React.CSSProperties = {
  padding: "2px 6px",
  borderRadius: 5,
  fontSize: 10,
  fontFamily: "ui-monospace, monospace",
  color: TEMA.inkFaded,
  background: "rgba(10,11,14,0.6)",
  border: `1px solid ${TEMA.border}`,
  boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
};

function IconButton({ title, icon: Ic }: { title: string; icon: LucideIcon }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      style={{
        display: "grid",
        placeItems: "center",
        height: 36,
        width: 36,
        borderRadius: 10,
        color: TEMA.inkMuted,
        background: "transparent",
        border: "none",
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
      <Ic size={16} />
    </button>
  );
}

function FirmaSwitcherPill({
  firma,
  erisilebilirFirmalar,
  onFirmaSec,
  aktifFirma,
}: {
  firma: typeof FIRMALAR[FirmaId];
  erisilebilirFirmalar: FirmaId[];
  onFirmaSec: (f: FirmaId) => void;
  aktifFirma: FirmaId;
}) {
  const cokluFirma = erisilebilirFirmalar.length > 1;
  // Basit dropdown — modal değil
  // (drawer açılırsa Drawer component'i tercih edilebilir; şimdilik native select)
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        disabled={!cokluFirma}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 12px",
          borderRadius: 12,
          fontSize: 12.5,
          fontWeight: 500,
          color: TEMA.inkSoft,
          cursor: cokluFirma ? "pointer" : "default",
          background:
            "linear-gradient(180deg, rgba(31,33,40,0.65), rgba(31,33,40,0.40))",
          border: `1px solid ${TEMA.border}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.20)",
          fontFamily: FONT.ana,
        }}
        onClick={() => {
          if (!cokluFirma) return;
          const idx = erisilebilirFirmalar.indexOf(aktifFirma);
          const next = erisilebilirFirmalar[(idx + 1) % erisilebilirFirmalar.length]!;
          onFirmaSec(next);
        }}
        aria-label="Firma seçici"
      >
        <span
          style={{
            height: 6,
            width: 6,
            borderRadius: "50%",
            background: firma.renk,
            boxShadow: `0 0 0 2px ${firma.renk}40`,
          }}
        />
        <span style={{ fontWeight: 600, letterSpacing: "-0.005em" }}>{firma.kisaAd}</span>
        <span style={{ color: TEMA.inkFaded, fontSize: 11 }}>/ {firma.konum.split(" ")[0]}</span>
        {cokluFirma && <ChevronDown size={12} color={TEMA.inkFaded} />}
      </button>
    </div>
  );
}
