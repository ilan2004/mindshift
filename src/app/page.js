"use client";

import CharacterCard from "@/components/CharacterCard";
import QuestBoard from "@/components/QuestBoard";
import ProductivityGraph from "@/components/ProductivityGraph";
import FocusSummaryModal from "@/components/FocusSummaryModal";
import Badges from "@/components/Badges";
import NudgeBox from "@/components/NudgeBox";
import PeerStatusPanel from "@/components/PeerStatusPanel";
import CommunityChallenges from "@/components/CommunityChallenges";
import LeaderboardSection from "@/components/LeaderboardSection";
import PersonalityProfile from "@/components/PersonalityProfile";
import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildBento, styleFor } from "./buildBento";

function readMBTI() {
  try { return (localStorage.getItem("mindshift_personality_type") || "").toUpperCase(); } catch { return ""; }
}

function mbtiToCluster(mbti) {
  const t = (mbti || "").toUpperCase();
  if (["ENFJ","ESFJ","ESTJ"].includes(t)) return "achievers";
  if (["INTJ","INTP","ENTJ"].includes(t)) return "analysts";
  if (["ENFP","ESFP","ESTP"].includes(t)) return "explorers";
  if (["INFJ","INFP","ISFJ"].includes(t)) return "diplomats";
  return "achievers"; // sensible default
}

function clusterTone(cluster) {
  return cluster === "achievers" ? "social"
    : cluster === "analysts" ? "logic"
    : cluster === "explorers" ? "fun"
    : "meaningful"; // diplomats
}

export default function Home() {
  const [mbti, setMbti] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [hasActive, setHasActive] = useState(false);
  const [quizGate, setQuizGate] = useState({ open: false, url: "", items: [] });
  const [breakConfirm, setBreakConfirm] = useState(false);

  useEffect(() => { 
    const currentMbti = readMBTI();
    if (currentMbti && !localStorage.getItem("mindshift_profile_seen")) {
      setShowProfile(true);
    }
    setMbti(currentMbti); 
  }, []);

  // Local session helpers
  function dayKey(d=new Date()) {
    try { return d.toLocaleDateString("en-CA"); } catch { return new Date().toISOString().slice(0,10); }
  }
  function readSessions() {
    try { const raw = localStorage.getItem("mindshift_focus_sessions"); const arr = raw? JSON.parse(raw) : []; return Array.isArray(arr)? arr : []; } catch { return []; }
  }
  function writeSessions(list) {
    try { localStorage.setItem("mindshift_focus_sessions", JSON.stringify(list)); } catch {}
  }
  function logRecent(evt) {
    try {
      const raw = localStorage.getItem("mindshift_recent_events");
      const arr = raw ? JSON.parse(raw) : [];
      const entry = { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, ts: Date.now(), ...evt };
      const next = [entry, ...arr].slice(0, 10);
      localStorage.setItem("mindshift_recent_events", JSON.stringify(next));
    } catch {}
  }
  function computeTodayMinutes() {
    const sessions = readSessions();
    const k = dayKey();
    let total = 0; const now = Date.now();
    for (const s of sessions) {
      const sd = new Date(s.started_at||s.startedAt||0);
      if (dayKey(sd) !== k) continue;
      const end = s.ends_at || s.endsAt || now;
      const start = s.started_at || s.startedAt || now;
      if (end && start) total += Math.max(0, Math.round((Math.min(end, now) - start)/60000));
    }
    return total;
  }
  function readStreak() { try { return Number(localStorage.getItem("mindshift_streak"))||0; } catch { return 0; } }
  function getActive() {
    const sessions = readSessions();
    const now = Date.now();
    return sessions.find(s => (s.status||"active") === "active" && (s.ends_at||s.endsAt||0) > now);
  }
  function refreshToday() {
    setTodayMinutes(computeTodayMinutes());
    setStreakDays(readStreak());
    setHasActive(!!getActive());
  }

  // Listen for template start events and create a local active session
  useEffect(() => {
    const onStart = (e) => {
      const detail = (e && e.detail) || {};
      const duration = Number(detail.duration)||25;
      const started = Date.now();
      const ends = started + duration*60*1000;
      const sess = {
        id: crypto?.randomUUID?.() || `${started}-${Math.random().toString(36).slice(2)}`,
        type: detail.template || "custom",
        duration_minutes: duration,
        status: "active",
        started_at: started,
        ends_at: ends,
        attachment_url: (detail.url||"")
      };
      const list = readSessions();
      list.unshift(sess);
      writeSessions(list);
      logRecent({ kind: "session_start", title: `Started ${sess.type}`, meta: `${duration}m` });
      try { window.dispatchEvent(new Event("mindshift:session:started")); } catch {}
      refreshToday();
    };
    const onComplete = () => { logRecent({ kind: "session_done", title: "Session completed", meta: dayKey() }); refreshToday(); };
    const onBadge = () => { logRecent({ kind: "badge", title: "Badge unlocked", meta: "Congrats" }); };
    const onQuiz = (e) => {
      const url = (e && e.detail && e.detail.url) || "";
      const items = makeQuizStub(url);
      setQuizGate({ open: true, url, items });
    };
    const onBreakReq = () => setBreakConfirm(true);
    window.addEventListener("mindshift:focus:start_template", onStart);
    window.addEventListener("mindshift:session:started", refreshToday);
    window.addEventListener("mindshift:session:completed", onComplete);
    window.addEventListener("mindshift:badges:update", onBadge);
    window.addEventListener("mindshift:blocker:quiz", onQuiz);
    window.addEventListener("mindshift:focus:break_request", onBreakReq);
    refreshToday();
    return () => {
      window.removeEventListener("mindshift:focus:start_template", onStart);
      window.removeEventListener("mindshift:session:started", refreshToday);
      window.removeEventListener("mindshift:session:completed", onComplete);
      window.removeEventListener("mindshift:badges:update", onBadge);
      window.removeEventListener("mindshift:blocker:quiz", onQuiz);
      window.removeEventListener("mindshift:focus:break_request", onBreakReq);
    };
  }, []);

  const handleProfileDone = () => {
    setShowProfile(false);
    localStorage.setItem("mindshift_profile_seen", "true");
  };

  const cluster = useMemo(() => mbtiToCluster(mbti), [mbti]);
  const tone = useMemo(() => clusterTone(cluster), [cluster]);

  // Decide which components appear in hero side columns and which go to More For You
  const heroLeft = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return (
          <div className="w-full max-w-md">
            <ProductivityGraph />
          </div>
        );
      case "explorers":
        return (
          <div className="w-full max-w-md">
            <QuestBoard />
          </div>
        );
      case "diplomats":
        return (
          <div className="w-full max-w-md">
            <PeerStatusPanel />
          </div>
        );
      case "achievers":
      default:
        return (
          <div className="w-full max-w-md">
            <LeaderboardSection />
          </div>
        );
    }
  }, [cluster]);

  const heroRight = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return (
          <div className="w-full max-w-sm">
            <LeaderboardSection />
          </div>
        );
      case "explorers":
        return (
          <div className="w-full max-w-sm">
            <CommunityChallenges />
          </div>
        );
      case "diplomats":
        return (
          <div className="w-full max-w-sm">
            <CommunityChallenges />
          </div>
        );
      case "achievers":
      default:
        return (
          <div className="w-full max-w-sm">
            <PeerStatusPanel />
          </div>
        );
    }
  }, [cluster]);

  // Determine which lower sections to hide because they already appear in hero
  const used = useMemo(() => {
    const set = new Set(["character", "nudge"]);
    if (cluster === "analysts") { set.add("ProductivityGraph"); set.add("LeaderboardSection"); }
    if (cluster === "explorers") { set.add("QuestBoard"); set.add("CommunityChallenges"); }
    if (cluster === "diplomats") { set.add("PeerStatusPanel"); set.add("CommunityChallenges"); }
    if (cluster === "achievers") { set.add("LeaderboardSection"); set.add("PeerStatusPanel"); }
    return set;
  }, [cluster]);

  // Low-priority components per cluster to show in collapsed area
  const moreItems = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return ["QuestBoard", "Badges"];
      case "explorers":
        return ["ProductivityGraph"]; // heavy stats hidden here
      case "diplomats":
        return ["LeaderboardSection", "ProductivityGraph"];
      case "achievers":
      default:
        return ["QuestBoard", "Badges", "ProductivityGraph"]; // graphs/deep stats
    }
  }, [cluster]);

  const [moreOpen, setMoreOpen] = useState(false);

  // In-view animations for section wrappers
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal-on-scroll").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });
    // Refresh to catch dynamic "More for you" content
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [moreOpen]);

  const bentoItems = useMemo(() => {
    const exclude = Array.from(used).filter((id) => id !== "character" && id !== "nudge");
    return buildBento(cluster, tone, exclude, 8);
  }, [cluster, tone, used]);

  return (
    <>
    {showProfile && <PersonalityProfile cluster={cluster} onDone={handleProfileDone} />}
    <section className="min-h-[70vh] flex flex-col items-center justify-start">
      <div className="w-full px-4 md:px-6 flex flex-col items-center gap-8">
        {/* Hero: 3-column with side components flanking Character (center fixed) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-28 items-start">
          {/* Left side */}
          <div className="order-2 md:order-1 flex justify-center md:justify-start mt-12 md:mt-16 lg:mt-20 px-6 lg:px-8 md:-ml-4 lg:-ml-8 reveal-on-scroll">
            {heroLeft}
          </div>
          {/* Center: Character always centered + Nudge with tone */}
          <div className="order-1 md:order-2 flex flex-col items-center gap-3 reveal-on-scroll">
            <CharacterCard />
          </div>
          {/* Right side */}
          <div className="order-3 md:order-3 flex justify-center md:justify-end mt-12 md:mt-16 lg:mt-20 px-6 lg:px-8 reveal-on-scroll">
            {heroRight}
          </div>
        </div>

        {/* Today strip */}
        <div className="w-full max-w-6xl reveal-on-scroll">
          <div className="rounded-xl p-3 md:p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-neutral-800">Today</div>
              <div className="nav-pill">{todayMinutes}m focused</div>
              <div className="nav-pill">Streak {streakDays}d</div>
              {hasActive && <div className="nav-pill nav-pill--cyan">Active session</div>}
            </div>
            <div>
              <button
                className="nav-pill nav-pill--primary"
                onClick={() => {
                  try {
                    const detail = { template: "work_sprint", duration: 25 };
                    window.dispatchEvent(new CustomEvent("mindshift:focus:start_template", { detail }));
                  } catch {}
                }}
              >
                {hasActive ? "Continue" : "Start focus"}
              </button>
            </div>
          </div>
        </div>

        {/* Templates (quick start) */}
        <div className="w-full max-w-6xl reveal-on-scroll">
          <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-tanker tracking-widest text-green text-2xl" style={{ lineHeight: 1 }}>Quick Start Templates</h2>
              <div className="text-xs text-neutral-600">Pick a mode to jump in</div>
            </div>
            <TemplatesGrid />
          </div>
        </div>

        {/* Recent feed */}
        <div className="w-full max-w-6xl reveal-on-scroll">
          <RecentFeed />
        </div>

        {/* Lower sections: hide duplicates shown in hero */}
        <div className="w-full reveal-on-scroll">
          <div className="bento-grid">
            {bentoItems.map((item) => (
              <div key={item.id} className="bento-card" style={styleFor(item)}>
                {item.el}
              </div>
            ))}
          </div>
        </div>

        {/* More for you (collapsed) */}
        {moreItems.length > 0 && (
          <div className="w-full max-w-6xl">
            <button
              type="button"
              className="nav-pill nav-pill--neutral"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
            >
              {moreOpen ? "Hide" : "More for you"}
            </button>
            {moreOpen && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {moreItems.includes("ProductivityGraph") && (
                  <div className="w-full reveal-on-scroll">
                    <ProductivityGraph />
                  </div>
                )}
                {moreItems.includes("LeaderboardSection") && (
                  <div className="w-full reveal-on-scroll">
                    <LeaderboardSection />
                  </div>
                )}
                {moreItems.includes("QuestBoard") && (
                  <div className="w-full reveal-on-scroll">
                    <QuestBoard />
                  </div>
                )}
                {moreItems.includes("Badges") && (
                  <div className="w-full reveal-on-scroll">
                    <Badges />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <FocusSummaryModal />
      {/* Modals */}
      {quizGate.open && <QuizGateModal items={quizGate.items} url={quizGate.url} onClose={()=>setQuizGate({ open:false, url:"", items:[] })} />}
      {breakConfirm && <BreakConfirmModal cluster={cluster} onClose={()=>setBreakConfirm(false)} />}
    </section>
    <style jsx global>{`
      .bento-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 0.5rem; grid-auto-flow: dense; }
      .bento-card { grid-column: span var(--c-base, 12); grid-row: span var(--r-base, 1); padding: 0; border: 0; background: transparent; box-shadow: none; margin: 0; }
      .bento-card > * { margin-top: 0; margin-bottom: 0; }
      .bento-card:hover { transform: none; box-shadow: none; }
      @media (min-width: 768px) {
        .bento-card { grid-column: span var(--c-md, var(--c-base, 12)); grid-row: span var(--r-md, var(--r-base, 1)); }
      }
      /* Masonry-style on large screens to eliminate vertical gaps */
      @media (min-width: 1024px) {
        .bento-grid { display: block; column-count: 2; column-gap: 1rem; }
        .bento-card { display: inline-block; width: 100%; break-inside: avoid; margin: 0 0 0.75rem; }
      }
    `}</style>
  </>
  );
}

function TemplatesGrid() {
  const [readingUrl, setReadingUrl] = useState("");

  const startTemplate = (template, extra = {}) => {
    try {
      const payload = { template, ...extra, startedAt: Date.now() };
      localStorage.setItem("mindshift_last_template", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("mindshift:focus:start_template", { detail: payload }));
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Work Sprint */}
      <div className="rounded-xl p-3" style={{ background: "var(--color-mint-500)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
        <div className="text-sm font-semibold text-neutral-800">Work Sprint</div>
        <div className="text-xs text-neutral-700">25 min deep focus · 5 min recovery</div>
        <div className="mt-2">
          <button className="nav-pill" onClick={() => startTemplate("work_sprint", { duration: 25, break: 5 })}>Start 25m</button>
        </div>
      </div>

      {/* Deep Reading */}
      <div className="rounded-xl p-3" style={{ background: "var(--color-lilac-300)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
        <div className="text-sm font-semibold text-neutral-800">Deep Reading</div>
        <div className="text-xs text-neutral-700">45 min immersive reading · optional source</div>
        <div className="mt-2">
          <input
            value={readingUrl}
            onChange={(e) => setReadingUrl(e.target.value)}
            placeholder="Paste YouTube or PDF URL (optional)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs bg-white"
          />
        </div>
        <div className="mt-2">
          <button className="nav-pill" onClick={() => startTemplate("deep_reading", { duration: 45, url: readingUrl.trim() })}>Start 45m</button>
        </div>
      </div>

      {/* Gym */}
      <div className="rounded-xl p-3" style={{ background: "var(--color-mint-500)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
        <div className="text-sm font-semibold text-neutral-800">Gym</div>
        <div className="text-xs text-neutral-700">60 min training block</div>
        <div className="mt-2">
          <button className="nav-pill" onClick={() => startTemplate("gym", { duration: 60 })}>Start 60m</button>
        </div>
      </div>
    </div>
  );
}

function RecentFeed() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const read = () => {
      try { const raw = localStorage.getItem("mindshift_recent_events"); const arr = raw? JSON.parse(raw): []; setItems(Array.isArray(arr)? arr.slice(0,3): []); } catch { setItems([]); }
    };
    read();
    const onAny = () => read();
    window.addEventListener("mindshift:session:started", onAny);
    window.addEventListener("mindshift:session:completed", onAny);
    window.addEventListener("mindshift:badges:update", onAny);
    return () => {
      window.removeEventListener("mindshift:session:started", onAny);
      window.removeEventListener("mindshift:session:completed", onAny);
      window.removeEventListener("mindshift:badges:update", onAny);
    };
  }, []);
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-800">Recent Activity</div>
        <div className="text-xs text-neutral-500">Last 3</div>
      </div>
      <ul className="text-sm text-neutral-800">
        {items.slice(0,3).map(it => (
          <li key={it.id} className="flex items-center justify-between py-1">
            <span className="truncate mr-3">{it.title}</span>
            <span className="text-xs text-neutral-600">{new Date(it.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function makeQuizStub(url) {
  // Very simple placeholder MCQs; backend can replace with real questions later
  return [
    { q: "What is your goal right now?", choices: ["Deep work", "Browsing", "Gaming"], a: 0 },
    { q: "How long is your current session?", choices: ["25m", "5h", "All day"], a: 0 },
  ];
}

function QuizGateModal({ items, url, onClose }) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const cur = items[idx];
  const safeHost = (() => { try { return url ? new URL(url).host : "the site"; } catch { return "the site"; } })();
  const answer = (i) => {
    const ok = i === cur.a;
    const nextIdx = idx + 1;
    setCorrect(ok ? correct + 1 : correct);
    if (nextIdx >= items.length) {
      // pass if at least 1 correct
      const passed = (ok? correct + 1 : correct) >= 1;
      if (passed) {
        try { window.dispatchEvent(new CustomEvent("mindshift:blocker:allow_temp", { detail: { url, minutes: 2 } })); } catch {}
      }
      onClose();
    } else {
      setIdx(nextIdx);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl max-w-md w-full p-4" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 4px 0 var(--color-green-900)" }}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-tanker text-2xl tracking-widest text-green" style={{ lineHeight: 1 }}>Quick Focus Check</h3>
          <button className="nav-pill" onClick={onClose}>Close</button>
        </div>
        <div className="text-sm text-neutral-800">{cur.q}</div>
        <div className="mt-3 flex flex-col gap-2">
          {cur.choices.map((c,i) => (
            <button key={i} className="nav-pill" onClick={()=>answer(i)}>{c}</button>
          ))}
        </div>
        <div className="mt-3 text-xs text-neutral-600">Answer 1 question right to unlock {safeHost} for 2 minutes.</div>
      </div>
    </div>
  );
}

function BreakConfirmModal({ cluster, onClose }) {
  const copy = cluster === "analysts" ? "Don’t break the chain—give it 2 more minutes."
    : cluster === "achievers" ? "Team-you would push through—quick win before the break?"
    : cluster === "explorers" ? "Explore your limit—finish this minute for a surprise perk."
    : "Future you will thank you—one more minute, then we pause together.";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl max-w-md w-full p-4" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 4px 0 var(--color-green-900)" }}>
        <h3 className="font-tanker text-2xl tracking-widest text-green" style={{ lineHeight: 1 }}>Take a break?</h3>
        <div className="mt-2 text-sm text-neutral-800">{copy}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="nav-pill" onClick={()=>{ try { window.dispatchEvent(new CustomEvent("mindshift:focus:microbreak", { detail: { seconds: 90 } })); } catch {}; onClose(); }}>Take 90s micro-break</button>
          <button className="nav-pill" onClick={()=>{ try { window.dispatchEvent(new CustomEvent("mindshift:blocker:quiz", { detail: {} })); } catch {}; onClose(); }}>Answer 1 question</button>
          <button className="nav-pill nav-pill--red" onClick={()=>{ try { window.dispatchEvent(new Event("mindshift:focus:break_confirmed")); } catch {}; onClose(); }}>Break anyway</button>
        </div>
        <div className="mt-3 flex justify-end">
          <button className="nav-pill" onClick={onClose}>Keep focusing</button>
        </div>
      </div>
    </div>
  );
}
