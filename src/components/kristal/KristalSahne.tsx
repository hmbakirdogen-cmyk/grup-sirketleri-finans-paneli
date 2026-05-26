// KristalSahne — ambient mesh + caustic ışık + radial vignette
// Apple Vision Pro / iOS 26 estetik referansı. Sahne kartların altında durur,
// görselin "3D dünya içinde yüzüyor" hissini verir.

import { useEffect, useRef } from "react";

export function KristalSahne() {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse position takip → mesh gradient hafifçe kayar
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      ref.current.style.setProperty("--mx", `${x}%`);
      ref.current.style.setProperty("--my", `${y}%`);
    }
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        ["--mx" as never]: "50%",
        ["--my" as never]: "50%",
      } as React.CSSProperties}
    >
      {/* Ana mesh — 3 radial gradient layer (Stripe + Linear + iOS 26 esinli) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px circle at var(--mx) var(--my), rgba(14,165,233,0.18), transparent 60%),
            radial-gradient(700px circle at calc(100% - var(--mx)) calc(100% - var(--my)), rgba(217,70,239,0.16), transparent 55%),
            radial-gradient(1100px circle at 50% 0%, rgba(139,92,246,0.12), transparent 65%),
            linear-gradient(180deg, #0a0a0f 0%, #06060a 100%)
          `,
          transition: "background 600ms ease",
        }}
      />

      {/* Caustic ışık desenleri — yavaşça döner (Aurora) */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            conic-gradient(from 0deg at 30% 40%,
              transparent 0deg,
              rgba(14,165,233,0.10) 60deg,
              transparent 120deg,
              rgba(217,70,239,0.08) 200deg,
              transparent 280deg,
              rgba(16,185,129,0.10) 340deg,
              transparent 360deg)
          `,
          filter: "blur(80px)",
          animation: "kristal-spin 60s linear infinite",
        }}
      />

      {/* Üst film grain (subtle, premium dergi hissi) */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* Vignette — kenarlar koyu */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <style>{`
        @keyframes kristal-spin {
          from { transform: rotate(0deg) scale(1.5); }
          to { transform: rotate(360deg) scale(1.5); }
        }
      `}</style>
    </div>
  );
}
