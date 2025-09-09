"use client";

import { useMemo } from "react";
import { getCharacterDialogue } from "@/lib/characterDialogue";
import { themeUtils } from "@/lib/mbtiThemes";

// No localStorage. Graph uses mock data only.

function toYMD(d) {
  try {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toLocaleDateString("en-CA");
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getLastNDays(n = 7) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ key: toYMD(d), date: d });
  }
  return out;
}

function dayLabel(d) {
  try {
    return d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
  } catch {
    return "";
  }
}

// Create deterministic mock data for the last 7 days without persisting
function mockSessions(personalityType = null) {
  const days = getLastNDays(7);
  
  // Personality-based patterns for more realistic data
  const patterns = {
    // Analysts - Consistent high performers
    INTJ: [45, 75, 90, 60, 85, 70, 40],
    INTP: [25, 60, 45, 90, 70, 35, 55],
    ENTJ: [80, 95, 85, 90, 75, 85, 60],
    ENTP: [40, 85, 30, 70, 60, 45, 75],
    
    // Diplomats - Balanced with purpose-driven spikes
    INFJ: [50, 40, 80, 65, 55, 70, 35],
    INFP: [30, 55, 40, 85, 60, 45, 25],
    ENFJ: [65, 70, 75, 80, 85, 60, 50],
    ENFP: [35, 70, 55, 40, 90, 65, 45],
    
    // Sentinels - Steady and reliable
    ISTJ: [60, 65, 70, 65, 75, 70, 45],
    ISFJ: [45, 60, 55, 70, 65, 60, 40],
    ESTJ: [70, 80, 85, 75, 90, 80, 55],
    ESFJ: [55, 65, 60, 75, 70, 65, 45],
    
    // Explorers - Variable with bursts
    ISTP: [35, 45, 60, 40, 80, 50, 30],
    ISFP: [25, 45, 35, 65, 50, 40, 35],
    ESTP: [50, 75, 40, 85, 60, 70, 55],
    ESFP: [40, 60, 50, 45, 75, 55, 50]
  };
  
  // Default pattern if personality not found or not provided
  const defaultPattern = [15, 35, 65, 45, 80, 95, 25];
  const pattern = patterns[personalityType?.toUpperCase()] || defaultPattern;
  
  return days.map((d, i) => ({ date: d.key, minutes: pattern[i % pattern.length] }));
}

export default function ProductivityGraph({ maxMinutes = 120, personalityType = null }) {
  // Get personality type from localStorage or props
  const mbti = personalityType || (() => {
    try { return localStorage.getItem("mindshift_personality_type") || ""; } catch { return ""; }
  })();
  
  // Personality-specific messaging
  const personalityContext = useMemo(() => {
    if (!mbti) return { title: "Productivity (7 days)", subtitle: "Track your focus patterns" };
    
    const messages = {
      INTJ: { title: "Strategic Progress", subtitle: "Building systematic focus habits" },
      INTP: { title: "Analysis Patterns", subtitle: "Exploring your productivity rhythms" },
      ENTJ: { title: "Leadership Metrics", subtitle: "Driving consistent performance" },
      ENTP: { title: "Innovation Tracker", subtitle: "Balancing focus with creativity" },
      INFJ: { title: "Mindful Progress", subtitle: "Aligning actions with purpose" },
      INFP: { title: "Authentic Journey", subtitle: "Growing at your own pace" },
      ENFJ: { title: "Inspiring Growth", subtitle: "Leading by example" },
      ENFP: { title: "Enthusiastic Momentum", subtitle: "Riding the waves of inspiration" },
      ISTJ: { title: "Steady Progress", subtitle: "Building reliable habits" },
      ISFJ: { title: "Caring Consistency", subtitle: "Supporting your wellbeing" },
      ESTJ: { title: "Achievement Tracker", subtitle: "Meeting your commitments" },
      ESFJ: { title: "Collaborative Growth", subtitle: "Succeeding together" },
      ISTP: { title: "Practical Results", subtitle: "Efficient focus sessions" },
      ISFP: { title: "Personal Rhythm", subtitle: "Finding your flow" },
      ESTP: { title: "Dynamic Progress", subtitle: "Adapting and achieving" },
      ESFP: { title: "Energetic Journey", subtitle: "Celebrating every step" }
    };
    
    return messages[mbti.toUpperCase()] || { title: "Productivity (7 days)", subtitle: "Track your focus patterns" };
  }, [mbti]);

  const data = useMemo(() => {
    const days = getLastNDays(7);
    const source = mockSessions(mbti); // Pass personality type for tailored data
    const byDate = source.reduce((acc, s) => {
      acc[s.date] = (acc[s.date] || 0) + s.minutes;
      return acc;
    }, {});
    return days.map(({ key, date }) => ({
      key,
      label: dayLabel(date),
      minutes: Math.max(0, Math.min(maxMinutes, byDate[key] || 0)),
      fullMinutes: byDate[key] || 0,
      isToday: toYMD(new Date()) === key,
    }));
  }, [maxMinutes, mbti]); // Include mbti in dependencies

  const peak = Math.max(1, ...data.map((d) => d.minutes));

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className="rounded-xl p-4 backdrop-blur-sm"
        style={{
          background: "rgba(249, 248, 244, 0.85)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 4px 20px rgba(3, 89, 77, 0.15)",
        }}
      >
        <div className="mb-4">
          <div className="text-center">
            <h2 className="text-base md:text-lg font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>
              {personalityContext.title}
            </h2>
            {mbti && (
              <div className="text-sm text-neutral-600 mt-1">
                {personalityContext.subtitle}
              </div>
            )}
            <div className="text-xs text-neutral-500 font-medium mt-2">
              {mbti && <span className="text-green font-medium">{mbti} • </span>}Last 7 days
            </div>
          </div>
        </div>

        <div className="h-40 md:h-48 flex items-end gap-3 px-4 py-3 bg-gray-50 rounded-lg">
          {data.map((d) => {
            // Calculate height in pixels instead of percentage
            const maxHeight = 140; // Increased max height to fill the card better
            const h = Math.max(20, Math.round((d.minutes / peak) * maxHeight));
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative flex items-end justify-center group w-full" title={`${d.fullMinutes} minutes on ${d.key}`}>
                  <div
                    className="rounded-t-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                    style={{ 
                      width: "24px",
                      height: `${h}px`,
                      background: d.isToday 
                        ? "linear-gradient(45deg, #035947, #059669)" // Gradient for today
                        : "linear-gradient(45deg, rgba(3, 89, 77, 0.8), rgba(5, 150, 105, 0.6))", // Gradient for other days
                      boxShadow: d.isToday ? "0 3px 12px rgba(3, 89, 77, 0.5)" : "0 2px 6px rgba(3, 89, 77, 0.3)",
                      minHeight: "20px", // Ensure bars are always visible
                      border: "1px solid rgba(3, 89, 77, 0.3)"
                    }}
                  />
                </div>
                <div className={`text-sm font-medium ${d.isToday ? "font-bold" : ""}`} style={{ color: d.isToday ? "#035947" : "#6b7280" }}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-3 border-t flex justify-between text-sm" style={{ borderColor: "rgba(3, 89, 77, 0.1)" }}>
          <div className="text-neutral-600 text-center">
            <div className="font-medium">Total</div>
            <div className="text-green font-bold text-base">{data.reduce((sum, d) => sum + d.fullMinutes, 0)}m</div>
          </div>
          <div className="text-neutral-600 text-center">
            <div className="font-medium">Avg</div>
            <div className="text-green font-bold text-base">{Math.round(data.reduce((sum, d) => sum + d.fullMinutes, 0) / 7)}m/day</div>
          </div>
          <div className="text-neutral-600 text-center">
            <div className="font-medium">Best</div>
            <div className="text-green font-bold text-base">{Math.max(...data.map(d => d.fullMinutes))}m</div>
          </div>
        </div>
      </div>
    </div>
  );
}
