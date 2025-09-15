"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import FocusRing from "@/components/FocusRing";
import { getAssetPath, getVideoPath } from "@/lib/assets";
import {
  getUserId,
  postHistory,
  getGeneralQuestions,
  postAnswers,
} from "@/lib/backend";
import { getCharacterDialogue } from "@/lib/characterDialogue";
import HelpBulb from "./HelpBulb";

// Asset path resolver imported from src/lib/assets

// Lightweight descriptions and tips per personality
const PERSONALITY_INFO = {
  ENFJ: {
    description: "Warm organizer; thrives when goals help others.",
    tips: [
      "Start with a clear why for each session.",
      "Batch notifications; protect collaboration time windows.",
    ],
  },
  // Examples for future personalities
  INFP: {
    description: "Reflective idealist; motivated by meaning.",
    tips: [
      "Write a one-line intent before starting the timer.",
      "Use soft ambient sounds; avoid context switching.",
    ],
  },
  INTJ: {
    description: "Strategic planner; prefers deep, uninterrupted work.",
    tips: [
      "Block 45–60m focus blocks; review plan between blocks.",
      "Keep a quick capture list to reduce mental load.",
    ],
  },
};

function normalizeType(type) {
  if (!type) return null;
  return String(type).trim().toUpperCase();
}

// Enhanced personality-specific colors and styling
function getPersonalityColor(type) {
  const colors = {
    INTJ: 'var(--color-purple-400)',
    INTP: 'var(--color-cyan-200)', 
    ENTJ: 'var(--color-orange-500)',
    ENTP: 'var(--color-pink-500)',
    INFJ: 'var(--color-blue-400)',
    INFP: 'var(--color-pink-200)',
    ENFJ: 'var(--color-teal-300)',
    ENFP: 'var(--color-amber-400)',
    ISTJ: 'var(--color-blue-400)',
    ISFJ: 'var(--color-pink-200)',
    ESTJ: 'var(--color-orange-500)',
    ESFJ: 'var(--color-pink-500)',
    ISTP: 'var(--color-teal-300)',
    ISFP: 'var(--color-lilac-300)',
    ESTP: 'var(--color-amber-400)',
    ESFP: 'var(--color-yellow-200)'
  };
  return colors[type.toUpperCase()] || 'var(--color-green-900)';
}

// Get personality group and description for enhanced display
function getPersonalityInfo(type) {
  const groups = {
    // Analysts (NT)
    INTJ: { group: 'Analyst', name: 'Architect', color: 'var(--color-purple-400)' },
    INTP: { group: 'Analyst', name: 'Thinker', color: 'var(--color-cyan-200)' },
    ENTJ: { group: 'Analyst', name: 'Commander', color: 'var(--color-orange-500)' },
    ENTP: { group: 'Analyst', name: 'Debater', color: 'var(--color-pink-500)' },
    
    // Diplomats (NF)
    INFJ: { group: 'Diplomat', name: 'Advocate', color: 'var(--color-blue-400)' },
    INFP: { group: 'Diplomat', name: 'Mediator', color: 'var(--color-pink-200)' },
    ENFJ: { group: 'Diplomat', name: 'Protagonist', color: 'var(--color-teal-300)' },
    ENFP: { group: 'Diplomat', name: 'Campaigner', color: 'var(--color-amber-400)' },
    
    // Sentinels (SJ)
    ISTJ: { group: 'Sentinel', name: 'Logistician', color: 'var(--color-blue-400)' },
    ISFJ: { group: 'Sentinel', name: 'Protector', color: 'var(--color-pink-200)' },
    ESTJ: { group: 'Sentinel', name: 'Executive', color: 'var(--color-orange-500)' },
    ESFJ: { group: 'Sentinel', name: 'Consul', color: 'var(--color-pink-500)' },
    
    // Explorers (SP)
    ISTP: { group: 'Explorer', name: 'Virtuoso', color: 'var(--color-teal-300)' },
    ISFP: { group: 'Explorer', name: 'Adventurer', color: 'var(--color-lilac-300)' },
    ESTP: { group: 'Explorer', name: 'Entrepreneur', color: 'var(--color-amber-400)' },
    ESFP: { group: 'Explorer', name: 'Entertainer', color: 'var(--color-yellow-200)' }
  };
  return groups[type?.toUpperCase()] || { group: 'Unknown', name: 'Type', color: 'var(--color-green-900)' };
}

// Messaging keys (align with FooterFocusBar and extension)
const MSG_REQUEST = "nudge:focus";
const MSG_RESPONSE = "nudge:focus:status";

// PersonalityBadge Component - Enhanced personality type display
function PersonalityBadge({ type, gender }) {
  const personalityInfo = getPersonalityInfo(type);
  const primaryColor = getPersonalityColor(type);
  
  // Create a contrasting text color based on the background
  const isDarkBackground = ['var(--color-green-900)', 'var(--color-purple-400)', 'var(--color-blue-400)'].includes(primaryColor);
  const textColor = isDarkBackground ? 'white' : 'var(--color-green-900)';
  
  // Helper to create color with opacity (works with CSS variables)
  const colorWithOpacity = (color, opacity) => {
    // For CSS variables, we'll use a fallback approach
    if (color.startsWith('var(')) {
      return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
    }
    return color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
  };
  
  return (
    <div className="mt-6">
      <div className="retro-console rounded-2xl px-6 py-3 transition-all duration-200 hover:transform hover:translateY(-1px)">
        <div className="flex items-center justify-center gap-4">
          {/* Main MBTI Badge - using nav-pill style */}
          <div 
            className="nav-pill font-tanker text-lg font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
            style={{ 
              backgroundColor: primaryColor,
              color: textColor,
              borderColor: 'var(--color-green-900)',
              boxShadow: `0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)`,
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = `0 5px 0 var(--color-green-900), 0 10px 28px var(--color-green-900-20)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = `0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)`;
            }}
          >
            {type}
          </div>
          
          {/* Personality Group on same line */}
          <div className="component-surface rounded-xl px-4 py-2 text-sm font-medium uppercase tracking-wider">
            {personalityInfo.group}
          </div>
          
          {/* Decorative DNA-style elements */}
          <div className="flex items-center gap-1 opacity-70" aria-hidden="true">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="dna-node transition-all duration-300"
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: 'var(--color-green-900)',
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CharacterCard({ personalityType, title = null, size = 0 }) {
  // Allow dynamic personality using localStorage as fallback source
  const [storedType, setStoredType] = useState(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem("Nudge_personality_type");
      if (v) setStoredType(v);
      // Do NOT auto-open any internal test modal; intro flow handles this now
    } catch {}
  }, []);

  const type = normalizeType(personalityType) || normalizeType(storedType) || null;

  // Character variant (M/W) should be available before any effects use it
  const [gender, setGender] = useState(() => {
    try { return localStorage.getItem("ms_gender") || ""; } catch { return ""; }
  });

  // Session status for ring progress
  const [status, setStatus] = useState({ active: false, mode: "idle", remainingMs: 0 });
  
  // Personality dialogue system  
  const [dialogue, setDialogue] = useState({ greeting: "", motivation: "" });
  useEffect(() => {
    if (!type) return;
    try {
      const streak = Number(localStorage.getItem("Nudge_streak")) || 0;
      const totalMinutes = Number(localStorage.getItem("Nudge_total_focus_time")) || 0;
      const achievements = JSON.parse(localStorage.getItem("Nudge_achievements") || "[]");
      
      const dialogue = getCharacterDialogue(type, {
        streak,
        totalMinutes,
        achievements,
        hasActiveSession: status.active
      });
      
      setDialogue(dialogue);
    } catch {
      // Fallback to basic dialogue
      const dialogue = getCharacterDialogue(type, {});
      setDialogue(dialogue);
    }
  }, [type, status.active]); // Re-run when session status changes
  const totalMsRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMessage = (evt) => {
      const data = evt?.data;
      if (!data || data.type !== MSG_RESPONSE) return;
      const { active, mode, remainingMs, lastDurationMin } = data.payload || {};
      setStatus({ active: !!active, mode: mode || (active ? "focus" : "idle"), remainingMs: remainingMs || 0 });
      // Keep total from localStorage if present; fall back to max observed remainingMs
      try {
        const stored = Number(localStorage.getItem("Nudge_session_total_ms")) || 0;
        if (stored > 0) {
          totalMsRef.current = stored;
        } else if (remainingMs) {
          // Prefer explicit duration from extension if provided
          if (Number(lastDurationMin) > 0) {
            totalMsRef.current = Number(lastDurationMin) * 60 * 1000;
          }
          // If this is an emergency-pass break (we trigger 5m), assume 5m total when none stored
          if ((mode === "break") && !totalMsRef.current) {
            totalMsRef.current = 5 * 60 * 1000;
          }
          totalMsRef.current = Math.max(totalMsRef.current || 0, remainingMs);
        }
      } catch {
        if (remainingMs) totalMsRef.current = Math.max(totalMsRef.current || 0, remainingMs);
      }
    };
    window.addEventListener("message", onMessage);
    // Request initial status
    window.postMessage({ type: MSG_REQUEST, action: "getStatus", payload: {} }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Initial Video (MP4) -> PNG crossfade control
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Character animation video overlay
  const videoRef = useRef(null);
  const [showAnim, setShowAnim] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoNonce, setVideoNonce] = useState(0); // force reload

  // Play on initial mount when character is known
  useEffect(() => {
    if (!type) return;
    const src = getVideoPath(type, gender || "M");
    setVideoSrc(src);
    setShowAnim(true);
    setVideoNonce((n) => n + 1);
    const safety = setTimeout(() => setShowAnim(false), 6000);
    return () => clearTimeout(safety);
  }, [type, gender]);

  // Detect timer completion and replay animation
  const prevStatusRef = useRef({ active: false, remainingMs: 0 });
  useEffect(() => {
    const prev = prevStatusRef.current;
    const now = status;
    const completed = (prev.active && !now.active) || (prev.remainingMs > 0 && (now.remainingMs || 0) === 0 && prev.active);
    if (completed && type) {
      const src = getVideoPath(type, gender || "M");
      setVideoSrc(src);
      setShowAnim(true);
      setVideoNonce((n) => n + 1);
      const safety = setTimeout(() => setShowAnim(false), 6000);
      // Cleanup timer on next change
      return () => clearTimeout(safety);
    }
    prevStatusRef.current = { active: !!now.active, remainingMs: Number(now.remainingMs || 0) };
  }, [status, type, gender]);

  // Responsive card size: if size prop not provided, compute from viewport (min 260, max 512)
  const [autoSize, setAutoSize] = useState(() => {
    if (typeof window !== "undefined") {
      const vw = Math.min(window.innerWidth || 0, document.documentElement?.clientWidth || 0) || window.innerWidth || 0;
      return Math.max(260, Math.min(512, Math.floor(vw * 0.7)));
    }
    return 384; // SSR fallback
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const calc = () => {
      const vw = Math.min(window.innerWidth || 0, document.documentElement?.clientWidth || 0) || window.innerWidth || 0;
      const target = Math.max(260, Math.min(512, Math.floor(vw * 0.7)));
      setAutoSize(target);
    };
    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("orientationchange", calc);
    };
  }, []);

  const cardSize = size && size > 0 ? size : autoSize;

  // Compute progress (0..1). If we don't know total, derive from the max seen remainingMs.
  const totalMs = totalMsRef.current || (status.remainingMs > 0 ? status.remainingMs : 0);
  const progress = useMemo(() => {
    if (!status.active || !totalMs) return 0;
    const elapsed = Math.max(0, totalMs - (status.remainingMs || 0));
    return Math.max(0, Math.min(1, elapsed / totalMs));
  }, [status.active, status.remainingMs, totalMs]);

  // Counters (Points / Streak) displayed above the title; values managed by QuestBoard or other components
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        setPoints(Number(localStorage.getItem("Nudge_points")) || 0);
        setStreak(Number(localStorage.getItem("Nudge_streak")) || 0);
      } catch {}
    };
    read();
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === "Nudge_points" || e.key === "Nudge_streak") read();
    };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("Nudge:counters:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("Nudge:counters:update", onCustom);
    };
  }, []);

  // Levels system (after points is declared)
  const LEVELS = useMemo(() => [0, 100, 250, 500, 800, 1200, 1700, 2300], []); // cumulative thresholds
  const levelInfo = useMemo(() => {
    let level = 1;
    for (let i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i]) level = i + 1; else break;
    }
    const currentIdx = Math.max(0, level - 1);
    const prevThreshold = LEVELS[currentIdx - 1] ?? 0;
    const nextThreshold = LEVELS[currentIdx] ?? 0; // when past array, 0 => maxed
    let progressPct = 100;
    if (nextThreshold > prevThreshold) {
      progressPct = Math.round(((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
      progressPct = Math.max(0, Math.min(100, progressPct));
    }
    return { level, prevThreshold, nextThreshold, progressPct };
  }, [points, LEVELS]);

  // ---------- Lightweight Sign-in (Display Name) ----------
  const [displayName, setDisplayName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  useEffect(() => {
    try {
      const introDone = localStorage.getItem("ms_intro_complete") === "1";
      const n = localStorage.getItem("ms_display_name") || "";
      const g = localStorage.getItem("ms_gender") || "";
      if (n) setDisplayName(n);
      if (!introDone) {
        // Suppress internal name modal while new intro flow is in charge
        setShowNameModal(false);
        return;
      }
      if (!n || !g) setShowNameModal(true);
    } catch {
      // Only show if intro is done
      try {
        const introDone = localStorage.getItem("ms_intro_complete") === "1";
        setShowNameModal(!!introDone);
      } catch {}
    }
  }, []);
  const heading = displayName || title || "Player";

  // Sync profile to the extension (MV3) so blocked page can personalize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mbti = type || "";
    const genderSafe = (gender || "").toUpperCase();
    const name = displayName || "";
    // Only send when we have at least MBTI
    if (!mbti) return;
    try {
      window.postMessage({
        type: MSG_REQUEST,
        action: "setProfile",
        payload: { mbti, gender: genderSafe, name }
      }, "*");
    } catch {}
  }, [type, gender, displayName]);

  // ---------- Test Modal State ----------
  const [showTest, setShowTest] = useState(false);
  const [mode, setMode] = useState(null); // "history" | "general"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // {question: 1..5}
  const userId = useMemo(() => getUserId(), []);

  const SCALE = [
    { v: 1, label: "Strongly Disagree" },
    { v: 2, label: "Disagree" },
    { v: 3, label: "Neutral" },
    { v: 4, label: "Agree" },
    { v: 5, label: "Strongly Agree" },
  ];

  // --------- Helpers: Parse Chat History Exports ---------
  function flattenChatGPTExport(input) {
    // Accepts either a single conversation object or an array of conversations
    const convos = Array.isArray(input) ? input : [input];
    const out = [];
    for (const convo of convos) {
      const mapping = convo && convo.mapping;
      if (!mapping || typeof mapping !== "object") continue;
      for (const k of Object.keys(mapping)) {
        const node = mapping[k];
        const msg = node && node.message;
        if (!msg) continue;
        const role = msg?.author?.role || "user";
        let content = "";
        const c = msg?.content;
        if (c && c.content_type === "text" && Array.isArray(c.parts)) {
          content = c.parts.join("\n");
        } else if (typeof c === "string") {
          content = c;
        }
        if (content && typeof content === "string") {
          out.push({ role, content });
        }
      }
    }
    return out;
  }

  async function handleUploadHistory(file) {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file");
      }
      // Accept either array of messages, ChatGPT export (with mapping), or simple fields
      let history = [];
      if (Array.isArray(parsed)) {
        // If looks like ChatGPT export (array of conversations with mapping), flatten it
        if (parsed.length && parsed[0] && parsed[0].mapping) {
          history = flattenChatGPTExport(parsed);
        } else {
          history = parsed;
        }
      } else if (parsed && parsed.mapping) {
        history = flattenChatGPTExport(parsed);
      } else {
        history = parsed?.messages || parsed?.conversations || parsed?.history || parsed || [];
      }
      const res = await postHistory({ user_id: userId, history });
      setQuestions(res.questions || []);
      setMode("history");
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function resetProfile() {
    // Clear MBTI and progress; keep name/gender
    try {
      localStorage.removeItem("Nudge_personality_type");
      localStorage.removeItem("Nudge_points");
      localStorage.removeItem("Nudge_streak");
      localStorage.removeItem("Nudge_session_total_ms");
    } catch {}
    setStoredType(null);
    setPoints(0);
    setStreak(0);
    // Reset test state and prompt to retake
    setMode(null);
    setQuestions([]);
    setAnswers({});
    setError("");
    setShowTest(true);
  }

  async function fetchGeneral() {
    setError("");
    setLoading(true);
    try {
      const res = await getGeneralQuestions(userId);
      setQuestions(res.questions || []);
      setMode("general");
    } catch (e) {
      setError(e?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswers() {
    setError("");
    setLoading(true);
    try {
      // Build backend-friendly answers: include question text in value to preserve keywords
      const payload = {};
      for (const q of questions) {
        const val = answers[q];
        const label = SCALE.find((s) => s.v === Number(val))?.label || String(val || "");
        payload[q] = `${q} — ${label}`;
      }
      const res = await postAnswers({ user_id: userId, answers: payload });
      const mbti = (res?.profile || "").toUpperCase();
      try {
        localStorage.setItem("Nudge_personality_type", mbti);
        setStoredType(mbti);
      } catch {}
      setShowTest(false);
    } catch (e) {
      setError(e?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-4" data-tutorial="personality-card">
      <div className="flex items-center gap-2">
        <h1 className="font-tanker text-5xl leading-none text-center" style={{ color: 'var(--mbti-text-primary)' }}>{heading}</h1>
        <button
          className="text-xs px-2 py-1 rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
          onClick={() => setShowNameModal(true)}
          title="Change name"
        >
          Edit
        </button>
      </div>
      <div className="relative" style={{ width: cardSize, height: cardSize }}>
        {/* Focus Ring behind character (not masked) */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center" aria-hidden>
          <FocusRing
            size={cardSize + 32}
            stroke={Math.round(Math.max(8, Math.min(16, cardSize * 0.03)))}
            value={progress}
            mode={status.mode}
          />
        </div>
        {/* If no type yet, show CTA placeholder instead of character media */}
        {!type ? (
          <div className="absolute inset-0 rounded-full border border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center text-center p-6">
            <div className="text-sm text-neutral-700 mb-2">Take the short test to unlock your character</div>
            {/* Internal test disabled; intro flow will handle */}
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {/* Base static image per MBTI+gender */}
            <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              showAnim && videoSrc ? 'opacity-0' : 'opacity-100'
            }`}>
              <Image
                src={getAssetPath(type, gender || "M")}
                alt={type}
                fill
                priority
                className={`w-full h-full object-contain object-bottom select-none`}
              />
            </div>
            
            {/* Video overlay for character animation */}
            {videoSrc && (
              <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                showAnim ? 'opacity-100' : 'opacity-0'
              }`}>
                <video
                  key={videoNonce}
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain object-bottom"
                  autoPlay={showAnim}
                  muted
                  playsInline
                  onEnded={() => {
                    // Delay hiding to allow smooth transition
                    setTimeout(() => setShowAnim(false), 200);
                  }}
                  onError={() => setShowAnim(false)}
                  onLoadedMetadata={() => {
                    if (showAnim) {
                      try { videoRef.current && videoRef.current.play && videoRef.current.play(); } catch {}
                    }
                  }}
                />
              </div>
            )}
            
            {/* Subtle video indicator for character cards with animations */}
            {videoSrc && (
              <div className="absolute bottom-2 right-2">
                <div className={`transition-opacity duration-300 ${
                  showAnim ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {type ? (
        <div className="text-center space-y-3">
          {/* Enhanced Personality Badge */}
          <PersonalityBadge type={type} gender={gender} />
          
          {/* Personality Dialogue */}
          {dialogue.greeting && (
            <div className="max-w-xs mx-auto px-3 py-2 rounded-lg bg-white/90 text-green text-sm font-medium text-center backdrop-blur-sm border border-green/20">
              {dialogue.greeting}
            </div>
          )}
          {dialogue.motivation && (
            <div className="max-w-xs mx-auto px-3 py-2 rounded-lg bg-green/90 text-white text-sm font-medium text-center backdrop-blur-sm">
              {dialogue.motivation}
            </div>
          )}
        </div>
      ) : null}
          
      {/* Internal test modal disabled by new intro flow */}
      {false && showTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowTest(false)} />
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Personality Test</h2>
              <button className="text-neutral-500 hover:text-neutral-700" onClick={() => setShowTest(false)}>✕</button>
            </div>

            {/* Mode selection */}
            {!mode && (
              <div className="grid gap-3">
                <p className="text-sm text-neutral-700">Choose a mode:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    className="rounded-lg border p-3 text-left hover:border-emerald-400"
                    onClick={() => setMode("history")}
                  >
                    <div className="font-medium">History-based</div>
                    <div className="text-xs text-neutral-600">Upload ChatGPT export JSON. We’ll generate tailored questions.</div>
                  </button>
                  <button
                    className="rounded-lg border p-3 text-left hover:border-emerald-400"
                    onClick={fetchGeneral}
                  >
                    <div className="font-medium">General</div>
                    <div className="text-xs text-neutral-600">Use 15 curated MBTI Likert questions.</div>
                  </button>
                </div>
              </div>
            )}

            {/* History uploader */}
            {mode === "history" && questions.length === 0 && (
              <div className="mt-3 grid gap-2">
                <label className="text-sm text-neutral-700">Upload ChatGPT history JSON</label>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => handleUploadHistory(e.target.files?.[0])}
                />
                <div className="text-xs text-neutral-500">We parse messages client-side and send to the backend to generate questions.</div>
              </div>
            )}

            {/* Questions form */}
            {questions.length > 0 && (
              <div className="mt-3">
                <ol className="space-y-3 max-h-[50vh] overflow-auto pr-1">
                  {questions.map((q, idx) => (
                    <li key={idx} className="border rounded-md p-2">
                      <div className="text-sm font-medium mb-2">{idx + 1}. {q}</div>
                      <div className="flex flex-wrap gap-2">
                        {SCALE.map((s) => (
                          <label key={s.v} className="text-xs inline-flex items-center gap-1 border rounded-md px-2 py-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`q_${idx}`}
                              value={s.v}
                              checked={Number(answers[q]) === s.v}
                              onChange={() => setAnswers((prev) => ({ ...prev, [q]: s.v }))}
                            />
                            <span>{s.label}</span>
                          </label>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white disabled:opacity-50"
                    disabled={loading || Object.keys(answers).length !== questions.length}
                    onClick={submitAnswers}
                  >
                    {loading ? "Submitting..." : "Submit Answers"}
                  </button>
                  {error && <div className="text-xs text-red-600">{error}</div>}
                </div>
              </div>
            )}

            {loading && questions.length === 0 && (
              <div className="mt-3 text-sm text-neutral-600">Loading...</div>
            )}

            {error && questions.length === 0 && (
              <div className="mt-3 text-sm text-red-600">{error}</div>
            )}
          </div>
        </div>
      )}

      {/* Name & Gender Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowNameModal(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Welcome</h2>
              <button className="text-neutral-500 hover:text-neutral-700" onClick={() => setShowNameModal(false)}>✕</button>
            </div>
            <p className="text-sm text-neutral-700">Enter your name and select your character style.</p>
            <div className="mt-3 grid gap-2">
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
              <div className="flex items-center gap-3 text-sm mt-1">
                <span className="text-neutral-700">Character:</span>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={gender === "M"}
                    onChange={() => setGender("M")}
                  />
                  <span>Male</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="W"
                    checked={gender === "W"}
                    onChange={() => setGender("W")}
                  />
                  <span>Female</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border" onClick={() => setShowNameModal(false)}>Cancel</button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white disabled:opacity-50"
                  disabled={!displayName.trim() || !gender}
                  onClick={() => {
                    try {
                      localStorage.setItem("ms_display_name", displayName.trim());
                      localStorage.setItem("ms_gender", gender);
                    } catch {}
                    setShowNameModal(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
