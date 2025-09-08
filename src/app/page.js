"use client";

import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Original components
import CharacterCard from "@/components/CharacterCard";
import QuestBoard from "@/components/QuestBoard";
import ProductivityGraph from "@/components/ProductivityGraph";
import FocusSummaryModal from "@/components/FocusSummaryModal";
import Badges from "@/components/Badges";
import PeerStatusPanel from "@/components/PeerStatusPanel";
import CommunityChallenges from "@/components/CommunityChallenges";
import LeaderboardSection from "@/components/LeaderboardSection";
import PersonalityProfile from "@/components/PersonalityProfile";
import { buildBento, styleFor } from "./buildBento";

// Phase 1 personality intelligence components - to be integrated
import { PersonalityProgressOverview } from "@/components/PersonalityProgress";
import CustomSessionScheduler from "@/components/CustomSessionScheduler";
import SmartTemplateGrid from "@/components/SmartTemplateGrid";
import { getCharacterDialogue } from "@/lib/characterDialogue";

// MBTI Theme System
import mbtiThemes, { 
  initializeThemeSystem, 
  getCurrentPersonalityTheme, 
  themeUtils 
} from "@/lib/mbtiThemes";

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
  const [quizGate, setQuizGate] = useState({ open: false, url: "", items: [], loading: false, metadata: null, error: null });
  const [breakConfirm, setBreakConfirm] = useState(false);
  const [theme, setTheme] = useState(null);

  // Initialize theme system
  useEffect(() => {
    initializeThemeSystem();
    setTheme(getCurrentPersonalityTheme());
  }, []);

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
      
      console.log('🚀 Session started:', sess);
      
      // Log the session start
      logRecent({ kind: "session_start", title: `Started ${sess.type}`, meta: `${duration}m` });
      
      // Show user feedback
      if (sess.attachment_url) {
        logRecent({ 
          kind: "content_attached", 
          title: `Content-gated session active`, 
          meta: `${duration}m with quiz protection` 
        });
        console.log('🔒 Content-gated session with URL:', sess.attachment_url);
      }
      
      try { window.dispatchEvent(new Event("mindshift:session:started")); } catch {}
      refreshToday();
    };
    const onComplete = () => { logRecent({ kind: "session_done", title: "Session completed", meta: dayKey() }); refreshToday(); };
    const onBadge = () => { logRecent({ kind: "badge", title: "Badge unlocked", meta: "Congrats" }); };
    const onQuiz = async (e) => {
      const url = (e && e.detail && e.detail.url) || "";
      
      // Show loading state
      setQuizGate({ open: true, url, items: [], loading: true });
      
      if (url.trim()) {
        try {
          const quizResult = await generateContentQuiz(url);
          setQuizGate({ 
            open: true, 
            url, 
            items: quizResult.questions,
            loading: false,
            metadata: quizResult.metadata,
            error: quizResult.success ? null : quizResult.error
          });
        } catch (error) {
          setQuizGate({ 
            open: true, 
            url, 
            items: makeQuizStub(url),
            loading: false,
            error: 'Failed to generate content-based quiz'
          });
        }
      } else {
        // No URL provided, use generic questions
        setQuizGate({ open: true, url, items: makeQuizStub(url), loading: false });
      }
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

  // Toggle theme mode function for navbar
  const toggleThemeMode = () => {
    themeUtils.toggleTheme();
    setTheme(getCurrentPersonalityTheme());
  };

  // Handle template selection and start
  const handleStartFocus = (template) => {
    try {
      const payload = { 
        template: template.id, 
        duration: template.duration,
        startedAt: Date.now() 
      };
      localStorage.setItem("mindshift_last_template", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("mindshift:focus:start_template", { detail: payload }));
    } catch {}
  };
  
  // Test content quiz functionality
  const testContentQuiz = (url) => {
    try {
      window.dispatchEvent(new CustomEvent("mindshift:blocker:quiz", { detail: { url } }));
    } catch {}
  };

  // Decide which components appear in hero side columns and which go to More For You
  const heroLeft = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return (
          <div className="w-full max-w-md">
            <ProductivityGraph personalityType={mbti} />
          </div>
        );
      case "explorers":
        return (
          <div className="w-full max-w-md">
            <QuestBoard personalityType={mbti} />
          </div>
        );
      case "diplomats":
        return (
          <div className="w-full max-w-md">
            <PeerStatusPanel personalityType={mbti} />
          </div>
        );
      case "achievers":
      default:
        return (
          <div className="w-full max-w-md">
            <LeaderboardSection personalityType={mbti} />
          </div>
        );
    }
  }, [cluster]);

  const heroRight = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return (
          <div className="w-full max-w-sm">
            <LeaderboardSection personalityType={mbti} />
          </div>
        );
      case "explorers":
        return (
          <div className="w-full max-w-sm">
            <CommunityChallenges personalityType={mbti} />
          </div>
        );
      case "diplomats":
        return (
          <div className="w-full max-w-sm">
            <CommunityChallenges personalityType={mbti} />
          </div>
        );
      case "achievers":
      default:
        return (
          <div className="w-full max-w-sm">
            <PeerStatusPanel personalityType={mbti} />
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

  // Apply personality-based semantic color overrides via CSS custom properties
  useEffect(() => {
    if (!mbti) {
      // Reset to default theme
      document.documentElement.style.setProperty('--bg-default', 'var(--color-mint-500)');
      document.documentElement.style.setProperty('--accent', 'var(--color-pink-500)');
      document.documentElement.style.setProperty('--muted', 'var(--color-teal-300)');
      return;
    }
    
    // Personality-specific theme using your existing color palette
    const personalityThemes = {
      INTJ: { bg: '--color-purple-400', accent: '--color-purple-400', muted: '--color-purple-400' },
      INTP: { bg: '--color-cyan-200', accent: '--color-cyan-200', muted: '--color-cyan-200' },
      ENTJ: { bg: '--color-orange-500', accent: '--color-orange-500', muted: '--color-orange-500' },
      ENTP: { bg: '--color-pink-500', accent: '--color-pink-500', muted: '--color-pink-500' },
      INFJ: { bg: '--color-blue-400', accent: '--color-blue-400', muted: '--color-blue-400' },
      INFP: { bg: '--color-pink-200', accent: '--color-pink-200', muted: '--color-pink-200' },
      ENFJ: { bg: '--color-teal-300', accent: '--color-teal-300', muted: '--color-teal-300' },
      ENFP: { bg: '--color-amber-400', accent: '--color-amber-400', muted: '--color-amber-400' },
      ISTJ: { bg: '--color-blue-400', accent: '--color-blue-400', muted: '--color-blue-400' },
      ISFJ: { bg: '--color-pink-200', accent: '--color-pink-200', muted: '--color-pink-200' },
      ESTJ: { bg: '--color-orange-500', accent: '--color-orange-500', muted: '--color-orange-500' },
      ESFJ: { bg: '--color-pink-500', accent: '--color-pink-500', muted: '--color-pink-500' },
      ISTP: { bg: '--color-teal-300', accent: '--color-teal-300', muted: '--color-teal-300' },
      ISFP: { bg: '--color-lilac-300', accent: '--color-lilac-300', muted: '--color-lilac-300' },
      ESTP: { bg: '--color-amber-400', accent: '--color-amber-400', muted: '--color-amber-400' },
      ESFP: { bg: '--color-yellow-200', accent: '--color-yellow-200', muted: '--color-yellow-200' }
    };
    
    const theme = personalityThemes[mbti.toUpperCase()];
    if (theme) {
      document.documentElement.style.setProperty('--bg-default', `var(${theme.bg})`);
      document.documentElement.style.setProperty('--accent', `var(${theme.accent})`);
      document.documentElement.style.setProperty('--muted', `var(${theme.muted})`);
    }
  }, [mbti]);

  return (
    <>
    {showProfile && <PersonalityProfile cluster={cluster} onDone={handleProfileDone} />}
    <section className="min-h-screen bg-mint">
      <div className="w-full px-4 md:px-6 py-6 flex flex-col items-center gap-8">
        
        {/* HERO: 3-Column Layout with CharacterCard Centerpiece */}
        <div className="w-full max-w-8xl grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          
          {/* Left Panel - Personality-specific component */}
          <div className="w-full flex justify-center md:justify-end mt-16">
            {heroLeft}
          </div>
          
          {/* Center: CharacterCard (The Star) */}
          <div className="w-full flex justify-center">
            <div className="reveal-on-scroll">
              <CharacterCard personalityType={mbti} />
            </div>
          </div>
          
          {/* Right Panel - Personality-specific component */}
          <div className="w-full flex justify-center md:justify-start mt-16">
            {heroRight}
          </div>
          
        </div>
        
        {/* Today strip */}
          <div className="w-full max-w-4xl reveal-on-scroll">
          <div className="text-center mb-3">
            <div className="font-tanker text-2xl text-green tracking-widest">TODAY</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-700">
            <span className="nav-pill">{todayMinutes}m focused</span>
            <span className="nav-pill">{streakDays} day streak</span>
            {hasActive && <span className="nav-pill nav-pill--primary">Session Active</span>}
          </div>
          {/* Subtle personality progress overview */}
          <div className="mt-4 rounded-xl" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <div className="p-3">
              <PersonalityProgressOverview personalityType={mbti} compact />
            </div>
          </div>
        </div>
        
        {/* Templates Grid - Enhanced with Smart Personality-Aware Templates */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <div 
            className="rounded-xl p-4"
            style={{
              background: "var(--surface)",
              border: "2px solid var(--color-green-900)",
              boxShadow: "0 2px 0 var(--color-green-900)"
            }}
          >
            <div className="text-center mb-4">
              <div className="font-tanker text-xl text-green tracking-widest">TEMPLATES</div>
            </div>
            <SmartTemplateGrid 
              onTemplateSelect={handleStartFocus}
              personalityType={mbti}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
              cardStyle="rounded-xl p-3"
              usePersonalityColors
            />
          </div>
        </div>
        
        {/* Custom Session Scheduler */}
        <CustomSessionScheduler personalityType={mbti} />
        
        {/* Recent Activity */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <RecentFeed />
        </div>
        
        {/* More For You - Collapsible lower-priority components */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <div className="text-center mb-4">
            <button 
              className="font-tanker text-xl text-green tracking-widest hover:text-green/80 transition-colors"
              onClick={() => setMoreOpen(!moreOpen)}
            >
              MORE FOR YOU {moreOpen ? '▲' : '▼'}
            </button>
          </div>
          {moreOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-on-scroll">
              {moreItems.includes("ProductivityGraph") && !used.has("ProductivityGraph") && (
                <div className="card">
                  <ProductivityGraph personalityType={mbti} />
                </div>
              )}
              {moreItems.includes("QuestBoard") && !used.has("QuestBoard") && (
                <div className="card">
                  <QuestBoard personalityType={mbti} />
                </div>
              )}
              {moreItems.includes("LeaderboardSection") && !used.has("LeaderboardSection") && (
                <div className="card">
                  <LeaderboardSection personalityType={mbti} />
                </div>
              )}
              {moreItems.includes("Badges") && (
                <div className="card">
                  <Badges />
                </div>
              )}
              {!used.has("CommunityChallenges") && (
                <div className="card">
                  <CommunityChallenges personalityType={mbti} />
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
      
      {/* Modals */}
      <FocusSummaryModal />
      {quizGate.open && <QuizGateModal 
        items={quizGate.items} 
        url={quizGate.url} 
        loading={quizGate.loading}
        metadata={quizGate.metadata}
        error={quizGate.error}
        onClose={()=>setQuizGate({ open:false, url:"", items:[], loading:false, metadata:null, error:null })} 
      />}
      {breakConfirm && <BreakConfirmModal cluster={cluster} onClose={()=>setBreakConfirm(false)} />}
    </section>
    </>
  );
}

function TemplatesGrid() {
  const [readingUrl, setReadingUrl] = useState("");
  const [urlStatus, setUrlStatus] = useState({ valid: null, type: null });

  const validateUrl = (url) => {
    if (!url.trim()) {
      setUrlStatus({ valid: null, type: null });
      return;
    }
    
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
    const isPDF = /\.pdf$/i.test(url) || /pdf/i.test(url);
    
    if (isYouTube || isPDF) {
      setUrlStatus({ valid: true, type: isYouTube ? 'youtube' : 'pdf' });
    } else {
      setUrlStatus({ valid: false, type: null });
    }
  };
  
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setReadingUrl(newUrl);
    validateUrl(newUrl);
  };

  const startTemplate = (template, extra = {}) => {
    try {
      const payload = { template, ...extra, startedAt: Date.now() };
      localStorage.setItem("mindshift_last_template", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("mindshift:focus:start_template", { detail: payload }));
    } catch {}
  };
  
  const testContentQuiz = (url) => {
    try {
      window.dispatchEvent(new CustomEvent("mindshift:blocker:quiz", { detail: { url } }));
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
          <div className="relative">
            <input
              value={readingUrl}
              onChange={handleUrlChange}
              placeholder="Paste YouTube or PDF URL (optional)"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs bg-white pr-10"
              style={{
                borderColor: urlStatus.valid === false ? 'var(--color-pink-500)' : 
                           urlStatus.valid === true ? 'var(--color-green-900)' : 'var(--color-neutral-300)'
              }}
            />
            {urlStatus.valid === true && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600">
                {urlStatus.type === 'youtube' ? '📺' : '📄'}
              </div>
            )}
            {urlStatus.valid === false && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">⚠️</div>
            )}
          </div>
          {urlStatus.valid === false && (
            <div className="text-xs text-red-600 mt-1">Please provide a valid YouTube or PDF URL</div>
          )}
          {urlStatus.valid === true && (
            <div className="text-xs text-green-700 mt-1">
              ✓ {urlStatus.type === 'youtube' ? 'YouTube video' : 'PDF document'} detected - Quiz questions will be generated from content
            </div>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <button className="nav-pill flex-1" onClick={() => startTemplate("deep_reading", { duration: 45, url: readingUrl.trim() })}>Start 45m</button>
          {readingUrl.trim() && (
            <button 
              className="nav-pill" 
              style={{ background: 'var(--color-blue-400)', color: 'var(--color-green-900)' }}
              onClick={() => testContentQuiz(readingUrl.trim())}
              title="Preview content-based quiz questions"
            >
              🧠 Quiz
            </button>
          )}
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

async function generateContentQuiz(url) {
  console.log('🔍 Starting content quiz generation for:', url);
  
  try {
    const { ContentParser } = await import('@/lib/contentParser');
    console.log('📚 Content parser loaded, analyzing content...');
    
    const result = await ContentParser.generateQuiz(url, { count: 3 });
    console.log('✅ Quiz generation result:', result);
    
    if (result.success) {
      console.log('🎯 Successfully generated', result.questions.length, 'questions from content');
      return {
        questions: result.questions,
        metadata: result.metadata,
        success: true
      };
    } else {
      console.log('⚠️ Content parsing failed, using fallback questions:', result.error);
      return {
        questions: result.questions, // Fallback questions
        error: result.error,
        success: false
      };
    }
  } catch (error) {
    console.error('❌ Error in generateContentQuiz:', error);
    return {
      questions: [
        { q: "What is your primary focus goal?", choices: ["Deep learning", "Quick browsing", "Entertainment", "Multitasking"], a: 0 },
        { q: "How committed are you to this session?", choices: ["Fully focused", "Partially focused", "Just checking", "Distracted"], a: 0 }
      ],
      error: error.message,
      success: false
    };
  }
}

function makeQuizStub(url) {
  // Fallback questions for immediate use
  return [
    { q: "What is your goal right now?", choices: ["Deep work", "Browsing", "Gaming"], a: 0 },
    { q: "How long is your current session?", choices: ["25m", "5h", "All day"], a: 0 },
  ];
}

function QuizGateModal({ items, url, loading, metadata, error, onClose }) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const cur = items && items.length > 0 ? items[idx] : null;
  const safeHost = (() => { try { return url ? new URL(url).host : "the site"; } catch { return "the site"; } })();
  
  const answer = (i) => {
    if (!cur) return;
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
          <h3 className="font-tanker text-2xl tracking-widest text-green" style={{ lineHeight: 1 }}>
            Content Focus Gate
          </h3>
          <button className="nav-pill" onClick={onClose}>Close</button>
        </div>
        
        {/* Content metadata display */}
        {metadata && (
          <div className="mb-3 p-2 rounded-lg" style={{ background: "var(--color-green-900-20)" }}>
            <div className="text-xs text-neutral-600 mb-1">
              {metadata.type === 'youtube' ? '📺 YouTube Video' : '📄 PDF Document'}
            </div>
            <div className="text-sm font-medium text-neutral-800 truncate">
              {metadata.title}
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-green-900 border-t-transparent rounded-full mx-auto mb-3"></div>
              <div className="text-sm text-neutral-600">Analyzing content...</div>
              <div className="text-xs text-neutral-500 mt-1">Generating personalized questions</div>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && !loading && (
          <div className="mb-3 p-3 rounded-lg" style={{ background: "var(--color-orange-500-20)", border: "1px solid var(--color-orange-500-40)" }}>
            <div className="text-sm text-orange-800 font-medium mb-1">⚠️ Content Analysis Failed</div>
            <div className="text-xs text-orange-700">{error}</div>
            <div className="text-xs text-orange-600 mt-1">Using generic focus questions instead.</div>
          </div>
        )}
        
        {/* Quiz content */}
        {!loading && cur && (
          <>
            <div className="text-sm text-neutral-800 mb-1">
              Question {idx + 1} of {items.length}
            </div>
            <div className="text-sm font-medium text-neutral-900 mb-3">{cur.q}</div>
            <div className="flex flex-col gap-2">
              {cur.choices.map((c,i) => (
                <button 
                  key={i} 
                  className="nav-pill text-left" 
                  onClick={()=>answer(i)}
                  style={{ textAlign: 'left', whiteSpace: 'normal', padding: '8px 12px' }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-neutral-600">
              {metadata ? 
                `Answer correctly to unlock ${safeHost} for 2 minutes during your Deep Reading session.` :
                `Answer 1 question right to unlock ${safeHost} for 2 minutes.`
              }
            </div>
            
            {/* Progress indicator */}
            <div className="mt-2 flex gap-1">
              {items.map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 flex-1 rounded"
                  style={{ 
                    background: i <= idx ? 'var(--color-green-900)' : 'var(--color-green-900-20)' 
                  }}
                />
              ))}
            </div>
          </>
        )}
        
        {!loading && !cur && (
          <div className="text-center py-4">
            <div className="text-sm text-neutral-600">No questions available</div>
          </div>
        )}
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
