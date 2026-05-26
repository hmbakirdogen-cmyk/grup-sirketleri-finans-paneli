// AnaGrafik — ekranın odak noktası, tek büyük area chart.
// Maksimum 2 veri serisi (gerçek ciro + hedef line).
// Çok hafif grid, sade eksen, hover olmadan okunabilir.

import { useEffect, useMemo, useRef, useState } from "react";
import { TEMA, FONT, fmtTL } from "@/lib/tema";

interface Props {
  veri: { ay: string; ciro: number }[];
  hedefAylik?: number;     // sabit yatay hedef çizgisi (isteğe bağlı)
  baslik?: string;
  altBaslik?: string;
}

export function AnaGrafik({ veri, hedefAylik, baslik = "Aylık Ciro", altBaslik }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 1200;
  const H = 380;
  const padL = 48;
  const padR = 32;
  const padT = 32;
  const padB = 44;

  const { yMin, yMax, noktalar, hedefY } = useMemo(() => {
    const minVeri = Math.min(...veri.map((v) => v.ciro));
    const maxVeri = Math.max(...veri.map((v) => v.ciro));
    const min = hedefAylik !== undefined ? Math.min(minVeri, hedefAylik) : minVeri;
    const max = hedefAylik !== undefined ? Math.max(maxVeri, hedefAylik) : maxVeri;
    // Üstte ve altta %12 padding
    const span = max - min;
    const yMin = min - span * 0.12;
    const yMax = max + span * 0.15;
    const yRange = yMax - yMin;

    const noktalar = veri.map((v, i) => ({
      x: padL + (i / (veri.length - 1)) * (W - padL - padR),
      y: padT + (1 - (v.ciro - yMin) / yRange) * (H - padT - padB),
      ay: v.ay,
      ciro: v.ciro,
    }));

    const hedefY =
      hedefAylik !== undefined
        ? padT + (1 - (hedefAylik - yMin) / yRange) * (H - padT - padB)
        : null;

    return { yMin, yMax, noktalar, hedefY };
  }, [veri, hedefAylik]);

  const path = noktalar.map((n, i) => (i === 0 ? `M ${n.x} ${n.y}` : `L ${n.x} ${n.y}`)).join(" ");
  const fill =
    `${path} L ${noktalar[noktalar.length - 1]!.x} ${H - padB} L ${noktalar[0]!.x} ${H - padB} Z`;

  // 3 Y grid çizgisi — hafif
  const yTicks = useMemo(() => {
    const adim = (yMax - yMin) / 3;
    return [0, 1, 2, 3].map((i) => {
      const v = yMin + adim * i;
      return {
        y: padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB),
        v,
      };
    });
  }, [yMin, yMax]);

  // Path reveal animasyonu (bir kere, 600ms)
  useEffect(() => {
    const p = svgRef.current?.querySelector("path[data-anim='line']") as SVGPathElement | null;
    if (!p) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset 600ms cubic-bezier(0.22, 0.61, 0.36, 1)";
    p.style.strokeDashoffset = "0";
  }, [veri]);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let yakin = 0;
    let yakinD = Infinity;
    noktalar.forEach((n, i) => {
      const d = Math.abs(n.x - x);
      if (d < yakinD) {
        yakinD = d;
        yakin = i;
      }
    });
    setHoverIdx(yakin);
  }

  const aktifNokta = hoverIdx !== null ? noktalar[hoverIdx] : noktalar[noktalar.length - 1];

  return (
    <div
      data-anim="grafik"
      style={{
        background: `linear-gradient(180deg, ${TEMA.bgKart}, ${TEMA.bgKartAlt})`,
        border: `1px solid ${TEMA.border}`,
        borderRadius: 16,
        padding: "28px 28px 22px",
      }}
    >
      {/* Üst başlık */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT.ana,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: TEMA.inkMuted,
              marginBottom: 6,
            }}
          >
            {baslik}
          </div>
          <div style={{ fontFamily: FONT.ana, fontSize: 14, color: TEMA.inkSoft }}>
            {altBaslik ?? "Son 12 ay"}
          </div>
        </div>

        {/* Sağ — aktif nokta özet */}
        {aktifNokta && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: FONT.num,
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: TEMA.ink,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {fmtTL(aktifNokta.ciro)}
            </div>
            <div
              style={{
                fontFamily: FONT.ana,
                fontSize: 12,
                color: TEMA.inkMuted,
                marginTop: 6,
                letterSpacing: "0.06em",
              }}
            >
              {aktifNokta.ay}
            </div>
          </div>
        )}
      </div>

      {/* SVG grafik */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block", cursor: "crosshair" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="ana-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEMA.mavi} stopOpacity={0.18} />
            <stop offset="100%" stopColor={TEMA.mavi} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Hafif yatay grid (3 çizgi) */}
        {yTicks.map((t, i) => (
          <line
            key={i}
            x1={padL}
            x2={W - padR}
            y1={t.y}
            y2={t.y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Sol Y ekseni etiketleri (3 değer) */}
        {yTicks.slice(0, 3).map((t, i) => (
          <text
            key={i}
            x={padL - 12}
            y={t.y + 4}
            textAnchor="end"
            fontFamily={FONT.ana}
            fontSize={10.5}
            fill={TEMA.inkFaded}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {fmtTL(t.v)}
          </text>
        ))}

        {/* Hedef yatay çizgi (varsa) */}
        {hedefY !== null && (
          <>
            <line
              x1={padL}
              x2={W - padR}
              y1={hedefY}
              y2={hedefY}
              stroke={TEMA.altin}
              strokeWidth={1}
              strokeDasharray="4 5"
              opacity={0.6}
            />
            <text
              x={W - padR + 6}
              y={hedefY + 4}
              fontFamily={FONT.ana}
              fontSize={10}
              fill={TEMA.altin}
              style={{ fontVariantNumeric: "tabular-nums", opacity: 0.85, letterSpacing: "0.06em" }}
            >
              HEDEF
            </text>
          </>
        )}

        {/* Dolu alan */}
        <path d={fill} fill="url(#ana-fill)" />

        {/* Ana çizgi */}
        <path
          data-anim="line"
          d={path}
          fill="none"
          stroke={TEMA.mavi}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover dikey çizgi + nokta */}
        {hoverIdx !== null && aktifNokta && (
          <g>
            <line
              x1={aktifNokta.x}
              x2={aktifNokta.x}
              y1={padT}
              y2={H - padB}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
            <circle
              cx={aktifNokta.x}
              cy={aktifNokta.y}
              r={5}
              fill={TEMA.bg}
              stroke={TEMA.mavi}
              strokeWidth={2}
            />
          </g>
        )}

        {/* X ekseni — sadece 4 ay etiketi (her 3'te bir) */}
        {noktalar.map((n, i) =>
          i % 3 === 0 || i === noktalar.length - 1 ? (
            <text
              key={i}
              x={n.x}
              y={H - 14}
              textAnchor="middle"
              fontFamily={FONT.ana}
              fontSize={11}
              fill={TEMA.inkFaded}
              letterSpacing="0.04em"
            >
              {n.ay}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
