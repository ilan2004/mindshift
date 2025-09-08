"use client";

import { useEffect, useState, useMemo } from "react";

function getCurrentStreak() {
  try {
    return Number(localStorage.getItem("mindshift_streak")) || 0;
  } catch {
    return 0;
  }
}

function getTotalFocusHours() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_focus_sessions") || "[]");
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return Math.round(totalMinutes / 60 * 10) / 10;
  } catch {
    return 0;
  }
}

function getTotalSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_focus_sessions") || "[]");
    return sessions.length;
  } catch {
    return 0;
  }
}

function getBlockedAttempts() {
  try {
    return Number(localStorage.getItem("mindshift_blocked_total")) || 0;
  } catch {
    return 0;
  }
}

// Define all achievements with unlock conditions
const ACHIEVEMENTS = [
  // Streak-based achievements
  {
    id: "first_day",
    title: "First Steps",
    description: "Complete your first focus session",
    icon: "🌱",
    rarity: "common",
    condition: (stats) => stats.totalSessions >= 1,
    progress: (stats) => Math.min(100, (stats.totalSessions / 1) * 100)
  },
  {
    id: "week_warrior",
    title: "Week Warrior", 
    description: "Maintain a 7-day focus streak",
    icon: "🔥",
    rarity: "uncommon",
    condition: (stats) => stats.streak >= 7,
    progress: (stats) => Math.min(100, (stats.streak / 7) * 100)
  },
  {
    id: "monthly_master",
    title: "Monthly Master",
    description: "Achieve a 30-day focus streak",
    icon: "👑",
    rarity: "rare",
    condition: (stats) => stats.streak >= 30,
    progress: (stats) => Math.min(100, (stats.streak / 30) * 100)
  },
  {
    id: "legendary_focus",
    title: "Legendary Focus",
    description: "Maintain a 90-day streak",
    icon: "🏆",
    rarity: "legendary",
    condition: (stats) => stats.streak >= 90,
    progress: (stats) => Math.min(100, (stats.streak / 90) * 100)
  },

  // Session-based achievements
  {
    id: "session_starter",
    title: "Session Starter",
    description: "Complete 10 focus sessions",
    icon: "🎯",
    rarity: "common",
    condition: (stats) => stats.totalSessions >= 10,
    progress: (stats) => Math.min(100, (stats.totalSessions / 10) * 100)
  },
  {
    id: "focus_machine",
    title: "Focus Machine",
    description: "Complete 50 focus sessions",
    icon: "🤖",
    rarity: "uncommon",
    condition: (stats) => stats.totalSessions >= 50,
    progress: (stats) => Math.min(100, (stats.totalSessions / 50) * 100)
  },
  {
    id: "century_club",
    title: "Century Club",
    description: "Complete 100 focus sessions",
    icon: "💯",
    rarity: "rare",
    condition: (stats) => stats.totalSessions >= 100,
    progress: (stats) => Math.min(100, (stats.totalSessions / 100) * 100)
  },

  // Hour-based achievements
  {
    id: "first_hour",
    title: "Hour Hero",
    description: "Accumulate 1 hour of focused time",
    icon: "⏰",
    rarity: "common",
    condition: (stats) => stats.totalHours >= 1,
    progress: (stats) => Math.min(100, (stats.totalHours / 1) * 100)
  },
  {
    id: "ten_hour_titan",
    title: "Ten Hour Titan",
    description: "Accumulate 10 hours of focused time",
    icon: "⚡",
    rarity: "uncommon", 
    condition: (stats) => stats.totalHours >= 10,
    progress: (stats) => Math.min(100, (stats.totalHours / 10) * 100)
  },
  {
    id: "hundred_hour_hero",
    title: "Hundred Hour Hero",
    description: "Accumulate 100 hours of focused time",
    icon: "🌟",
    rarity: "rare",
    condition: (stats) => stats.totalHours >= 100,
    progress: (stats) => Math.min(100, (stats.totalHours / 100) * 100)
  },

  // Defense-based achievements
  {
    id: "guardian",
    title: "Digital Guardian",
    description: "Block 25 distraction attempts",
    icon: "🛡️",
    rarity: "common",
    condition: (stats) => stats.blockedAttempts >= 25,
    progress: (stats) => Math.min(100, (stats.blockedAttempts / 25) * 100)
  },
  {
    id: "fortress",
    title: "Fortress Mind", 
    description: "Block 100 distraction attempts",
    icon: "🏰",
    rarity: "uncommon",
    condition: (stats) => stats.blockedAttempts >= 100,
    progress: (stats) => Math.min(100, (stats.blockedAttempts / 100) * 100)
  },

  // Special achievements
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Start a focus session before 8 AM",
    icon: "🌅",
    rarity: "uncommon",
    condition: (stats) => stats.hasEarlySession,
    progress: (stats) => stats.hasEarlySession ? 100 : 0
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Start a focus session after 10 PM",
    icon: "🦉",
    rarity: "uncommon",
    condition: (stats) => stats.hasLateSession,
    progress: (stats) => stats.hasLateSession ? 100 : 0
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Send 10 peer nudges",
    icon: "🦋",
    rarity: "uncommon",
    condition: (stats) => stats.nudgesSent >= 10,
    progress: (stats) => Math.min(100, (stats.nudgesSent / 10) * 100)
  }
];

function getRarityColor(rarity) {
  switch (rarity) {
    case "common": return "border-gray-300 bg-gray-50";
    case "uncommon": return "border-green-300 bg-green-50";
    case "rare": return "border-blue-300 bg-blue-50";
    case "epic": return "border-purple-300 bg-purple-50";
    case "legendary": return "border-yellow-300 bg-yellow-50";
    default: return "border-gray-300 bg-gray-50";
  }
}

function getRarityGlow(rarity) {
  switch (rarity) {
    case "uncommon": return "shadow-green-200/50";
    case "rare": return "shadow-blue-200/50";
    case "epic": return "shadow-purple-200/50";
    case "legendary": return "shadow-yellow-200/50";
    default: return "";
  }
}

export default function AchievementShowcase() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    streak: 0,
    totalSessions: 0,
    totalHours: 0,
    blockedAttempts: 0,
    nudgesSent: 0,
    hasEarlySession: false,
    hasLateSession: false
  });

  useEffect(() => {
    setMounted(true);
    updateStats();

    // Listen for updates
    const handleUpdate = () => updateStats();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("mindshift:session:completed", handleUpdate);
    window.addEventListener("mindshift:achievement:unlocked", handleUpdate);
    window.addEventListener("mindshift:counters:update", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("mindshift:session:completed", handleUpdate);
      window.removeEventListener("mindshift:achievement:unlocked", handleUpdate);
      window.removeEventListener("mindshift:counters:update", handleUpdate);
    };
  }, []);

  const updateStats = () => {
    try {
      const newStats = {
        streak: getCurrentStreak(),
        totalSessions: getTotalSessions(),
        totalHours: getTotalFocusHours(),
        blockedAttempts: getBlockedAttempts(),
        nudgesSent: Number(localStorage.getItem("mindshift_nudges_sent")) || 0,
        hasEarlySession: Boolean(localStorage.getItem("mindshift_early_bird")),
        hasLateSession: Boolean(localStorage.getItem("mindshift_night_owl"))
      };
      setStats(newStats);
    } catch {}
  };

  const achievements = useMemo(() => {
    if (!mounted) return { unlocked: [], inProgress: [], locked: [] };

    const unlocked = [];
    const inProgress = [];
    const locked = [];

    ACHIEVEMENTS.forEach(achievement => {
      const isUnlocked = achievement.condition(stats);
      const progress = achievement.progress(stats);

      if (isUnlocked) {
        unlocked.push({ ...achievement, progress });
      } else if (progress > 0) {
        inProgress.push({ ...achievement, progress });
      } else {
        locked.push({ ...achievement, progress });
      }
    });

    return { unlocked, inProgress, locked };
  }, [mounted, stats]);

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  const AchievementCard = ({ achievement, isUnlocked = false }) => {
    const rarityClass = getRarityColor(achievement.rarity);
    const glowClass = getRarityGlow(achievement.rarity);
    
    return (
      <div 
        className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${rarityClass} ${isUnlocked ? glowClass : 'opacity-75'}`}
        style={{
          boxShadow: isUnlocked ? "0 4px 0 var(--color-green-900-20)" : "none"
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`text-2xl ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${isUnlocked ? 'text-neutral-800' : 'text-neutral-600'}`}>
              {achievement.title}
            </h3>
            <p className="text-xs text-neutral-600 leading-tight">
              {achievement.description}
            </p>
          </div>
        </div>
        
        {!isUnlocked && achievement.progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(achievement.progress)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        )}
        
        {isUnlocked && (
          <div className="mt-2">
            <div className="text-xs font-medium text-green-600 flex items-center gap-1">
              <span>✓</span>
              <span>Unlocked!</span>
            </div>
          </div>
        )}
      </div>
    );
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
          <span className="text-2xl">🏆</span>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            Achievements
          </h2>
        </div>
        <div className="text-sm text-neutral-600">
          {achievements.unlocked.length} / {ACHIEVEMENTS.length} unlocked
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-700">{achievements.unlocked.length}</div>
          <div className="text-xs text-green-600">Unlocked</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-lg font-bold text-yellow-700">{achievements.inProgress.length}</div>
          <div className="text-xs text-yellow-600">In Progress</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-700">{stats.streak}</div>
          <div className="text-xs text-blue-600">Day Streak</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-700">{stats.totalHours}h</div>
          <div className="text-xs text-purple-600">Total Focus</div>
        </div>
      </div>

      {/* Recently unlocked */}
      {achievements.unlocked.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <span>🌟</span>
            <span>Recently Unlocked</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.unlocked.slice(0, 3).map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} isUnlocked={true} />
            ))}
          </div>
        </div>
      )}

      {/* In progress */}
      {achievements.inProgress.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <span>⏳</span>
            <span>Almost There</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.inProgress.slice(0, 6).map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Next milestones */}
      {achievements.locked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <span>🔒</span>
            <span>Next Milestones</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.locked.slice(0, 4).map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
        <div className="text-xs text-neutral-500">
          Earn achievements by maintaining streaks, completing sessions, and staying focused!
        </div>
      </div>
    </div>
  );
}
