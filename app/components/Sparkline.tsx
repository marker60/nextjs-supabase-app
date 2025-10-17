// [LABEL: FILE] app/components/Sparkline.tsx
// [LABEL: PURPOSE] Tiny sparkline (no deps). Pass an array of numbers (y-values).
// [LABEL: USAGE] <Sparkline data={series} width={120} height={32} strokeWidth={2} />

import * as React from "react";

type Props = {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  ariaLabel?: string;
};

export default function Sparkline({
  data,
  width = 120,
  height = 32,
  strokeWidth = 2,
  ariaLabel = "trend",
}: Props) {
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} role="img" aria-label={ariaLabel}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity="0.25" />
      </svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1, max - min);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * height;
    return `${x},${isFinite(y) ? y : height / 2}`;
  });

  return (
    <svg width={width} height={height} role="img" aria-label={ariaLabel}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(" ")}
      />
    </svg>
  );
}
