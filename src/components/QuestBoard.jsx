"use client";

import { useEffect, useMemo, useState } from "react";

// Default quests for the day (MVP). Later, drive from backend/user settings.
const DEFAULT_QUESTS = [
  { id: "daily_focus_25", title: "Complete one 25m focus block", points: 10 },
  { id: "no_social_hour", title: "Avoid social media for 1 hour", points: 8 },
  { id: "write_intent", title: "Write a one-line session intent", points: 5 },
];

function todayKey() {
  try {
    // Local-date in YYYY-MM-DD
    return new Date().toLocaleDateString("en-CA");
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function loadDayState(key) {
  try {
    const raw = localStorage.getItem(`mindshift_quests_${key}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDayState(key, state) {
  try {
    localStorage.setItem(`mindshift_quests_${key}`, JSON.stringify(state));
  } catch {}
}

function getNumber(key, def = 0) {
  try {
    return Number(localStorage.getItem(key)) || def;
  } catch {
    return def;
  }
}

function setNumber(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function dispatchCountersUpdate() {
  try {
    window.dispatchEvent(new Event("mindshift:counters:update"));
  } catch {}
}

export default function QuestBoard({ quests = DEFAULT_QUESTS }) {
  const [day, setDay] = useState(todayKey());
  const [state, setState] = useState({}); // { [questId]: boolean }
  const [customQuests, setCustomQuests] = useState([]); // array of { id, title, points }
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState(5);

  // Load today's state on mount and when day changes
  useEffect(() => {
    const key = todayKey();
    setDay(key);
    setState(loadDayState(key));
    // load custom quests for the day
    try {
      const raw = localStorage.getItem(`mindshift_custom_quests_${key}`);
      setCustomQuests(raw ? JSON.parse(raw) : []);
    } catch {
      setCustomQuests([]);
    }
  }, []);

  // If the actual day changes while the app is open
  useEffect(() => {
    const interval = setInterval(() => {
      const key = todayKey();
      if (key !== day) {
        setDay(key);
        setState(loadDayState(key));
        try {
          const raw = localStorage.getItem(`mindshift_custom_quests_${key}`);
          setCustomQuests(raw ? JSON.parse(raw) : []);
        } catch {
          setCustomQuests([]);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [day]);

  const allQuests = useMemo(() => [...quests, ...customQuests], [quests, customQuests]);
  const completedCount = useMemo(
    () => allQuests.filter((q) => !!state[q.id]).length,
    [state, allQuests]
  );
  const progress = Math.round((completedCount / Math.max(1, allQuests.length)) * 100);

  const toggleQuest = (quest) => {
    const key = day;
    const prev = !!state[quest.id];
    const next = !prev;

    // Persist quest state
    const nextState = { ...state, [quest.id]: next };
    setState(nextState);
    saveDayState(key, nextState);

    // Update points based on transition
    let points = getNumber("mindshift_points", 0);
    if (next && !prev) points += quest.points;
    if (!next && prev) points = Math.max(0, points - quest.points);
    setNumber("mindshift_points", points);

    // Update streak if this is the first completion of the day
    if (next && !prev) maybeUpdateStreakOnFirstCompletionOfDay(key);

    dispatchCountersUpdate();
    // Ask badge system to re-evaluate (points/streak may have changed)
    try { window.dispatchEvent(new Event("mindshift:badges:check")); } catch {}
  };

  const saveCustomQuests = (key, list) => {
    try {
      localStorage.setItem(`mindshift_custom_quests_${key}`, JSON.stringify(list));
    } catch {}
  };

  const addCustomQuest = (e) => {
    e?.preventDefault?.();
    const title = newTitle.trim();
    const pts = Math.max(1, Math.min(1000, Number(newPoints) || 1));
    if (!title) return;
    const id = `custom_${Date.now()}`;
    const q = { id, title, points: pts };
    const next = [...customQuests, q];
    setCustomQuests(next);
    saveCustomQuests(day, next);
    setNewTitle("");
    setNewPoints(5);
    // Trigger badge evaluation for 'Quest Maker'
    try { window.dispatchEvent(new Event("mindshift:badges:check")); } catch {}
  };

  const resetToday = () => {
    const key = day;
    // Calculate points to subtract for any completed quests (base + custom)
    const questsCompleted = allQuests.filter((q) => !!state[q.id]);
    let points = getNumber("mindshift_points", 0);
    for (const q of questsCompleted) {
      points = Math.max(0, points - (Number(q.points) || 0));
    }
    setNumber("mindshift_points", points);

    // Clear completion state for the day
    const cleared = {};
    setState(cleared);
    saveDayState(key, cleared);

    // Allow streak to re-trigger by clearing the first-completion flag
    try { localStorage.removeItem(`mindshift_completed_any_${key}`); } catch {}

    dispatchCountersUpdate();
  };

  return (
    <div id="quest-board" className="w-full max-w-md mx-auto px-3 md:px-4 mt-6">
      <div 
        className="rounded-xl p-3 md:p-4"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
          <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Quest Board</h2>
          <div className="text-xs md:text-sm text-neutral-600 font-medium">{day}</div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full overflow-hidden mb-3" style={{ background: "var(--color-green-900-20)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: "var(--color-green-900)"
            }}
          />
        </div>
        <div className="text-xs text-neutral-600 mb-3">{completedCount}/{allQuests.length} completed • {progress}%</div>

        {/* Add custom quest */}
        <form onSubmit={addCustomQuest} className="space-y-2 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-xs text-neutral-600 mb-1">Quest title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Plan tomorrow in 5 minutes"
                className="w-full rounded-[999px] px-3 py-2 text-sm"
                style={{ 
                  background: "var(--surface)", 
                  border: "2px solid var(--color-green-900)", 
                  boxShadow: "0 2px 0 var(--color-green-900)" 
                }}
              />
            </div>
            <div className="w-full sm:w-24">
              <label className="block text-xs text-neutral-600 mb-1">Points</label>
              <input
                type="number"
                min={1}
                max={1000}
                step={1}
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                className="w-full rounded-[999px] px-3 py-2 text-sm"
                style={{ 
                  background: "var(--surface)", 
                  border: "2px solid var(--color-green-900)", 
                  boxShadow: "0 2px 0 var(--color-green-900)" 
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="nav-pill nav-pill--cyan flex-1 sm:flex-none">Add Quest</button>
            <button type="button" onClick={resetToday} className="nav-pill flex-1 sm:flex-none">Reset Today</button>
          </div>
        </form>

        {/* Quests List */}
        <ul className="space-y-2">
          {allQuests.map((q) => {
            const done = !!state[q.id];
            return (
              <li
                key={q.id}
                className="flex items-center justify-between gap-3 rounded-xl p-3 transition-all duration-200"
                style={{
                  background: done ? "var(--color-green-900-10)" : "var(--surface)",
                  border: `2px solid ${done ? "var(--color-green-900)" : "var(--color-green-900-30)"}`,
                  boxShadow: done ? "0 2px 0 var(--color-green-900)" : "none"
                }}
              >
                <label className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0"
                    style={{ accentColor: "var(--color-green-900)" }}
                    checked={done}
                    onChange={() => toggleQuest(q)}
                  />
                  <span className={`text-xs md:text-sm transition-colors duration-200 ${done ? "line-through text-neutral-500" : "text-neutral-900"} truncate`}>
                    {q.title}
                  </span>
                  {done && (
                    <span className="text-emerald-600 flex-shrink-0" aria-hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28-2.03a.75.75 0 0 0-1.06-1.06l-5.47 5.47-2.19-2.19a.75.75 0 1 0-1.06 1.06l2.72 2.72c.293.293.767.293 1.06 0l6-6Z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
                <span className="nav-pill nav-pill--neutral text-xs flex-shrink-0">+{q.points}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function maybeUpdateStreakOnFirstCompletionOfDay(today) {
  // Guard: only once per day
  const flagKey = `mindshift_completed_any_${today}`;
  try {
    if (localStorage.getItem(flagKey)) return;
    localStorage.setItem(flagKey, "1");
  } catch {
    // continue; streak update still safe
  }

  const last = (() => {
    try {
      return localStorage.getItem("mindshift_last_active_date") || "";
    } catch {
      return "";
    }
  })();

  const currentStreak = getNumber("mindshift_streak", 0);

  const prevDate = last;
  const todayDate = today;
  const yesterday = computeRelativeDate(todayDate, -1);

  let nextStreak = currentStreak;
  if (!prevDate) {
    nextStreak = 1;
  } else if (prevDate === todayDate) {
    // already active today, keep streak
    nextStreak = currentStreak || 1;
  } else if (prevDate === yesterday) {
    nextStreak = currentStreak + 1;
  } else {
    nextStreak = 1; // reset
  }

  setNumber("mindshift_streak", nextStreak);
  try { localStorage.setItem("mindshift_last_active_date", todayDate); } catch {}
}

function computeRelativeDate(baseYYYYMMDD, deltaDays) {
  try {
    const [y, m, d] = baseYYYYMMDD.split("-").map((n) => parseInt(n, 10));
    const dt = new Date(y, (m - 1), d);
    dt.setDate(dt.getDate() + deltaDays);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).toLocaleDateString("en-CA");
  } catch {
    const dt = new Date();
    dt.setDate(dt.getDate() + deltaDays);
    return dt.toISOString().slice(0, 10);
  }
}
