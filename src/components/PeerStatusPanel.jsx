"use client";

import { useEffect, useMemo, useState } from "react";
import { getLeaderboard, getFriends, getUsersByIds } from "@/lib/api";

// MBTI compatibility and peer suggestions
const PERSONALITY_COMPATIBLE = {
  // Analysts - work well with other thinkers and complementary types
  INTJ: ['ENTP', 'ENFP', 'INTP', 'ENTJ'],
  INTP: ['ENTJ', 'ESTJ', 'INTJ', 'ENTP'],
  ENTJ: ['INTP', 'INFP', 'ENTP', 'INTJ'],
  ENTP: ['INTJ', 'INFJ', 'INTP', 'ENTJ'],
  
  // Diplomats - thrive with authentic connections
  INFJ: ['ENTP', 'ENFP', 'INFP', 'ENFJ'],
  INFP: ['ENFJ', 'ENTJ', 'INFJ', 'ENFP'],
  ENFJ: ['INFP', 'ISFP', 'INFJ', 'ENFP'],
  ENFP: ['INTJ', 'INFJ', 'INFP', 'ENFJ'],
  
  // Sentinels - appreciate structure and reliability
  ISTJ: ['ESFP', 'ESTP', 'ISFJ', 'ESTJ'],
  ISFJ: ['ESFP', 'ESTP', 'ISTJ', 'ESFJ'],
  ESTJ: ['ISFP', 'ISTP', 'ISTJ', 'ESFJ'],
  ESFJ: ['ISFP', 'ISTP', 'ISFJ', 'ESTJ'],
  
  // Explorers - enjoy dynamic interactions
  ISTP: ['ESFJ', 'ESTJ', 'ISFP', 'ESTP'],
  ISFP: ['ESFJ', 'ENFJ', 'ISTP', 'ESFP'],
  ESTP: ['ISFJ', 'ISTJ', 'ISTP', 'ESFP'],
  ESFP: ['ISFJ', 'ISTJ', 'ISFP', 'ESTP']
};

// Generate mock peers with compatible personality types
function generateCompatiblePeers(userPersonality) {
  const compatibleTypes = userPersonality ? PERSONALITY_COMPATIBLE[userPersonality.toUpperCase()] || [] : [];
  const allTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
  
  const peerPool = [
    { id: 101, name: 'Alex Chen', personality: compatibleTypes[0] || 'ENFP', points: 1240, avatar: '🎯' },
    { id: 102, name: 'Sam Rivera', personality: compatibleTypes[1] || 'INTJ', points: 1180, avatar: '🚀' },
    { id: 103, name: 'Jordan Kim', personality: compatibleTypes[2] || 'ISFJ', points: 1050, avatar: '🌟' },
    { id: 104, name: 'Taylor Morgan', personality: compatibleTypes[3] || 'ENTP', points: 980, avatar: '⚡' },
    { id: 105, name: 'Casey Parker', personality: allTypes[Math.floor(Math.random() * allTypes.length)], points: 920, avatar: '🔥' },
    { id: 106, name: 'Riley Davis', personality: allTypes[Math.floor(Math.random() * allTypes.length)], points: 860, avatar: '💫' }
  ];
  
  return peerPool;
}

// Personality-aware status messages
function getPersonalityStatusMessage(personality, baseLabel) {
  if (!personality) return baseLabel;
  
  const messages = {
    'Focusing': {
      INTJ: 'Deep work mode', INTP: 'Exploring ideas', ENTJ: 'Crushing goals', ENTP: 'Creative sprint',
      INFJ: 'Visioning session', INFP: 'Authentic flow', ENFJ: 'Focused helping', ENFP: 'Inspired creating',
      ISTJ: 'Methodical work', ISFJ: 'Caring focus', ESTJ: 'Achievement mode', ESFJ: 'Team supporting',
      ISTP: 'Hands-on building', ISFP: 'Creative expression', ESTP: 'Action focus', ESFP: 'Energetic flow'
    },
    'On Break': {
      INTJ: 'Strategic pause', INTP: 'Pondering break', ENTJ: 'Quick recharge', ENTP: 'Idea brewing',
      INFJ: 'Reflective moment', INFP: 'Soul recharge', ENFJ: 'People break', ENFP: 'Social energy',
      ISTJ: 'Scheduled break', ISFJ: 'Gentle pause', ESTJ: 'Efficiency break', ESFJ: 'Connection time',
      ISTP: 'Hands break', ISFP: 'Beauty pause', ESTP: 'Quick adventure', ESFP: 'Joy break'
    },
    'Idle': {
      INTJ: 'Planning mode', INTP: 'Contemplating', ENTJ: 'Strategizing', ENTP: 'Brainstorming',
      INFJ: 'Reflecting', INFP: 'Dreaming', ENFJ: 'Mentoring', ENFP: 'Inspiring',
      ISTJ: 'Organizing', ISFJ: 'Supporting', ESTJ: 'Coordinating', ESFJ: 'Harmonizing',
      ISTP: 'Tinkering', ISFP: 'Creating', ESTP: 'Networking', ESFP: 'Celebrating'
    }
  };
  
  return messages[baseLabel]?.[personality.toUpperCase()] || baseLabel;
}

// Lightweight mock of presence/focus status
function randomStatus() {
  const modes = [
    { label: "Focusing", color: "bg-emerald-500" },
    { label: "On Break", color: "bg-amber-500" },
    { label: "Idle", color: "bg-neutral-400" },
    { label: "Offline", color: "bg-neutral-300" },
  ];
  return modes[Math.floor(Math.random() * modes.length)];
}

export default function PeerStatusPanel({ userId = 1, personalityType }) {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        // Generate personality-compatible peers instead of random leaderboard
        const compatiblePeers = generateCompatiblePeers(personalityType);
        const sample = compatiblePeers.map((u) => ({
          ...u,
          presence: randomStatus(),
          etaMin: Math.floor(Math.random() * 25) + 1,
        }));
        if (mounted) setPeers(sample);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Periodically update presence to feel live
    const t = setInterval(() => {
      setPeers((prev) => 
        prev.map((p) => ({ ...p, presence: randomStatus() }))
      );
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const activeCount = useMemo(
    () => peers.filter((p) => p.presence.label !== "Offline").length,
    [peers]
  );

  return (
    <div
      className="rounded-xl p-2.5 md:p-3 w-full max-w-md mx-auto"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 2px 0 var(--color-green-900)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm md:text-base font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            {getPersonalityPeerTitle(personalityType)}
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
              Compatible
            </span>
          )}
        </div>
        <span className="text-xs md:text-sm text-neutral-600 font-medium">
          {activeCount}/{peers.length} active
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 md:py-8">
          <div className="animate-pulse text-sm md:text-base text-neutral-600">Loading peers…</div>
        </div>
      ) : (
        <div className="space-y-2">
          {peers.map((p) => (
            <div 
              key={p.id} 
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 rounded-xl transition-colors"
              style={{ 
                background: "var(--surface)", 
                border: "2px solid var(--color-green-900)",
                boxShadow: "0 2px 0 var(--color-green-900)"
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm md:text-sm font-semibold flex-shrink-0" style={{ background: "var(--color-green-900)", color: "white" }}>
                  {p.avatar || p.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm md:text-sm font-medium text-neutral-800 truncate">
                      {p.name}
                    </span>
                    <div 
                      className={`h-2 w-2 rounded-full ${p.presence.color} flex-shrink-0`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="text-xs text-neutral-600 flex items-center gap-2">
                    <span>{getPersonalityStatusMessage(p.personality, p.presence.label)}</span>
                    {p.presence.label === "Focusing" && <span>• {p.etaMin}m left</span>}
                    {p.personality && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: getPersonalityAccentColor(p.personality),
                          color: 'var(--color-green-900)'
                        }}
                      >
                        {p.personality}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                className="nav-pill text-xs px-2.5 py-1.25 font-medium w-full sm:w-auto flex-shrink-0"
                style={{
                  background: getPersonalityAccentColor(p.personality || personalityType),
                  color: 'var(--color-green-900)'
                }}
              >
                {getPersonalityNudgeText(p.personality, personalityType)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions for personality theming
function getPersonalityPeerTitle(personalityType) {
  if (!personalityType) return "Peer Status";
  
  const titles = {
    // Analysts
    INTJ: "Strategic Allies",
    INTP: "Thinking Partners", 
    ENTJ: "Goal Crushers",
    ENTP: "Idea Collaborators",
    // Diplomats 
    INFJ: "Kindred Spirits",
    INFP: "Authentic Souls",
    ENFJ: "Growth Partners",
    ENFP: "Inspiration Circle",
    // Sentinels
    ISTJ: "Reliable Team",
    ISFJ: "Support Network", 
    ESTJ: "Achievement Squad",
    ESFJ: "Harmony Circle",
    // Explorers
    ISTP: "Craft Partners",
    ISFP: "Creative Spirits",
    ESTP: "Action Buddies",
    ESFP: "Joy Squad"
  };
  
  return titles[personalityType.toUpperCase()] || "Compatible Peers";
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

function getPersonalityNudgeText(peerPersonality, userPersonality) {
  // Different nudge styles based on personality compatibility
  const nudgeStyles = {
    // Analyst to Analyst
    'NT_NT': 'Challenge',
    // Analyst to others
    'NT_NF': 'Inspire', 'NT_SJ': 'Support', 'NT_SP': 'Energize',
    // Diplomat nudges
    'NF_NT': 'Motivate', 'NF_NF': 'Encourage', 'NF_SJ': 'Appreciate', 'NF_SP': 'Celebrate',
    // Sentinel nudges  
    'SJ_NT': 'Focus', 'SJ_NF': 'Care', 'SJ_SJ': 'Organize', 'SJ_SP': 'Guide',
    // Explorer nudges
    'SP_NT': 'Spark', 'SP_NF': 'Connect', 'SP_SJ': 'Boost', 'SP_SP': 'Rally'
  };
  
  const userCluster = getPersonalityCluster(userPersonality);
  const peerCluster = getPersonalityCluster(peerPersonality);
  const key = `${userCluster}_${peerCluster}`;
  
  return nudgeStyles[key] || 'Nudge';
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
