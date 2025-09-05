"use client";

import { useEffect, useMemo, useState } from "react";

const MSG_REQUEST = "mindshift:focus";
const MSG_RESPONSE = "mindshift:focus:status";

function useFocusStatus() {
  const [status, setStatus] = useState({ active: false, mode: "idle", remainingMs: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMessage = (evt) => {
      const data = evt?.data;
      if (!data || data.type !== MSG_RESPONSE) return;
      const { active, mode, remainingMs } = data.payload || {};
      setStatus({ active: !!active, mode: mode || (active ? "focus" : "idle"), remainingMs: remainingMs || 0 });
    };
    window.addEventListener("message", onMessage);
    // Request initial status
    window.postMessage({ type: MSG_REQUEST, action: "getStatus", payload: {} }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return status;
}

function readNumber(key, def = 0) {
  try { return Number(localStorage.getItem(key)) || def; } catch { return def; }
}

function readString(key, def = "") {
  try { return localStorage.getItem(key) || def; } catch { return def; }
}

function getTimeOfDay(now = new Date()) {
  const h = now.getHours();
  if (h < 6) return "late-night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function NudgeBox({ tone }) {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [personality, setPersonality] = useState("");
  const status = useFocusStatus();

  useEffect(() => {
    const read = () => {
      setPoints(readNumber("mindshift_points"));
      setStreak(readNumber("mindshift_streak"));
      setPersonality((readString("mindshift_personality_type", "ENFJ") || "ENFJ").toUpperCase());
    };
    read();
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (["mindshift_points", "mindshift_streak", "mindshift_personality_type"].includes(e.key)) read();
    };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("mindshift:counters:update", onCustom);
    window.addEventListener("mindshift:session:completed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mindshift:counters:update", onCustom);
      window.removeEventListener("mindshift:session:completed", onCustom);
    };
  }, []);

  const nudge = useMemo(() => {
    const tod = getTimeOfDay();
    // Personality-flavored stems
    const stems = {
      ENFJ: {
        start: "Align this block to who you’ll help.",
        mid: "Protect your collaboration windows.",
        end: "Close strong — write a 1-line recap.",
      },
      INTJ: {
        start: "Lock a 45m deep slice and remove friction.",
        mid: "Keep context tight. One tab, one goal.",
        end: "Capture learnings in 2 bullets.",
      },
      INFP: {
        start: "Write a one-line intent that feels meaningful.",
        mid: "Keep the space calm — one gentle track.",
        end: "Celebrate the smallest win; it compounds.",
      },
    };
    // Optional tone-flavored stems (overrides when tone is provided)
    const toneStems = {
      social: {
        start: "Set an intent your future teammates will thank you for.",
        mid: "Protect your collab block; message later.",
        end: "Share one takeaway with a peer.",
      },
      logic: {
        start: "Define the exact next unit — 25m, one metric moved.",
        mid: "Single-context flow. No branching.",
        end: "Write a 2-bullet checkpoint.",
      },
      fun: {
        start: "Pick a quest — tiny, novel, and winnable.",
        mid: "Keep it playful: one tab, one track.",
        end: "Claim your badge with a quick snapshot.",
      },
      meaningful: {
        start: "Name why this matters (one line).",
        mid: "Stay gentle; tiny progress is still progress.",
        end: "Note one thing you’re grateful for.",
      },
    };
    const P = stems[personality] || stems.ENFJ;
    const T = tone && toneStems[tone] ? toneStems[tone] : null;

    // Time of day flavor
    const todLine = tod === "morning" ? "Prime the day with one crisp win."
      : tod === "afternoon" ? "Nudge the needle — 25m is enough."
      : tod === "evening" ? "Wind down with a tidy checkpoint."
      : "Quick, focused pass > perfect plan.";

    // Streak / points context
    const streakLine = streak >= 7 ? `🔥 ${streak}-day streak — defend it with one block.`
      : streak >= 3 ? `🔥 ${streak}-day streak — consistency beats intensity.`
      : streak === 0 ? "Day 1 energy: make it obvious and easy."
      : `Streak: ${streak} — keep momentum with a small win.`;

    // Mode-aware call to action
    const modeCTA = status.active && status.mode === "focus"
      ? "Stay with the single next step."
      : status.active && status.mode === "break"
        ? "Great break. Queue the next intent before returning."
        : "Start a 25m focus — write your one-liner intent.";

    // Personality or tone section pick
    const base = T || P;
    const section = status.active ? base.mid : base.start;

    return {
      title: status.active ? "You’re in the zone" : "Ready for a focused pass?",
      body: `${todLine} ${streakLine} ${section}`,
      cta: modeCTA,
    };
  }, [status.active, status.mode, streak, points, personality, tone]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm" style={{ boxShadow: "0 6px 0 var(--color-green-900-20)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="nav-pill nav-pill--amber text-xs">Nudge</span>
          <h3 className="text-sm font-semibold text-neutral-800">{nudge.title}</h3>
        </div>
        <p className="text-sm text-neutral-700">{nudge.body}</p>
        <div className="mt-3">
          <button type="button" className="nav-pill nav-pill--primary" onClick={() => {
            // prompt a status refresh and focus start intent
            window.postMessage({ type: MSG_REQUEST, action: "getStatus", payload: {} }, "*");
            // Consumers can listen to this to open timer UI or prompt intent entry
            window.dispatchEvent(new CustomEvent("mindshift:nudge:cta", { detail: { action: "focus_or_intent" } }));
          }}>
            {nudge.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
