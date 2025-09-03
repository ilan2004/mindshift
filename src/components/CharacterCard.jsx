"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import FocusRing from "@/components/FocusRing";
import { getAssetPath } from "@/lib/assets";
import {
  getUserId,
  postHistory,
  getGeneralQuestions,
  postAnswers,
} from "@/lib/backend";

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

// Messaging keys (align with FooterFocusBar and extension)
const MSG_REQUEST = "mindshift:focus";
const MSG_RESPONSE = "mindshift:focus:status";

export default function CharacterCard({ personalityType, title = null, size = 0 }) {
  // Allow dynamic personality using localStorage as fallback source
  const [storedType, setStoredType] = useState(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem("mindshift_personality_type");
      if (v) setStoredType(v);
      else {
        // Auto-open test for new users with no stored type
        setShowTest(true);
      }
    } catch {}
  }, []);

  const type = normalizeType(personalityType) || normalizeType(storedType) || null;

  // Session status for ring progress
  const [status, setStatus] = useState({ active: false, mode: "idle", remainingMs: 0 });
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
        const stored = Number(localStorage.getItem("mindshift_session_total_ms")) || 0;
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
        setPoints(Number(localStorage.getItem("mindshift_points")) || 0);
        setStreak(Number(localStorage.getItem("mindshift_streak")) || 0);
      } catch {}
    };
    read();
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === "mindshift_points" || e.key === "mindshift_streak") read();
    };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("mindshift:counters:update", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mindshift:counters:update", onCustom);
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
      const n = localStorage.getItem("ms_display_name") || "";
      const g = localStorage.getItem("ms_gender") || "";
      if (n) setDisplayName(n);
      if (!n || !g) setShowNameModal(true);
    } catch {
      setShowNameModal(true);
    }
  }, []);
  const heading = displayName || title || "Player";
  const [gender, setGender] = useState(() => {
    try { return localStorage.getItem("ms_gender") || ""; } catch { return ""; }
  });

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
      localStorage.removeItem("mindshift_personality_type");
      localStorage.removeItem("mindshift_points");
      localStorage.removeItem("mindshift_streak");
      localStorage.removeItem("mindshift_session_total_ms");
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
        localStorage.setItem("mindshift_personality_type", mbti);
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
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Counters above title (Points / Streak) */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="nav-pill nav-pill--neutral" title="Total Points">Points: {points}</span>
        <span className="nav-pill nav-pill--green flex items-center gap-1.5" title="Daily Streak">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-amber-500"
            aria-hidden
          >
            <path d="M12.001 2c.65 2.93-.61 4.89-2.02 6.33C8.49 9.85 7.5 11 8 12.75c.35 1.2 1.45 2.16 2.75 2.23 1.77.1 2.91-1.04 3.4-2.23.76-1.81.15-3.61-.54-4.74.83.52 1.67 1.22 2.36 2.2 1.07 1.52 1.62 3.67.87 5.73-1.03 2.84-3.86 4.56-6.84 4.56-3.72 0-7-2.67-7-6.5 0-3.5 2.4-5.6 4.22-7.22C9.44 5.49 10.61 4.48 12.001 2z" />
          </svg>
          <span>Streak: {streak}</span>
        </span>
        <span className="nav-pill nav-pill--cyan" title="Level based on points">Level {levelInfo.level}</span>
      </div>
      {/* Level progress bar */}
      <div className="w-full max-w-md px-4 -mt-1">
        <div className="text-[11px] text-neutral-600 mb-1 text-center">
          {levelInfo.nextThreshold > 0 ? `${points - levelInfo.prevThreshold} / ${levelInfo.nextThreshold - levelInfo.prevThreshold} to next level` : `Max level`}
        </div>
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${levelInfo.progressPct}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <h1 className="font-tanker text-5xl leading-none text-center">{heading}</h1>
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
            <button
              className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowTest(true)}
            >
              Take Test
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {/* Static image per MBTI+gender. Video intro can be added per-asset later. */}
            <div className="absolute inset-0">
              <Image
                src={getAssetPath(type, gender || "M")}
                alt={type}
                fill
                priority
                className={`w-full h-full object-contain object-bottom select-none`}
              />
            </div>
          </div>
        )}
      </div>
      {type ? <div className="text-sm text-neutral-600">{type}</div> : null}
      {(() => {
        const info = PERSONALITY_INFO[type] || {
          description: "Focused mode tailored to your style.",
          tips: [
            "Pick a preset and write a one-line goal.",
            "Silence notifications until the timer completes.",
          ],
        };
        return (
          <div className="w-full max-w-md px-4">
            <div
              className="rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-3 shadow-sm"
              style={{ boxShadow: "0 4px 0 var(--color-green-900-20)" }}
            >
              <p className="text-sm text-neutral-800 text-center">{info.description}</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {info.tips.slice(0, 2).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                    <span
                      className="mt-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ background: "var(--color-green-900)" }}
                      aria-hidden
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => {
                    setShowTest(true);
                    setMode(null);
                    setQuestions([]);
                    setAnswers({});
                    setError("");
                  }}
                >
                  {type ? "Retake Test" : "Take Test"}
                </button>
                {type && (
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                    onClick={resetProfile}
                  >
                    Reset Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {showTest && (
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
