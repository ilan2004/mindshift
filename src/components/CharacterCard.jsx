"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import FocusRing from "@/components/FocusRing";

// Map personality codes to asset filenames in /public
const PERSONALITY_ASSETS = {
  ENFJ: "/ENFJ.png",
  // Add more as assets are added:
  // INFP: "/INFP.png",
  // INTJ: "/INTJ.png",
};

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

export default function CharacterCard({ personalityType, title = "ben", size = 0 }) {
  // Allow dynamic personality using localStorage as fallback source
  const [storedType, setStoredType] = useState(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem("mindshift_personality_type");
      if (v) setStoredType(v);
    } catch {}
  }, []);

  const type = normalizeType(personalityType) || normalizeType(storedType) || "ENFJ";

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

  const src = useMemo(() => {
    const key = normalizeType(type);
    if (key && PERSONALITY_ASSETS[key]) return PERSONALITY_ASSETS[key];
    // Fallback to ENFJ if specific asset is missing
    return PERSONALITY_ASSETS.ENFJ;
  }, [type]);

  // Responsive card size: if size prop not provided, compute from viewport (min 260, max 512)
  const [autoSize, setAutoSize] = useState(384);
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

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {title ? (
        <h1 className="font-tanker text-5xl leading-none text-center">{title}</h1>
      ) : null}
      <div className="relative" style={{ width: cardSize, height: cardSize }}>
        {/* Focus Ring behind character */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center" aria-hidden>
          <FocusRing
            size={cardSize + 32}
            stroke={Math.round(Math.max(8, Math.min(16, cardSize * 0.03)))}
            value={progress}
            mode={status.mode}
          />
        </div>
        <Image
          src={src}
          alt={type}
          width={cardSize}
          height={cardSize}
          priority
          className="object-contain max-w-full h-auto select-none"
        />
      </div>
      <div className="text-sm text-neutral-600">{type}</div>
      {(() => {
        const info = PERSONALITY_INFO[type] || {
          description: "Focused mode tailored to your style.",
          tips: [
            "Pick a preset and write a one-line goal.",
            "Silence notifications until the timer completes.",
          ],
        };
        return (
          <div className="text-center max-w-md px-4">
            <p className="text-sm text-neutral-700">{info.description}</p>
            <ul className="mt-1 space-y-1">
              {info.tips.slice(0, 2).map((t, i) => (
                <li key={i} className="text-xs text-neutral-600">• {t}</li>
              ))}
            </ul>
          </div>
        );
      })()}
    </div>
  );
}
