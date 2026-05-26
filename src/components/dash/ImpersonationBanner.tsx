// ImpersonationBanner — süper yönetici impersonation aktifken üstte sabit şerit.
// "Şu an X Bey olarak görüntülüyorsunuz · Kendime dön"

import { motion, AnimatePresence } from "framer-motion";
import { Crown, RotateCcw, Eye } from "lucide-react";
import { TEMA, FONT } from "@/lib/tema";
import type { Kullanici } from "@/types/domain";

interface Props {
  /** Görüntülenen (impersonation hedefi) — null ise banner çıkmaz */
  goruntulenen: Kullanici | null;
  /** Süper yöneticiye dön */
  onGercege: () => void;
  /** Süper yönetici adı (Crown rozet için) */
  gercekHitap: string;
}

export function ImpersonationBanner({ goruntulenen, onGercege, gercekHitap }: Props) {
  return (
    <AnimatePresence>
      {goruntulenen && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 35,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 24px",
            background: `linear-gradient(90deg, ${TEMA.altin}15, ${TEMA.altin}08 50%, transparent)`,
            borderBottom: `1px solid ${TEMA.altin}40`,
            backdropFilter: "blur(20px) saturate(160%)",
            fontFamily: FONT.ana,
          }}
        >
          {/* Crown rozet */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: `${TEMA.altin}25`,
              border: `1px solid ${TEMA.altin}50`,
              color: TEMA.altin,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
            title={`Gerçek hesap: ${gercekHitap}`}
          >
            <Crown size={11} />
            Süper Yönetici
          </span>

          <Eye size={14} color={TEMA.inkMuted} />

          <span style={{ fontSize: 13, color: TEMA.inkSoft, flex: 1 }}>
            Şu an{" "}
            <strong style={{ color: TEMA.ink }}>{goruntulenen.hitap}</strong>{" "}
            gözünden bakıyorsunuz · {goruntulenen.rol === "cekirdek-ortak"
              ? "Çekirdek Ortak"
              : "Tek Firma Yöneticisi"}
            {" · "}
            <span style={{ color: TEMA.inkFaded }}>{goruntulenen.firmaIzin.length} firma erişimi</span>
          </span>

          <button
            type="button"
            onClick={onGercege}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${TEMA.altin}, #c19660)`,
              color: "white",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${TEMA.altin}50`,
              letterSpacing: "0.02em",
            }}
          >
            <RotateCcw size={12} />
            Kendime Dön
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
