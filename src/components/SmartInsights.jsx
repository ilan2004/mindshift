"use client";

import { useEffect, useState, useMemo } from "react";

function getPersonalityType() {
  try {
    return localStorage.getItem("mindshift_personality_type") || "";
  } catch {
    return "";
  }
}

function getFocusSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_focus_sessions") || "[]");
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function getBlockedAttempts() {
  try {
    return Number(localStorage.getItem("mindshift_blocked_today")) || 0;
  } catch {
    return 0;
  }
}

function getCurrentStreak() {
  try {
    return Number(localStorage.getItem("mindshift_streak")) || 0;
  } catch {
    return 0;
  }
}

// Simulated AI insights based on personality and usage patterns
const PERSONALITY_INSIGHTS = {
  INTJ: {
    patterns: ["You focus best in 90+ minute blocks", "Deep work sessions yield highest productivity", "Mornings show peak performance"],
    recommendations: ["Try 2-hour 'Architect Blocks' for complex problems", "Schedule demanding work between 9-11 AM", "Use background noise for deeper focus"],
    tips: ["Your analytical mind thrives on uninterrupted time", "Consider the 'Rule of 3' - three major outcomes per session"]
  },
  INTP: {
    patterns: ["Irregular but intense focus patterns", "Research-heavy sessions perform well", "Afternoon creativity spikes"],
    recommendations: ["Flexible session lengths based on interest level", "Follow curiosity-driven focus themes", "Explore ideas before executing"],
    tips: ["Your curiosity is your superpower - follow interesting tangents", "Break complex problems into theoretical components"]
  },
  ENTJ: {
    patterns: ["Consistent high-intensity sessions", "Goal-oriented outcomes", "Strong completion rates"],
    recommendations: ["45-minute 'Results Sprints' with clear outcomes", "Time-box decisions to maintain momentum", "Use productivity metrics for motivation"],
    tips: ["Your leadership shines when you set ambitious session goals", "Track measurable progress within each focus block"]
  },
  ENTP: {
    patterns: ["Variable session lengths", "High creativity periods", "Project-jumping tendencies"],
    recommendations: ["30-45 minute bursts with variety", "Rotate between different project types", "Use idea capture during focus"],
    tips: ["Your innovation thrives on fresh perspectives", "Keep an 'idea parking lot' for tangential thoughts"]
  },
  INFJ: {
    patterns: ["Meaningful work drives longest sessions", "Purpose-clarity improves focus", "Reflective breaks enhance productivity"],
    recommendations: ["Start sessions with 'why' reflection", "Align daily work with larger vision", "Use mindful transitions between tasks"],
    tips: ["Your intuition guides optimal work selection", "Connect today's tasks to your bigger purpose"]
  },
  INFP: {
    patterns: ["Value-aligned work shows best focus", "Creative sessions run longer", "Energy varies with personal meaning"],
    recommendations: ["Match tasks to your energy and values", "Create aesthetically pleasing work environment", "Honor your natural rhythms"],
    tips: ["Your authenticity powers sustainable focus", "Work on projects that resonate with your core values"]
  },
  ENFJ: {
    patterns: ["People-focused work drives engagement", "Collaboration boosts energy", "Teaching moments extend focus"],
    recommendations: ["Include helping others in focus goals", "Share progress with accountability partners", "Use focus time for growth activities"],
    tips: ["Your impact on others motivates sustained effort", "Frame solo work as preparation to better serve others"]
  },
  ENFP: {
    patterns: ["Enthusiasm creates focus bursts", "Social elements improve engagement", "New challenges maintain interest"],
    recommendations: ["Keep sessions fresh and varied", "Include social accountability elements", "Start sessions with inspiring content"],
    tips: ["Your enthusiasm is contagious - share your focus journey", "Celebrate small wins to maintain momentum"]
  },
  // Sentinels
  ISTJ: {
    patterns: ["Consistent daily focus habits", "Structured approaches work best", "Steady progress over time"],
    recommendations: ["Create detailed session templates", "Use checklists and structured approaches", "Maintain consistent daily schedule"],
    tips: ["Your reliability builds powerful long-term habits", "Trust your systematic approach to complex work"]
  },
  ISFJ: {
    patterns: ["Quiet environments optimize focus", "Helping others increases motivation", "Gentle progress prevents burnout"],
    recommendations: ["Create calm, organized workspace", "Include service elements in goals", "Use gentle accountability methods"],
    tips: ["Your caring nature can extend to self-care in focus habits", "Small consistent steps create major transformations"]
  },
  ESTJ: {
    patterns: ["Efficient goal-oriented sessions", "Strong organizational systems", "Results-driven metrics"],
    recommendations: ["Clear objectives for every session", "Use time-blocking and scheduling", "Track progress with detailed metrics"],
    tips: ["Your executive skills shine in focus management", "Lead by example in productivity habits"]
  },
  ESFJ: {
    patterns: ["Team collaboration enhances focus", "Harmony in environment matters", "Helping others provides energy"],
    recommendations: ["Include others in focus goals", "Create harmonious work environment", "Share progress with supportive community"],
    tips: ["Your collaborative spirit can make focus social", "Consider group focus sessions or study partners"]
  },
  // Explorers
  ISTP: {
    patterns: ["Hands-on work extends focus naturally", "Problem-solving drives engagement", "Practical outcomes motivate"],
    recommendations: ["Focus on concrete, tangible outcomes", "Include building/making in sessions", "Use tools and techniques that feel natural"],
    tips: ["Your practical skills turn abstract goals into reality", "Trust your ability to find efficient solutions"]
  },
  ISFP: {
    patterns: ["Creative work flows naturally", "Personal expression increases engagement", "Aesthetic environment matters"],
    recommendations: ["Include creative elements in focus time", "Personalize your workspace", "Follow your authentic interests"],
    tips: ["Your artistic sensibility can make any work more engaging", "Create beauty in your process, not just outcomes"]
  },
  ESTP: {
    patterns: ["Action-oriented sessions perform best", "Quick wins maintain momentum", "Social elements add energy"],
    recommendations: ["Keep sessions dynamic and engaging", "Focus on immediate, visible results", "Include movement and variety"],
    tips: ["Your energy creates momentum for others too", "Make focus sessions feel like engaging challenges"]
  },
  ESFP: {
    patterns: ["Fun elements increase focus duration", "Social connections boost energy", "Positive environment is key"],
    recommendations: ["Make focus time enjoyable and social", "Celebrate progress frequently", "Include people and play"],
    tips: ["Your joy can transform work into celebration", "Share your focus journey to inspire others"]
  }
};

function generateInsights(personalityType, sessions, streak, blockedAttempts) {
  const personality = personalityType.toUpperCase();
  const personalityData = PERSONALITY_INSIGHTS[personality];
  
  if (!personalityData) {
    return {
      patterns: ["Building your unique focus patterns", "Every session teaches us more about your style"],
      recommendations: ["Try different session lengths to find your optimal rhythm", "Pay attention to what time of day you focus best"],
      tips: ["Consistency beats perfection in building focus habits"]
    };
  }

  const insights = {
    patterns: [...personalityData.patterns],
    recommendations: [...personalityData.recommendations],
    tips: [...personalityData.tips]
  };

  // Add dynamic insights based on actual usage
  if (sessions.length > 5) {
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const avgSession = Math.round(totalMinutes / sessions.length);
    insights.patterns.push(`Your average session length is ${avgSession} minutes`);
    
    if (avgSession < 25) {
      insights.recommendations.push("Try gradually extending sessions by 5-10 minutes");
    } else if (avgSession > 90) {
      insights.recommendations.push("Consider shorter, more frequent sessions to avoid burnout");
    }
  }

  if (streak > 0) {
    insights.patterns.push(`${streak}-day streak shows excellent consistency`);
    if (streak >= 7) {
      insights.tips.push("Your weekly consistency is building powerful neural pathways");
    }
  }

  if (blockedAttempts > 5) {
    insights.patterns.push("High distraction blocking suggests challenging environment");
    insights.recommendations.push("Consider changing your physical environment during focus time");
  }

  return insights;
}

export default function SmartInsights() {
  const [mounted, setMounted] = useState(false);
  const [personalityType, setPersonalityType] = useState("");
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [blockedAttempts, setBlockedAttempts] = useState(0);

  useEffect(() => {
    setMounted(true);
    setPersonalityType(getPersonalityType());
    setSessions(getFocusSessions());
    setStreak(getCurrentStreak());
    setBlockedAttempts(getBlockedAttempts());

    // Listen for updates
    const handleUpdate = () => {
      setSessions(getFocusSessions());
      setStreak(getCurrentStreak());
      setBlockedAttempts(getBlockedAttempts());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("mindshift:session:completed", handleUpdate);
    window.addEventListener("mindshift:counters:update", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("mindshift:session:completed", handleUpdate);
      window.removeEventListener("mindshift:counters:update", handleUpdate);
    };
  }, []);

  const insights = useMemo(() => {
    if (!mounted) return { patterns: [], recommendations: [], tips: [] };
    return generateInsights(personalityType, sessions, streak, blockedAttempts);
  }, [mounted, personalityType, sessions, streak, blockedAttempts]);

  if (!mounted) {
    return <div className="h-80 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  const InsightSection = ({ title, items, icon, bgColor = "bg-blue-50", borderColor = "border-blue-200" }) => (
    <div className={`p-4 rounded-lg ${bgColor} ${borderColor} border`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-sm text-neutral-800">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.slice(0, 2).map((item, index) => (
          <div key={index} className="text-sm text-neutral-700 leading-relaxed">
            • {item}
          </div>
        ))}
      </div>
    </div>
  );

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
          <span className="text-2xl">🧠</span>
          <h2 className="text-lg md:text-xl font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
            Smart Insights
          </h2>
        </div>
        {personalityType && (
          <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
            {personalityType.toUpperCase()}-powered
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InsightSection 
          title="Your Patterns" 
          items={insights.patterns}
          icon="📊"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
        <InsightSection 
          title="Recommendations" 
          items={insights.recommendations}
          icon="💡"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
        />
        <InsightSection 
          title="Pro Tips" 
          items={insights.tips}
          icon="⚡"
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="text-lg font-bold text-neutral-800">{sessions.length}</div>
          <div className="text-xs text-neutral-600">Total Sessions</div>
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="text-lg font-bold text-neutral-800">
            {Math.round(sessions.reduce((sum, s) => sum + (s.minutes || 0), 0) / 60 * 10) / 10}h
          </div>
          <div className="text-xs text-neutral-600">Total Focus</div>
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="text-lg font-bold text-neutral-800">{streak}</div>
          <div className="text-xs text-neutral-600">Day Streak</div>
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="text-lg font-bold text-neutral-800">{blockedAttempts}</div>
          <div className="text-xs text-neutral-600">Sites Blocked</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200 text-center">
        <div className="text-xs text-neutral-500">
          Insights powered by your {personalityType ? `${personalityType.toUpperCase()} personality` : "usage patterns"} • Updates in real-time
        </div>
      </div>
    </div>
  );
}
