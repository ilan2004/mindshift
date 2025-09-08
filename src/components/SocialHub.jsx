"use client";

import { useEffect, useState, useMemo } from "react";

function getPersonalityType() {
  try {
    return localStorage.getItem("mindshift_personality_type") || "";
  } catch {
    return "";
  }
}

function getCurrentStreak() {
  try {
    return Number(localStorage.getItem("mindshift_streak")) || 0;
  } catch {
    return 0;
  }
}

function getFocusHours() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_focus_sessions") || "[]");
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return Math.round(totalMinutes / 60 * 10) / 10;
  } catch {
    return 0;
  }
}

// Mock data for social features
const MOCK_USERS = [
  { id: "u1", name: "Ilan", personality: "INTJ", streak: 12, focusHours: 25.5, status: "focusing", avatar: "I", compatibility: 95 },
  { id: "u2", name: "Hadee", personality: "ENTP", streak: 8, focusHours: 18.2, status: "break", avatar: "H", compatibility: 88 },
  { id: "u3", name: "Rohan", personality: "ENFJ", streak: 15, focusHours: 32.1, status: "idle", avatar: "R", compatibility: 92 },
  { id: "u4", name: "Sarah", personality: "ISFP", streak: 22, focusHours: 41.3, status: "focusing", avatar: "S", compatibility: 78 },
  { id: "u5", name: "Alex", personality: "ESTJ", streak: 6, focusHours: 15.7, status: "focusing", avatar: "A", compatibility: 85 },
  { id: "u6", name: "Maya", personality: "INFP", streak: 18, focusHours: 28.9, status: "break", avatar: "M", compatibility: 90 }
];

const MOCK_CHALLENGES = [
  {
    id: "c1",
    title: "Weekend Focus Warriors",
    description: "Complete 6+ hours of focus time this weekend",
    participants: 24,
    reward: "250 points",
    timeLeft: "2 days",
    joined: false,
    type: "weekend"
  },
  {
    id: "c2", 
    title: "MBTI Analysts Unite",
    description: "Analyst personalities (NT types) weekly challenge",
    participants: 12,
    reward: "300 points + badge",
    timeLeft: "4 days",
    joined: true,
    type: "personality"
  },
  {
    id: "c3",
    title: "Morning Focus Club",
    description: "Start focus sessions before 9 AM for 5 consecutive days",
    participants: 18,
    reward: "Early Bird badge",
    timeLeft: "6 days",
    joined: false,
    type: "habit"
  }
];

const MOCK_MESSAGES = [
  {
    id: "m1",
    from: "Hadee",
    avatar: "H",
    message: "Just finished a 90-min deep work session! 🧠",
    timestamp: Date.now() - 300000,
    type: "achievement"
  },
  {
    id: "m2",
    from: "Sarah", 
    avatar: "S",
    message: "Anyone up for a co-focus session this afternoon?",
    timestamp: Date.now() - 1800000,
    type: "invitation"
  },
  {
    id: "m3",
    from: "Rohan",
    avatar: "R", 
    message: "Hit my 15-day streak milestone! Thanks for the support 🔥",
    timestamp: Date.now() - 3600000,
    type: "celebration"
  }
];

function getCompatibilityColor(score) {
  if (score >= 90) return "text-green-600 bg-green-100";
  if (score >= 80) return "text-blue-600 bg-blue-100";
  if (score >= 70) return "text-yellow-600 bg-yellow-100";
  return "text-neutral-600 bg-neutral-100";
}

function getStatusColor(status) {
  switch (status) {
    case "focusing": return "bg-green-500";
    case "break": return "bg-yellow-500";
    case "idle": return "bg-neutral-400";
    default: return "bg-neutral-300";
  }
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function SocialHub() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("buddies");
  const [personalityType, setPersonalityType] = useState("");
  const [myStats, setMyStats] = useState({ streak: 0, focusHours: 0 });

  useEffect(() => {
    setMounted(true);
    setPersonalityType(getPersonalityType());
    setMyStats({
      streak: getCurrentStreak(),
      focusHours: getFocusHours()
    });
  }, []);

  const recommendedBuddies = useMemo(() => {
    if (!personalityType) return MOCK_USERS.slice(0, 3);
    
    // Sort by compatibility score and filter by similar focus levels
    return MOCK_USERS
      .filter(user => Math.abs(user.focusHours - myStats.focusHours) < 20)
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 3);
  }, [personalityType, myStats.focusHours]);

  const personalityChallenges = useMemo(() => {
    return MOCK_CHALLENGES.filter(challenge => 
      challenge.type === "personality" || challenge.type === "weekend"
    );
  }, []);

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  const tabs = [
    { id: "buddies", label: "Buddies", icon: "👥" },
    { id: "challenges", label: "Challenges", icon: "🎯" },
    { id: "messages", label: "Messages", icon: "💬" }
  ];

  const sendNudge = (userId) => {
    // Mock sending a nudge
    try {
      const activities = JSON.parse(localStorage.getItem("mindshift_activity_feed") || "[]");
      const user = MOCK_USERS.find(u => u.id === userId);
      const newActivity = {
        id: `nudge-${Date.now()}`,
        type: "social",
        user: "You",
        message: `sent a motivational nudge to ${user?.name}`,
        timestamp: Date.now(),
        icon: "🤗"
      };
      activities.unshift(newActivity);
      localStorage.setItem("mindshift_activity_feed", JSON.stringify(activities.slice(0, 50)));
      
      // Update nudge count
      const nudgeCount = Number(localStorage.getItem("mindshift_nudges_sent")) || 0;
      localStorage.setItem("mindshift_nudges_sent", String(nudgeCount + 1));
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent("mindshift:counters:update"));
    } catch {}
  };

  const joinChallenge = (challengeId) => {
    // Mock joining challenge
    const challengeIndex = MOCK_CHALLENGES.findIndex(c => c.id === challengeId);
    if (challengeIndex >= 0) {
      MOCK_CHALLENGES[challengeIndex].joined = true;
      MOCK_CHALLENGES[challengeIndex].participants += 1;
    }
  };

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
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            Social Hub
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                activeTab === tab.id
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-80">
        {activeTab === "buddies" && (
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <span>✨</span>
                <span>Recommended for You</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedBuddies.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-neutral-200 rounded-lg bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
                          style={{ backgroundColor: "var(--color-green-900)" }}
                        >
                          {user.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-neutral-800">{user.name}</div>
                        <div className="text-xs text-neutral-600">{user.personality}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="text-center p-2 bg-neutral-50 rounded">
                        <div className="font-semibold text-neutral-800">{user.streak}</div>
                        <div className="text-neutral-600">days</div>
                      </div>
                      <div className="text-center p-2 bg-neutral-50 rounded">
                        <div className="font-semibold text-neutral-800">{user.focusHours}h</div>
                        <div className="text-neutral-600">focus</div>
                      </div>
                    </div>

                    <div className={`text-xs px-2 py-1 rounded-full text-center mb-3 font-medium ${getCompatibilityColor(user.compatibility)}`}>
                      {user.compatibility}% match
                    </div>

                    <button
                      onClick={() => sendNudge(user.id)}
                      className="w-full nav-pill nav-pill--cyan text-xs py-2"
                    >
                      Send Nudge 🤗
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <span>🌟</span>
                <span>Active Focus Partners</span>
              </h3>
              <div className="space-y-3">
                {MOCK_USERS.filter(u => u.status === "focusing").map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-white">
                    <div className="relative">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-white text-sm"
                        style={{ backgroundColor: "var(--color-green-900)" }}
                      >
                        {user.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-neutral-800">{user.name}</div>
                      <div className="text-xs text-neutral-600">Currently focusing • {user.streak} day streak</div>
                    </div>
                    <button
                      onClick={() => sendNudge(user.id)}
                      className="nav-pill nav-pill--neutral text-xs px-2 py-1"
                    >
                      👋 Wave
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "challenges" && (
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <span>🎯</span>
                <span>Group Challenges</span>
              </h3>
              <div className="space-y-4">
                {MOCK_CHALLENGES.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      challenge.joined ? "border-green-200 bg-green-50" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-neutral-800">{challenge.title}</h4>
                          {challenge.joined && (
                            <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">
                              Joined
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-xs text-neutral-600">
                          <span>👥 {challenge.participants} participants</span>
                          <span>🏆 {challenge.reward}</span>
                          <span>⏰ {challenge.timeLeft} left</span>
                        </div>
                      </div>
                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        disabled={challenge.joined}
                        className={`nav-pill text-xs px-3 py-2 ${
                          challenge.joined ? "nav-pill--neutral" : "nav-pill--cyan"
                        }`}
                      >
                        {challenge.joined ? "✓ Joined" : "Join"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <h4 className="font-semibold text-sm text-blue-800">Challenge Ideas</h4>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Create study groups with similar personality types</div>
                <div>• Set shared focus goals with accountability partners</div>
                <div>• Compete in weekly productivity leaderboards</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <span>📱</span>
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3">
                {MOCK_MESSAGES.map((message) => (
                  <div key={message.id} className="p-3 border border-neutral-200 rounded-lg bg-white">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-white text-sm flex-shrink-0"
                        style={{ backgroundColor: "var(--color-green-900)" }}
                      >
                        {message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-neutral-800">{message.from}</span>
                          <span className="text-xs text-neutral-500">{timeAgo(message.timestamp)}</span>
                        </div>
                        <div className="text-sm text-neutral-700">{message.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Share your progress or send encouragement..."
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
                <button className="nav-pill nav-pill--primary px-4 py-2 text-sm">
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
