"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchBlocklist, saveBlocklist as saveBlocklistDB, startSession as startSessionDB } from "../lib/focusStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getOrCreateToken, fetchBlocklistJSON as fetchBLJson, addDomains as addBL } from "@/lib/blocklist";

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

// Helpers for ProductivityGraph logging
function todayKey() {
  try { return new Date().toLocaleDateString("en-CA"); } catch { return new Date().toISOString().slice(0, 10); }
}
function readSessions() {
  try {
    const raw = localStorage.getItem("mindshift_focus_sessions");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function writeSessions(list) {
  try { localStorage.setItem("mindshift_focus_sessions", JSON.stringify(list)); } catch {}
}
function dispatchFocusUpdate() {
  try { window.dispatchEvent(new Event("mindshift:focus:update")); } catch {}
}
function dispatchSessionCompleted(minutes) {
  try {
    const ev = new CustomEvent("mindshift:session:completed", { detail: { minutes } });
    window.dispatchEvent(ev);
  } catch {}
}

export default function FooterFocusBar() {
  const [durationMin, setDurationMin] = useState(25);
  const [customMin, setCustomMin] = useState(25);
  const [status, setStatus] = useState({ active: false, mode: "idle", remainingMs: 0, domains: [] });
  const [domains, setDomains] = useState(DEFAULT_BLOCKLIST);
  const [quickDomain, setQuickDomain] = useState("");
  const [showQuickAddMobile, setShowQuickAddMobile] = useState(false);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const [blToken, setBlToken] = useState("");

  const hasExtensionRef = useRef(false);
  const barRef = useRef(null);

  // Show/hide the footer bar on scroll direction using GSAP ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    const el = barRef.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ensure starting position and optimize for transform
    gsap.set(el, { yPercent: 0, willChange: "transform" });

    // Use quickTo for smoother, debounced updates
    const yTo = gsap.quickTo(el, "yPercent", { duration: prefersReducedMotion ? 0 : 0.65, ease: "power3.out", overwrite: true });

    // Slight scroll offset before we start hiding to avoid jitter on micro scroll
    let armed = false;
    const armAt = 30; // px scrolled before enabling hide/show logic

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (prefersReducedMotion) return;
        const scroll = self.scroller ? self.scroller.scrollTop : window.scrollY || 0;
        if (!armed && scroll > armAt) armed = true;
        if (!armed) return;

        if (self.direction === 1) {
          // Scrolling down -> hide (reduced travel to 105%)
          yTo(105);
        } else {
          // Scrolling up -> show
          yTo(0);
        }
      },
      onRefresh: () => {
        // Keep visible on refresh
        yTo(0);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

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

    // Prepare per-user token and hydrate from backend blocklist (base + custom)
    (async () => {
      try {
        const t = getOrCreateToken();
        setBlToken(t);
        const json = await fetchBLJson(t);
        if (json && (Array.isArray(json.base) || Array.isArray(json.custom))) {
          const set = new Set([...(json.base || []), ...(json.custom || [])]);
          if (set.size) {
            const merged = Array.from(set).sort();
            setDomains((prev) => {
              // merge with existing domains, prefer backend list as authoritative start
              const mergedSet = new Set([...(merged || []), ...(prev || [])]);
              return Array.from(mergedSet);
            });
          }
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
    // If extension isn't present, prompt user to enable blocking options
    if (!hasExtensionRef.current) {
      setShowEnablePrompt(true);
      return;
    }
    const m = Number(customMin) || durationMin || 25;
    // Persist to Supabase
    try { await saveBlocklistDB(domains); } catch {}
    try { await startSessionDB({ mode: "focus", durationMinutes: m }); } catch {}
    // Notify extension
    send("startSession", { durationMinutes: m, domains });
    // Persist total duration locally so UI can restore ring progress on refresh
    try {
      localStorage.setItem("mindshift_session_total_ms", String(m * 60 * 1000));
      localStorage.setItem("mindshift_session_mode", "focus");
      localStorage.removeItem("mindshift_session_stopped");
    } catch {}
  };

  const onPause = () => send("pauseSession");
  const onResume = () => send("resumeSession");
  const onStop = () => {
    // Mark as manually stopped to avoid logging as completed
    try { localStorage.setItem("mindshift_session_stopped", "1"); } catch {}
    send("stopSession");
    try {
      localStorage.removeItem("mindshift_session_total_ms");
      localStorage.removeItem("mindshift_session_mode");
    } catch {}
  };
  const onStartBreak = (m = 5) => {
    send("startBreak", { durationMinutes: m });
    try {
      localStorage.setItem("mindshift_session_total_ms", String(m * 60 * 1000));
      localStorage.setItem("mindshift_session_mode", "break");
      localStorage.removeItem("mindshift_session_stopped");
    } catch {}
  };

  // Helpers to build one-click subscribe links for blockers
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const filterListUrl = useMemo(() => (API_BASE && blToken ? `${API_BASE}/blocklist/${blToken}.filter` : ""), [API_BASE, blToken]);
  const abpSubscribeHref = useMemo(() => (filterListUrl ? `abp:subscribe?location=${encodeURIComponent(filterListUrl)}&title=${encodeURIComponent("Mindshift Blocklist")}` : ""), [filterListUrl]);
  const adguardSubscribeHref = useMemo(() => (filterListUrl ? `adguard:add_subscription?location=${encodeURIComponent(filterListUrl)}&title=${encodeURIComponent("Mindshift Blocklist")}` : ""), [filterListUrl]);
  const extensionInstallHref = ""; // TODO: set to your Chrome/Edge/Firefox store listing when available

  // Since the extension is not on the store yet, show an instructions modal on desktop
  function isMobileUA() {
    if (typeof navigator === "undefined") return false;
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
  }
  const onEnableBlocking = () => {
    if (isMobileUA()) {
      try { window.location.href = "/mobile-setup"; } catch {}
    } else {
      setShowEnablePrompt(true);
    }
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
        // Also add to per-user NextDNS list (best-effort)
        try { if (blToken) await addBL(blToken, host); } catch {}
      }
    } catch (_) {
      // If not a URL, treat as plain domain
      const host = raw.replace(/^www\./, "");
      if (!domains.includes(host)) {
        const next = [...domains, host];
        setDomains(next);
        try { await saveBlocklistDB(next); } catch {}
        send("updateBlocklist", { domains: next });
        try { if (blToken) await addBL(blToken, host); } catch {}
      }
    }
    setQuickDomain("");
  };

  const statusLabel = useMemo(() => {
    if (status.active) return status.mode === "break" ? "Break" : "Focusing";
    if (status.mode === "paused") return "Paused";
    return "Idle";
  }, [status.active, status.mode]);

  // Detect natural completion of a focus session and log minutes for ProductivityGraph
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = status;
    // Transition to inactive/idle with timer reaching zero
    const ended = prev?.active && (!curr.active || curr.mode === "idle") && (prev.remainingMs === 0 || curr.remainingMs === 0);
    if (ended) {
      let mode = "";
      let totalMs = 0;
      let manuallyStopped = false;
      try {
        mode = localStorage.getItem("mindshift_session_mode") || "";
        totalMs = Number(localStorage.getItem("mindshift_session_total_ms")) || 0;
        manuallyStopped = !!localStorage.getItem("mindshift_session_stopped");
      } catch {}
      if (!manuallyStopped && mode === "focus" && totalMs > 0) {
        const minutes = Math.max(1, Math.round(totalMs / 60000));
        const key = todayKey();
        const sessions = readSessions();
        const idx = sessions.findIndex((s) => s && s.date === key);
        if (idx >= 0) sessions[idx] = { ...sessions[idx], minutes: (Number(sessions[idx].minutes) || 0) + minutes };
        else sessions.push({ date: key, minutes });
        writeSessions(sessions);
        dispatchFocusUpdate();
        dispatchSessionCompleted(minutes);
      }
      // Clear session markers after handling
      try {
        localStorage.removeItem("mindshift_session_total_ms");
        localStorage.removeItem("mindshift_session_mode");
        localStorage.removeItem("mindshift_session_stopped");
      } catch {}
    }
    prevStatusRef.current = curr;
  }, [status]);

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
    <div ref={barRef} className="fixed left-0 right-0 bottom-4 md:bottom-10 z-40 pointer-events-none">
      <div className="mx-auto max-w-6xl px-3 md:px-6">
        <div
          className="pointer-events-auto rounded-[999px] px-3 md:px-8 py-2.5 md:py-4.5 flex flex-wrap items-center gap-1.5 md:gap-3 justify-center"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
          }}
        >
          {/* If extension is not enabled, show only the single Enable button on desktop */}
          {!hasExtensionRef.current ? (
            <div className="hidden md:flex items-center gap-3">
              <button type="button" className="nav-pill nav-pill--primary" onClick={onEnableBlocking}>Enable blocking</button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="nav-pill nav-pill--cyan">{statusLabel}</span>
                <span className="font-mono text-sm tabular-nums">{formatMMSS(status.remainingMs)}</span>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2">
                {DEFAULT_PRESETS.map((m) => (
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
          )}

          {/* Mobile: Status & Actions */}
          {!hasExtensionRef.current ? (
            <div className="flex md:hidden items-center gap-2">
              <button type="button" className="nav-pill nav-pill--primary" onClick={onEnableBlocking}>Enable blocking</button>
            </div>
          ) : (
            <>
              <div className="flex md:hidden items-center gap-2">
                <span className="nav-pill nav-pill--cyan">{statusLabel}</span>
                <span className="font-mono text-xs tabular-nums">{formatMMSS(status.remainingMs)}</span>
              </div>
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
            </>
          )}

        {/* Mobile-only extra actions row */}
        {hasExtensionRef.current && (
          <div
            id="more-actions-row"
            className={`${showMoreMobile ? "flex" : "hidden"} md:hidden basis-full justify-center items-center gap-2`}
          >
            <button type="button" onClick={onStop} className="nav-pill nav-pill--accent">Stop</button>
            <button type="button" onClick={() => onStartBreak(5)} className="nav-pill nav-pill--cyan">Break 5m</button>
          </div>
        )}

        {/* No extra enable row on mobile; handled by single button */}

        {/* Quick add domain
            - Mobile: hidden until toggled via '+ Domain' to reduce stacking
            - Desktop: always visible centered on its own row */}
        {hasExtensionRef.current && (
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
        )}
        </div>
      </div>

      {/* Helper text when extension not detected */}
      {!hasExtensionRef.current && (
        <div className="mt-1 text-center text-[11px] text-neutral-600">Install/enable the MindShift extension to enforce blocks and run the timer in the background.</div>
      )}

      {/* Desktop instructions modal for enabling blocking */}
      {showEnablePrompt && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white border p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Enable blocking in your browser</h3>
            <ol className="list-decimal ml-5 space-y-1 text-sm text-neutral-700 mb-3">
              <li>Open <span className="font-mono">chrome://extensions</span> (or your browser’s extensions page).</li>
              <li>Turn on <b>Developer mode</b>.</li>
              <li>Click <b>Load unpacked</b> and select the <span className="font-mono">extension/</span> folder from this project.</li>
              <li>Refresh this page; the controls will appear when detected.</li>
            </ol>
            <div className="text-xs text-neutral-500 mb-3">Alternatively, subscribe via your ad blocker (browser-only blocking):</div>
            <div className="flex flex-wrap gap-2 mb-3">
              <a className={`nav-pill ${extensionInstallHref ? "" : "opacity-60 pointer-events-none"}`} href={extensionInstallHref || undefined} target="_blank" rel="noreferrer" onClick={() => setShowEnablePrompt(false)}>Install from store</a>
              <a className={`nav-pill ${abpSubscribeHref ? "" : "opacity-60 pointer-events-none"}`} href={abpSubscribeHref || undefined} onClick={() => setShowEnablePrompt(false)}>Add to uBlock/ABP</a>
              <a className={`nav-pill ${adguardSubscribeHref ? "" : "opacity-60 pointer-events-none"}`} href={adguardSubscribeHref || undefined} onClick={() => setShowEnablePrompt(false)}>Add to AdGuard</a>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="nav-pill" onClick={() => setShowEnablePrompt(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
