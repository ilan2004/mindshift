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
    <div className="w-full max-w-2xl mx-auto px-4 mt-6">
      <div className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Productivity (7 days)</h2>
          <div className="text-xs text-neutral-500">Max {maxMinutes}m cap</div>
        </div>

        <div className="h-40 flex items-end gap-3 px-2">
          {data.map((d) => {
            const h = Math.max(4, Math.round((d.minutes / peak) * 100));
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-6 sm:w-8 md:w-9 flex items-end justify-center" title={`${d.fullMinutes} min`}>
                  <div
                    className={`w-full rounded-lg transition-all duration-300 ${d.isToday ? "bg-emerald-600" : "bg-emerald-400"}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <div className={`text-xs ${d.isToday ? "text-emerald-700" : "text-neutral-600"}`}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
