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
      <div className="w-full max-w-md mx-auto px-2 md:px-3 mt-2">
        <div 
          className="rounded-xl p-2.5 md:p-3"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
            <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Badges</h2>
            <div className="text-xs md:text-sm text-neutral-600 font-medium">{earnedCount}/{BADGES.length} earned</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {list.map((b) => (
              <div 
                key={b.id} 
                className={`rounded-xl p-2.5 flex items-start gap-2 md:gap-2.5 transition-colors ${b.earned ? "opacity-100" : "opacity-60"}`}
                style={{
                  background: b.earned ? "var(--color-green-900-10)" : "var(--surface)",
                  border: `2px solid ${b.earned ? "var(--color-green-900)" : "var(--color-green-900-30)"}`,
                  boxShadow: b.earned ? "0 2px 0 var(--color-green-900)" : "none"
                }}
              >
                <div className="text-base md:text-lg flex-shrink-0" aria-hidden>{b.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs md:text-sm font-semibold text-neutral-800">{b.title}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">{b.desc}</div>
                  {!b.earned && (
                    <div className="mt-1 text-xs text-neutral-500">Not earned yet</div>
                  )}
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
      <div className="w-full max-w-md mx-auto px-2 md:px-3 mt-3">
        <div 
          className="rounded-xl p-2.5"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>Recently unlocked</h3>
            <button
              type="button"
              className="nav-pill text-xs px-2 py-1"
              onClick={() => { writeRecent([]); setRecent([]); }}
            >
              Clear
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="text-xs text-neutral-500 text-center py-2">No recent badges yet.</div>
          ) : (
            <ul className="flex flex-wrap gap-1">
              {recent.slice(0, 6).map((r) => {
                const meta = badgeById[r.badgeId];
                const variant = meta?.variant || "green";
                return (
                  <li key={r.id} className={`nav-pill nav-pill--${variant} text-xs`} title={new Date(r.ts).toLocaleString()}>
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
