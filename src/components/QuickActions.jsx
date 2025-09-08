"use client";

import { useState, useEffect } from "react";

function getLastUsedDuration() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_recent_sessions") || "[]");
    return sessions[0]?.duration || 25;
  } catch {
    return 25;
  }
}

function getCurrentUrl() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.replace(/^www\./, "");
}

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startQuickFocus = () => {
    const duration = getLastUsedDuration();
    
    // Dispatch focus session start
    try {
      const event = new CustomEvent("mindshift:focus:start_template", {
        detail: { duration, template: "Quick Focus" }
      });
      window.dispatchEvent(event);
    } catch {}

    // Send message to extension
    try {
      window.postMessage({
        type: "mindshift:focus",
        action: "startSession", 
        payload: { durationMinutes: duration }
      }, "*");
    } catch {}

    setIsOpen(false);
  };

  const quickBlock = () => {
    const domain = getCurrentUrl();
    if (!domain) return;

    // Add to blocked domains
    try {
      const blocked = JSON.parse(localStorage.getItem("mindshift_blocked_domains") || "[]");
      if (!blocked.includes(domain)) {
        blocked.push(domain);
        localStorage.setItem("mindshift_blocked_domains", JSON.stringify(blocked));
        
        // Send to extension
        window.postMessage({
          type: "mindshift:focus",
          action: "updateBlocklist",
          payload: { domains: blocked }
        }, "*");
      }
    } catch {}

    setIsOpen(false);
  };

  const startBreak = () => {
    // Start 5-minute break
    try {
      window.postMessage({
        type: "mindshift:focus",
        action: "startBreak",
        payload: { durationMinutes: 5 }
      }, "*");
    } catch {}

    setIsOpen(false);
  };

  const sendBuddyNudge = () => {
    // Mock buddy nudge - in real app this would send to a peer
    try {
      const event = new CustomEvent("mindshift:achievement:unlocked", {
        detail: { achievement: "Supportive Buddy" }
      });
      window.dispatchEvent(event);
    } catch {}
    
    // Add activity
    try {
      const activities = JSON.parse(localStorage.getItem("mindshift_activity_feed") || "[]");
      const newActivity = {
        id: `buddy-${Date.now()}`,
        type: "social",
        user: "You",
        message: "sent a motivational nudge to a peer",
        timestamp: Date.now(),
        icon: "🤗"
      };
      activities.unshift(newActivity);
      localStorage.setItem("mindshift_activity_feed", JSON.stringify(activities.slice(0, 50)));
    } catch {}

    setIsOpen(false);
  };

  if (!mounted) {
    return null;
  }

  const actions = [
    {
      id: "focus",
      label: "Start Focus",
      icon: "🎯",
      bgColor: "bg-green-500",
      action: startQuickFocus
    },
    {
      id: "block",
      label: "Block Site",
      icon: "🛡️", 
      bgColor: "bg-red-500",
      action: quickBlock
    },
    {
      id: "break",
      label: "Take Break",
      icon: "☕",
      bgColor: "bg-blue-500",
      action: startBreak
    },
    {
      id: "nudge",
      label: "Buddy Nudge",
      icon: "🤗",
      bgColor: "bg-purple-500",
      action: sendBuddyNudge
    }
  ];

  return (
    <>
      {/* Mobile Quick Actions - only show on mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        {/* Action buttons - show when open */}
        <div className={`transition-all duration-300 ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}`}>
          <div className="flex flex-col gap-3 mb-4">
            {actions.map((action, index) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`w-12 h-12 rounded-full ${action.bgColor} text-white shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center text-lg`}
                style={{
                  transform: isOpen ? `translateY(${-60 * (index + 1)}px)` : 'translateY(0)',
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                }}
                title={action.label}
              >
                <span>{action.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center ${isOpen ? "rotate-45" : ""}`}
          style={{
            background: "var(--color-green-900)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          <span className="text-xl">{isOpen ? "✕" : "⚡"}</span>
        </button>
      </div>

      {/* Desktop Quick Actions Bar - show on larger screens */}
      <div className="hidden md:block fixed top-1/2 right-6 transform -translate-y-1/2 z-40">
        <div 
          className="flex flex-col gap-3 p-3 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
          }}
        >
          <div className="text-xs font-semibold text-neutral-700 text-center mb-1">
            Quick Actions
          </div>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`w-10 h-10 rounded-lg ${action.bgColor} text-white hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-sm group relative`}
              title={action.label}
            >
              <span className="text-sm">{action.icon}</span>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background overlay when mobile menu is open */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
