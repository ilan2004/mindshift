"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// LocalStorage helpers
function getNumber(key, def = 0) {
  try { return Number(localStorage.getItem(key)) || def; } catch { return def; }
}
function readSessions() {
  try {
    const raw = localStorage.getItem("mindshift_focus_sessions");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function readBadges() {
  try {
    const raw = localStorage.getItem("mindshift_badges");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function writeBadges(list) {
  try { localStorage.setItem("mindshift_badges", JSON.stringify(list)); } catch {}
}
function dispatchBadgesUpdate() {
  try { window.dispatchEvent(new Event("mindshift:badges:update")); } catch {}
}

// Badge schema
// id: unique key
// variant: nav-pill color variant suffix
// test: function to determine if earned given context
const BADGES = [
  {
    id: "first_focus",
    title: "First Focus",
    desc: "Complete your first focus session",
    emoji: "🎯",
    variant: "cyan",
    test: ({ totalSessions }) => totalSessions >= 1,
  },
  {
    id: "hundred_points",
    title: "Century Points",
    desc: "Reach 100 total points",
    emoji: "💯",
    variant: "green",
    test: ({ points }) => points >= 100,
  },
  {
    id: "streak_7",
    title: "7-Day Streak",
    desc: "Maintain a 7-day streak",
    emoji: "🔥",
    variant: "amber",
    test: ({ streak }) => streak >= 7,
  },
  {
    id: "custom_creator",
    title: "Quest Maker",
    desc: "Add your first custom quest",
    emoji: "🛠️",
    variant: "purple",
    test: ({ hasCustomQuest }) => !!hasCustomQuest,
  },
];

// Discover hasCustomQuest via today's custom quest storage keys
function todayKey() {
  try { return new Date().toLocaleDateString("en-CA"); } catch { return new Date().toISOString().slice(0,10); }
}
function hasAnyCustomQuestForToday() {
  try {
    const key = `mindshift_custom_quests_${todayKey()}`;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) && list.length > 0;
  } catch { return false; }
}

// Recent feed helpers
function readRecent() {
  try {
    const raw = localStorage.getItem("mindshift_badges_recent");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function writeRecent(list) {
  try { localStorage.setItem("mindshift_badges_recent", JSON.stringify(list)); } catch {}
}

export default function Badges() {
  const [earned, setEarned] = useState([]); // array of ids
  const [toasts, setToasts] = useState([]); // { id, title, emoji }
  const [recent, setRecent] = useState([]); // persisted recent feed

  const load = () => {
    setEarned(readBadges());
    setRecent(readRecent());
  };

  // Evaluate and award any new badges
  const evaluate = () => {
    const points = getNumber("mindshift_points", 0);
    const streak = getNumber("mindshift_streak", 0);
    const sessions = readSessions();
    const totalSessions = sessions.length;
    const context = { points, streak, totalSessions, hasCustomQuest: hasAnyCustomQuestForToday() };

    const have = new Set(readBadges());
    const prevEarned = new Set(earned);
    let changed = false;
    for (const b of BADGES) {
      if (!have.has(b.id) && b.test(context)) {
        have.add(b.id);
        changed = true;
      }
    }
    if (changed) {
      const arr = Array.from(have);
      writeBadges(arr);
      setEarned(arr);
      // Determine newly unlocked badges and toast them
      const newly = arr.filter((id) => !prevEarned.has(id));
      if (newly.length) {
        const metas = BADGES.filter((b) => newly.includes(b.id));
        metas.forEach((b) => addToast(b));
        // Append to recent feed (cap 10)
        const now = Date.now();
        const prev = readRecent();
        const appended = [
          ...metas.map((b) => ({ id: `${b.id}_${now}`, badgeId: b.id, title: b.title, emoji: b.emoji, ts: now })),
          ...prev,
        ].slice(0, 10);
        writeRecent(appended);
        setRecent(appended);
      }
      dispatchBadgesUpdate();
    } else {
      // still update local state to reflect any external changes
      setEarned(Array.from(have));
    }
  };

  const addToast = (badge) => {
    const toastId = `${badge.id}_${Date.now()}`;
    setToasts((q) => [...q, { id: toastId, title: badge.title, emoji: badge.emoji, variant: badge.variant }] );
    // Auto-dismiss
    setTimeout(() => {
      setToasts((q) => q.filter((t) => t.id !== toastId));
    }, 3500);
  };

  useEffect(() => {
    load();
    // Evaluate on key events
    const onCounters = () => evaluate();
    const onSession = () => evaluate();
    const onManualCheck = () => evaluate();
    window.addEventListener("mindshift:counters:update", onCounters);
    window.addEventListener("mindshift:session:completed", onSession);
    window.addEventListener("mindshift:badges:check", onManualCheck);
    return () => {
      window.removeEventListener("mindshift:counters:update", onCounters);
      window.removeEventListener("mindshift:session:completed", onSession);
      window.removeEventListener("mindshift:badges:check", onManualCheck);
    };
  }, []);

  const list = useMemo(() => {
    const got = new Set(earned);
    return BADGES.map((b) => ({ ...b, earned: got.has(b.id) }));
  }, [earned]);

  const earnedCount = list.filter((b) => b.earned).length;

  // Map for quick badge meta lookup
  const badgeById = useMemo(() => Object.fromEntries(BADGES.map((b) => [b.id, b])), []);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-4 mt-2">
        <div className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Badges</h2>
            <div className="text-xs text-neutral-600">{earnedCount}/{BADGES.length} earned</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {list.map((b) => (
              <div key={b.id} className={`rounded-xl border p-3 flex items-start gap-2 ${b.earned ? "bg-emerald-50 border-emerald-200" : "bg-white border-neutral-200"}`}>
                <div className="text-xl" aria-hidden>{b.emoji}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-800">{b.title}</div>
                  <div className="text-xs text-neutral-600">{b.desc}</div>
                  {!b.earned ? (
                    <div className="mt-1 text-[11px] text-neutral-500">Not earned yet</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.6 }}
              className="flex items-center gap-2"
            >
              <div className={`nav-pill ${t.variant ? `nav-pill--${t.variant}` : "nav-pill--green"}`}>
                <span className="mr-1" aria-hidden>{t.emoji}</span>
                Badge unlocked: {t.title}
              </div>
              <button
                type="button"
                className="nav-pill"
                aria-label="Dismiss"
                onClick={() => setToasts((q) => q.filter((x) => x.id !== t.id))}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Recently unlocked feed */}
      <div className="w-full max-w-2xl mx-auto px-4 mt-3">
        <div className="rounded-xl border border-neutral-200/70 bg-white/60 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neutral-800">Recently unlocked</h3>
            <button
              type="button"
              className="text-[11px] text-neutral-500 hover:underline"
              onClick={() => { writeRecent([]); setRecent([]); }}
            >
              Clear
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="text-xs text-neutral-500">No recent badges yet.</div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {recent.slice(0, 8).map((r) => {
                const meta = badgeById[r.badgeId];
                const variant = meta?.variant || "green";
                return (
                  <li key={r.id} className={`nav-pill nav-pill--${variant}`} title={new Date(r.ts).toLocaleString()}>
                    <span className="mr-1" aria-hidden>{r.emoji}</span>
                    {r.title}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
