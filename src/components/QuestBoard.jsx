"use client";

import { useEffect, useMemo, useState } from "react";

// MBTI-specific quest variations
const PERSONALITY_QUESTS = {
  // Analysts (NT) - Strategy and systems
  INTJ: [
    { id: "strategic_planning", title: "Map out your long-term goal strategy (10m)", points: 12 },
    { id: "optimize_system", title: "Identify and fix one inefficiency in your workflow", points: 10 },
    { id: "deep_learning", title: "Study a complex concept for 45m uninterrupted", points: 15 },
  ],
  INTP: [
    { id: "explore_concept", title: "Dive deep into a fascinating new idea for 30m", points: 12 },
    { id: "connect_patterns", title: "Find connections between 3 different concepts", points: 10 },
    { id: "analyze_problem", title: "Break down a complex problem into components", points: 8 },
  ],
  ENTJ: [
    { id: "lead_initiative", title: "Take charge of organizing one project task", points: 15 },
    { id: "efficiency_audit", title: "Streamline a process to save time tomorrow", points: 12 },
    { id: "goal_milestone", title: "Achieve a concrete milestone toward your goal", points: 10 },
  ],
  ENTP: [
    { id: "brainstorm_session", title: "Generate 10 creative solutions to a challenge", points: 10 },
    { id: "network_connect", title: "Have a meaningful conversation with someone new", points: 8 },
    { id: "prototype_idea", title: "Turn one idea into a quick prototype or draft", points: 12 },
  ],
  
  // Diplomats (NF) - People and potential
  INFJ: [
    { id: "vision_clarity", title: "Write about your long-term vision for 15m", points: 10 },
    { id: "meaningful_help", title: "Offer genuine help to someone who needs it", points: 12 },
    { id: "reflection_time", title: "Reflect on personal growth for 20m in solitude", points: 8 },
  ],
  INFP: [
    { id: "authentic_create", title: "Create something that expresses your true self", points: 15 },
    { id: "value_action", title: "Take one action aligned with your core values", points: 10 },
    { id: "inspire_moment", title: "Find and capture one moment of inspiration", points: 5 },
  ],
  ENFJ: [
    { id: "team_support", title: "Help a teammate overcome a challenge", points: 12 },
    { id: "group_harmony", title: "Facilitate positive energy in a group setting", points: 10 },
    { id: "mentor_someone", title: "Share knowledge to help someone grow", points: 15 },
  ],
  ENFP: [
    { id: "spark_enthusiasm", title: "Share excitement about an idea with others", points: 8 },
    { id: "explore_possibility", title: "Explore a new possibility for 25m", points: 10 },
    { id: "authentic_connect", title: "Have a deep, authentic conversation", points: 12 },
  ],
  
  // Sentinels (SJ) - Structure and reliability
  ISTJ: [
    { id: "organize_space", title: "Organize your workspace for maximum efficiency", points: 10 },
    { id: "complete_task", title: "Finish a task you've been putting off", points: 12 },
    { id: "plan_tomorrow", title: "Plan tomorrow's schedule in detail", points: 8 },
  ],
  ISFJ: [
    { id: "care_action", title: "Do something thoughtful for someone you care about", points: 12 },
    { id: "maintain_routine", title: "Stick to your healthy routine for the whole day", points: 10 },
    { id: "prepare_others", title: "Prepare something that will help others succeed", points: 15 },
  ],
  ESTJ: [
    { id: "lead_progress", title: "Drive progress on a team goal or project", points: 15 },
    { id: "optimize_process", title: "Make a process more efficient and organized", points: 12 },
    { id: "achieve_target", title: "Hit a specific, measurable target today", points: 10 },
  ],
  ESFJ: [
    { id: "support_harmony", title: "Foster positive relationships in your environment", points: 10 },
    { id: "organize_group", title: "Organize or coordinate something for others", points: 12 },
    { id: "celebrate_someone", title: "Recognize someone's efforts or achievements", points: 8 },
  ],
  
  // Explorers (SP) - Action and adaptability
  ISTP: [
    { id: "solve_practically", title: "Fix or improve something with your hands", points: 12 },
    { id: "master_skill", title: "Practice a technical skill for 30m", points: 10 },
    { id: "analyze_system", title: "Understand how something works by taking it apart", points: 8 },
  ],
  ISFP: [
    { id: "create_beauty", title: "Create or appreciate something beautiful", points: 10 },
    { id: "personal_expression", title: "Express yourself authentically in some way", points: 8 },
    { id: "nature_connect", title: "Spend 15m connecting with nature or beauty", points: 5 },
  ],
  ESTP: [
    { id: "take_action", title: "Jump into action on something you've been thinking about", points: 12 },
    { id: "social_energy", title: "Energize others through positive interaction", points: 10 },
    { id: "seize_opportunity", title: "Seize an opportunity that presents itself today", points: 15 },
  ],
  ESFP: [
    { id: "bring_joy", title: "Bring joy or laughter to someone's day", points: 10 },
    { id: "live_moment", title: "Fully experience and enjoy a beautiful moment", points: 8 },
    { id: "help_spontaneously", title: "Help someone in a spontaneous, heartfelt way", points: 12 },
  ],
};

// Universal quests that work for everyone
const UNIVERSAL_QUESTS = [
  { id: "daily_focus_25", title: "Complete one 25m focus block", points: 10 },
  { id: "no_social_hour", title: "Avoid social media for 1 hour", points: 8 },
  { id: "write_intent", title: "Write a one-line session intent", points: 5 },
];

function todayKey() {
  try {
    // Local-date in YYYY-MM-DD
    return new Date().toLocaleDateString("en-CA");
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function loadDayState(key) {
  try {
    const raw = localStorage.getItem(`mindshift_quests_${key}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDayState(key, state) {
  try {
    localStorage.setItem(`mindshift_quests_${key}`, JSON.stringify(state));
  } catch {}
}

function getNumber(key, def = 0) {
  try {
    return Number(localStorage.getItem(key)) || def;
  } catch {
    return def;
  }
}

function setNumber(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function dispatchCountersUpdate() {
  try {
    window.dispatchEvent(new Event("mindshift:counters:update"));
  } catch {}
}

export default function QuestBoard({ quests, personalityType }) {
  // Generate personality-specific quests
  const personalityQuests = useMemo(() => {
    if (!personalityType) return UNIVERSAL_QUESTS;
    const specificQuests = PERSONALITY_QUESTS[personalityType.toUpperCase()] || [];
    // Combine 2 personality-specific quests with 1 universal quest
    return [...specificQuests.slice(0, 2), UNIVERSAL_QUESTS[0]];
  }, [personalityType]);
  
  const defaultQuests = quests || personalityQuests;
  const [day, setDay] = useState(todayKey());
  const [state, setState] = useState({}); // { [questId]: boolean }
  const [customQuests, setCustomQuests] = useState([]); // array of { id, title, points }
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState(5);

  // Load today's state on mount and when day changes
  useEffect(() => {
    const key = todayKey();
    setDay(key);
    setState(loadDayState(key));
    // load custom quests for the day
    try {
      const raw = localStorage.getItem(`mindshift_custom_quests_${key}`);
      setCustomQuests(raw ? JSON.parse(raw) : []);
    } catch {
      setCustomQuests([]);
    }
  }, []);

  // If the actual day changes while the app is open
  useEffect(() => {
    const interval = setInterval(() => {
      const key = todayKey();
      if (key !== day) {
        setDay(key);
        setState(loadDayState(key));
        try {
          const raw = localStorage.getItem(`mindshift_custom_quests_${key}`);
          setCustomQuests(raw ? JSON.parse(raw) : []);
        } catch {
          setCustomQuests([]);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [day]);

  const allQuests = useMemo(() => [...defaultQuests, ...customQuests], [defaultQuests, customQuests]);
  const completedCount = useMemo(
    () => allQuests.filter((q) => !!state[q.id]).length,
    [state, allQuests]
  );
  const progress = Math.round((completedCount / Math.max(1, allQuests.length)) * 100);

  const toggleQuest = (quest) => {
    const key = day;
    const prev = !!state[quest.id];
    const next = !prev;

    // Persist quest state
    const nextState = { ...state, [quest.id]: next };
    setState(nextState);
    saveDayState(key, nextState);

    // Update points based on transition
    let points = getNumber("mindshift_points", 0);
    if (next && !prev) points += quest.points;
    if (!next && prev) points = Math.max(0, points - quest.points);
    setNumber("mindshift_points", points);

    // Update streak if this is the first completion of the day
    if (next && !prev) maybeUpdateStreakOnFirstCompletionOfDay(key);

    dispatchCountersUpdate();
    // Ask badge system to re-evaluate (points/streak may have changed)
    try { window.dispatchEvent(new Event("mindshift:badges:check")); } catch {}
  };

  const saveCustomQuests = (key, list) => {
    try {
      localStorage.setItem(`mindshift_custom_quests_${key}`, JSON.stringify(list));
    } catch {}
  };

  const addCustomQuest = (e) => {
    e?.preventDefault?.();
    const title = newTitle.trim();
    const pts = Math.max(1, Math.min(1000, Number(newPoints) || 1));
    if (!title) return;
    const id = `custom_${Date.now()}`;
    const q = { id, title, points: pts };
    const next = [...customQuests, q];
    setCustomQuests(next);
    saveCustomQuests(day, next);
    setNewTitle("");
    setNewPoints(5);
    // Trigger badge evaluation for 'Quest Maker'
    try { window.dispatchEvent(new Event("mindshift:badges:check")); } catch {}
  };

  const resetToday = () => {
    const key = day;
    // Calculate points to subtract for any completed quests (base + custom)
    const questsCompleted = allQuests.filter((q) => !!state[q.id]);
    let points = getNumber("mindshift_points", 0);
    for (const q of questsCompleted) {
      points = Math.max(0, points - (Number(q.points) || 0));
    }
    setNumber("mindshift_points", points);

    // Clear completion state for the day
    const cleared = {};
    setState(cleared);
    saveDayState(key, cleared);

    // Allow streak to re-trigger by clearing the first-completion flag
    try { localStorage.removeItem(`mindshift_completed_any_${key}`); } catch {}

    dispatchCountersUpdate();
  };

  return (
    <div id="quest-board" className="w-full max-w-md mx-auto px-2 md:px-3 mt-4">
      <div 
        className="rounded-xl p-2.5 md:p-3 backdrop-blur-sm"
        style={{
          background: "rgba(249, 248, 244, 0.85)", // Semi-transparent cream
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 4px 20px rgba(3, 89, 77, 0.15)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>
              {getPersonalityQuestTitle(personalityType)}
            </h2>
            {personalityType && (
              <span 
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  background: getPersonalityAccentColor(personalityType),
                  color: 'var(--color-green-900)',
                  border: '1px solid var(--color-green-900-20)'
                }}
              >
                {personalityType}
              </span>
            )}
          </div>
          <div className="text-xs md:text-sm text-neutral-600 font-medium">{day}</div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full overflow-hidden mb-2" style={{ background: "var(--color-green-900-20)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: "var(--color-green-900)"
            }}
          />
        </div>
        <div className="text-xs text-neutral-600 mb-3">{completedCount}/{allQuests.length} completed • {progress}%</div>

        {/* Add custom quest */}
        <form onSubmit={addCustomQuest} className="space-y-2 mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-xs text-neutral-600 mb-1">Quest title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Plan tomorrow in 5 minutes"
                className="w-full rounded-[999px] px-2.5 py-1.5 text-sm"
                style={{ 
                  background: "var(--surface)", 
                  border: "2px solid var(--color-green-900)", 
                  boxShadow: "0 2px 0 var(--color-green-900)" 
                }}
              />
            </div>
            <div className="w-full sm:w-24">
              <label className="block text-xs text-neutral-600 mb-1">Points</label>
              <input
                type="number"
                min={1}
                max={1000}
                step={1}
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                className="w-full rounded-[999px] px-2.5 py-1.5 text-sm"
                style={{ 
                  background: "var(--surface)", 
                  border: "2px solid var(--color-green-900)", 
                  boxShadow: "0 2px 0 var(--color-green-900)" 
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="nav-pill nav-pill--cyan flex-1 sm:flex-none">Add Quest</button>
            <button type="button" onClick={resetToday} className="nav-pill flex-1 sm:flex-none">Reset Today</button>
          </div>
        </form>

        {/* Quests List */}
        <ul className="space-y-2">
          {allQuests.map((q, index) => {
            const done = !!state[q.id];
            const isPersonalityQuest = personalityType && index < 2; // First 2 are personality-specific
            return (
              <li
                key={q.id}
                className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition-all duration-200"
                style={{
                  background: done ? (isPersonalityQuest ? getPersonalityAccentColor(personalityType) : "var(--color-green-900-10)") : "var(--surface)",
                  border: `2px solid ${done ? "var(--color-green-900)" : "var(--color-green-900-30)"}`,
                  boxShadow: done ? "0 2px 0 var(--color-green-900)" : (isPersonalityQuest ? "0 1px 0 var(--color-green-900-20)" : "none")
                }}
              >
                <label className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
                  {isPersonalityQuest && (
                    <span className="text-xs opacity-70 flex-shrink-0">✨</span>
                  )}
                  <input
                    type="checkbox"
                    className="h-4 w-4 flex-shrink-0"
                    style={{ accentColor: isPersonalityQuest && done ? "var(--color-green-900)" : "var(--color-green-900)" }}
                    checked={done}
                    onChange={() => toggleQuest(q)}
                  />
                  <span className={`text-xs md:text-sm transition-colors duration-200 ${done ? "line-through text-neutral-500" : "text-neutral-900"} truncate`}>
                    {q.title}
                  </span>
                  {done && (
                    <span className="text-emerald-600 flex-shrink-0" aria-hidden>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28-2.03a.75.75 0 0 0-1.06-1.06l-5.47 5.47-2.19-2.19a.75.75 0 1 0-1.06 1.06l2.72 2.72c.293.293.767.293 1.06 0l6-6Z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  {isPersonalityQuest && (
                    <span className="text-xs text-neutral-500 font-medium">{personalityType}</span>
                  )}
                  <span 
                    className="nav-pill text-xs flex-shrink-0"
                    style={{
                      background: isPersonalityQuest ? getPersonalityAccentColor(personalityType) : 'var(--surface)',
                      color: 'var(--color-green-900)'
                    }}
                  >
                    +{q.points}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function maybeUpdateStreakOnFirstCompletionOfDay(today) {
  // Guard: only once per day
  const flagKey = `mindshift_completed_any_${today}`;
  try {
    if (localStorage.getItem(flagKey)) return;
    localStorage.setItem(flagKey, "1");
  } catch {
    // continue; streak update still safe
  }

  const last = (() => {
    try {
      return localStorage.getItem("mindshift_last_active_date") || "";
    } catch {
      return "";
    }
  })();

  const currentStreak = getNumber("mindshift_streak", 0);

  const prevDate = last;
  const todayDate = today;
  const yesterday = computeRelativeDate(todayDate, -1);

  let nextStreak = currentStreak;
  if (!prevDate) {
    nextStreak = 1;
  } else if (prevDate === todayDate) {
    // already active today, keep streak
    nextStreak = currentStreak || 1;
  } else if (prevDate === yesterday) {
    nextStreak = currentStreak + 1;
  } else {
    nextStreak = 1; // reset
  }

  setNumber("mindshift_streak", nextStreak);
  try { localStorage.setItem("mindshift_last_active_date", todayDate); } catch {}
}

function computeRelativeDate(baseYYYYMMDD, deltaDays) {
  try {
    const [y, m, d] = baseYYYYMMDD.split("-").map((n) => parseInt(n, 10));
    const dt = new Date(y, (m - 1), d);
    dt.setDate(dt.getDate() + deltaDays);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).toLocaleDateString("en-CA");
  } catch {
    const dt = new Date();
    dt.setDate(dt.getDate() + deltaDays);
    return dt.toISOString().slice(0, 10);
  }
}

// Helper functions for personality theming
function getPersonalityQuestTitle(personalityType) {
  if (!personalityType) return "Quest Board";
  
  const titles = {
    // Analysts
    INTJ: "Strategic Quests",
    INTP: "Explorer Quests", 
    ENTJ: "Leadership Quests",
    ENTP: "Innovation Quests",
    // Diplomats 
    INFJ: "Vision Quests",
    INFP: "Authentic Quests",
    ENFJ: "Harmony Quests",
    ENFP: "Inspiration Quests",
    // Sentinels
    ISTJ: "Structure Quests",
    ISFJ: "Care Quests", 
    ESTJ: "Achievement Quests",
    ESFJ: "Community Quests",
    // Explorers
    ISTP: "Craft Quests",
    ISFP: "Expression Quests",
    ESTP: "Action Quests",
    ESFP: "Joy Quests"
  };
  
  return titles[personalityType.toUpperCase()] || "Quest Board";
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
