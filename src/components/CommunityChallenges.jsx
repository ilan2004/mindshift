"use client";

import { useEffect, useMemo, useState } from "react";

const LS_KEY = "mindshift_challenges";

function seedChallenges() {
  return [
    {
      id: "wk-focus-10h",
      title: "10h Focus Week",
      desc: "Accumulate 10 hours of focused work this week.",
      participants: 42,
      joined: false,
      rewardPts: 150,
      endsAt: Date.now() + 6 * 24 * 60 * 60 * 1000,
    },
    {
      id: "daily-streak-7",
      title: "7-Day Streak",
      desc: "Maintain a daily focus streak for 7 days.",
      participants: 77,
      joined: false,
      rewardPts: 200,
      endsAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
    },
    {
      id: "social-nudges-5",
      title: "Nudge 5 Peers",
      desc: "Send encouragement nudges to 5 peers this week.",
      participants: 18,
      joined: false,
      rewardPts: 80,
      endsAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    },
  ];
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedChallenges();
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : seedChallenges();
  } catch {
    return seedChallenges();
  }
}
function save(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

function timeLeft(ts) {
  const ms = ts - Date.now();
  if (ms <= 0) return "ended";
  const d = Math.floor(ms / (24*60*60*1000));
  const h = Math.floor((ms % (24*60*60*1000)) / (60*60*1000));
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((ms % (60*60*1000)) / (60*1000));
  return `${h}h ${m}m left`;
}

export default function CommunityChallenges() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const join = (id) => {
    setItems((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, joined: true, participants: (c.participants||0)+1 } : c);
      save(next);
      return next;
    });
  };
  const leave = (id) => {
    setItems((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, joined: false, participants: Math.max(0, (c.participants||0)-1) } : c);
      save(next);
      return next;
    });
  };

  const sorted = useMemo(() => [...items].sort((a,b) => (a.joined === b.joined ? 0 : a.joined ? -1 : 1)), [items]);

  return (
    <div
      className="rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm overflow-hidden"
      style={{ backgroundColor: "var(--token-3cf441d7-edfe-47fb-95dc-1899b0597681, #f9f8f4)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Community Challenges</h2>
        <span className="text-xs text-neutral-600">{sorted.length} available</span>
      </div>
      <ul className="grid gap-3 w-full">
        {sorted.map((c) => (
          <li
            key={c.id}
            className="p-3 rounded-lg border border-neutral-200 w-full overflow-hidden"
            style={{ backgroundColor: "var(--token-3cf441d7-edfe-47fb-95dc-1899b0597681, #f9f8f4)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="text-sm font-medium truncate w-full">{c.title}</div>
                <div className="text-xs text-neutral-600 truncate w-full">{c.desc}</div>
                <div className="text-[11px] text-neutral-500 mt-1 truncate w-full">
                  {c.participants} joined · Reward {c.rewardPts} pts · {timeLeft(c.endsAt)}
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {c.joined ? (
                  <button className="nav-pill nav-pill--neutral text-xs whitespace-nowrap" onClick={() => leave(c.id)}>Leave</button>
                ) : (
                  <button className="nav-pill nav-pill--cyan text-xs whitespace-nowrap" onClick={() => join(c.id)}>Join</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
