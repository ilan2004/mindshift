"use client";

import { useEffect, useMemo, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";

function readJSON(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function readNumber(key, def = 0) {
  try { return Number(localStorage.getItem(key)) || def; } catch { return def; }
}

function useStats() {
  const [stats, setStats] = useState({ points: 0, streak: 0, focusHours: 0 });
  useEffect(() => {
    const recalc = () => {
      const points = readNumber("mindshift_points", 0);
      const streak = readNumber("mindshift_streak", 0);
      const sessions = readJSON("mindshift_focus_sessions", []);
      const totalMinutes = Array.isArray(sessions) ? sessions.reduce((sum, s) => sum + (Number(s?.minutes) || 0), 0) : 0;
      const focusHours = +(totalMinutes / 60).toFixed(1);
      setStats({ points, streak, focusHours });
    };
    recalc();
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (["mindshift_points", "mindshift_streak", "mindshift_focus_sessions"].includes(e.key)) recalc();
    };
    const onCustom = () => recalc();
    window.addEventListener("storage", onStorage);
    window.addEventListener("mindshift:counters:update", onCustom);
    window.addEventListener("mindshift:session:completed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mindshift:counters:update", onCustom);
      window.removeEventListener("mindshift:session:completed", onCustom);
    };
  }, []);
  return stats;
}

export default function LeaderboardSection() {
  const me = useStats();
  const [type, setType] = useState("points");

  const rows = useMemo(() => {
    const self = { id: "me", name: "You", avatar: "🧠", points: me.points, streak: me.streak, focusHours: me.focusHours, screenTime: 0 };
    // Mock peers for demo
    const peers = [
      { id: "p1", name: "Ilan", avatar: "I", points: 420, streak: 4, focusHours: 9.5, screenTime: 0 },
      { id: "p2", name: "Hadee", avatar: "H", points: 610, streak: 7, focusHours: 12.2, screenTime: 0 },
      { id: "p3", name: "Maggie", avatar: "M", points: 310, streak: 2, focusHours: 6.3, screenTime: 0 },
    ];
    const all = [self, ...peers];
    all.sort((a, b) => b.points - a.points);
    return all;
  }, [me.points, me.streak, me.focusHours]);

  return (
    <div
      className="rounded-xl p-3 w-full"
      style={{
        background: "var(--token-3cf441d7-edfe-47fb-95dc-1899b0597681, #f9f8f4)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">Leaderboard</h3>
        <div className="flex items-center gap-2">
          {[
            { key: "points", label: "Points" },
            { key: "streak", label: "Streak" },
            { key: "focusHours", label: "Focus" },
            { key: "screenTime", label: "Screen" },
          ].map((opt) => (
            <button
              key={opt.key}
              className={`nav-pill ${type === opt.key ? "nav-pill--cyan" : "nav-pill--neutral"} text-[11px] px-2 py-1`}
              onClick={() => setType(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <LeaderboardTable rows={rows} type={type} />
    </div>
  );
}
