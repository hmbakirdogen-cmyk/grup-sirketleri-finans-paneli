// KullaniciSecici — süper yönetici için kullanıcı geçişi (impersonation).
// Mehmet Bey direktifi: "programı yapılandırırken herkesi takip etmem gerek".
// 5 kullanıcı kartı, tıkla seç, banner üstte gösterir.

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X, UserCheck, Eye, Crown } from "lucide-react";
import { FIRMALAR } from "@/data/firmalar";
import { KULLANICILAR } from "@/data/kullanicilar";
import { TEMA, FONT } from "@/lib/tema";
import type { KullaniciId } from "@/types/domain";

interface Props {
  acik: boolean;
  onClose: () => void;
  /** Gerçek kullanıcı (süper yönetici, geri dönüş referansı) */
  gercekKullaniciId: KullaniciId;
  /** Şu an görüntülenen kullanıcı (impersonation hedefi) */
  goruntulenenKullaniciId: KullaniciId;
  /** Seçim yapılınca tetiklenir */
  onSec: (id: KullaniciId) => void;
}

const HEPSI: KullaniciId[] = [
  "mehmet-bakirdogen",
  "mehmet-maras",
  "fatih-lazoglu",
  "ahmet-esmeray",
  "konya-fatih",
];

export function KullaniciSecici({
  acik,
  onClose,
  gercekKullaniciId,
  goruntulenenKullaniciId,
  onSec,
}: Props) {
  useEffect(() => {
    if (!acik) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [acik, onClose]);

  return (
    <AnimatePresence>
      {acik && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: 680,
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: 20,
              border: `1px solid ${TEMA.border}`,
              background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bg})`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
              fontFamily: FONT.ana,
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 26px 16px",
                borderBottom: `1px solid ${TEMA.border}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: TEMA.altin,
                    marginBottom: 4,
                  }}
                >
                  Süper Yönetici Görünümü
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: TEMA.ink,
                    margin: 0,
                    letterSpacing: "-0.015em",
                  }}
                >
                  Kullanıcı Olarak Görüntüle
                </h2>
                <p
                  style={{
                    fontSize: 12.5,
                    color: TEMA.inkMuted,
                    marginTop: 4,
                    marginBottom: 0,
                    maxWidth: 480,
                    lineHeight: 1.5,
                  }}
                >
                  Hangi yöneticinin gözünden bakmak istediğinizi seçin —
                  yetki katmanları otomatik filtrelenir, banner üstte
                  hangi kullanıcı olduğunuzu hatırlatır.
                </p>
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
                }}
              >
                <X size={18} />
              </button>
            </header>

            <div
              style={{
                padding: "16px 22px 22px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {HEPSI.map((id) => {
                const k = KULLANICILAR[id];
                const aktif = id === goruntulenenKullaniciId;
                const sizSiniz = id === gercekKullaniciId;
                const yonettigi = k.yonettigi[0] ? FIRMALAR[k.yonettigi[0]] : null;
                const renk = yonettigi?.renk ?? "#94a3b8";

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSec(id);
                      onClose();
                    }}
                    style={{
                      position: "relative",
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: aktif
                        ? `linear-gradient(180deg, ${renk}1f, ${renk}10)`
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${aktif ? renk + "60" : TEMA.border}`,
                      cursor: "pointer",
                      fontFamily: FONT.ana,
                      color: TEMA.ink,
                      transition: "all 180ms ease",
                      boxShadow: aktif ? `0 8px 24px ${renk}22` : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!aktif) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = TEMA.borderAktif;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!aktif) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor = TEMA.border;
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${renk}, ${renk}aa)`,
                          color: "white",
                          fontWeight: 700,
                          fontSize: 13,
                          display: "grid",
                          placeItems: "center",
                          letterSpacing: "-0.02em",
                          boxShadow: `0 4px 12px ${renk}55`,
                        }}
                      >
                        {k.ad
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: TEMA.ink,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {k.hitap}
                          {sizSiniz && (
                            <span
                              title="Sizin gerçek hesabınız"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: `${TEMA.altin}20`,
                                color: TEMA.altin,
                                border: `1px solid ${TEMA.altin}40`,
                                textTransform: "uppercase",
                              }}
                            >
                              <Crown size={9} />
                              Siz
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: TEMA.inkMuted, marginTop: 2 }}>
                          {k.rol === "cekirdek-ortak" ? "Çekirdek Ortak" : "Tek Firma Yöneticisi"}
                          {yonettigi && (
                            <>
                              {" · "}
                              <strong style={{ color: yonettigi.renk }}>{yonettigi.kisaAd}</strong>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 6,
                      }}
                    >
                      {k.firmaIzin.map((fId) => {
                        const f = FIRMALAR[fId];
                        return (
                          <span
                            key={fId}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: 999,
                              background: `${f.renk}1f`,
                              color: f.renk,
                              border: `1px solid ${f.renk}30`,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {f.kisaAd}
                          </span>
                        );
                      })}
                      {k.konsolideGorur && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background: "rgba(167,139,250,0.18)",
                            color: "#a78bfa",
                            border: "1px solid rgba(167,139,250,0.30)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          + Konsolide
                        </span>
                      )}
                    </div>

                    {aktif && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          color: renk,
                        }}
                      >
                        <UserCheck size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <footer
              style={{
                padding: "14px 26px",
                borderTop: `1px solid ${TEMA.border}`,
                background: "rgba(0,0,0,0.20)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: TEMA.inkFaded,
              }}
            >
              <Eye size={12} />
              Bu görünüm değişimi audit log oluşturmaz — sadece UI tarafında
              filtreleme yapar. Gerçek kullanıcının verilerine erişilmez.
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
