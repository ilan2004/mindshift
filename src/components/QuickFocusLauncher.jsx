"use client";

import { useEffect, useState, useMemo } from "react";

function getPersonalityType() {
  try {
    return localStorage.getItem("Nudge_personality_type") || "";
  } catch {
    return "";
  }
}

function getRecentSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem("Nudge_recent_sessions") || "[]");
    return Array.isArray(sessions) ? sessions.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function saveRecentSession(duration, name) {
  try {
    const sessions = getRecentSessions();
    const newSession = { duration, name, timestamp: Date.now() };
    const updated = [newSession, ...sessions.filter(s => s.duration !== duration || s.name !== name)].slice(0, 5);
    localStorage.setItem("Nudge_recent_sessions", JSON.stringify(updated));
  } catch {}
}

const PERSONALITY_TEMPLATES = {
  // Analysts - Deep work and systematic approaches
  INTJ: [
    { name: "Deep Work", duration: 90, icon: "🧠", description: "Uninterrupted strategic thinking" },
    { name: "System Design", duration: 120, icon: "⚡", description: "Build complex solutions" },
    { name: "Research Block", duration: 60, icon: "📚", description: "Dive deep into topics" }
  ],
  INTP: [
    { name: "Theory Time", duration: 75, icon: "🔬", description: "Explore ideas and concepts" },
    { name: "Problem Solving", duration: 45, icon: "🧩", description: "Analytical deep dive" },
    { name: "Learning Sprint", duration: 90, icon: "📖", description: "Absorb new knowledge" }
  ],
  ENTJ: [
    { name: "Goal Crusher", duration: 45, icon: "🎯", description: "Execute with precision" },
    { name: "Leadership Block", duration: 60, icon: "👑", description: "Strategic planning" },
    { name: "Results Sprint", duration: 30, icon: "⚡", description: "High-impact work" }
  ],
  ENTP: [
    { name: "Innovation Hour", duration: 60, icon: "💡", description: "Brainstorm and create" },
    { name: "Rapid Prototype", duration: 45, icon: "🚀", description: "Build and iterate fast" },
    { name: "Idea Marathon", duration: 90, icon: "🌟", description: "Unleash creativity" }
  ],

  // Diplomats - Purpose-driven and meaningful work
  INFJ: [
    { name: "Mindful Focus", duration: 50, icon: "🧘", description: "Purposeful deep work" },
    { name: "Vision Building", duration: 75, icon: "🌅", description: "Create meaningful change" },
    { name: "Reflection Time", duration: 30, icon: "💭", description: "Process and synthesize" }
  ],
  INFP: [
    { name: "Creative Flow", duration: 60, icon: "🎨", description: "Express authentic self" },
    { name: "Value Work", duration: 45, icon: "💝", description: "Align with your values" },
    { name: "Gentle Focus", duration: 25, icon: "🌸", description: "Soft, sustainable pace" }
  ],
  ENFJ: [
    { name: "People Impact", duration: 45, icon: "🤝", description: "Help others succeed" },
    { name: "Growth Session", duration: 60, icon: "🌱", description: "Nurture and develop" },
    { name: "Community Building", duration: 90, icon: "🏘️", description: "Bring people together" }
  ],
  ENFP: [
    { name: "Inspiration Burst", duration: 30, icon: "✨", description: "High-energy creativity" },
    { name: "Adventure Work", duration: 45, icon: "🎢", description: "Exciting new projects" },
    { name: "Social Sprint", duration: 25, icon: "🎉", description: "Collaborative energy" }
  ],

  // Sentinels - Structured and reliable approaches  
  ISTJ: [
    { name: "Steady Progress", duration: 60, icon: "📊", description: "Consistent, methodical work" },
    { name: "Detail Focus", duration: 45, icon: "🔍", description: "Thorough and precise" },
    { name: "Planning Block", duration: 30, icon: "📋", description: "Organize and structure" }
  ],
  ISFJ: [
    { name: "Caring Work", duration: 45, icon: "💕", description: "Help and support others" },
    { name: "Gentle Progress", duration: 30, icon: "🌺", description: "Steady, nurturing pace" },
    { name: "Service Focus", duration: 60, icon: "🤲", description: "Meaningful contribution" }
  ],
  ESTJ: [
    { name: "Executive Sprint", duration: 45, icon: "⚡", description: "Efficient goal execution" },
    { name: "Organization Hour", duration: 60, icon: "📁", description: "Structure and optimize" },
    { name: "Leadership Focus", duration: 90, icon: "🏛️", description: "Drive team success" }
  ],
  ESFJ: [
    { name: "Team Support", duration: 45, icon: "🤗", description: "Collaborative harmony" },
    { name: "Helper Mode", duration: 30, icon: "🎁", description: "Make others' day better" },
    { name: "Community Focus", duration: 60, icon: "👥", description: "Strengthen connections" }
  ],

  // Explorers - Action-oriented and adaptable
  ISTP: [
    { name: "Hands-On", duration: 45, icon: "🔧", description: "Practical problem solving" },
    { name: "Craft Mastery", duration: 75, icon: "⚒️", description: "Perfect your skills" },
    { name: "Build Mode", duration: 60, icon: "🛠️", description: "Create and tinker" }
  ],
  ISFP: [
    { name: "Creative Expression", duration: 60, icon: "🎭", description: "Authentic creation" },
    { name: "Beauty Focus", duration: 45, icon: "🌻", description: "Appreciate aesthetics" },
    { name: "Personal Project", duration: 90, icon: "🦋", description: "Follow your passion" }
  ],
  ESTP: [
    { name: "Action Sprint", duration: 25, icon: "🏃", description: "High-energy execution" },
    { name: "Quick Win", duration: 30, icon: "⚡", description: "Fast, visible results" },
    { name: "Dynamic Work", duration: 45, icon: "🎯", description: "Adaptable and agile" }
  ],
  ESFP: [
    { name: "Joy Work", duration: 30, icon: "😄", description: "Make it fun and engaging" },
    { name: "Social Energy", duration: 25, icon: "🎊", description: "People-powered focus" },
    { name: "Celebration Mode", duration: 45, icon: "🎈", description: "Turn work into play" }
  ]
};

const DEFAULT_TEMPLATES = [
  { name: "Pomodoro", duration: 25, icon: "🍅", description: "Classic 25-min focus" },
  { name: "Power Hour", duration: 60, icon: "⚡", description: "Sustained deep work" },
  { name: "Sprint", duration: 45, icon: "🏃", description: "Medium-length focus" },
  { name: "Deep Dive", duration: 90, icon: "🌊", description: "Extended concentration" }
];

export default function QuickFocusLauncher() {
  const [mounted, setMounted] = useState(false);
  const [personalityType, setPersonalityType] = useState("");
  const [recentSessions, setRecentSessions] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(25);

  useEffect(() => {
    setMounted(true);
    setPersonalityType(getPersonalityType());
    setRecentSessions(getRecentSessions());
  }, []);

  const templates = useMemo(() => {
    const personality = personalityType.toUpperCase();
    return PERSONALITY_TEMPLATES[personality] || DEFAULT_TEMPLATES;
  }, [personalityType]);

  const startSession = (duration, name = "Focus Session") => {
    // Save to recent sessions
    saveRecentSession(duration, name);
    setRecentSessions(getRecentSessions());

    // Dispatch focus session start event
    try {
      const event = new CustomEvent("Nudge:focus:start_template", {
        detail: { duration, template: name }
      });
      window.dispatchEvent(event);
    } catch {}

    // Also send message to extension if available
    try {
      window.postMessage({
        type: "Nudge:focus",
        action: "startSession",
        payload: { durationMinutes: duration }
      }, "*");
    } catch {}
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!mounted) {
    return <div className="h-64 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  return (
    <div 
      className="rounded-xl p-4 md:p-6"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-800 mb-1" style={{ fontFamily: "Tanker, sans-serif" }}>
            Start Focus Session
          </h2>
          <p className="text-sm text-neutral-600">
            Choose a template or set custom duration
          </p>
        </div>
        <div className="text-2xl">🚀</div>
      </div>

      {/* Personality-based templates */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          {personalityType ? `${personalityType.toUpperCase()} Templates` : "Focus Templates"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={`${template.name}-${template.duration}`}
              onClick={() => startSession(template.duration, template.name)}
              className="p-3 rounded-lg border-2 border-green-900 bg-white hover:bg-green-50 transition-all duration-200 text-left group hover:scale-105"
              style={{ boxShadow: "0 2px 0 var(--color-green-900)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-neutral-800">{template.name}</div>
                  <div className="text-xs text-neutral-600">{formatTime(template.duration)}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600 group-hover:text-neutral-700">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom duration */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Custom Duration</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="180"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(Number(e.target.value) || 25)}
            className="w-20 px-3 py-2 rounded-lg border-2 border-green-900 text-sm font-medium"
            style={{ boxShadow: "0 2px 0 var(--color-green-900)" }}
          />
          <span className="text-sm text-neutral-600">minutes</span>
          <button
            onClick={() => startSession(selectedDuration, `${selectedDuration}min Focus`)}
            className="nav-pill nav-pill--primary ml-auto"
          >
            Start Custom Session
          </button>
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Recent Sessions</h3>
          <div className="flex flex-wrap gap-2">
            {recentSessions.map((session, index) => (
              <button
                key={`${session.name}-${session.duration}-${index}`}
                onClick={() => startSession(session.duration, session.name)}
                className="nav-pill nav-pill--neutral text-xs hover:nav-pill--cyan transition-all duration-200"
              >
                {session.name} ({formatTime(session.duration)})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
