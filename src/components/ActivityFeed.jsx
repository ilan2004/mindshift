"use client";

import { useEffect, useState } from "react";

function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function generateMockPeerActivities() {
  const names = ["Ilan", "Hadee", "Rohan", "Sarah", "Alex", "Maya", "David", "Emma"];
  const activities = [
    { type: "completion", templates: ["completed a 45min Deep Work session", "finished 90min Research Block", "wrapped up 25min Pomodoro"] },
    { type: "achievement", templates: ["hit a 7-day streak!", "earned 'Focus Master' badge", "reached 100 total hours", "unlocked 'Week Warrior'"] },
    { type: "challenge", templates: ["joined the 10h Focus Week challenge", "leading the Daily Streak challenge", "completed Social Nudge challenge"] },
    { type: "milestone", templates: ["reached 500 focus points", "blocked 100 distractions today", "maintained focus for 3 hours straight"] }
  ];

  const mockActivities = [];
  const now = Date.now();

  for (let i = 0; i < 8; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const template = activity.templates[Math.floor(Math.random() * activity.templates.length)];
    
    mockActivities.push({
      id: `mock-${i}`,
      type: activity.type,
      user: name,
      message: template,
      timestamp: now - Math.random() * 7200000, // Random time within last 2 hours
      icon: activity.type === "completion" ? "✅" : 
            activity.type === "achievement" ? "🏆" : 
            activity.type === "challenge" ? "🎯" : "🌟"
    });
  }

  return mockActivities.sort((a, b) => b.timestamp - a.timestamp);
}

function getStoredActivities() {
  try {
    const stored = localStorage.getItem("mindshift_activity_feed") || "[]";
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveActivity(activity) {
  try {
    const activities = getStoredActivities();
    const updated = [activity, ...activities].slice(0, 50); // Keep last 50 activities
    localStorage.setItem("mindshift_activity_feed", JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

function addUserActivity(type, message) {
  const activity = {
    id: `user-${Date.now()}`,
    type,
    user: "You",
    message,
    timestamp: Date.now(),
    icon: type === "completion" ? "✅" : 
          type === "achievement" ? "🎖️" : 
          type === "start" ? "🚀" : "💫"
  };
  
  return saveActivity(activity);
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load stored activities and add mock peer activities
    const storedActivities = getStoredActivities();
    const mockPeerActivities = generateMockPeerActivities();
    const combined = [...storedActivities, ...mockPeerActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 15); // Show latest 15 activities
      
    setActivities(combined);

    // Listen for session completions and other events
    const handleSessionCompleted = (event) => {
      const minutes = event.detail?.minutes || 0;
      if (minutes > 0) {
        const message = `completed ${minutes}min focus session`;
        const updated = addUserActivity("completion", message);
        
        // Refresh with latest activities including new user activity
        const mockActivities = generateMockPeerActivities();
        const combined = [...updated, ...mockActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 15);
        setActivities(combined);
      }
    };

    const handleFocusStart = (event) => {
      const template = event.detail?.template || "focus session";
      const message = `started ${template}`;
      const updated = addUserActivity("start", message);
      
      const mockActivities = generateMockPeerActivities();
      const combined = [...updated, ...mockActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 15);
      setActivities(combined);
    };

    const handleAchievement = () => {
      // This could be triggered by streak milestones, etc.
      const achievements = [
        "earned 'Daily Warrior' badge",
        "reached new streak milestone",
        "unlocked productivity achievement"
      ];
      const message = achievements[Math.floor(Math.random() * achievements.length)];
      const updated = addUserActivity("achievement", message);
      
      const mockActivities = generateMockPeerActivities();
      const combined = [...updated, ...mockActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 15);
      setActivities(combined);
    };

    window.addEventListener("mindshift:session:completed", handleSessionCompleted);
    window.addEventListener("mindshift:focus:start_template", handleFocusStart);
    window.addEventListener("mindshift:achievement:unlocked", handleAchievement);

    // Refresh peer activities every 30 seconds to simulate real-time
    const refreshInterval = setInterval(() => {
      const stored = getStoredActivities();
      const newMockActivities = generateMockPeerActivities();
      const combined = [...stored, ...newMockActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 15);
      setActivities(combined);
    }, 30000);

    return () => {
      window.removeEventListener("mindshift:session:completed", handleSessionCompleted);
      window.removeEventListener("mindshift:focus:start_template", handleFocusStart);
      window.removeEventListener("mindshift:achievement:unlocked", handleAchievement);
      clearInterval(refreshInterval);
    };
  }, []);

  const getActivityStyle = (type) => {
    switch (type) {
      case "completion":
        return "border-green-200 bg-green-50";
      case "achievement": 
        return "border-yellow-200 bg-yellow-50";
      case "challenge":
        return "border-blue-200 bg-blue-50";
      case "milestone":
        return "border-purple-200 bg-purple-50";
      case "start":
        return "border-cyan-200 bg-cyan-50";
      default:
        return "border-neutral-200 bg-neutral-50";
    }
  };

  if (!mounted) {
    return <div className="h-80 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  return (
    <div 
      className="rounded-xl p-4 md:p-6 h-80 flex flex-col"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📱</span>
          <h2 className="text-lg font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            Activity Feed
          </h2>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live updates" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg border transition-all duration-200 hover:scale-102 ${getActivityStyle(activity.type)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-sm ${activity.user === "You" ? "text-green-700" : "text-neutral-700"}`}>
                    {activity.user}
                  </span>
                  <span className="text-xs text-neutral-500">{timeAgo(activity.timestamp)}</span>
                </div>
                <div className="text-sm text-neutral-600 leading-relaxed">
                  {activity.message}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <span className="text-4xl mb-2">📈</span>
            <p className="text-sm text-center">
              Your activity will appear here.<br />
              Start a focus session to see it in action!
            </p>
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 text-center">
            Updates automatically • {activities.length} recent activities
          </div>
        </div>
      )}
    </div>
  );
}
