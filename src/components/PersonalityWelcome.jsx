"use client";

import { useEffect, useMemo, useState } from "react";
import TextReveal from "./TextReveal";

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

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

function getTodayFocusMinutes() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_focus_sessions") || "[]");
    const today = new Date().toLocaleDateString("en-CA");
    const todaySession = sessions.find(s => s.date === today);
    return todaySession?.minutes || 0;
  } catch {
    return 0;
  }
}

const PERSONALITY_GREETINGS = {
  // Analysts
  INTJ: {
    morning: ["Strategic morning, Architect!", "Time to build your vision", "Your focused mind leads the way"],
    afternoon: ["Systems check, Architect", "Deep work time approaches", "Execute your master plan"],
    evening: ["Reflect and strategize, Architect", "Evening optimization time", "Tomorrow's blueprint awaits"]
  },
  INTP: {
    morning: ["Curious morning, Thinker!", "New ideas await discovery", "Your analytical mind is ready"],
    afternoon: ["Problem-solving time, Thinker", "Dive deep into complexity", "Connect those dots"],
    evening: ["Evening contemplation, Thinker", "Synthesize today's insights", "Theory meets practice"]
  },
  ENTJ: {
    morning: ["Leadership morning, Commander!", "Goals await your execution", "Time to make things happen"],
    afternoon: ["Command the day, Commander", "Drive results and progress", "Your vision shapes reality"],
    evening: ["Review and conquer, Commander", "Tomorrow's victories planned", "Excellence never rests"]
  },
  ENTP: {
    morning: ["Innovative morning, Debater!", "New possibilities emerge", "Your creativity knows no bounds"],
    afternoon: ["Brainstorm and build, Debater", "Challenge the status quo", "Ideas become reality"],
    evening: ["Connect and create, Debater", "Evening inspiration flows", "Tomorrow's innovations await"]
  },

  // Diplomats  
  INFJ: {
    morning: ["Mindful morning, Advocate!", "Purpose guides your path", "Inner wisdom leads today"],
    afternoon: ["Meaningful work, Advocate", "Create positive change", "Your vision inspires others"],
    evening: ["Reflective evening, Advocate", "Today's impact considered", "Tomorrow's purpose clarified"]
  },
  INFP: {
    morning: ["Authentic morning, Mediator!", "Follow your true path", "Creative spirit awakens"],
    afternoon: ["Values-driven work, Mediator", "Stay true to yourself", "Make it meaningful"],
    evening: ["Gentle evening, Mediator", "Honor today's journey", "Rest and recharge"]
  },
  ENFJ: {
    morning: ["Inspiring morning, Protagonist!", "Lift others as you rise", "Your energy uplifts all"],
    afternoon: ["Nurture and grow, Protagonist", "Help others succeed", "Lead with your heart"],
    evening: ["Community evening, Protagonist", "Celebrate shared wins", "Tomorrow we grow together"]
  },
  ENFP: {
    morning: ["Enthusiastic morning, Campaigner!", "Adventure calls your name", "Possibilities are endless"],
    afternoon: ["Energize and explore, Campaigner", "Share your passion", "Inspire and be inspired"],
    evening: ["Social evening, Campaigner", "Connect and celebrate", "Dream big for tomorrow"]
  },

  // Sentinels
  ISTJ: {
    morning: ["Steady morning, Logistician!", "Consistent progress ahead", "Discipline builds success"],
    afternoon: ["Methodical work, Logistician", "Step by step to victory", "Reliability is strength"],
    evening: ["Organized evening, Logistician", "Today's tasks completed", "Tomorrow well prepared"]
  },
  ISFJ: {
    morning: ["Caring morning, Protector!", "Support others' growth", "Quiet strength serves all"],
    afternoon: ["Helpful work, Protector", "Make others' day better", "Service brings fulfillment"],
    evening: ["Peaceful evening, Protector", "Rest after giving much", "Tomorrow's care awaits"]
  },
  ESTJ: {
    morning: ["Productive morning, Executive!", "Efficiency drives results", "Leadership starts now"],
    afternoon: ["Execute the plan, Executive", "Organize and optimize", "Results speak loudest"],
    evening: ["Achievement evening, Executive", "Goals conquered today", "Tomorrow's targets set"]
  },
  ESFJ: {
    morning: ["Supportive morning, Consul!", "Harmony guides your way", "Team success starts here"],
    afternoon: ["Collaborative work, Consul", "Bring people together", "Shared wins are best"],
    evening: ["Connected evening, Consul", "Relationships nurtured", "Community strengthened"]
  },

  // Explorers
  ISTP: {
    morning: ["Practical morning, Virtuoso!", "Hands-on solutions await", "Master your craft today"],
    afternoon: ["Skillful work, Virtuoso", "Problem-solve with finesse", "Tools and technique unite"],
    evening: ["Crafted evening, Virtuoso", "Today's work speaks volumes", "Skills sharpened for tomorrow"]
  },
  ISFP: {
    morning: ["Creative morning, Adventurer!", "Beauty surrounds your work", "Express your true self"],
    afternoon: ["Artistic work, Adventurer", "Create something beautiful", "Stay authentic and free"],
    evening: ["Aesthetic evening, Adventurer", "Appreciate today's beauty", "Tomorrow's canvas awaits"]
  },
  ESTP: {
    morning: ["Dynamic morning, Entrepreneur!", "Action creates opportunity", "Seize the moment now"],
    afternoon: ["Active work, Entrepreneur", "Make things happen fast", "Energy drives results"],
    evening: ["Social evening, Entrepreneur", "Celebrate today's wins", "Tomorrow's adventures await"]
  },
  ESFP: {
    morning: ["Joyful morning, Entertainer!", "Spread positivity today", "Your energy lights up rooms"],
    afternoon: ["Vibrant work, Entertainer", "Make work feel like play", "Enthusiasm is contagious"],
    evening: ["Celebratory evening, Entertainer", "Share today's highlights", "Tomorrow's joy awaits"]
  }
};

const STREAK_MESSAGES = {
  0: "Today's a fresh start! 🌱",
  1: "One day strong! Keep going 💪",
  3: "Three days in! Building momentum 🚀",
  7: "One week warrior! You're unstoppable 🔥",
  14: "Two weeks of excellence! 🏆",
  21: "Three weeks of mastery! 👑",
  30: "Monthly legend! You're incredible! 🌟",
  60: "Two months of dedication! Phenomenal! ⭐",
  90: "Quarterly champion! Absolutely amazing! 🎖️",
  365: "YEARLY MASTER! You're a legend! 👑✨"
};

function getStreakMessage(streak) {
  const milestones = Object.keys(STREAK_MESSAGES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const milestone of milestones) {
    if (streak >= milestone) {
      return STREAK_MESSAGES[milestone];
    }
  }
  return STREAK_MESSAGES[0];
}

const FOCUS_ENCOURAGEMENT = {
  0: "Ready to start your focus journey? 🎯",
  15: "Great start! 15 minutes of focus 💫",
  30: "Half hour down! You're building momentum 🌊",
  60: "One hour focused! You're in the zone ⚡",
  120: "Two hours deep! Exceptional focus 🧠",
  180: "Three hours strong! You're unstoppable 🚀",
  240: "Four hours mastery! Incredible dedication 🏆"
};

function getFocusMessage(minutes) {
  const milestones = Object.keys(FOCUS_ENCOURAGEMENT)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const milestone of milestones) {
    if (minutes >= milestone) {
      return FOCUS_ENCOURAGEMENT[milestone];
    }
  }
  return FOCUS_ENCOURAGEMENT[0];
}

export default function PersonalityWelcome() {
  const [mounted, setMounted] = useState(false);
  const [personalityType, setPersonalityType] = useState("");
  const [streak, setStreak] = useState(0);
  const [todayFocus, setTodayFocus] = useState(0);

  useEffect(() => {
    setMounted(true);
    setPersonalityType(getPersonalityType());
    setStreak(getCurrentStreak());
    setTodayFocus(getTodayFocusMinutes());

    // Listen for updates
    const handleStorageUpdate = () => {
      setStreak(getCurrentStreak());
      setTodayFocus(getTodayFocusMinutes());
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("nudge:counters:update", handleStorageUpdate);
    window.addEventListener("nudge:session:completed", handleStorageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("nudge:counters:update", handleStorageUpdate);
      window.removeEventListener("nudge:session:completed", handleStorageUpdate);
    };
  }, []);

  const greeting = useMemo(() => {
    if (!mounted || !personalityType) return { primary: "Welcome back!", secondary: "Ready to focus?", tertiary: "" };
    
    const timeOfDay = getTimeOfDay();
    const typeGreetings = PERSONALITY_GREETINGS[personalityType.toUpperCase()];
    
    if (!typeGreetings) {
      return { 
        primary: `Good ${timeOfDay}!`, 
        secondary: "Ready to focus?", 
        tertiary: getStreakMessage(streak)
      };
    }

    const timeGreetings = typeGreetings[timeOfDay] || typeGreetings.morning;
    const randomIndex = Math.floor(Math.random() * timeGreetings.length);
    
    return {
      primary: timeGreetings[randomIndex],
      secondary: getFocusMessage(todayFocus),
      tertiary: getStreakMessage(streak)
    };
  }, [mounted, personalityType, streak, todayFocus]);

  const timeIcon = useMemo(() => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case "morning": return "🌅";
      case "afternoon": return "☀️";
      case "evening": return "🌙";
      default: return "🌟";
    }
  }, []);

  if (!mounted) {
    return <div className="h-32 animate-pulse bg-neutral-100 rounded-xl" />;
  }

  return (
    <div 
      className="rounded-xl p-4 md:p-6 mb-6"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <TextReveal animateOnScroll={false} delay={0.3}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{timeIcon}</span>
              <h1 className="text-xl md:text-2xl font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
                {greeting.primary}
              </h1>
            </div>
          </TextReveal>
          
          <TextReveal animateOnScroll={false} delay={0.5}>
            <p className="text-neutral-600 text-sm md:text-base mb-1">
              {greeting.secondary}
            </p>
          </TextReveal>
          
          {greeting.tertiary && (
            <TextReveal animateOnScroll={false} delay={0.7}>
              <p className="text-sm text-neutral-500 font-medium">
                {greeting.tertiary}
              </p>
            </TextReveal>
          )}
        </div>

        {personalityType && (
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "var(--color-green-900)",
              color: "white"
            }}
          >
            {personalityType.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
