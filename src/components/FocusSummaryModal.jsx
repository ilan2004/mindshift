"use client";

import { useEffect, useMemo, useState } from "react";

function todayKey() {
  try { return new Date().toLocaleDateString("en-CA"); } catch { return new Date().toISOString().slice(0, 10); }
}

// Duplicate of default quests from QuestBoard for points tally
const DEFAULT_QUESTS = [
  { id: "daily_focus_25", title: "Complete one 25m focus block", points: 10 },
  { id: "no_social_hour", title: "Avoid social media for 1 hour", points: 8 },
  { id: "write_intent", title: "Write a one-line session intent", points: 5 },
];

function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function readNumber(key, def = 0) {
  try { return Number(localStorage.getItem(key)) || def; } catch { return def; }
}

export default function FocusSummaryModal() {
  const [open, setOpen] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Pull counters
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Recompute daily stats on open
  const [dayTotalPoints, setDayTotalPoints] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  const computeToday = () => {
    const key = todayKey();
    const state = readJSON(`mindshift_quests_${key}`, {});
    const custom = readJSON(`mindshift_custom_quests_${key}`, []);
    const all = [...DEFAULT_QUESTS, ...(Array.isArray(custom) ? custom : [])];
    const completedIds = new Set(Object.keys(state).filter((k) => !!state[k]));
    let total = 0;
    let count = 0;
    for (const q of all) {
      if (completedIds.has(q.id)) {
        total += Number(q.points) || 0;
        count += 1;
      }
    }
    setDayTotalPoints(total);
    setCompletedToday(count);
  };

  useEffect(() => {
    const onDone = (e) => {
      const m = Math.max(0, Number(e?.detail?.minutes) || 0);
      setSessionMinutes(m);
      // Read current counters
      try {
        setPoints(readNumber("mindshift_points", 0));
        setStreak(readNumber("mindshift_streak", 0));
      } catch {}
      computeToday();
      setOpen(true);
    };
    window.addEventListener("mindshift:session:completed", onDone);
    return () => window.removeEventListener("mindshift:session:completed", onDone);
  }, []);

  const close = () => setOpen(false);
  const goToQuests = () => {
    try {
      const el = document.getElementById("quest-board");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">Session complete</h3>
          <button onClick={close} className="nav-pill">Close</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="nav-pill nav-pill--green">+{sessionMinutes}m focus</span>
            <span className="nav-pill nav-pill--neutral">Points: {points}</span>
            <span className="nav-pill nav-pill--green">Streak: {streak}</span>
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 text-sm text-neutral-800">
            <div className="flex items-center justify-between">
              <span>Today</span>
              <span className="text-neutral-600">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white border border-neutral-200 p-2 text-center">
                <div className="text-xs text-neutral-500">Quests Completed</div>
                <div className="text-base font-semibold">{completedToday}</div>
              </div>
              <div className="rounded-lg bg-white border border-neutral-200 p-2 text-center">
                <div className="text-xs text-neutral-500">Points Earned Today</div>
                <div className="text-base font-semibold">{dayTotalPoints}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button className="nav-pill" onClick={goToQuests}>Add next quest</button>
          </div>
        </div>
      </div>
    </div>
  );
}
