// BroadcastSov — "Günün Özeti" 30 saniyelik canlı yayın şovu.
//
// Sahne (üstten alta):
//   1. TICKER TAPE — üstte sürekli akan 4 firma + döviz şeridi (CNBC alt yazı)
//   2. LOWER THIRD — alttan dramatik kayan başlık şeridi (firma adı + ay + saat)
//   3. HERO SAYI — büyük net satış rakamı, Odometer mekanik dans + spotlight glow
//   4. AREA CHART — 12 ay ciro, GSAP path draw-on (Tesla Investor Day reveal)
//   5. KPI TRIO — 3 sayı sırayla pop in (Apple Keynote big number)
//
// Hiçbir 3D rotate yok. Düz 2D ama her bileşen sırayla SHOW gibi açılıyor.
// GSAP timeline tüm akışı koreografi eder.

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import CountUp from "react-countup";
import { ArrowUpRight, Radio } from "lucide-react";
import { FIRMALAR } from "@/data/firmalar";
import { FINANS_VERISI } from "@/data/gercek-finans";
import type { FirmaId } from "@/types/domain";

interface Props {
  aktifFirma: FirmaId;
}

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function BroadcastSov({ aktifFirma }: Props) {
  const sahneRef = useRef<HTMLDivElement>(null);
  const firma = FIRMALAR[aktifFirma];
  const finans = FINANS_VERISI[aktifFirma];

  const son12 = finans.son12Ay;
  const son = son12[son12.length - 1]!;
  const onceki = son12[son12.length - 2]!;
  const yilOnce = son12[0]!;
  const yillikCiro = son12.reduce((s, a) => s + a.ciro, 0);
  const ciroDelta = ((son.ciro - onceki.ciro) / onceki.ciro) * 100;
  const ciroYilDelta = ((son.ciro - yilOnce.ciro) / yilOnce.ciro) * 100;

  // GSAP master timeline — sahne sırayla açılır
  useEffect(() => {
    if (!sahneRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Lower third — alttan kayar
      tl.from("[data-sov='lt']", {
        y: 80,
        opacity: 0,
        duration: 0.7,
      }, 0.1);

      // 2. Hero sayı — büyük pop
      tl.from("[data-sov='hero-pre']", {
        opacity: 0,
        y: 12,
        duration: 0.4,
      }, 0.6);

      tl.from("[data-sov='hero']", {
        scale: 0.7,
        opacity: 0,
        filter: "blur(20px)",
        duration: 0.9,
        ease: "power4.out",
      }, 0.7);

      // 3. Spotlight sweep
      tl.fromTo(
        "[data-sov='spotlight']",
        { x: "-120%", opacity: 0 },
        { x: "120%", opacity: 1, duration: 1.6, ease: "power2.inOut" },
        1.2,
      );

      // 4. Delta rozet
      tl.from("[data-sov='delta']", {
        x: -20,
        opacity: 0,
        duration: 0.5,
      }, 1.4);

      // 5. Area chart path draw-on
      tl.from("[data-sov='area-path']", {
        strokeDasharray: 2000,
        strokeDashoffset: 2000,
        duration: 1.8,
        ease: "power2.inOut",
      }, 1.5);

      tl.from("[data-sov='area-fill']", {
        opacity: 0,
        duration: 1.2,
      }, 2.2);

      // 6. Area noktaları sırayla
      tl.from("[data-sov='area-dot']", {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(2)",
      }, 2.4);

      // 7. KPI trio sırayla
      tl.from("[data-sov='kpi']", {
        y: 40,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.18,
        ease: "back.out(1.4)",
      }, 2.6);

      // 8. "LIVE" rozet pulse loop
      gsap.to("[data-sov='live']", {
        opacity: 0.5,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }, sahneRef);

    return () => ctx.revert();
  }, [aktifFirma]);

  return (
    <div
      ref={sahneRef}
      className="relative overflow-hidden rounded-3xl border border-white/5"
      style={{
        background:
          "radial-gradient(1400px 700px at 50% 110%, " +
          firma.renk + "26, transparent 70%), " +
          "linear-gradient(180deg, #06060a 0%, #0a0a10 60%, #06060a 100%)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        height: 680,
      }}
    >
      {/* Üst CANLI rozet + saat */}
      <div className="absolute top-5 left-6 z-20 flex items-center gap-3">
        <span
          data-sov="live"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-bold"
          style={{
            background: "rgba(239,68,68,0.20)",
            color: "rgb(252,165,165)",
            border: "1px solid rgba(239,68,68,0.40)",
          }}
        >
          <Radio size={10} />
          Canlı
        </span>
        <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
          {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          {" · "}
          {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* Sağ üst — bölüm etiketi */}
      <div className="absolute top-5 right-6 z-20 text-right">
        <div className="text-[9px] uppercase tracking-[0.24em] font-bold text-zinc-600">
          Bölüm 01 · Günün Özeti
        </div>
      </div>

      {/* HERO SAYI — Net satış / Yıllık ciro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div
            data-sov="hero-pre"
            className="text-[11px] uppercase tracking-[0.32em] font-bold text-zinc-500 mb-3"
          >
            {firma.kisaAd} · Yıllık Ciro
          </div>
          <div
            data-sov="hero"
            className="relative inline-block"
            style={{
              fontFamily: "ui-monospace, 'JetBrains Mono', 'Geist Mono', monospace",
              fontSize: 132,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: "#ffffff",
              textShadow:
                `0 0 80px ${firma.renk}80, ` +
                `0 0 32px ${firma.renk}aa, ` +
                "0 4px 16px rgba(0,0,0,0.50)",
            }}
          >
            {/* Spotlight sweep — büyük sayının üzerinden ışık geçer */}
            <span
              aria-hidden
              data-sov="spotlight"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                mixBlendMode: "overlay",
              }}
            />
            <CountUp
              end={yillikCiro}
              duration={2.4}
              separator="."
              decimals={0}
              formattingFn={(n) => `${formatTL(n)} ₺`}
              delay={0.7}
            />
          </div>
          <div
            data-sov="delta"
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{
              background:
                ciroDelta > 0
                  ? "rgba(34,197,94,0.14)"
                  : "rgba(239,68,68,0.14)",
              color: ciroDelta > 0 ? "rgb(74,222,128)" : "rgb(248,113,113)",
              border: `1px solid ${ciroDelta > 0 ? "rgba(34,197,94,0.40)" : "rgba(239,68,68,0.40)"}`,
              boxShadow: ciroDelta > 0
                ? "0 0 24px rgba(34,197,94,0.30)"
                : "0 0 24px rgba(239,68,68,0.30)",
            }}
          >
            <ArrowUpRight
              size={14}
              style={{ transform: ciroDelta > 0 ? "none" : "rotate(90deg)" }}
            />
            <span className="font-mono tabular-nums">
              {ciroDelta > 0 ? "+" : ""}
              {ciroDelta.toFixed(1)}% geçen aya
            </span>
            <span className="text-zinc-500">·</span>
            <span className="font-mono tabular-nums">
              {ciroYilDelta > 0 ? "+" : ""}
              {ciroYilDelta.toFixed(0)}% yıllık
            </span>
          </div>
        </div>
      </div>

      {/* 12 ay area chart — sol alt köşede sermaye ekran */}
      <AylikAreaArkaplan son12Ay={son12} renk={firma.renk} />

      {/* KPI Trio — sağ alt */}
      <div className="absolute bottom-24 right-6 z-10 flex flex-col gap-2 items-end">
        <KpiSatir
          etiket="Net Kâr / yıl"
          deger={son.netKar * 12}
          renk="rgb(34,197,94)"
          delay={0}
        />
        <KpiSatir
          etiket="Brüt Marj"
          deger={son.brutMarj}
          format="yuzde"
          renk="rgb(14,165,233)"
          delay={1}
        />
        <KpiSatir
          etiket="Açık Alacak"
          deger={son.alacak}
          renk="rgb(245,158,11)"
          delay={2}
        />
      </div>

      {/* LOWER THIRD — alttan kayan dramatik info bar (CNBC tarzı) */}
      <div
        data-sov="lt"
        className="absolute left-0 right-0 bottom-0 z-20 flex items-stretch h-16"
      >
        {/* Sol blok — firma logo + renk */}
        <div
          className="flex items-center gap-3 px-5"
          style={{
            background: `linear-gradient(90deg, ${firma.renk}, ${firma.renk}cc 80%, ${firma.renk}99)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 -8px 24px ${firma.renk}55`,
          }}
        >
          <div
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 backdrop-blur-sm text-white font-extrabold"
            style={{ letterSpacing: "-0.02em" }}
          >
            {firma.kisaAd.slice(0, 2)}
          </div>
          <div>
            <div className="text-white font-bold leading-tight" style={{ fontSize: 15, letterSpacing: "-0.01em" }}>
              {firma.kisaAd}
            </div>
            <div className="text-white/80 text-[10px] uppercase tracking-wider">
              {firma.isKolu.split(" ").slice(0, 3).join(" ")}
            </div>
          </div>
        </div>

        {/* Orta blok — başlık */}
        <div
          className="flex-1 flex items-center px-6"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.95))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-zinc-500">
              Mayıs 2026 dönemi
            </div>
            <div className="text-zinc-100 font-bold mt-0.5" style={{ fontSize: 18, letterSpacing: "-0.015em" }}>
              {ciroDelta > 0
                ? `Bereket sürüyor — geçen ay aşıldı`
                : ciroDelta < -3
                  ? `Geçen aya göre yumuşama var`
                  : `Yatay seyir — denge yerinde`}
            </div>
          </div>
        </div>

        {/* Sağ blok — ticker mini fiyatlar */}
        <div
          className="hidden md:flex items-center gap-4 px-5 font-mono tabular-nums"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.95), rgba(0,0,0,0.85))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <MiniTik etiket="USD/TRY" deger="45.77" delta={-0.2} />
          <MiniTik etiket="EUR/TRY" deger="49.12" delta={+0.4} />
          <MiniTik etiket="GR ALTIN" deger="5.842" delta={+1.1} />
        </div>
      </div>
    </div>
  );
}

function KpiSatir({
  etiket,
  deger,
  format = "para",
  renk,
  delay,
}: {
  etiket: string;
  deger: number;
  format?: "para" | "yuzde";
  renk: string;
  delay: number;
}) {
  return (
    <div
      data-sov="kpi"
      className="flex items-center gap-3 rounded-xl px-4 py-2.5"
      style={{
        background: "rgba(15,15,20,0.65)",
        backdropFilter: "blur(18px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: `0 8px 24px rgba(0,0,0,0.40), inset 0 0 0 1px ${renk}1f`,
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-zinc-500 text-right">
        {etiket}
      </div>
      <div
        className="font-mono tabular-nums font-bold"
        style={{
          fontSize: 22,
          color: renk,
          textShadow: `0 0 20px ${renk}80`,
          letterSpacing: "-0.02em",
          minWidth: 110,
          textAlign: "right",
        }}
      >
        <CountUp
          end={deger}
          duration={1.6}
          delay={2.8 + delay * 0.2}
          separator="."
          decimals={format === "yuzde" ? 1 : 0}
          formattingFn={
            format === "yuzde"
              ? (n) => `%${n.toFixed(1)}`
              : (n) => `${formatTL(n)} ₺`
          }
        />
      </div>
    </div>
  );
}

function MiniTik({
  etiket,
  deger,
  delta,
}: {
  etiket: string;
  deger: string;
  delta: number;
}) {
  const yukari = delta > 0;
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-zinc-500">{etiket}</span>
      <span className="text-zinc-100 font-semibold">{deger}</span>
      <span
        className="font-mono tabular-nums font-bold"
        style={{ color: yukari ? "rgb(74,222,128)" : "rgb(248,113,113)" }}
      >
        {yukari ? "▲" : "▼"}
        {Math.abs(delta).toFixed(1)}%
      </span>
    </div>
  );
}

function AylikAreaArkaplan({
  son12Ay,
  renk,
}: {
  son12Ay: { ay: string; ciro: number }[];
  renk: string;
}) {
  const w = 800;
  const h = 220;
  const pad = 40;

  const minCiro = Math.min(...son12Ay.map((a) => a.ciro));
  const maxCiro = Math.max(...son12Ay.map((a) => a.ciro));
  const span = maxCiro - minCiro || 1;

  const noktalar = useMemo(
    () =>
      son12Ay.map((a, i) => {
        const x = pad + (i / (son12Ay.length - 1)) * (w - pad * 2);
        const y = h - pad - ((a.ciro - minCiro) / span) * (h - pad * 2);
        return { x, y, ay: a.ay, ciro: a.ciro };
      }),
    [son12Ay, minCiro, span],
  );

  const cizgi = noktalar
    .map((n, i) => (i === 0 ? `M ${n.x} ${n.y}` : `L ${n.x} ${n.y}`))
    .join(" ");
  const dolgu = `${cizgi} L ${noktalar[noktalar.length - 1]!.x} ${h - pad} L ${noktalar[0]!.x} ${h - pad} Z`;

  return (
    <div
      className="absolute left-0 right-0 bottom-16 z-0 pointer-events-none"
      style={{ height: 220 }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="area-fill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={renk} stopOpacity={0.35} />
            <stop offset="100%" stopColor={renk} stopOpacity={0} />
          </linearGradient>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation={3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Yatay grid çizgileri — soluk */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={pad}
            x2={w - pad}
            y1={pad + (h - pad * 2) * p}
            y2={pad + (h - pad * 2) * p}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="2 4"
          />
        ))}

        {/* Dolu alan */}
        <path data-sov="area-fill" d={dolgu} fill="url(#area-fill-grad)" />

        {/* Çizgi — glow ile */}
        <path
          data-sov="area-path"
          d={cizgi}
          fill="none"
          stroke={renk}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#line-glow)"
        />

        {/* Noktalar */}
        {noktalar.map((n, i) => (
          <g key={i}>
            <circle
              data-sov="area-dot"
              cx={n.x}
              cy={n.y}
              r={3.5}
              fill="#0a0a10"
              stroke={renk}
              strokeWidth={2}
            />
            {/* Son noktada büyük halka */}
            {i === noktalar.length - 1 && (
              <>
                <circle
                  data-sov="area-dot"
                  cx={n.x}
                  cy={n.y}
                  r={10}
                  fill="none"
                  stroke={renk}
                  strokeWidth={1.5}
                  opacity={0.45}
                />
                <circle
                  data-sov="area-dot"
                  cx={n.x}
                  cy={n.y}
                  r={18}
                  fill="none"
                  stroke={renk}
                  strokeWidth={1}
                  opacity={0.22}
                />
              </>
            )}
          </g>
        ))}

        {/* Ay etiketleri — alt */}
        {noktalar.map((n, i) =>
          i % 2 === 0 ? (
            <text
              key={i}
              x={n.x}
              y={h - pad + 16}
              textAnchor="middle"
              fill="rgb(82,82,91)"
              fontSize={10}
              fontFamily="ui-monospace, monospace"
            >
              {n.ay}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
