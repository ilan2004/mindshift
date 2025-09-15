"use client";

import { useEffect, useState } from "react";

function getTodayFocusMinutes() {
  try {
    const sessions = JSON.parse(localStorage.getItem("Nudge_focus_sessions") || "[]");
    const today = new Date().toLocaleDateString("en-CA");
    const todaySession = sessions.find(s => s.date === today);
    return todaySession?.minutes || 0;
  } catch {
    return 0;
  }
}

function getWeeklyFocusMinutes() {
  try {
    const sessions = JSON.parse(localStorage.getItem("Nudge_focus_sessions") || "[]");
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week
    
    return sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart;
      })
      .reduce((sum, s) => sum + (s.minutes || 0), 0);
  } catch {
    return 0;
  }
}

function getCurrentStreak() {
  try {
    return Number(localStorage.getItem("Nudge_streak")) || 0;
  } catch {
    return 0;
  }
}

function getBlockedToday() {
  try {
    return Number(localStorage.getItem("Nudge_blocked_today")) || 0;
  } catch {
    return 0;
  }
}

function CircularProgress({ percentage, size = 64, strokeWidth = 6, color = "var(--color-green-900)" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-neutral-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-neutral-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

export default function FocusMetricCard({ metric }) {
  const [value, setValue] = useState(0);
  const [target, setTarget] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateValues();

    // Listen for updates
    const handleUpdate = () => updateValues();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("Nudge:counters:update", handleUpdate);
    window.addEventListener("Nudge:session:completed", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("Nudge:counters:update", handleUpdate);
      window.removeEventListener("Nudge:session:completed", handleUpdate);
    };
  }, [metric]);

  const updateValues = () => {
    switch (metric) {
      case "todayFocus":
        setValue(getTodayFocusMinutes());
        setTarget(240); // 4 hours default daily goal
        break;
      case "weeklyGoal":
        setValue(getWeeklyFocusMinutes());
        setTarget(1500); // 25 hours weekly goal
        break;
      case "currentStreak":
        setValue(getCurrentStreak());
        setTarget(30); // 30 day streak goal
        break;
      case "blockedSites":
        setValue(getBlockedToday());
        setTarget(50); // 50 blocks is "full protection"
        break;
      default:
        setValue(0);
        setTarget(100);
    }
  };

  const getMetricConfig = () => {
    switch (metric) {
      case "todayFocus":
        return {
          icon: "🎯",
          title: "Today's Focus",
          valueText: `${Math.floor(value / 60)}h ${value % 60}m`,
          targetText: `${Math.floor(target / 60)}h goal`,
          color: "var(--color-green-900)",
          bgColor: "var(--token-3cf441d7-edfe-47fb-95dc-1899b0597681, #f9f8f4)"
        };
      case "weeklyGoal":
        return {
          icon: "📊",
          title: "Weekly Progress", 
          valueText: `${Math.floor(value / 60)}h ${value % 60}m`,
          targetText: `${Math.floor(target / 60)}h goal`,
          color: "var(--color-blue-600)",
          bgColor: "var(--token-4c81cc5a-0ef3-499f-8b97-80de09631c0a, #ffff94)"
        };
      case "currentStreak":
        return {
          icon: "🔥",
          title: "Current Streak",
          valueText: `${value} days`,
          targetText: `${target} day goal`,
          color: "var(--color-orange-500)",
          bgColor: "var(--token-e8b4cb83-7b8a-4c3a-9db5-c5c5c5c5c5c5, #ffe5cc)"
        };
      case "blockedSites":
        return {
          icon: "🛡️",
          title: "Sites Blocked",
          valueText: `${value} blocked`,
          targetText: value > 0 ? "Great defense!" : "Stay focused",
          color: "var(--color-red-500)",
          bgColor: "var(--token-f5d5d5-8b4a-4c3a-9db5-d5d5d5d5d5d5, #fce5e5)"
        };
      default:
        return {
          icon: "📈",
          title: "Metric",
          valueText: `${value}`,
          targetText: `${target}`,
          color: "var(--color-green-900)",
          bgColor: "var(--surface)"
        };
    }
  };

  if (!mounted) {
    return <div className="h-32 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  const config = getMetricConfig();
  const percentage = Math.min(100, (value / target) * 100);

  return (
    <div 
      className="rounded-xl p-4 transition-all duration-200 hover:scale-105"
      style={{
        background: config.bgColor,
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 3px 0 var(--color-green-900)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <h3 className="text-sm font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            {config.title}
          </h3>
        </div>
        <CircularProgress 
          percentage={percentage} 
          size={48} 
          strokeWidth={4}
          color={config.color}
        />
      </div>
      
      <div className="space-y-1">
        <div className="text-lg font-bold text-neutral-800">
          {config.valueText}
        </div>
        <div className="text-xs text-neutral-600">
          {config.targetText}
        </div>
      </div>

      {/* Progress bar for mobile */}
      <div className="mt-3 md:hidden">
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: config.color
            }}
          />
        </div>
      </div>
    </div>
  );
}
