"use client";

import { useMemo } from "react";

export default function FocusRing({
  size = 560,
  stroke = 10,
  value = 0, // 0..1
  mode = "focus", // focus | break | paused | idle
}) {
  const radius = useMemo(() => (size - stroke) / 2, [size, stroke]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  // Use a slightly smaller radius for the painted ring so we have room for a border underlay
  const innerRadius = useMemo(() => radius - 4, [radius]);
  const innerCircumference = useMemo(() => 2 * Math.PI * innerRadius, [innerRadius]);
  const progress = Math.max(0, Math.min(1, value || 0));
  const dashoffset = useMemo(() => innerCircumference * (1 - progress), [innerCircumference, progress]);

  // Match nav-pill tones using CSS variables
  const color = useMemo(() => {
    if (mode === "break") return "var(--color-blue-400)";
    if (mode === "paused") return "var(--color-teal-300)";
    if (mode === "focus") return "var(--color-green-900)";
    return "var(--color-green-900-20)";
  }, [mode]);

  return (
    <div
      className="select-none"
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg width={size - 8} height={size - 8} className="block">
        <defs>
          {/* Soft drop shadow similar to nav-pill box shadow */}
          <filter id="ringShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="rgba(0,0,0,0.20)" />
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={(size - 8) / 2}
          cy={(size - 8) / 2}
          r={innerRadius}
          stroke="#F3F4F6"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress with border underlay and shadow to mimic nav-pill depth */}
        <g filter="url(#ringShadow)">
          {/* Underlay/border */}
          <circle
            cx={(size - 8) / 2}
            cy={(size - 8) / 2}
            r={innerRadius}
            stroke="var(--color-green-900)"
            strokeWidth={Math.max(1, stroke + 2)}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={innerCircumference}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${(size - 8) / 2} ${(size - 8) / 2})`}
          />
          {/* Colored overlay */}
          <circle
            cx={(size - 8) / 2}
            cy={(size - 8) / 2}
            r={innerRadius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={innerCircumference}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${(size - 8) / 2} ${(size - 8) / 2})`}
          />
        </g>
      </svg>
    </div>
  );
}
