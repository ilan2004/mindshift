"use client";

import { useEffect, useState, useMemo } from "react";

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
    return d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);
  } catch {
    return "";
  }
}

function getFocusSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem("Nudge_focus_sessions") || "[]");
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function getHourlyData() {
  // Mock hourly productivity data - in real app this would come from session timestamps
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    let intensity = 0;
    
    // Simulate typical productivity patterns
    if (hour >= 9 && hour <= 11) intensity = Math.random() * 0.8 + 0.2; // Morning peak
    else if (hour >= 14 && hour <= 16) intensity = Math.random() * 0.9 + 0.1; // Afternoon peak
    else if (hour >= 19 && hour <= 21) intensity = Math.random() * 0.6 + 0.1; // Evening
    else if (hour >= 22 || hour <= 6) intensity = Math.random() * 0.1; // Night/early morning
    else intensity = Math.random() * 0.4 + 0.1; // Other times
    
    return {
      hour,
      intensity: Math.round(intensity * 100) / 100,
      sessions: Math.floor(intensity * 3),
      label: hour === 0 ? "12a" : hour <= 11 ? `${hour}a` : hour === 12 ? "12p" : `${hour-12}p`
    };
  });
  
  return hours;
}

function getDistractionData() {
  // Mock distraction timeline data
  const days = getLastNDays(7);
  return days.map(({ key, date }) => {
    const attempts = Math.floor(Math.random() * 20) + 5;
    const blocked = Math.floor(attempts * (0.7 + Math.random() * 0.3));
    return {
      date: key,
      dayLabel: dayLabel(date),
      attempts,
      blocked,
      success_rate: Math.round((blocked / attempts) * 100)
    };
  });
}

function getFocusQualityData() {
  // Mock focus quality ratings
  const sessions = getFocusSessions();
  if (sessions.length === 0) {
    return { average: 0, trend: "stable", distribution: { excellent: 0, good: 0, fair: 0, poor: 0 }};
  }
  
  // Mock quality scores
  const qualities = sessions.map(() => Math.floor(Math.random() * 5) + 1); // 1-5 scale
  const average = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
  
  const distribution = {
    excellent: qualities.filter(q => q === 5).length,
    good: qualities.filter(q => q === 4).length,
    fair: qualities.filter(q => q === 3).length,
    poor: qualities.filter(q => q <= 2).length,
  };
  
  return { average, trend: "improving", distribution };
}

export default function ProductivityInsights({ maxMinutes = 120 }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const weeklyData = useMemo(() => {
    const days = getLastNDays(7);
    const sessions = getFocusSessions();
    const byDate = sessions.reduce((acc, s) => {
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
  }, [maxMinutes]);

  const hourlyData = useMemo(() => getHourlyData(), []);
  const distractionData = useMemo(() => getDistractionData(), []);
  const qualityData = useMemo(() => getFocusQualityData(), []);

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  const peak = Math.max(1, ...weeklyData.map((d) => d.minutes));

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "hourly", label: "Hourly", icon: "⏰" },
    { id: "distractions", label: "Blocked", icon: "🛡️" },
    { id: "quality", label: "Quality", icon: "⭐" }
  ];

  const HeatmapCell = ({ hour, intensity }) => {
    const opacity = Math.max(0.1, intensity);
    return (
      <div
        className="w-6 h-6 rounded-sm border border-neutral-200 flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: `rgba(34, 197, 94, ${opacity})`,
          color: intensity > 0.5 ? "white" : "rgb(64, 64, 64)"
        }}
        title={`${hour.label}: ${Math.round(intensity * 100)}% productivity`}
      >
        {hour.sessions > 0 ? hour.sessions : ""}
      </div>
    );
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto px-2 md:px-3 mt-4"
    >
      <div 
        className="rounded-xl p-3 md:p-4"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 3px 0 var(--color-green-900)",
        }}
      >
        {/* Header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>
            Productivity Insights
          </h2>
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
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

        {/* Tab content */}
        <div className="min-h-48">
          {activeTab === "overview" && (
            <div>
              <div className="text-xs text-neutral-500 font-medium mb-3">
                Focus Time (7 days) • Max {maxMinutes}m cap
              </div>
              <div className="h-32 md:h-36 flex items-end gap-2 px-1">
                {weeklyData.map((d) => {
                  const h = Math.max(8, Math.round((d.minutes / peak) * 100));
                  return (
                    <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5 md:gap-2">
                      <div className="relative w-4 md:w-6 flex items-end justify-center" title={`${d.fullMinutes} min`}>
                        <div
                          className="w-full rounded-lg transition-all duration-300"
                          style={{ 
                            height: `${h}%`,
                            background: d.isToday ? "var(--color-green-900)" : "var(--color-green-900-60)"
                          }}
                        />
                      </div>
                      <div className={`text-xs font-medium ${d.isToday ? "font-semibold" : ""}`} 
                           style={{ color: d.isToday ? "var(--color-green-900)" : "var(--color-neutral-600)" }}>
                        {d.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "hourly" && (
            <div>
              <div className="text-xs text-neutral-500 font-medium mb-3">
                Hourly Productivity Heatmap • Focus sessions per hour
              </div>
              <div className="grid grid-cols-12 gap-1">
                {hourlyData.map((hour) => (
                  <HeatmapCell key={hour.hour} hour={hour} intensity={hour.intensity} />
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
                <span>12a</span>
                <span>6a</span>
                <span>12p</span>
                <span>6p</span>
                <span>11p</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-neutral-600">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
                    <div 
                      key={i}
                      className="w-3 h-3 rounded-sm border border-neutral-200"
                      style={{ backgroundColor: `rgba(34, 197, 94, ${opacity})` }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          )}

          {activeTab === "distractions" && (
            <div>
              <div className="text-xs text-neutral-500 font-medium mb-3">
                Distraction Blocking • Success rate over 7 days
              </div>
              <div className="space-y-3">
                {distractionData.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <div className="w-8 text-xs font-medium text-neutral-600">
                      {day.dayLabel}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                        <span>{day.blocked}/{day.attempts} blocked</span>
                        <span>{day.success_rate}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${day.success_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-sm font-bold text-green-700">85%</div>
                  <div className="text-xs text-green-600">Avg Success</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-sm font-bold text-blue-700">92</div>
                  <div className="text-xs text-blue-600">Total Blocked</div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <div className="text-sm font-bold text-purple-700">18</div>
                  <div className="text-xs text-purple-600">Slip-ups</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "quality" && (
            <div>
              <div className="text-xs text-neutral-500 font-medium mb-3">
                Focus Quality • Self-rated session effectiveness
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {qualityData.average.toFixed(1)}/5
                    </div>
                    <div className="text-xs text-neutral-600">Average Quality</div>
                    <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                      <span>↗</span>
                      <span className="capitalize">{qualityData.trend}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Excellent", count: qualityData.distribution.excellent, color: "bg-green-500" },
                    { label: "Good", count: qualityData.distribution.good, color: "bg-blue-500" },
                    { label: "Fair", count: qualityData.distribution.fair, color: "bg-yellow-500" },
                    { label: "Poor", count: qualityData.distribution.poor, color: "bg-red-500" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-xs text-neutral-600 flex-1">{item.label}</span>
                      <span className="text-xs font-medium text-neutral-700">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Rate your sessions after completing them to track quality trends and identify optimal focus patterns.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
