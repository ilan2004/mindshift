// Personality-Aware Progress Components
// Frame progress and achievements through personality-specific lenses

import React from 'react';
import { getProgressFraming } from '../lib/characterDialogue';

// Get personality type from localStorage
function getPersonalityType() {
  try {
    const profile = JSON.parse(localStorage.getItem('mindshift_user_profile') || '{}');
    return profile.personalityType || 'INFP';
  } catch {
    return 'INFP';
  }
}

// Get current progress data
function getProgressData() {
  try {
    const streak = Number(localStorage.getItem('mindshift_streak')) || 0;
    const sessions = JSON.parse(localStorage.getItem('mindshift_focus_sessions') || '[]');
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.minutes || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    const completedSessions = sessions.length;
    
    return { streak, totalHours, completedSessions, totalMinutes };
  } catch {
    return { streak: 0, totalHours: 0, completedSessions: 0, totalMinutes: 0 };
  }
}

// Personality-specific progress visualization components
const ProgressIndicator = ({ personalityType, value, maxValue, category }) => {
  const personality = personalityType.toUpperCase();
  
  // Personality-specific visual styles
  const visualStyles = {
    // Analysts - Clean, geometric, system-focused
    INTJ: { 
      bg: 'from-slate-900 to-purple-900',
      fill: 'from-blue-400 to-purple-400',
      shape: 'geometric',
      icon: '🏗️'
    },
    INTP: { 
      bg: 'from-slate-800 to-blue-900',
      fill: 'from-cyan-400 to-blue-400',
      shape: 'organic',
      icon: '🔍'
    },
    ENTJ: { 
      bg: 'from-red-900 to-orange-900',
      fill: 'from-red-400 to-orange-400',
      shape: 'bold',
      icon: '👑'
    },
    ENTP: { 
      bg: 'from-purple-800 to-pink-900',
      fill: 'from-purple-400 to-pink-400',
      shape: 'dynamic',
      icon: '💡'
    },
    
    // Diplomats - Warm, flowing, meaning-focused
    INFJ: { 
      bg: 'from-indigo-900 to-purple-900',
      fill: 'from-indigo-400 to-purple-300',
      shape: 'ethereal',
      icon: '🔮'
    },
    INFP: { 
      bg: 'from-purple-900 to-pink-900',
      fill: 'from-purple-300 to-pink-300',
      shape: 'gentle',
      icon: '🎨'
    },
    ENFJ: { 
      bg: 'from-green-900 to-teal-900',
      fill: 'from-green-400 to-teal-400',
      shape: 'embracing',
      icon: '🤝'
    },
    ENFP: { 
      bg: 'from-orange-900 to-yellow-900',
      fill: 'from-orange-400 to-yellow-400',
      shape: 'energetic',
      icon: '🌟'
    },
    
    // Sentinels - Structured, reliable, service-focused
    ISTJ: { 
      bg: 'from-gray-800 to-blue-900',
      fill: 'from-blue-500 to-blue-400',
      shape: 'structured',
      icon: '📋'
    },
    ISFJ: { 
      bg: 'from-rose-900 to-pink-900',
      fill: 'from-rose-400 to-pink-400',
      shape: 'nurturing',
      icon: '💝'
    },
    ESTJ: { 
      bg: 'from-red-900 to-yellow-900',
      fill: 'from-red-500 to-yellow-500',
      shape: 'executive',
      icon: '💼'
    },
    ESFJ: { 
      bg: 'from-pink-900 to-rose-900',
      fill: 'from-pink-400 to-rose-400',
      shape: 'harmonious',
      icon: '🌈'
    },
    
    // Explorers - Dynamic, experiential, action-focused
    ISTP: { 
      bg: 'from-gray-900 to-green-900',
      fill: 'from-gray-400 to-green-400',
      shape: 'crafted',
      icon: '🔨'
    },
    ISFP: { 
      bg: 'from-purple-900 to-green-900',
      fill: 'from-purple-300 to-green-300',
      shape: 'artistic',
      icon: '🎨'
    },
    ESTP: { 
      bg: 'from-orange-900 to-red-900',
      fill: 'from-orange-400 to-red-400',
      shape: 'dynamic',
      icon: '💥'
    },
    ESFP: { 
      bg: 'from-yellow-900 to-pink-900',
      fill: 'from-yellow-400 to-pink-400',
      shape: 'joyful',
      icon: '🌟'
    }
  };
  
  const style = visualStyles[personality] || visualStyles.INFP;
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  return (
    <div className="relative">
      <div className={`h-3 rounded-full bg-gradient-to-r ${style.bg} overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r ${style.fill} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="absolute -top-1 -right-1 text-lg">
        {style.icon}
      </div>
    </div>
  );
};

// Personality-specific metric cards
const PersonalityMetricCard = ({ personalityType, title, value, subtitle, category }) => {
  const personality = personalityType.toUpperCase();
  
  // Personality-specific value interpretations
  const getValueInterpretation = (category, value, personality) => {
    switch (category) {
      case 'streak':
        const streakFramings = {
          // Analysts - System & Optimization Focus
          INTJ: value >= 7 ? 'System Optimized' : value >= 3 ? 'Pattern Stabilizing' : 'System Initializing',
          INTP: value >= 7 ? 'Theory Validated' : value >= 3 ? 'Pattern Emerging' : 'Hypothesis Testing',
          ENTJ: value >= 7 ? 'Command Established' : value >= 3 ? 'Momentum Building' : 'Campaign Launched',
          ENTP: value >= 7 ? 'Innovation Flowing' : value >= 3 ? 'Ideas Connecting' : 'Creativity Sparking',
          
          // Diplomats - Growth & Meaning Focus  
          INFJ: value >= 7 ? 'Vision Manifesting' : value >= 3 ? 'Purpose Aligning' : 'Journey Beginning',
          INFP: value >= 7 ? 'Authenticity Flowing' : value >= 3 ? 'Values Aligning' : 'Soul Stirring',
          ENFJ: value >= 7 ? 'Community Thriving' : value >= 3 ? 'Influence Growing' : 'Leadership Emerging',
          ENFP: value >= 7 ? 'Possibilities Blooming' : value >= 3 ? 'Energy Building' : 'Spark Igniting',
          
          // Sentinels - Consistency & Service Focus
          ISTJ: value >= 7 ? 'Excellence Achieved' : value >= 3 ? 'Standard Maintained' : 'Foundation Building',
          ISFJ: value >= 7 ? 'Service Sustained' : value >= 3 ? 'Care Consistent' : 'Support Growing',
          ESTJ: value >= 7 ? 'Goals Dominating' : value >= 3 ? 'Results Compounding' : 'Execution Starting',
          ESFJ: value >= 7 ? 'Harmony Sustained' : value >= 3 ? 'Community Building' : 'Connection Growing',
          
          // Explorers - Action & Experience Focus
          ISTP: value >= 7 ? 'Mastery Evident' : value >= 3 ? 'Skills Sharpening' : 'Craft Developing',
          ISFP: value >= 7 ? 'Beauty Consistent' : value >= 3 ? 'Art Flowing' : 'Creativity Awakening',
          ESTP: value >= 7 ? 'Victory Streak!' : value >= 3 ? 'Momentum Strong' : 'Action Mode!',
          ESFP: value >= 7 ? 'Joy Radiating' : value >= 3 ? 'Energy Sustained' : 'Happiness Growing'
        };
        return streakFramings[personality] || `${value} Day Chain`;
        
      case 'hours':
        const hourFramings = {
          INTJ: 'Strategic Analysis',
          INTP: 'Deep Contemplation', 
          ENTJ: 'Executive Leadership',
          ENTP: 'Creative Innovation',
          INFJ: 'Meaningful Work',
          INFP: 'Authentic Expression',
          ENFJ: 'People Development',
          ENFP: 'Energetic Creation',
          ISTJ: 'Methodical Excellence',
          ISFJ: 'Caring Service',
          ESTJ: 'Productive Achievement',
          ESFJ: 'Harmonious Building',
          ISTP: 'Skilled Craftsmanship',
          ISFP: 'Artistic Flow',
          ESTP: 'Dynamic Action',
          ESFP: 'Joyful Creation'
        };
        return hourFramings[personality] || 'Focus Time';
        
      case 'sessions':
        const sessionFramings = {
          INTJ: 'Systems Built',
          INTP: 'Theories Explored',
          ENTJ: 'Victories Won',
          ENTP: 'Ideas Generated',
          INFJ: 'Visions Developed',
          INFP: 'Dreams Nurtured',
          ENFJ: 'Lives Impacted',
          ENFP: 'Adventures Completed',
          ISTJ: 'Tasks Mastered',
          ISFJ: 'Hearts Supported',
          ESTJ: 'Goals Conquered',
          ESFJ: 'Connections Made',
          ISTP: 'Problems Solved',
          ISFP: 'Art Created',
          ESTP: 'Challenges Crushed',
          ESFP: 'Moments Celebrated'
        };
        return sessionFramings[personality] || 'Sessions Done';
    }
  };
  
  // Personality-specific card styling
  const cardStyles = {
    INTJ: 'bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/20',
    INTP: 'bg-gradient-to-br from-slate-800/50 to-blue-900/50 border-blue-500/20',
    ENTJ: 'bg-gradient-to-br from-red-900/50 to-orange-900/50 border-orange-500/20',
    ENTP: 'bg-gradient-to-br from-purple-800/50 to-pink-900/50 border-pink-500/20',
    INFJ: 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-purple-400/20',
    INFP: 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-pink-400/20',
    ENFJ: 'bg-gradient-to-br from-green-900/50 to-teal-900/50 border-teal-400/20',
    ENFP: 'bg-gradient-to-br from-orange-900/50 to-yellow-900/50 border-yellow-400/20',
    ISTJ: 'bg-gradient-to-br from-gray-800/50 to-blue-900/50 border-blue-500/20',
    ISFJ: 'bg-gradient-to-br from-rose-900/50 to-pink-900/50 border-pink-400/20',
    ESTJ: 'bg-gradient-to-br from-red-900/50 to-yellow-900/50 border-yellow-500/20',
    ESFJ: 'bg-gradient-to-br from-pink-900/50 to-rose-900/50 border-rose-400/20',
    ISTP: 'bg-gradient-to-br from-gray-900/50 to-green-900/50 border-green-400/20',
    ISFP: 'bg-gradient-to-br from-purple-900/50 to-green-900/50 border-green-300/20',
    ESTP: 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-red-400/20',
    ESFP: 'bg-gradient-to-br from-yellow-900/50 to-pink-900/50 border-pink-400/20'
  };
  
  const interpretation = getValueInterpretation(category, value, personality);
  
  return (
    <div className={`rounded-xl p-6 border backdrop-blur-sm ${cardStyles[personality] || cardStyles.INFP}`}>
      <div className="space-y-3">
        <div className="text-sm text-gray-300 font-medium">{title}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{interpretation}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </div>
  );
};

// Main progress overview component
const PersonalityProgressOverview = ({ personalityType, compact = false }) => {
  const progress = getProgressData();
  const personality = personalityType || getPersonalityType();
  
  // Get personality-specific progress framing
  const framings = getProgressFraming(personality, progress) || {};
  
  // Personality-specific goal setting
  const getPersonalityGoals = (personality) => {
    const goalStyles = {
      // Analysts - Efficiency and System Goals
      INTJ: { daily: 90, weekly: 7, monthly: 30 },
      INTP: { daily: 75, weekly: 6, monthly: 25 },
      ENTJ: { daily: 120, weekly: 8, monthly: 40 },
      ENTP: { daily: 60, weekly: 7, monthly: 25 },
      
      // Diplomats - Meaningful and Growth Goals
      INFJ: { daily: 75, weekly: 6, monthly: 25 },
      INFP: { daily: 60, weekly: 5, monthly: 20 },
      ENFJ: { daily: 90, weekly: 7, monthly: 30 },
      ENFP: { daily: 75, weekly: 6, monthly: 25 },
      
      // Sentinels - Consistent and Service Goals
      ISTJ: { daily: 90, weekly: 7, monthly: 35 },
      ISFJ: { daily: 75, weekly: 6, monthly: 30 },
      ESTJ: { daily: 120, weekly: 8, monthly: 40 },
      ESFJ: { daily: 90, weekly: 7, monthly: 30 },
      
      // Explorers - Flexible and Action Goals
      ISTP: { daily: 60, weekly: 5, monthly: 25 },
      ISFP: { daily: 60, weekly: 5, monthly: 20 },
      ESTP: { daily: 75, weekly: 6, monthly: 30 },
      ESFP: { daily: 60, weekly: 6, monthly: 25 }
    };
    
    return goalStyles[personality.toUpperCase()] || { daily: 75, weekly: 6, monthly: 25 };
  };
  
  const goals = getPersonalityGoals(personality);
  const todayMinutes = progress.totalMinutes; // Simplified for demo
  
  // Compact version for home page
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Today's Progress with Personality Goal */}
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold" style={{ fontFamily: "Tanker, sans-serif", color: 'var(--color-green-900)' }}>
            Today's Focus Progress
          </h3>
          <div className="text-xs text-neutral-600">
            {todayMinutes}/{goals.daily} min goal
          </div>
        </div>
        
        {/* Progress bar using your design system */}
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--color-green-900-20)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (todayMinutes / goals.daily) * 100)}%`,
              background: getPersonalityAccentColor(personality) || "var(--color-green-900)"
            }}
          />
        </div>
        
        {/* Personality-specific encouragement */}
        <div className="text-xs text-neutral-600">
          {getPersonalityEncouragement(personality, todayMinutes, goals.daily)}
        </div>
        
        {/* Quick stats */}
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{progress.streak} day streak</span>
          <span>{progress.totalHours}h total</span>
          <span>{progress.completedSessions} sessions</span>
        </div>
      </div>
    );
  }
  
  // Full version (original)
  return (
    <div className="space-y-6">
      {/* Personality-Specific Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PersonalityMetricCard
          personalityType={personality}
          title="Focus Streak"
          value={progress.streak}
          subtitle={framings.streak || `${progress.streak} consecutive days`}
          category="streak"
        />
        <PersonalityMetricCard
          personalityType={personality}
          title="Total Hours"
          value={progress.totalHours}
          subtitle={framings.hours || `${progress.totalHours} hours of focus`}
          category="hours"
        />
        <PersonalityMetricCard
          personalityType={personality}
          title="Sessions"
          value={progress.completedSessions}
          subtitle={framings.sessions || `${progress.completedSessions} sessions completed`}
          category="sessions"
        />
      </div>
      
      {/* Today's Progress with Personality Goal */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Today's Focus Progress</h3>
          <div className="text-sm text-gray-400">
            {todayMinutes}/{goals.daily} min goal
          </div>
        </div>
        <ProgressIndicator
          personalityType={personality}
          value={todayMinutes}
          maxValue={goals.daily}
          category="daily"
        />
        
        {/* Personality-specific encouragement */}
        <div className="text-sm text-gray-300">
          {getPersonalityEncouragement(personality, todayMinutes, goals.daily)}
        </div>
      </div>
    </div>
  );
};

// Get personality-specific encouragement based on progress
function getPersonalityEncouragement(personality, current, goal) {
  const percentage = (current / goal) * 100;
  
  if (percentage >= 100) {
    const completionMessages = {
      INTJ: "System optimization complete. Excellent strategic execution.",
      INTP: "Theoretical exploration successful. Your mind expanded beautifully.",
      ENTJ: "Command objectives achieved. Outstanding leadership performance.",
      ENTP: "Innovation goals reached. Your creativity conquered the day!",
      INFJ: "Meaningful work accomplished. Your vision touched reality today.",
      INFP: "Authentic expression achieved. Your soul spoke its truth beautifully.",
      ENFJ: "Community impact realized. Your guidance lifted others up.",
      ENFP: "Enthusiastic goals crushed! Your energy created magic today.",
      ISTJ: "Methodical excellence delivered. Your consistency paid off perfectly.",
      ISFJ: "Caring service provided. Your gentle strength made a difference.",
      ESTJ: "Executive targets conquered. Your organization drove results.",
      ESFJ: "Harmony and achievement balanced. Your care created success.",
      ISTP: "Practical mastery demonstrated. Your skills solved real problems.",
      ISFP: "Artistic flow achieved. Your creativity brought beauty to life.",
      ESTP: "Dynamic victory secured! Your action energy dominated the day.",
      ESFP: "Joyful success celebrated! Your happiness energy was contagious."
    };
    return completionMessages[personality.toUpperCase()] || "Great work! Goal achieved.";
  }
  
  if (percentage >= 75) {
    const strongProgressMessages = {
      INTJ: "Strategic momentum building. System efficiency at 75%.",
      INTP: "Intellectual flow detected. Your curiosity is paying off.",
      ENTJ: "Command performance strong. Victory is within reach.",
      ENTP: "Creative energy surging. Innovation mode activated!",
      INFJ: "Purposeful progress evident. Your vision is manifesting.",
      INFP: "Authentic momentum building. Your values guide the way.",
      ENFJ: "Inspirational progress clear. Your impact grows stronger.",
      ENFP: "Enthusiastic energy flowing. You're creating possibilities!",
      ISTJ: "Methodical consistency maintained. Excellence approaching.",
      ISFJ: "Gentle progress sustained. Your caring nature shines through.",
      ESTJ: "Executive efficiency strong. Results are compounding nicely.",
      ESFJ: "Harmonious achievement building. Your balance works beautifully.",
      ISTP: "Practical skills engaged. Your craftsmanship is developing.",
      ISFP: "Creative flow emerging. Your artistic soul is expressing.",
      ESTP: "Action momentum strong. You're crushing today's challenges!",
      ESFP: "Joyful energy sustained. Your positivity is powerful!"
    };
    return strongProgressMessages[personality.toUpperCase()] || "Strong progress! Keep going.";
  }
  
  if (percentage >= 50) {
    const midProgressMessages = {
      INTJ: "System halfway optimized. Strategic progress on track.",
      INTP: "Contemplative momentum building. Ideas are crystallizing.",
      ENTJ: "Command objectives 50% complete. Maintain leadership focus.",
      ENTP: "Innovation pipeline flowing. Creative connections forming.",
      INFJ: "Meaningful work progressing. Your vision is taking shape.",
      INFP: "Authentic expression growing. Honor your inner rhythm.",
      ENFJ: "People-focused progress evident. Your guidance is working.",
      ENFP: "Possibility energy building. Your enthusiasm is contagious!",
      ISTJ: "Methodical approach working. Steady progress continues.",
      ISFJ: "Caring consistency maintained. Your gentle strength persists.",
      ESTJ: "Executive efficiency engaged. Results are building nicely.",
      ESFJ: "Harmonious balance sustained. Your approach is working.",
      ISTP: "Practical progress evident. Your skills are developing.",
      ISFP: "Creative expression flowing. Your art is taking form.",
      ESTP: "Dynamic action engaged. You're making things happen!",
      ESFP: "Joyful momentum building. Your energy lights up everything!"
    };
    return midProgressMessages[personality.toUpperCase()] || "Good progress! Halfway there.";
  }
  
  // Early progress encouragement
  const earlyProgressMessages = {
    INTJ: "Strategic foundation laid. Your system is initializing.",
    INTP: "Curiosity activated. Let your analytical mind explore.",
    ENTJ: "Command initiated. Your leadership journey begins.",
    ENTP: "Innovation sparked. Creative possibilities await discovery.",
    INFJ: "Purpose alignment starting. Your vision needs nurturing.",
    INFP: "Authentic journey begun. Honor your unique path.",
    ENFJ: "Inspirational energy emerging. Your guidance will grow.",
    ENFP: "Enthusiastic spark ignited. Your possibilities are endless!",
    ISTJ: "Methodical foundation set. Your consistency will compound.",
    ISFJ: "Caring intention planted. Your gentle strength will flourish.",
    ESTJ: "Executive mode activated. Your organization will drive results.",
    ESFJ: "Harmonious beginning established. Your balance will create success.",
    ISTP: "Practical engagement started. Your skills will sharpen.",
    ISFP: "Creative spark awakened. Your artistic soul will express beautifully.",
    ESTP: "Action energy initiated. Your momentum will build victories!",
    ESFP: "Joyful intention set. Your happiness will create magic!"
  };
  
  return earlyProgressMessages[personality.toUpperCase()] || "Great start! Keep building momentum.";
}

// Helper function for personality accent colors
function getPersonalityAccentColor(personalityType) {
  if (!personalityType) return 'var(--color-green-900)';
  
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
  
  return colors[personalityType.toUpperCase()] || 'var(--color-green-900)';
}

// Weekly progress chart component
const PersonalityWeeklyChart = ({ personalityType }) => {
  // This would integrate with your existing chart but with personality theming
  return (
    <div className="text-gray-400 text-sm">
      Weekly progress chart with {personalityType} theming would go here
    </div>
  );
};

export {
  PersonalityProgressOverview,
  PersonalityMetricCard,
  ProgressIndicator,
  PersonalityWeeklyChart
};
