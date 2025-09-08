"use client";

import { useMemo } from "react";

// No localStorage. Graph uses mock data only.

function toYMD(d) {
  try {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toLocaleDateString("en-CA");
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getLastNDays(n = 7) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ key: toYMD(d), date: d });
  }
  return out;
}

function dayLabel(d) {
  try {
    return d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
  } catch {
    return "";
  }
}

// Create deterministic mock data for the last 7 days without persisting
function mockSessions() {
  const days = getLastNDays(7);
  // Example pattern (minutes) for visual variety; capped by maxMinutes later
  const pattern = [20, 45, 0, 60, 30, 80, 25];
  return days.map((d, i) => ({ date: d.key, minutes: pattern[i % pattern.length] }));
}

export default function ProductivityGraph({ maxMinutes = 120 }) {

  const data = useMemo(() => {
    const days = getLastNDays(7);
    const source = mockSessions();
    const byDate = source.reduce((acc, s) => {
      acc[s.date] = (acc[s.date] || 0) + s.minutes;
      return acc;
    }, {});
    return days.map(({ key, date }) => ({
      key,
      label: dayLabel(date),
      minutes: Math.max(0, Math.min(maxMinutes, byDate[key] || 0)),
      fullMinutes: byDate[key] || 0,
      isToday: toYMD(new Date()) === key,
    }));
  }, [maxMinutes]);

  const peak = Math.max(1, ...data.map((d) => d.minutes));

  return (
    <div className="w-full max-w-md mx-auto px-2 md:px-3 mt-4">
      <div 
        className="rounded-xl p-2.5 md:p-3"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 2px 0 var(--color-green-900)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
          <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Productivity (7 days)</h2>
          <div className="text-xs text-neutral-500 font-medium">Max {maxMinutes}m cap</div>
        </div>

        <div className="h-28 md:h-36 flex items-end gap-2 px-1">
          {data.map((d) => {
            const h = Math.max(8, Math.round((d.minutes / peak) * 100));
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5 md:gap-2">
                <div className="relative w-4 md:w-6 flex items-end justify-center" title={`${d.fullMinutes} min`}>
                  <div
                    className="w-full rounded-lg transition-all duration-300"
                    style={{ 
                      height: `${h}%`,
                      background: d.isToday ? "var(--color-green-900)" : "var(--color-green-900-60)"
                    }}
                  />
                </div>
                <div className={`text-xs font-medium ${d.isToday ? "font-semibold" : ""}`} style={{ color: d.isToday ? "var(--color-green-900)" : "var(--color-neutral-600)" }}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
