// Sparkline — MEBA Komuta Merkezi'nden direkt adapte.
// Smooth path via mid-points, gradient stroke + area fill, endpoint pulse.
// KpiKart içinde küçük trend göstergesi olarak kullanılır.

import { memo } from "react";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  /** Endpoint dot + halo + iç beyaz nokta */
  endpoint?: boolean;
}

function _Sparkline({
  data,
  width = 120,
  height = 28,
  stroke = "#5b9dff",
  fill = "#5b9dff",
  endpoint = true,
}: Props) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return [x, y] as const;
  });

  // Smooth path — mid-point bezier (Q...T)
  const d = pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
      const prev = pts[i - 1]!;
      const px = prev[0];
      const py = prev[1];
      const mx = (px + x) / 2;
      return `Q${px.toFixed(1)},${py.toFixed(1)} ${mx.toFixed(1)},${((py + y) / 2).toFixed(1)} T${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const area = `${d} L${width},${height} L0,${height} Z`;
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const uid = `sg-${data.length}-${Math.round(first * 10)}-${Math.round(last * 10)}-${Math.round(stroke.charCodeAt(1) || 0)}`;
  const lastPt = pts[pts.length - 1]!;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.40} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`stroke-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.40} />
          <stop offset="100%" stopColor={stroke} stopOpacity={1} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${uid})`} />
      <path
        d={d}
        fill="none"
        stroke={`url(#stroke-${uid})`}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 1px 2px ${stroke}80)` }}
      />
      {endpoint && (
        <g>
          <circle cx={lastPt[0]} cy={lastPt[1]} r={3.5} fill={stroke} opacity={0.20} />
          <circle cx={lastPt[0]} cy={lastPt[1]} r={2} fill={stroke} />
          <circle cx={lastPt[0]} cy={lastPt[1]} r={1} fill="white" opacity={0.85} />
        </g>
      )}
    </svg>
  );
}

export const Sparkline = memo(_Sparkline);
