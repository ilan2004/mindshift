"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fetchBlocklist, saveBlocklist as saveBlocklistDB, startSession as startSessionDB } from "../lib/focusStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getOrCreateToken, fetchBlocklistJSON as fetchBLJson, addDomains as addBL } from "@/lib/blocklist";
import { useTutorial } from "@/contexts/TutorialContext";
import { HelpCircle } from "lucide-react";

// Messaging keys
const MSG_REQUEST = "nudge:focus";
const MSG_RESPONSE = "nudge:focus:status";

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
    const raw = localStorage.getItem("Nudge_focus_sessions");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function writeSessions(list) {
  try { localStorage.setItem("Nudge_focus_sessions", JSON.stringify(list)); } catch {}
}
function dispatchFocusUpdate() {
  try { window.dispatchEvent(new Event("nudge:counters:update")); } catch {}
}
function dispatchSessionCompleted(minutes) {
  try {
    const ev = new CustomEvent("nudge:session:completed", { detail: { minutes } });
    window.dispatchEvent(ev);
  } catch {}
}

export default function FooterFocusBar() {
  const [mounted, setMounted] = useState(false);
  const [durationMin, setDurationMin] = useState(25);
  const [customMin, setCustomMin] = useState(25);
  const [status, setStatus] = useState({ active: false, mode: "idle", remainingMs: 0, domains: [] });
  const [domains, setDomains] = useState(DEFAULT_BLOCKLIST);
  const [quickDomain, setQuickDomain] = useState("");
  const [showQuickAddMobile, setShowQuickAddMobile] = useState(false);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const [blToken, setBlToken] = useState("");
  const { startTutorial, completedTutorials, userPreferences } = useTutorial();

  const hasExtensionRef = useRef(false);
  const barRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

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
          // Scrolling down -> hide completely
          yTo(150);
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

    // Fallback: plain window scroll listener to detect direction and toggle bar
    let lastY = window.scrollY || 0;
    const onScroll = () => {
      if (prefersReducedMotion) return;
      const y = window.scrollY || 0;
      if (!armed && y > armAt) armed = true;
      if (!armed) return;
      const dir = y > lastY ? 1 : -1;
      lastY = y;
      if (dir === 1) yTo(150); else yTo(0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      st.kill();
      window.removeEventListener("scroll", onScroll);
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
      localStorage.setItem("Nudge_session_total_ms", String(m * 60 * 1000));
      localStorage.setItem("Nudge_session_mode", "focus");
      localStorage.removeItem("Nudge_session_stopped");
    } catch {}
  };

  const onPause = () => send("pauseSession");
  const onResume = () => send("resumeSession");
  const onStop = () => {
    // Mark as manually stopped to avoid logging as completed
    try { localStorage.setItem("Nudge_session_stopped", "1"); } catch {}
    send("stopSession");
    try {
      localStorage.removeItem("Nudge_session_total_ms");
      localStorage.removeItem("Nudge_session_mode");
    } catch {}
  };
  const onStartBreak = (m = 5) => {
    send("startBreak", { durationMinutes: m });
    try {
      localStorage.setItem("Nudge_session_total_ms", String(m * 60 * 1000));
      localStorage.setItem("Nudge_session_mode", "break");
      localStorage.removeItem("Nudge_session_stopped");
    } catch {}
  };

  // Helpers to build one-click subscribe links for blockers
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const filterListUrl = useMemo(() => (API_BASE && blToken ? `${API_BASE}/blocklist/${blToken}.filter` : ""), [API_BASE, blToken]);
  const abpSubscribeHref = useMemo(() => (filterListUrl ? `abp:subscribe?location=${encodeURIComponent(filterListUrl)}&title=${encodeURIComponent("Nudge Blocklist")}` : ""), [filterListUrl]);
  const adguardSubscribeHref = useMemo(() => (filterListUrl ? `adguard:add_subscription?location=${encodeURIComponent(filterListUrl)}&title=${encodeURIComponent("Nudge Blocklist")}` : ""), [filterListUrl]);
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
        mode = localStorage.getItem("Nudge_session_mode") || "";
        totalMs = Number(localStorage.getItem("Nudge_session_total_ms")) || 0;
        manuallyStopped = !!localStorage.getItem("Nudge_session_stopped");
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
        localStorage.removeItem("Nudge_session_total_ms");
        localStorage.removeItem("Nudge_session_mode");
        localStorage.removeItem("Nudge_session_stopped");
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
    <div ref={barRef} className="fixed left-0 right-0 bottom-4 md:bottom-10 z-10 pointer-events-none" data-tutorial="focus-bar">
      <div className="mx-auto max-w-6xl px-3 md:px-6 flex justify-center">
        <div
          className="pointer-events-auto rounded-[999px] px-3 md:px-8 py-2.5 md:py-4.5 flex flex-wrap items-center gap-1.5 md:gap-3 justify-center mx-auto"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
            width: "fit-content",
            maxWidth: "100%",
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
                <button type="button" onClick={onStop} className="nav-pill nav-pill--accent" style={{ color: "var(--color-green-900)" }}>Stop</button>
                <button type="button" onClick={() => onStartBreak(5)} className="nav-pill nav-pill--cyan">Break 5m</button>
                {/* Tutorial help for new users */}
                {userPreferences.showTooltips && !completedTutorials.has('focus_sessions') && (
                  <button
                    type="button"
                    onClick={() => startTutorial('focus_sessions')}
                    className="nav-pill nav-pill--outline nav-pill--compact"
                    title="Learn how focus sessions work"
                  >
                    <HelpCircle size={14} />
                  </button>
                )}
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
                {/* Tutorial help for mobile users */}
                {userPreferences.showTooltips && !completedTutorials.has('focus_sessions') && (
                  <button
                    type="button"
                    onClick={() => startTutorial('focus_sessions')}
                    className="nav-pill nav-pill--outline nav-pill--compact"
                    title="How does this work?"
                  >
                    ?
                  </button>
                )}
              </div>
            </>
          )}

        {/* Mobile-only extra actions row */}
        {hasExtensionRef.current && (
          <div
            id="more-actions-row"
            className={`${showMoreMobile ? "flex" : "hidden"} md:hidden basis-full justify-center items-center gap-2`}
          >
            <button type="button" onClick={onStop} className="nav-pill nav-pill--accent" style={{ color: "var(--color-green-900)" }}>Stop</button>
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
        <div className="mt-1 text-center text-[11px] text-neutral-600">Install/enable the Nudge extension to enforce blocks and run the timer in the background.</div>
      )}

      {/* Desktop instructions modal for enabling blocking */}
      {showEnablePrompt && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEnablePrompt(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl mx-auto">
            {/* Main Modal Card using Nudge retro-console style */}
            <div 
              className="retro-console rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative"
              style={{
                background: "var(--surface)",
                border: "2px solid var(--color-green-900)",
                boxShadow: "0 4px 20px rgba(3, 89, 77, 0.25)"
              }}
            >
              {/* Close Button - Top Right */}
              <button
                onClick={() => setShowEnablePrompt(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors z-10"
                style={{ color: 'var(--text-default)' }}
                aria-label="Close blocking setup"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 6-12 12"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
              
              {/* Header */}
              <div className="mb-6 pr-12">
                <div className="flex items-center gap-2 mb-3">
                  <div className="nav-pill nav-pill--cyan text-xs font-bold uppercase tracking-wider">
                    Setup
                  </div>
                  <div className="nav-pill nav-pill--outline text-xs">
                    Browser Extension
                  </div>
                </div>
                
                <h3 
                  className="text-xl md:text-2xl font-tanker text-mbti-primary mb-2 leading-tight"
                  style={{ color: "var(--color-green-900)" }}
                >
                  Enable Blocking in Your Browser
                </h3>
                
                <p className="text-mbti-secondary text-sm opacity-75">
                  Install the extension to start distraction-blocking focus sessions
                </p>
              </div>

              {/* Content */}
              <div className="mb-6">
                <div 
                  className="component-surface rounded-2xl p-6"
                  style={{ backgroundColor: 'rgba(249, 248, 244, 0.8)' }}
                >
                  <h4 className="font-semibold text-base mb-4" style={{ color: "var(--color-green-900)" }}>
                    📦 Developer Installation (Recommended)
                  </h4>
                  <ol className="list-decimal ml-5 space-y-2 text-sm mb-4" style={{ color: "var(--text-default)" }}>
                    <li>Open <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">chrome://extensions</code> (or your browser's extensions page)</li>
                    <li>Turn on <strong className="font-semibold">Developer mode</strong> (toggle in top right)</li>
                    <li>Click <strong className="font-semibold">Load unpacked</strong> and select the <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">extension/</code> folder from this project</li>
                    <li>Refresh this page - the focus controls will appear when detected ✨</li>
                  </ol>
                  
                  <div className="mt-4 p-4 rounded-xl" style={{ background: "var(--color-cyan-200)", border: "2px solid var(--color-cyan-500)" }}>
                    <p className="text-xs font-medium" style={{ color: "var(--color-green-900)" }}>
                      💡 <strong>Pro Tip:</strong> Once installed, you'll see focus session controls right here in the footer bar!
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Methods */}
              <div className="mb-6">
                <h4 className="font-semibold text-base mb-4" style={{ color: "var(--color-green-900)" }}>
                  🌐 Alternative: Browser-only Blocking
                </h4>
                <p className="text-sm mb-4 opacity-75">Subscribe via your ad blocker for browser-only blocking (less powerful but easier):</p>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <a 
                    className={`nav-pill nav-pill--primary flex items-center gap-2 ${extensionInstallHref ? "" : "opacity-60 pointer-events-none"}`} 
                    href={extensionInstallHref || undefined} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={() => setShowEnablePrompt(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.29 7 12 12 20.71 7"/>
                      <line x1="12" y1="22" x2="12" y2="12"/>
                    </svg>
                    Install from Store
                  </a>
                  <a 
                    className={`nav-pill nav-pill--cyan ${abpSubscribeHref ? "" : "opacity-60 pointer-events-none"}`} 
                    href={abpSubscribeHref || undefined} 
                    onClick={() => setShowEnablePrompt(false)}
                  >
                    Add to uBlock/ABP
                  </a>
                  <a 
                    className={`nav-pill nav-pill--accent ${adguardSubscribeHref ? "" : "opacity-60 pointer-events-none"}`} 
                    href={adguardSubscribeHref || undefined} 
                    onClick={() => setShowEnablePrompt(false)}
                  >
                    Add to AdGuard
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: "rgba(3, 89, 77, 0.1)" }}>
                <div className="text-xs text-neutral-500">
                  Need help? Check out our setup guide for more details.
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="nav-pill nav-pill--outline"
                    onClick={() => setShowEnablePrompt(false)}
                  >
                    Maybe Later
                  </button>
                  <button 
                    className="nav-pill nav-pill--primary"
                    onClick={() => setShowEnablePrompt(false)}
                  >
                    Got It!
                  </button>
                </div>
              </div>

              {/* Decorative DNA Elements */}
              <div className="flex justify-center items-center mt-6 w-full opacity-60" aria-hidden="true">
                <div className="flex items-center justify-center w-full gap-3 px-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: 'var(--color-green-900)',
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>, document.body)
      }
    </div>
  );
}
