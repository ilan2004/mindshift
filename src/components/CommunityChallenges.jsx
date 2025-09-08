"use client";

import { useEffect, useMemo, useState } from "react";

const LS_KEY = "mindshift_challenges";

// Personality-specific challenges
const PERSONALITY_CHALLENGES = {
  // Analysts - Strategy and optimization focused
  INTJ: [
    { id: "strategic-plan-week", title: "Master Planner", desc: "Plan and execute 5 strategic deep-work sessions.", rewardPts: 180, duration: 7 },
    { id: "system-optimize", title: "System Optimizer", desc: "Identify and fix 3 workflow inefficiencies.", rewardPts: 120, duration: 5 },
    { id: "knowledge-synthesis", title: "Knowledge Architect", desc: "Connect insights across 4 different learning sources.", rewardPts: 160, duration: 10 }
  ],
  INTP: [
    { id: "deep-exploration", title: "Deep Explorer", desc: "Spend 8+ hours exploring fascinating new concepts.", rewardPts: 200, duration: 14 },
    { id: "pattern-hunter", title: "Pattern Hunter", desc: "Document 5 interesting connections between ideas.", rewardPts: 140, duration: 7 },
    { id: "curiosity-binge", title: "Curiosity Champion", desc: "Follow your curiosity for 3 consecutive days.", rewardPts: 110, duration: 3 }
  ],
  ENTJ: [
    { id: "leadership-sprint", title: "Leadership Sprint", desc: "Lead 3 initiatives and drive measurable progress.", rewardPts: 220, duration: 7 },
    { id: "efficiency-master", title: "Efficiency Master", desc: "Optimize 5 processes to save 2+ hours weekly.", rewardPts: 180, duration: 14 },
    { id: "goal-crusher", title: "Goal Crusher", desc: "Achieve 3 concrete milestones this week.", rewardPts: 200, duration: 7 }
  ],
  ENTP: [
    { id: "innovation-lab", title: "Innovation Lab", desc: "Generate and prototype 5 creative solutions.", rewardPts: 160, duration: 10 },
    { id: "network-builder", title: "Network Builder", desc: "Have meaningful conversations with 7 new people.", rewardPts: 120, duration: 14 },
    { id: "possibility-explorer", title: "Possibility Explorer", desc: "Explore 3 wildly different possibilities this week.", rewardPts: 140, duration: 7 }
  ],
  
  // Diplomats - Growth and meaning focused  
  INFJ: [
    { id: "vision-clarifier", title: "Vision Clarifier", desc: "Spend 3+ hours clarifying your long-term vision.", rewardPts: 150, duration: 7 },
    { id: "meaningful-impact", title: "Impact Maker", desc: "Take 5 actions that help others grow.", rewardPts: 180, duration: 14 },
    { id: "reflection-master", title: "Reflection Master", desc: "Journal for personal growth 7 days straight.", rewardPts: 140, duration: 7 }
  ],
  INFP: [
    { id: "authentic-creator", title: "Authentic Creator", desc: "Create 3 things that express your true self.", rewardPts: 170, duration: 14 },
    { id: "values-champion", title: "Values Champion", desc: "Take 7 actions aligned with your core values.", rewardPts: 160, duration: 7 },
    { id: "inspiration-seeker", title: "Inspiration Seeker", desc: "Capture and act on 5 moments of inspiration.", rewardPts: 120, duration: 10 }
  ],
  ENFJ: [
    { id: "team-harmony", title: "Harmony Builder", desc: "Foster positive energy in 5 group interactions.", rewardPts: 180, duration: 7 },
    { id: "mentor-master", title: "Mentor Master", desc: "Help 3 people overcome specific challenges.", rewardPts: 200, duration: 14 },
    { id: "growth-facilitator", title: "Growth Facilitator", desc: "Create growth opportunities for 5 others.", rewardPts: 190, duration: 10 }
  ],
  ENFP: [
    { id: "enthusiasm-spark", title: "Enthusiasm Spark", desc: "Share excitement about ideas with 8+ people.", rewardPts: 130, duration: 7 },
    { id: "possibility-champion", title: "Possibility Champion", desc: "Explore 4 new possibilities with others.", rewardPts: 150, duration: 14 },
    { id: "authentic-connector", title: "Authentic Connector", desc: "Have 5 deep, meaningful conversations.", rewardPts: 160, duration: 7 }
  ],
  
  // Sentinels - Structure and reliability focused
  ISTJ: [
    { id: "organization-master", title: "Organization Master", desc: "Organize 3 areas of life for maximum efficiency.", rewardPts: 150, duration: 7 },
    { id: "consistency-king", title: "Consistency King", desc: "Maintain perfect routine adherence for 10 days.", rewardPts: 200, duration: 10 },
    { id: "task-completionist", title: "Task Completionist", desc: "Clear your entire backlog of delayed tasks.", rewardPts: 180, duration: 14 }
  ],
  ISFJ: [
    { id: "care-champion", title: "Care Champion", desc: "Do 7 thoughtful things for people you care about.", rewardPts: 170, duration: 7 },
    { id: "routine-guardian", title: "Routine Guardian", desc: "Perfect your healthy routine for 14 days.", rewardPts: 200, duration: 14 },
    { id: "preparation-pro", title: "Preparation Pro", desc: "Prepare 5 things that will help others succeed.", rewardPts: 160, duration: 10 }
  ],
  ESTJ: [
    { id: "progress-driver", title: "Progress Driver", desc: "Drive measurable progress on 3 team goals.", rewardPts: 220, duration: 7 },
    { id: "process-optimizer", title: "Process Optimizer", desc: "Make 4 processes more efficient and organized.", rewardPts: 180, duration: 14 },
    { id: "target-achiever", title: "Target Achiever", desc: "Hit 5 specific, measurable targets.", rewardPts: 200, duration: 10 }
  ],
  ESFJ: [
    { id: "harmony-weaver", title: "Harmony Weaver", desc: "Foster positive relationships in 5+ environments.", rewardPts: 160, duration: 7 },
    { id: "organization-hero", title: "Organization Hero", desc: "Organize or coordinate 3 things for others.", rewardPts: 150, duration: 14 },
    { id: "celebration-master", title: "Celebration Master", desc: "Recognize 8 people's efforts or achievements.", rewardPts: 140, duration: 7 }
  ],
  
  // Explorers - Action and adaptability focused
  ISTP: [
    { id: "hands-on-master", title: "Hands-On Master", desc: "Fix, build, or improve 5 things with your hands.", rewardPts: 180, duration: 14 },
    { id: "skill-perfectionist", title: "Skill Perfectionist", desc: "Practice technical skills for 10+ hours.", rewardPts: 200, duration: 10 },
    { id: "system-analyzer", title: "System Analyzer", desc: "Understand how 3 complex systems work.", rewardPts: 160, duration: 14 }
  ],
  ISFP: [
    { id: "beauty-creator", title: "Beauty Creator", desc: "Create or appreciate 5 beautiful things.", rewardPts: 150, duration: 7 },
    { id: "expression-artist", title: "Expression Artist", desc: "Express yourself authentically in 4 ways.", rewardPts: 140, duration: 10 },
    { id: "nature-connector", title: "Nature Connector", desc: "Spend 5+ hours connecting with nature/beauty.", rewardPts: 120, duration: 14 }
  ],
  ESTP: [
    { id: "action-hero", title: "Action Hero", desc: "Jump into action on 5 things you've been thinking about.", rewardPts: 170, duration: 7 },
    { id: "energy-multiplier", title: "Energy Multiplier", desc: "Energize others through 8+ positive interactions.", rewardPts: 150, duration: 14 },
    { id: "opportunity-seizer", title: "Opportunity Seizer", desc: "Seize 3 opportunities that present themselves.", rewardPts: 180, duration: 10 }
  ],
  ESFP: [
    { id: "joy-bringer", title: "Joy Bringer", desc: "Bring joy or laughter to 10 people's days.", rewardPts: 160, duration: 7 },
    { id: "moment-embracer", title: "Moment Embracer", desc: "Fully experience 5+ beautiful moments.", rewardPts: 130, duration: 14 },
    { id: "spontaneous-helper", title: "Spontaneous Helper", desc: "Help 6 people in spontaneous, heartfelt ways.", rewardPts: 170, duration: 10 }
  ]
};

function seedChallenges(personalityType = null) {
  // Generate personality-specific challenges if type is provided
  if (personalityType && PERSONALITY_CHALLENGES[personalityType.toUpperCase()]) {
    const personalityChallenges = PERSONALITY_CHALLENGES[personalityType.toUpperCase()];
    return personalityChallenges.slice(0, 2).map((challenge, index) => ({ // Take 2 personality challenges
      ...challenge,
      participants: Math.floor(Math.random() * 30) + 10,
      joined: false,
      endsAt: Date.now() + challenge.duration * 24 * 60 * 60 * 1000,
      personalitySpecific: true
    })).concat([{
      // Add 1 universal challenge
      id: "daily-streak-7",
      title: "7-Day Streak",
      desc: "Maintain a daily focus streak for 7 days.",
      participants: 77,
      joined: false,
      rewardPts: 200,
      endsAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
      personalitySpecific: false
    }]);
  }
  
  // Default universal challenges
  return [
    {
      id: "wk-focus-10h",
      title: "10h Focus Week",
      desc: "Accumulate 10 hours of focused work this week.",
      participants: 42,
      joined: false,
      rewardPts: 150,
      endsAt: Date.now() + 6 * 24 * 60 * 60 * 1000,
      personalitySpecific: false
    },
    {
      id: "daily-streak-7",
      title: "7-Day Streak",
      desc: "Maintain a daily focus streak for 7 days.",
      participants: 77,
      joined: false,
      rewardPts: 200,
      endsAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
      personalitySpecific: false
    },
    {
      id: "social-nudges-5",
      title: "Nudge 5 Peers",
      desc: "Send encouragement nudges to 5 peers this week.",
      participants: 18,
      joined: false,
      rewardPts: 80,
      endsAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
      personalitySpecific: false
    },
  ];
}

function load(personalityType = null) {
  try {
    const key = personalityType ? `${LS_KEY}_${personalityType}` : LS_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return seedChallenges(personalityType);
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : seedChallenges(personalityType);
  } catch {
    return seedChallenges(personalityType);
  }
}
function save(list, personalityType = null) {
  try { 
    const key = personalityType ? `${LS_KEY}_${personalityType}` : LS_KEY;
    localStorage.setItem(key, JSON.stringify(list)); 
  } catch {}
}

function timeLeft(ts) {
  const ms = ts - Date.now();
  if (ms <= 0) return "ended";
  const d = Math.floor(ms / (24*60*60*1000));
  const h = Math.floor((ms % (24*60*60*1000)) / (60*60*1000));
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((ms % (60*60*1000)) / (60*1000));
  return `${h}h ${m}m left`;
}

export default function CommunityChallenges({ personalityType }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(load(personalityType));
  }, [personalityType]);

  const join = (id) => {
    setItems((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, joined: true, participants: (c.participants||0)+1 } : c);
      save(next, personalityType);
      return next;
    });
  };
  const leave = (id) => {
    setItems((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, joined: false, participants: Math.max(0, (c.participants||0)-1) } : c);
      save(next, personalityType);
      return next;
    });
  };

  const sorted = useMemo(() => [...items].sort((a,b) => (a.joined === b.joined ? 0 : a.joined ? -1 : 1)), [items]);

  return (
    <div
      className="rounded-xl p-3 overflow-hidden w-full max-w-md mx-auto backdrop-blur-sm"
      style={{
        background: "rgba(249, 248, 244, 0.85)", // Semi-transparent cream
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 20px rgba(3, 89, 77, 0.15)"
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>
            {getPersonalityChallengeTitle(personalityType)}
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
              Tailored
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-600">{sorted.length} available</span>
      </div>
      <ul className="grid gap-3 w-full">
        {sorted.map((c, index) => {
          const isPersonalityChallenge = c.personalitySpecific;
          return (
            <li
              key={c.id}
              className="p-2.5 rounded-lg w-full overflow-hidden"
              style={{
                background: c.joined ? (isPersonalityChallenge ? getPersonalityAccentColor(personalityType) : "var(--color-green-900-10)") : "var(--surface)",
                border: "2px solid var(--color-green-900)",
                boxShadow: c.joined ? "0 2px 0 var(--color-green-900)" : (isPersonalityChallenge ? "0 1px 0 var(--color-green-900-20)" : "none")
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    {isPersonalityChallenge && (
                      <span className="text-xs opacity-70">✨</span>
                    )}
                    <div className="text-[13px] font-medium truncate w-full">{c.title}</div>
                    {isPersonalityChallenge && personalityType && (
                      <span 
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                        style={{
                          background: getPersonalityAccentColor(personalityType),
                          color: 'var(--color-green-900)'
                        }}
                      >
                        {personalityType}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-600 truncate w-full">{c.desc}</div>
                  <div className="text-[11px] text-neutral-500 mt-1 truncate w-full">
                    {c.participants} joined • Reward {c.rewardPts} pts • {timeLeft(c.endsAt)}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {c.joined ? (
                    <button 
                      className="nav-pill text-xs px-2.5 py-1 whitespace-nowrap" 
                      style={{
                        background: 'var(--surface)',
                        color: 'var(--color-green-900)'
                      }}
                      onClick={() => leave(c.id)}
                    >
                      Leave
                    </button>
                  ) : (
                    <button 
                      className="nav-pill text-xs px-2.5 py-1 whitespace-nowrap" 
                      style={{
                        background: isPersonalityChallenge ? getPersonalityAccentColor(personalityType) : 'var(--color-cyan-200)',
                        color: 'var(--color-green-900)'
                      }}
                      onClick={() => join(c.id)}
                    >
                      {getPersonalityJoinText(personalityType, isPersonalityChallenge)}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Helper functions for personality theming
function getPersonalityChallengeTitle(personalityType) {
  if (!personalityType) return "Community Challenges";
  
  const titles = {
    // Analysts
    INTJ: "Strategic Challenges",
    INTP: "Explorer Challenges", 
    ENTJ: "Leadership Challenges",
    ENTP: "Innovation Challenges",
    // Diplomats 
    INFJ: "Vision Challenges",
    INFP: "Authentic Challenges",
    ENFJ: "Growth Challenges",
    ENFP: "Inspiration Challenges",
    // Sentinels
    ISTJ: "Structure Challenges",
    ISFJ: "Care Challenges", 
    ESTJ: "Achievement Challenges",
    ESFJ: "Community Challenges",
    // Explorers
    ISTP: "Craft Challenges",
    ISFP: "Expression Challenges",
    ESTP: "Action Challenges",
    ESFP: "Joy Challenges"
  };
  
  return titles[personalityType.toUpperCase()] || "Community Challenges";
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

function getPersonalityJoinText(personalityType, isPersonalityChallenge) {
  if (!isPersonalityChallenge) return 'Join';
  
  const joinTexts = {
    // Analysts
    INTJ: 'Execute', INTP: 'Explore', ENTJ: 'Lead', ENTP: 'Innovate',
    // Diplomats
    INFJ: 'Envision', INFP: 'Authentify', ENFJ: 'Grow', ENFP: 'Inspire',
    // Sentinels 
    ISTJ: 'Structure', ISFJ: 'Care', ESTJ: 'Achieve', ESFJ: 'Harmonize',
    // Explorers
    ISTP: 'Craft', ISFP: 'Express', ESTP: 'Act', ESFP: 'Celebrate'
  };
  
  return joinTexts[personalityType?.toUpperCase()] || 'Join';
}
