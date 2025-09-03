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
  };

  const onPause = () => send("pauseSession");
  const onResume = () => send("resumeSession");
  const onStop = () => send("stopSession");
  const onStartBreak = (m = 5) => send("startBreak", { durationMinutes: m });

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

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3 justify-between">
        {/* Status */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm border"
                style={{ background: "var(--color-cyan-200)", color: "#064e3b", borderColor: "rgba(0,0,0,0.06)" }}>
            {statusLabel}
          </span>
          <span className="font-mono text-sm tabular-nums">{formatMMSS(status.remainingMs)}</span>
        </div>

        {/* Presets */}
        <div className="hidden md:flex items-center gap-2">
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
              className="w-16 px-2 py-1 border rounded text-sm"
            />
            <span className="text-sm text-neutral-600">min</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={primaryAction.onClick} className="nav-pill nav-pill--cyan">
            {primaryAction.label}
          </button>
          <button type="button" onClick={onStop} className="nav-pill">Stop</button>
          <button type="button" onClick={() => onStartBreak(5)} className="nav-pill">Break 5m</button>
        </div>

        {/* Quick add domain */}
        <div className="flex items-center gap-2 min-w-[280px]">
          <input
            type="text"
            placeholder="Add domain to block (e.g., twitter.com)"
            value={quickDomain}
            onChange={(e) => setQuickDomain(e.target.value)}
            className="flex-1 px-3 py-2 border rounded text-sm"
          />
          <button type="button" onClick={onAddDomain} className="nav-pill">+ Add</button>
        </div>
      </div>

      {/* Helper text when extension not detected */}
      {!hasExtensionRef.current && (
        <div className="text-center text-xs text-neutral-500 pb-2">Install/enable the MindShift extension to enforce blocks and run the timer in the background.</div>
      )}
    </div>
  );
}
