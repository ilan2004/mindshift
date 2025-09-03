"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchBlocklist, saveBlocklist as saveBlocklistDB, startSession as startSessionDB } from "../lib/focusStore";

// Messaging keys
const MSG_REQUEST = "mindshift:focus";
const MSG_RESPONSE = "mindshift:focus:status";

const DEFAULT_PRESETS = [25, 45, 60];
const DEFAULT_BLOCKLIST = [
  "youtube.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "reddit.com",
  "tiktok.com",
  "facebook.com",
  "netflix.com",
  "primevideo.com",
  "discord.com",
  "twitch.tv",
];

function formatMMSS(ms) {
  if (!ms || ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FooterFocusBar() {
  const [presets] = useState(DEFAULT_PRESETS);
  const [durationMin, setDurationMin] = useState(25);
  const [customMin, setCustomMin] = useState(25);
  const [status, setStatus] = useState({ active: false, mode: "idle", remainingMs: 0, domains: [] });
  const [domains, setDomains] = useState(DEFAULT_BLOCKLIST);
  const [quickDomain, setQuickDomain] = useState("");
  const [showQuickAddMobile, setShowQuickAddMobile] = useState(false);
  const [showMoreMobile, setShowMoreMobile] = useState(false);

  const hasExtensionRef = useRef(false);

  const send = useCallback((action, payload = {}) => {
    if (typeof window === "undefined") return;
    // Communicate via window.postMessage; content script will forward to background
    window.postMessage({ type: MSG_REQUEST, action, payload }, "*");
  }, []);

  // Ask extension for status on mount and load blocklist from Supabase
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onMessage = (evt) => {
      const data = evt?.data;
      if (!data || data.type !== MSG_RESPONSE) return;
      // Extension present
      hasExtensionRef.current = true;
      const { active, mode, remainingMs, domains: extDomains } = data.payload || {};
      setStatus({ active: !!active, mode: mode || (active ? "focus" : "idle"), remainingMs: remainingMs || 0, domains: extDomains || [] });
      if (Array.isArray(extDomains) && extDomains.length) {
        setDomains(extDomains);
      }
    };

    window.addEventListener("message", onMessage);
    // initial status request
    send("getStatus");

    // Load blocklist from Supabase as source of truth; if extension sends one later, it will override
    (async () => {
      try {
        const dbDomains = await fetchBlocklist();
        if (Array.isArray(dbDomains) && dbDomains.length) {
          setDomains(dbDomains);
          // Inform extension of current list
          send("updateBlocklist", { domains: dbDomains });
        }
      } catch {}
    })();

    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  // Fallback countdown in UI if extension doesn't push updates frequently
  useEffect(() => {
    if (!status.active || !status.remainingMs) return;
    const id = setInterval(() => {
      setStatus((s) => ({ ...s, remainingMs: Math.max(0, (s.remainingMs || 0) - 1000) }));
    }, 1000);
    return () => clearInterval(id);
  }, [status.active, status.remainingMs]);

  // Refresh status when page regains focus/visibility and with a light polling interval
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFocus = () => send("getStatus");
    const onVisibility = () => { if (document.visibilityState === "visible") send("getStatus"); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const poll = setInterval(() => { if (document.visibilityState === "visible") send("getStatus"); }, 30000);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(poll);
    };
  }, [send]);

  const onPreset = (m) => {
    setDurationMin(m);
    setCustomMin(m);
  };

  const onStart = async () => {
    const m = Number(customMin) || durationMin || 25;
    // Persist to Supabase
    try { await saveBlocklistDB(domains); } catch {}
    try { await startSessionDB({ mode: "focus", durationMinutes: m }); } catch {}
    // Notify extension
    send("startSession", { durationMinutes: m, domains });
    // Persist total duration locally so UI can restore ring progress on refresh
    try { localStorage.setItem("mindshift_session_total_ms", String(m * 60 * 1000)); } catch {}
  };

  const onPause = () => send("pauseSession");
  const onResume = () => send("resumeSession");
  const onStop = () => {
    send("stopSession");
    try { localStorage.removeItem("mindshift_session_total_ms"); } catch {}
  };
  const onStartBreak = (m = 5) => {
    send("startBreak", { durationMinutes: m });
    try { localStorage.setItem("mindshift_session_total_ms", String(m * 60 * 1000)); } catch {}
  };

  const onAddDomain = async () => {
    const raw = (quickDomain || "").trim();
    if (!raw) return;
    // Basic normalization: strip protocol/path, keep hostname
    try {
      const url = raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`);
      const host = url.hostname.replace(/^www\./, "");
      if (!domains.includes(host)) {
        const next = [...domains, host];
        setDomains(next);
        try { await saveBlocklistDB(next); } catch {}
        send("updateBlocklist", { domains: next });
      }
    } catch (_) {
      // If not a URL, treat as plain domain
      const host = raw.replace(/^www\./, "");
      if (!domains.includes(host)) {
        const next = [...domains, host];
        setDomains(next);
        try { await saveBlocklistDB(next); } catch {}
        send("updateBlocklist", { domains: next });
      }
    }
    setQuickDomain("");
  };

  const statusLabel = useMemo(() => {
    if (status.active) return status.mode === "break" ? "Break" : "Focusing";
    if (status.mode === "paused") return "Paused";
    return "Idle";
  }, [status.active, status.mode]);

  const primaryAction = useMemo(() => {
    if (!status.active) return { label: "Start", onClick: onStart };
    if (status.mode === "paused") return { label: "Resume", onClick: onResume };
    return { label: "Pause", onClick: onPause };
  }, [status.active, status.mode]);

  const primaryClass = useMemo(() => {
    // Start/Resume -> primary (green); Pause -> amber
    if (!status.active) return "nav-pill nav-pill--primary";
    if (status.mode === "paused") return "nav-pill nav-pill--primary";
    return "nav-pill nav-pill--amber"; // when focusing/breaking, primary action is Pause
  }, [status.active, status.mode]);

  return (
    <div className="fixed left-0 right-0 bottom-4 md:bottom-10 z-40 pointer-events-none">
      <div className="mx-auto max-w-6xl px-3 md:px-6">
        <div
          className="pointer-events-auto rounded-[999px] px-3 md:px-8 py-2.5 md:py-4.5 flex flex-wrap items-center gap-1.5 md:gap-3 justify-center"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
          }}
        >
        {/* Desktop: All controls in one line */}
        <div className="hidden md:flex items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="nav-pill nav-pill--cyan">{statusLabel}</span>
            <span className="font-mono text-sm tabular-nums">{formatMMSS(status.remainingMs)}</span>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2">
            {presets.map((m) => (
              <button key={m}
                type="button"
                onClick={() => onPreset(m)}
                className={`nav-pill ${m === durationMin ? "nav-pill--cyan" : ""}`}
              >
                {m}m
              </button>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="w-20 px-3 py-2 rounded-[999px] text-sm"
                style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
              />
              <span className="text-sm text-neutral-600">min</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={primaryAction.onClick} className={primaryClass}>
              {primaryAction.label}
            </button>
            <button type="button" onClick={onStop} className="nav-pill nav-pill--accent">Stop</button>
            <button type="button" onClick={() => onStartBreak(5)} className="nav-pill nav-pill--cyan">Break 5m</button>
          </div>
        </div>

        {/* Mobile: Status */}
        <div className="flex md:hidden items-center gap-2">
          <span className="nav-pill nav-pill--cyan">{statusLabel}</span>
          <span className="font-mono text-xs tabular-nums">{formatMMSS(status.remainingMs)}</span>
        </div>

        {/* Mobile: Actions */}
        <div className="flex md:hidden flex-wrap items-center gap-1.5">
          <button type="button" onClick={primaryAction.onClick} className={primaryClass}>
            {primaryAction.label}
          </button>
          <button
            type="button"
            className="nav-pill"
            onClick={() => setShowMoreMobile((v) => !v)}
            aria-expanded={showMoreMobile}
            aria-controls="more-actions-row"
          >
            More
          </button>
          <button
            type="button"
            className="nav-pill"
            onClick={() => setShowQuickAddMobile((v) => !v)}
            aria-expanded={showQuickAddMobile}
            aria-controls="quick-add-row"
          >
            + Domain
          </button>
        </div>

        {/* Mobile-only extra actions row */}
        <div
          id="more-actions-row"
          className={`${showMoreMobile ? "flex" : "hidden"} md:hidden basis-full justify-center items-center gap-2`}
        >
          <button type="button" onClick={onStop} className="nav-pill nav-pill--accent">Stop</button>
          <button type="button" onClick={() => onStartBreak(5)} className="nav-pill nav-pill--cyan">Break 5m</button>
        </div>

        {/* Quick add domain
            - Mobile: hidden until toggled via '+ Domain' to reduce stacking
            - Desktop: always visible centered on its own row */}
        <div
          id="quick-add-row"
          className={`${showQuickAddMobile ? "flex" : "hidden"} md:flex basis-full justify-center items-center gap-2`}
        >
          <input
            type="text"
            placeholder="Add domain to block (e.g., twitter.com)"
            value={quickDomain}
            onChange={(e) => setQuickDomain(e.target.value)}
            className="px-3 py-2 rounded-[999px] text-sm w-full max-w-[320px] md:max-w-[360px]"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)" }}
          />
          <button type="button" onClick={onAddDomain} className="nav-pill">+ Add</button>
        </div>
        </div>
      </div>

      {/* Helper text when extension not detected */}
      {!hasExtensionRef.current && (
        <div className="mt-1 text-center text-[11px] text-neutral-600">Install/enable the MindShift extension to enforce blocks and run the timer in the background.</div>
      )}
    </div>
  );
}
