// MEBA Nabız — ECG/kardiyo monitör estetiği
// Referans: iStock anatomik kalp + yeşil EKG nabız + siyah grid (Mehmet Bey çıpası)
//
// Sahne (sol → sağ):
//   - 3D parlak mavi pulsing form (firmanın canlı kalbi)
//   - Yeşil neon EKG dalga grafiği (12 ay ciro QRS-T dalgaları)
//   - BPM-tarzı rakamlar (ciro = nabız, marj = ritim)
//
// Arka plan: saf siyah + yeşil ECG grid (medikal monitör)

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import CountUp from "react-countup";
import { FIRMALAR } from "./data/firmalar";
import { FINANS_VERISI } from "./data/mock-finans";
import type { FirmaId } from "./types/domain";

const FIRMA_LISTE: FirmaId[] = ["meba", "mesa", "elmos", "arkon"];

// === 3D PULSING HEART/CORE ====================================================

function PulsingCore({ renk }: { renk: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const tBase = useRef(0);

  useFrame((_, dt) => {
    tBase.current += dt;
    // Kalp atışı ritmi — iki vuruş + uzun bekleyiş (real heartbeat curve)
    const beat = Math.max(
      0,
      Math.sin(tBase.current * 4.5) ** 12 * 0.30 +
        Math.sin(tBase.current * 4.5 - 0.4) ** 16 * 0.15,
    );
    const scale = 1 + beat;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y += 0.003;
    }
    if (ring1.current) {
      ring1.current.scale.setScalar(1 + beat * 0.6);
      ring1.current.rotation.z += 0.005;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(1 + beat * 0.4);
      ring2.current.rotation.x += 0.003;
      ring2.current.rotation.y -= 0.004;
    }
  });

  return (
    <group>
      {/* İç ana küre — distort material (organik form) */}
      <mesh ref={meshRef} castShadow>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color={renk}
          distort={0.32}
          speed={1.6}
          roughness={0.15}
          metalness={0.05}
          emissive={renk}
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* Halka 1 — dış yörünge */}
      <mesh ref={ring1}>
        <torusGeometry args={[1.7, 0.025, 16, 100]} />
        <meshStandardMaterial
          color={renk}
          emissive={renk}
          emissiveIntensity={1.2}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Halka 2 — çapraz */}
      <mesh ref={ring2}>
        <torusGeometry args={[2.1, 0.015, 16, 100]} />
        <meshStandardMaterial
          color={renk}
          emissive={renk}
          emissiveIntensity={1.4}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* İç ışık küresi */}
      <pointLight position={[0, 0, 0]} intensity={2} color={renk} distance={6} />
    </group>
  );
}

function CoreSahne({ renk }: { renk: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 35 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 4, 4]} intensity={1.4} />
        <directionalLight position={[-3, -2, -3]} intensity={0.5} color="#00ffaa" />
        <Environment preset="night" environmentIntensity={0.4} />
        <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.25}>
          <PulsingCore renk={renk} />
        </Float>
      </Suspense>
    </Canvas>
  );
}

// === EKG NABIZ GRAFİĞİ ========================================================

interface EkgProps {
  son12Ay: { ay: string; ciro: number; brutMarj: number }[];
  /** EKG line rengi (medikal yeşil veya canlı renk) */
  renk?: string;
}

/**
 * EKG dalga yolu üretici — her veri noktasında P-Q-R-S-T kalp dalgası.
 * QRS tepe yüksekliği = aylık ciro / max ciro (firma performansı).
 */
function ekgYolu(
  veri: { ciro: number }[],
  w: number,
  h: number,
  padX: number,
  taban: number,
): string {
  const maxCiro = Math.max(...veri.map((v) => v.ciro));
  const minCiro = Math.min(...veri.map((v) => v.ciro));
  const span = maxCiro - minCiro || 1;

  const segGenislik = (w - padX * 2) / veri.length;
  const yTaban = h * 0.5 + taban;

  let yol = `M ${padX} ${yTaban}`;

  veri.forEach((nokta, i) => {
    const x0 = padX + i * segGenislik;
    // QRS yüksekliği — performansa göre 30-160 px
    const yogunluk = (nokta.ciro - minCiro) / span;
    const qrsYuk = 35 + yogunluk * 130;

    // Düz baseline kısmı (segment başı %20)
    const xBaseline = x0 + segGenislik * 0.20;
    yol += ` L ${xBaseline} ${yTaban}`;

    // P dalgası — küçük yukarı tümsek
    const xP1 = x0 + segGenislik * 0.25;
    const xP2 = x0 + segGenislik * 0.30;
    const xP3 = x0 + segGenislik * 0.35;
    yol += ` Q ${xP1} ${yTaban - qrsYuk * 0.15}, ${xP2} ${yTaban}`;
    yol += ` L ${xP3} ${yTaban}`;

    // QRS kompleksi — Q (küçük aşağı), R (büyük yukarı), S (büyük aşağı)
    const xQ = x0 + segGenislik * 0.40;
    const xR = x0 + segGenislik * 0.45;
    const xS = x0 + segGenislik * 0.50;
    yol += ` L ${xQ} ${yTaban + qrsYuk * 0.15}`;
    yol += ` L ${xR} ${yTaban - qrsYuk}`;
    yol += ` L ${xS} ${yTaban + qrsYuk * 0.30}`;

    // T dalgası
    const xT1 = x0 + segGenislik * 0.60;
    const xT2 = x0 + segGenislik * 0.70;
    const xT3 = x0 + segGenislik * 0.80;
    yol += ` L ${xT1} ${yTaban}`;
    yol += ` Q ${xT2} ${yTaban - qrsYuk * 0.25}, ${xT3} ${yTaban}`;

    // Düz baseline (segment sonu)
    const xSon = x0 + segGenislik;
    yol += ` L ${xSon} ${yTaban}`;
  });

  return yol;
}

function EkgGrafigi({ son12Ay, renk = "#22ff88" }: EkgProps) {
  const W = 1080;
  const H = 360;
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    const ctx = gsap.context(() => {
      gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 4.2,
        ease: "none",
        repeat: -1,
        repeatDelay: 0.4,
      });
    });
    return () => ctx.revert();
  }, [son12Ay]);

  const yolStr = ekgYolu(son12Ay, W, H, 24, 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        {/* Yeşil grid pattern (medikal monitör) */}
        <pattern id="ekg-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          {/* Küçük grid */}
          <path d="M 8 0 L 8 32 M 16 0 L 16 32 M 24 0 L 24 32" stroke="rgba(34,255,136,0.07)" strokeWidth="0.5" />
          <path d="M 0 8 L 32 8 M 0 16 L 32 16 M 0 24 L 32 24" stroke="rgba(34,255,136,0.07)" strokeWidth="0.5" />
          {/* Büyük grid */}
          <path d="M 32 0 L 32 32" stroke="rgba(34,255,136,0.18)" strokeWidth="1" />
          <path d="M 0 32 L 32 32" stroke="rgba(34,255,136,0.18)" strokeWidth="1" />
        </pattern>

        {/* Neon glow filter */}
        <filter id="ekg-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" in="blur1" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid background */}
      <rect width={W} height={H} fill="url(#ekg-grid)" />

      {/* Merkez yatay çizgi (zero/baseline) */}
      <line
        x1={0}
        x2={W}
        y1={H * 0.5}
        y2={H * 0.5}
        stroke="rgba(34,255,136,0.10)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* EKG yol — neon glow */}
      <path
        ref={pathRef}
        d={yolStr}
        fill="none"
        stroke={renk}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ekg-glow)"
      />

      {/* Ay etiketleri (alt) */}
      {son12Ay.map((nokta, i) => {
        const x = 24 + (i + 0.5) * ((W - 48) / son12Ay.length);
        return (
          <text
            key={i}
            x={x}
            y={H - 12}
            textAnchor="middle"
            fill="rgba(34,255,136,0.45)"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            fontSize="10"
            letterSpacing="0.06em"
          >
            {nokta.ay}
          </text>
        );
      })}
    </svg>
  );
}

// === ANA SAYFA ================================================================

export function App() {
  const sayfaRef = useRef<HTMLDivElement>(null);
  const [aktif, setAktif] = useState<FirmaId>("meba");
  const [saat, setSaat] = useState(new Date());

  const firma = FIRMALAR[aktif];
  const finans = FINANS_VERISI[aktif];
  const son = finans.son12Ay[finans.son12Ay.length - 1]!;
  const onceki = finans.son12Ay[finans.son12Ay.length - 2]!;
  const yillikCiro = finans.son12Ay.reduce((s, a) => s + a.ciro, 0);
  const ciroDelta = ((son.ciro - onceki.ciro) / onceki.ciro) * 100;
  // BPM mantığı — ciro hızına göre 58-95 arası (sağlıklı yetişkin)
  const bpm = Math.round(60 + ((son.ciro - 2_000_000) / 2_000_000) * 18);

  // Saat tik tik
  useEffect(() => {
    const i = setInterval(() => setSaat(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // GSAP intro koreografi
  useEffect(() => {
    if (!sayfaRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-n='topbar']", { y: -16, opacity: 0, duration: 0.6 }, 0);
      tl.from("[data-n='kicker']", { opacity: 0, y: 12, duration: 0.4 }, 0.25);
      tl.from("[data-n='hero-num']", {
        opacity: 0,
        scale: 0.84,
        duration: 0.8,
        ease: "back.out(1.4)",
      }, 0.4);
      tl.from("[data-n='bpm']", { opacity: 0, x: 30, duration: 0.6 }, 0.7);
      tl.from("[data-n='trio']", { opacity: 0, y: 24, stagger: 0.1, duration: 0.5 }, 0.9);
    }, sayfaRef);
    return () => ctx.revert();
  }, [aktif]);

  return (
    <div
      ref={sayfaRef}
      style={{
        background: "#03060a",
        color: "#22ff88",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Arkaplan — soluk grid (CSS pattern) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(34,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,255,136,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 90%)",
          pointerEvents: "none",
        }}
      />

      {/* Üst bar — kanal kimliği gibi */}
      <header
        data-n="topbar"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          borderBottom: "1px solid rgba(34,255,136,0.18)",
          background: "linear-gradient(180deg, rgba(0,20,10,0.6), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              border: "1px solid rgba(255,80,80,0.55)",
              background: "rgba(255,40,40,0.16)",
              color: "#ff8e8e",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              animation: "pulse-red 1.4s ease-in-out infinite",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4444", boxShadow: "0 0 12px #ff4444" }} />
            Canlı
          </span>
          <span style={{ fontSize: 12, color: "#22ff88aa", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>
            Grup Şirketleri · Finans Nabzı
          </span>
        </div>

        {/* Firma seçici */}
        <div style={{ display: "flex", gap: 6 }}>
          {FIRMA_LISTE.map((f) => {
            const sec = f === aktif;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setAktif(f)}
                style={{
                  background: sec ? "rgba(34,255,136,0.15)" : "transparent",
                  border: `1px solid ${sec ? "#22ff88" : "rgba(34,255,136,0.25)"}`,
                  color: sec ? "#22ff88" : "rgba(34,255,136,0.55)",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontFamily: "ui-monospace, monospace",
                  boxShadow: sec ? "0 0 18px rgba(34,255,136,0.35)" : "none",
                }}
              >
                {FIRMALAR[f].kisaAd}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "ui-monospace, monospace" }}>
          <span style={{ fontSize: 11, color: "#22ff8888" }}>
            {saat.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <span style={{ fontSize: 16, color: "#22ff88", fontWeight: 700, letterSpacing: "0.05em" }}>
            {saat.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </header>

      {/* HERO SAHNE */}
      <main style={{ position: "relative", zIndex: 5, padding: "32px 32px 24px", maxWidth: 1480, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.85fr 2fr",
            gap: 36,
            alignItems: "stretch",
            minHeight: 460,
          }}
        >
          {/* SOL — 3D pulsing core */}
          <div
            style={{
              position: "relative",
              border: "1px solid rgba(34,255,136,0.22)",
              background: "radial-gradient(ellipse at center, rgba(0,40,30,0.55), rgba(0,10,8,0.0) 70%)",
              overflow: "hidden",
            }}
          >
            {/* Köşe ribrosatları (medikal panel hissi) */}
            <KoseIsareti pos="tl" />
            <KoseIsareti pos="tr" />
            <KoseIsareti pos="bl" />
            <KoseIsareti pos="br" />

            <div
              data-n="kicker"
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 5,
                fontSize: 10,
                color: "rgba(34,255,136,0.7)",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 800,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {firma.kisaAd} · CORE PULSE
            </div>

            <CoreSahne renk={firma.renk} />

            {/* Alt — etiket */}
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 20,
                right: 20,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              <div style={{ fontSize: 10, color: "rgba(34,255,136,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Şirket çekirdeği
              </div>
              <div style={{ fontSize: 13, color: "#22ff88", marginTop: 4, opacity: 0.85 }}>
                Pulse genliği · ciro hızıyla orantılı · {bpm} BPM
              </div>
            </div>
          </div>

          {/* SAĞ — EKG + BPM + Hero rakam */}
          <div
            style={{
              position: "relative",
              border: "1px solid rgba(34,255,136,0.22)",
              padding: "28px 32px",
              background:
                "linear-gradient(180deg, rgba(0,25,15,0.55) 0%, rgba(0,8,5,0.65) 100%)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <KoseIsareti pos="tl" />
            <KoseIsareti pos="tr" />
            <KoseIsareti pos="bl" />
            <KoseIsareti pos="br" />

            {/* Üst satır — Kicker + BPM rozet */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#ff8e8e",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  {firma.unvan.split(" ").slice(0, 2).join(" ")} · 12 ay nabız
                </div>
                <div
                  data-n="hero-num"
                  style={{
                    fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
                    fontSize: 78,
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "-0.04em",
                    lineHeight: 0.95,
                    marginTop: 6,
                    textShadow:
                      "0 0 40px rgba(34,255,136,0.55), 0 0 16px rgba(34,255,136,0.8)",
                  }}
                >
                  <CountUp
                    end={yillikCiro / 1_000_000}
                    duration={2.2}
                    decimals={1}
                    decimal=","
                    suffix="M ₺"
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 13,
                    color: "rgba(34,255,136,0.65)",
                    letterSpacing: "0.06em",
                  }}
                >
                  YILLIK CİRO ·{" "}
                  <span style={{ color: ciroDelta > 0 ? "#22ff88" : "#ff6b6b", fontWeight: 700 }}>
                    {ciroDelta > 0 ? "▲" : "▼"} {Math.abs(ciroDelta).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* BPM ROZET */}
              <div
                data-n="bpm"
                style={{
                  border: "1px solid rgba(34,255,136,0.45)",
                  padding: "14px 22px 12px",
                  background: "rgba(0,30,18,0.55)",
                  textAlign: "right",
                  boxShadow: "inset 0 0 32px rgba(34,255,136,0.15), 0 0 28px rgba(34,255,136,0.10)",
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    color: "rgba(34,255,136,0.55)",
                    textTransform: "uppercase",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 700,
                  }}
                >
                  Şirket Nabzı
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 56,
                    color: "#22ff88",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    textShadow: "0 0 24px rgba(34,255,136,0.7)",
                    marginTop: 2,
                  }}
                >
                  <CountUp end={bpm} duration={1.6} />
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 10,
                    color: "rgba(34,255,136,0.55)",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Vuruş / dakika
                </div>
              </div>
            </div>

            {/* EKG GRAFİĞİ */}
            <div style={{ flex: 1, minHeight: 240 }}>
              <EkgGrafigi son12Ay={finans.son12Ay} renk="#22ff88" />
            </div>
          </div>
        </div>

        {/* ALT — KPI TRIO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 16,
          }}
        >
          <KpiPanel etiket="Brüt Marj" deger={son.brutMarj} format="yuzde" />
          <KpiPanel etiket="Net Kâr / Yıl" deger={son.netKar * 12} format="para-buyuk" />
          <KpiPanel etiket="Açık Alacak" deger={son.alacak} format="para-buyuk" tepki="dn" />
          <KpiPanel etiket="Nakit" deger={son.nakit} format="para-buyuk" tepki="up" />
        </div>

        {/* Alt durum çubuğu — terminal hissi */}
        <div
          style={{
            marginTop: 24,
            padding: "10px 18px",
            border: "1px solid rgba(34,255,136,0.18)",
            background: "rgba(0,20,12,0.45)",
            fontFamily: "ui-monospace, monospace",
            fontSize: 10.5,
            letterSpacing: "0.10em",
            color: "rgba(34,255,136,0.65)",
            display: "flex",
            justifyContent: "space-between",
            textTransform: "uppercase",
          }}
        >
          <span>SYNC · LOGO GO MESA · OK · son güncelleme {saat.toLocaleTimeString("tr-TR")}</span>
          <span>EKG sürekli akıyor · sahne 1 / 5</span>
        </div>
      </main>

      <style>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

// === Yardımcı komponentler ====================================================

function KoseIsareti({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const ortak: React.CSSProperties = {
    position: "absolute",
    width: 16,
    height: 16,
    pointerEvents: "none",
    zIndex: 3,
  };
  if (pos === "tl") {
    return (
      <span
        aria-hidden
        style={{
          ...ortak,
          top: 6,
          left: 6,
          borderTop: "2px solid #22ff88",
          borderLeft: "2px solid #22ff88",
        }}
      />
    );
  }
  if (pos === "tr") {
    return (
      <span
        aria-hidden
        style={{
          ...ortak,
          top: 6,
          right: 6,
          borderTop: "2px solid #22ff88",
          borderRight: "2px solid #22ff88",
        }}
      />
    );
  }
  if (pos === "bl") {
    return (
      <span
        aria-hidden
        style={{
          ...ortak,
          bottom: 6,
          left: 6,
          borderBottom: "2px solid #22ff88",
          borderLeft: "2px solid #22ff88",
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        ...ortak,
        bottom: 6,
        right: 6,
        borderBottom: "2px solid #22ff88",
        borderRight: "2px solid #22ff88",
      }}
    />
  );
}

function KpiPanel({
  etiket,
  deger,
  format,
  tepki,
}: {
  etiket: string;
  deger: number;
  format: "yuzde" | "para-buyuk";
  tepki?: "up" | "dn";
}) {
  const renk = tepki === "dn" ? "#ff6b6b" : "#22ff88";
  return (
    <div
      data-n="trio"
      style={{
        position: "relative",
        border: `1px solid ${tepki === "dn" ? "rgba(255,107,107,0.30)" : "rgba(34,255,136,0.22)"}`,
        padding: "16px 18px",
        background: "rgba(0,20,12,0.45)",
        fontFamily: "ui-monospace, monospace",
      }}
    >
      <KoseIsareti pos="tl" />
      <KoseIsareti pos="tr" />
      <KoseIsareti pos="bl" />
      <KoseIsareti pos="br" />

      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: `${renk}99`,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {etiket}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: renk,
          letterSpacing: "-0.02em",
          textShadow: `0 0 18px ${renk}80`,
          lineHeight: 1,
        }}
      >
        <CountUp
          end={format === "yuzde" ? deger : deger / 1_000_000}
          duration={1.6}
          decimals={1}
          decimal=","
          prefix={format === "yuzde" ? "%" : ""}
          suffix={format === "yuzde" ? "" : "M ₺"}
        />
      </div>
    </div>
  );
}
