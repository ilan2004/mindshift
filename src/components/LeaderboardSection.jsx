"use client";

import { useEffect, useMemo, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";

function readJSON(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function readNumber(key, def = 0) {
  try { return Number(localStorage.getItem(key)) || def; } catch { return def; }
}
function readString(key, def = "") {
  try { return localStorage.getItem(key) || def; } catch { return def; }
}

function mbtiToCluster(mbti) {
  const t = (mbti || "").toUpperCase();
  if (["ENFJ","ESFJ","ESTJ"].includes(t)) return "achievers";
  if (["INTJ","INTP","ENTJ"].includes(t)) return "analysts";
  if (["ENFP","ESFP","ESTP"].includes(t)) return "explorers";
  if (["INFJ","INFP","ISFJ"].includes(t)) return "diplomats";
  return "achievers";
}

function useStats() {
  const [stats, setStats] = useState({ points: 0, streak: 0, focusHours: 0 });
  useEffect(() => {
    const recalc = () => {
      const points = readNumber("mindshift_points", 0);
      const streak = readNumber("mindshift_streak", 0);
      const sessions = readJSON("mindshift_focus_sessions", []);
      const totalMinutes = Array.isArray(sessions) ? sessions.reduce((sum, s) => sum + (Number(s?.minutes) || 0), 0) : 0;
      const focusHours = +(totalMinutes / 60).toFixed(1);
      setStats({ points, streak, focusHours });
    };
    recalc();
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (["mindshift_points", "mindshift_streak", "mindshift_focus_sessions"].includes(e.key)) recalc();
    };
    const onCustom = () => recalc();
    window.addEventListener("storage", onStorage);
    window.addEventListener("mindshift:counters:update", onCustom);
    window.addEventListener("mindshift:session:completed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mindshift:counters:update", onCustom);
      window.removeEventListener("mindshift:session:completed", onCustom);
    };
  }, []);
  return stats;
}

export default function LeaderboardSection({ personalityType }) {
  const me = useStats();
  const [type, setType] = useState("points");
  const [visibleTabs, setVisibleTabs] = useState(["points", "streak"]);
  const [userPersonality, setUserPersonality] = useState("");

  // Decide which two tabs to show based on personality cluster
  useEffect(() => {
    const mbti = personalityType || readString("mindshift_personality_type", "");
    setUserPersonality(mbti);
    const cluster = mbtiToCluster(mbti);
    let tabs = ["points", "streak"]; // default
    switch (cluster) {
      case "analysts":
        tabs = ["focusHours", "streak"]; // emphasize deep work and consistency
        break;
      case "explorers":
        tabs = ["points", "screenTime"]; // playful points and mindful screen time
        break;
      case "diplomats":
        tabs = ["streak", "focusHours"]; // gentle nudges toward consistency and meaningful work time
        break;
      case "achievers":
      default:
        tabs = ["points", "streak"]; // competitive and consistency signals
        break;
    }
    setVisibleTabs(tabs);
    setType((prev) => tabs.includes(prev) ? prev : tabs[0]);
  }, [personalityType]);

  const rows = useMemo(() => {
    const self = { 
      id: "me", 
      name: "You", 
      avatar: getPersonalityAvatar(userPersonality), 
      points: me.points, 
      streak: me.streak, 
      focusHours: me.focusHours, 
      screenTime: 0,
      personality: userPersonality
    };
    
    // Generate personality-themed competitors
    const peers = generatePersonalityCompetitors(userPersonality, me);
    
    const all = [self, ...peers];
    // Sort by current leaderboard type
    const sortKey = type === 'points' ? 'points' : type === 'streak' ? 'streak' : type === 'focusHours' ? 'focusHours' : 'points';
    all.sort((a, b) => b[sortKey] - a[sortKey]);
    return all;
  }, [me.points, me.streak, me.focusHours, type, userPersonality]);

  return (
    <div
      className="rounded-xl p-3 md:p-4 w-full max-w-md mx-auto"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm md:text-base font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            {getPersonalityLeaderboardTitle(userPersonality)}
          </h3>
          {userPersonality && (
            <span 
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                background: getPersonalityAccentColor(userPersonality),
                color: 'var(--color-green-900)',
                border: '1px solid var(--color-green-900-20)'
              }}
            >
              {mbtiToCluster(userPersonality)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {visibleTabs.map((k) => {
            const opt = k === "points" ? { key: "points", label: "Points" }
              : k === "streak" ? { key: "streak", label: "Streak" }
              : k === "focusHours" ? { key: "focusHours", label: "Focus" }
              : { key: "screenTime", label: "Screen" };
            return (
              <button
                key={opt.key}
                className={`nav-pill text-xs px-2.5 py-1.5 flex-1 sm:flex-none min-w-0`}
                style={{
                  background: type === opt.key ? getPersonalityAccentColor(userPersonality) : 'var(--surface)',
                  color: 'var(--color-green-900)',
                  border: '2px solid var(--color-green-900)',
                  boxShadow: type === opt.key ? '0 2px 0 var(--color-green-900)' : 'none'
                }}
                onClick={() => setType(opt.key)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <LeaderboardTable rows={rows} type={type} personalityType={userPersonality} />
    </div>
  );
}

// Helper functions for personality theming
function getPersonalityLeaderboardTitle(personalityType) {
  if (!personalityType) return "Leaderboard";
  
  const titles = {
    // Analysts
    INTJ: "Strategic Rankings",
    INTP: "Knowledge Leaders", 
    ENTJ: "Achievement Board",
    ENTP: "Innovation Index",
    // Diplomats 
    INFJ: "Growth Champions",
    INFP: "Authentic Achievers",
    ENFJ: "Harmony Heroes",
    ENFP: "Inspiration Leaders",
    // Sentinels
    ISTJ: "Consistency Kings",
    ISFJ: "Dedication Board", 
    ESTJ: "Performance Panel",
    ESFJ: "Team Champions",
    // Explorers
    ISTP: "Skill Masters",
    ISFP: "Creative Champions",
    ESTP: "Action Heroes",
    ESFP: "Energy Leaders"
  };
  
  return titles[personalityType.toUpperCase()] || "Leaderboard";
}

function getPersonalityAccentColor(personalityType) {
  if (!personalityType) return 'var(--surface)';
  
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
  
  return colors[personalityType.toUpperCase()] || 'var(--surface)';
}

function getPersonalityAvatar(personalityType) {
  if (!personalityType) return '🧠';
  
  const avatars = {
    INTJ: '♔', INTP: '🔬', ENTJ: '🎯', ENTP: '💡',
    INFJ: '🌟', INFP: '🎨', ENFJ: '🌱', ENFP: '🎭',
    ISTJ: '📋', ISFJ: '🛡️', ESTJ: '📊', ESFJ: '🤝',
    ISTP: '🔧', ISFP: '🌸', ESTP: '⚡', ESFP: '🌈'
  };
  
  return avatars[personalityType.toUpperCase()] || '🧠';
}

function generatePersonalityCompetitors(userPersonality, userStats) {
  // Generate competitors with personalities that would be interesting to compete against
  const competitiveTypes = {
    // Analysts compete with other strategists
    'NT': ['INTJ', 'ENTJ', 'INTP', 'ENTP'],
    // Diplomats compete with growth-minded types  
    'NF': ['INFJ', 'ENFJ', 'INFP', 'ENFP'],
    // Sentinels compete with achievers
    'SJ': ['ISTJ', 'ESTJ', 'ISFJ', 'ESFJ'], 
    // Explorers compete with action-oriented types
    'SP': ['ISTP', 'ESTP', 'ISFP', 'ESFP']
  };
  
  const cluster = getPersonalityCluster(userPersonality);
  const types = competitiveTypes[cluster] || competitiveTypes['NT'];
  
  const names = ['Alex Chen', 'Sam Rivera', 'Jordan Kim', 'Taylor Morgan', 'Casey Parker'];
  const basePoints = userStats.points || 100;
  
  return names.slice(0, 4).map((name, i) => {
    const personalityType = types[i] || types[0];
    const variance = 0.3; // ±30% of user stats for competitive balance
    const pointsMultiplier = 0.7 + Math.random() * variance * 2;
    const streakMultiplier = 0.8 + Math.random() * 0.4;
    const focusMultiplier = 0.75 + Math.random() * 0.5;
    
    return {
      id: `comp_${i}`,
      name,
      avatar: getPersonalityAvatar(personalityType),
      personality: personalityType,
      points: Math.round(basePoints * pointsMultiplier),
      streak: Math.round((userStats.streak || 1) * streakMultiplier),
      focusHours: +((userStats.focusHours || 1) * focusMultiplier).toFixed(1),
      screenTime: 0
    };
  });
}

function getPersonalityCluster(personality) {
  if (!personality) return 'NT';
  const p = personality.toUpperCase();
  if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(p)) return 'NT';
  if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(p)) return 'NF';
  if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(p)) return 'SJ';
  if (['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(p)) return 'SP';
  return 'NT';
}

