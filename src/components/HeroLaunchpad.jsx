// MBTI-Specific Hero Components
// Main home page centerpiece that completely adapts based on personality type

import React, { useState, useEffect } from 'react';
import { getCharacterDialogue, getSessionEncouragement } from '../lib/characterDialogue';
import { getPersonalityTemplates, getTimeBasedTemplates } from '../lib/mbtiTemplates';

// Get personality type from localStorage
function getPersonalityType() {
  try {
    const profile = JSON.parse(localStorage.getItem('Nudge_user_profile') || '{}');
    return profile.personalityType || 'INFP';
  } catch {
    return 'INFP';
  }
}

// Get current user progress for context
function getUserContext() {
  try {
    const streak = Number(localStorage.getItem('Nudge_streak')) || 0;
    const sessions = JSON.parse(localStorage.getItem('Nudge_focus_sessions') || '[]');
    const todaySession = sessions.find(s => s.date === new Date().toLocaleDateString('en-CA'));
    const todayMinutes = todaySession?.minutes || 0;
    
    return { streak, todayMinutes, totalSessions: sessions.length };
  } catch {
    return { streak: 0, todayMinutes: 0, totalSessions: 0 };
  }
}

// Personality-specific hero layouts and interactions
const PersonalityHeroCore = ({ personalityType, onStartFocus }) => {
  const personality = personalityType.toUpperCase();
  const [greeting, setGreeting] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const context = getUserContext();

  useEffect(() => {
    // Get personality-specific greeting
    const dialogueGreeting = getCharacterDialogue(personality, { type: 'greeting' });
    setGreeting(dialogueGreeting);
  }, [personality]);

  // Get recommended templates for this personality
  const templates = getTimeBasedTemplates(personality).slice(0, 3);
  const allTemplates = getPersonalityTemplates(personality);

  // Personality-specific hero configurations
  const heroConfigs = {
    // ========== ANALYSTS (NT) ==========
    INTJ: {
      theme: 'bg-gradient-to-br from-slate-900/90 via-purple-900/50 to-indigo-900/90',
      accent: 'text-purple-300',
      border: 'border-purple-500/30',
      primaryAction: 'Build Systems',
      secondaryAction: 'Analyze & Plan',
      quickActions: ['90min Strategic Deep Work', 'System Optimization', 'Knowledge Integration'],
      focusStyle: 'architectural',
      icon: '🏗️',
      characterPos: 'right-analytical',
      layout: 'systematic'
    },
    INTP: {
      theme: 'bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-cyan-900/90',
      accent: 'text-cyan-300',
      border: 'border-cyan-500/30',
      primaryAction: 'Explore Ideas',
      secondaryAction: 'Deep Dive',
      quickActions: ['Theory Exploration', 'Concept Mapping', 'Contemplative Focus'],
      focusStyle: 'exploratory',
      icon: '🔍',
      characterPos: 'center-contemplative',
      layout: 'organic'
    },
    ENTJ: {
      theme: 'bg-gradient-to-br from-red-900/90 via-orange-900/50 to-yellow-900/90',
      accent: 'text-orange-300',
      border: 'border-orange-500/30',
      primaryAction: 'Command & Execute',
      secondaryAction: 'Lead Forward',
      quickActions: ['Leadership Strategy', 'Execution Blitz', 'Empire Building'],
      focusStyle: 'commanding',
      icon: '👑',
      characterPos: 'center-dominant',
      layout: 'executive'
    },
    ENTP: {
      theme: 'bg-gradient-to-br from-purple-800/90 via-pink-900/50 to-rose-900/90',
      accent: 'text-pink-300',
      border: 'border-pink-500/30',
      primaryAction: 'Innovate & Create',
      secondaryAction: 'Brainstorm',
      quickActions: ['Innovation Storm', 'Possibility Mapping', 'Rapid Prototyping'],
      focusStyle: 'innovative',
      icon: '💡',
      characterPos: 'left-dynamic',
      layout: 'creative-chaos'
    },

    // ========== DIPLOMATS (NF) ==========
    INFJ: {
      theme: 'bg-gradient-to-br from-indigo-900/90 via-purple-900/50 to-violet-900/90',
      accent: 'text-indigo-300',
      border: 'border-indigo-500/30',
      primaryAction: 'Create Meaning',
      secondaryAction: 'Vision Work',
      quickActions: ['Vision Development', 'Mindful Productivity', 'Purposeful Creation'],
      focusStyle: 'visionary',
      icon: '🔮',
      characterPos: 'center-ethereal',
      layout: 'meaningful'
    },
    INFP: {
      theme: 'bg-gradient-to-br from-purple-900/90 via-pink-900/50 to-rose-900/90',
      accent: 'text-purple-300',
      border: 'border-purple-500/30',
      primaryAction: 'Express Authentically',
      secondaryAction: 'Creative Flow',
      quickActions: ['Authentic Expression', 'Gentle Flow State', 'Inspiration Sessions'],
      focusStyle: 'authentic',
      icon: '🎨',
      characterPos: 'right-gentle',
      layout: 'artistic'
    },
    ENFJ: {
      theme: 'bg-gradient-to-br from-green-900/90 via-teal-900/50 to-emerald-900/90',
      accent: 'text-teal-300',
      border: 'border-teal-500/30',
      primaryAction: 'Inspire & Guide',
      secondaryAction: 'Mentor Others',
      quickActions: ['People-Centered Work', 'Mentoring Prep', 'Community Building'],
      focusStyle: 'inspirational',
      icon: '🤝',
      characterPos: 'center-embracing',
      layout: 'community'
    },
    ENFP: {
      theme: 'bg-gradient-to-br from-orange-900/90 via-yellow-900/50 to-amber-900/90',
      accent: 'text-yellow-300',
      border: 'border-yellow-500/30',
      primaryAction: 'Spark & Explore',
      secondaryAction: 'Adventure Time',
      quickActions: ['Creative Explosion', 'Possibility Adventure', 'Enthusiasm Sprint'],
      focusStyle: 'energetic',
      icon: '🌟',
      characterPos: 'left-energetic',
      layout: 'adventure'
    },

    // ========== SENTINELS (SJ) ==========
    ISTJ: {
      theme: 'bg-gradient-to-br from-gray-800/90 via-blue-900/50 to-slate-900/90',
      accent: 'text-blue-300',
      border: 'border-blue-500/30',
      primaryAction: 'Execute Methodically',
      secondaryAction: 'Steady Progress',
      quickActions: ['Methodical Progress', 'Detail Excellence', 'Uninterrupted Focus'],
      focusStyle: 'methodical',
      icon: '📋',
      characterPos: 'center-steady',
      layout: 'structured'
    },
    ISFJ: {
      theme: 'bg-gradient-to-br from-rose-900/90 via-pink-900/50 to-red-900/90',
      accent: 'text-rose-300',
      border: 'border-rose-500/30',
      primaryAction: 'Serve & Support',
      secondaryAction: 'Gentle Care',
      quickActions: ['Caring Productivity', 'Supportive Service', 'Harmony Creation'],
      focusStyle: 'nurturing',
      icon: '💝',
      characterPos: 'right-caring',
      layout: 'supportive'
    },
    ESTJ: {
      theme: 'bg-gradient-to-br from-red-900/90 via-yellow-900/50 to-orange-900/90',
      accent: 'text-red-300',
      border: 'border-red-500/30',
      primaryAction: 'Organize & Achieve',
      secondaryAction: 'Drive Results',
      quickActions: ['Executive Power Hour', 'Goal Destroyer', 'System Architecture'],
      focusStyle: 'executive',
      icon: '💼',
      characterPos: 'center-executive',
      layout: 'results-driven'
    },
    ESFJ: {
      theme: 'bg-gradient-to-br from-pink-900/90 via-rose-900/50 to-red-900/90',
      accent: 'text-pink-300',
      border: 'border-pink-500/30',
      primaryAction: 'Connect & Harmonize',
      secondaryAction: 'Build Together',
      quickActions: ['Harmony & Achievement', 'Collaborative Magic', 'Celebration Prep'],
      focusStyle: 'harmonious',
      icon: '🌈',
      characterPos: 'center-connecting',
      layout: 'collaborative'
    },

    // ========== EXPLORERS (SP) ==========
    ISTP: {
      theme: 'bg-gradient-to-br from-gray-900/90 via-green-900/50 to-slate-900/90',
      accent: 'text-green-300',
      border: 'border-green-500/30',
      primaryAction: 'Build & Craft',
      secondaryAction: 'Solve Problems',
      quickActions: ['Hands-On Building', 'Problem Solving Mode', 'Skill Development'],
      focusStyle: 'practical',
      icon: '🔨',
      characterPos: 'right-practical',
      layout: 'craftsman'
    },
    ISFP: {
      theme: 'bg-gradient-to-br from-purple-900/90 via-green-900/50 to-teal-900/90',
      accent: 'text-purple-300',
      border: 'border-purple-500/30',
      primaryAction: 'Create Beauty',
      secondaryAction: 'Artistic Flow',
      quickActions: ['Artistic Flow State', 'Value Expression', 'Peaceful Focus'],
      focusStyle: 'artistic',
      icon: '🎨',
      characterPos: 'left-artistic',
      layout: 'aesthetic'
    },
    ESTP: {
      theme: 'bg-gradient-to-br from-orange-900/90 via-red-900/50 to-yellow-900/90',
      accent: 'text-orange-300',
      border: 'border-orange-500/30',
      primaryAction: 'Take Action!',
      secondaryAction: 'Dynamic Mode',
      quickActions: ['Action Burst', 'Competitive Sprint', 'Immediate Impact'],
      focusStyle: 'dynamic',
      icon: '💥',
      characterPos: 'center-action',
      layout: 'high-energy'
    },
    ESFP: {
      theme: 'bg-gradient-to-br from-yellow-900/90 via-pink-900/50 to-rose-900/90',
      accent: 'text-yellow-300',
      border: 'border-yellow-500/30',
      primaryAction: 'Celebrate & Create',
      secondaryAction: 'Joyful Energy',
      quickActions: ['Joyful Creation', 'People-Powered Focus', 'Celebration Mode'],
      focusStyle: 'joyful',
      icon: '🌟',
      characterPos: 'left-joyful',
      layout: 'celebration'
    }
  };

  const config = heroConfigs[personality] || heroConfigs.INFP;

  // Handle focus session start
  const handleStartFocus = (template = null) => {
    const sessionTemplate = template || templates[0];
    if (onStartFocus) {
      onStartFocus(sessionTemplate);
    }
  };

  // Personality-specific motivation based on context
  const getContextualMotivation = () => {
    if (context.todayMinutes >= 60) {
      return getCharacterDialogue(personality, { type: 'motivation' });
    }
    
    if (context.streak >= 7) {
      return getCharacterDialogue(personality, { 
        type: 'achievement', 
        achievementType: 'streak_milestone' 
      });
    }
    
    return getCharacterDialogue(personality, { type: 'session_suggestion' });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm p-8 ${config.theme} ${config.border}`}>
      {/* Character Icon */}
      <div className="absolute top-6 right-6 text-4xl opacity-20">
        {config.icon}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Greeting */}
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold text-white`}>
            {greeting}
          </h2>
          <p className={`text-sm ${config.accent} leading-relaxed`}>
            {getContextualMotivation()}
          </p>
        </div>

        {/* Primary Action Area */}
        <div className="space-y-4">
          {/* Main Focus Button */}
          <button
            onClick={() => handleStartFocus()}
            className={`w-full bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 
                       border ${config.border} rounded-xl p-6 text-left transition-all duration-300 
                       hover:scale-105 hover:shadow-2xl group`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-white">
                  {config.primaryAction}
                </h3>
                <p className={`text-sm ${config.accent}`}>
                  {templates[0]?.name || 'Focus Session'} • {templates[0]?.duration || 60} minutes
                </p>
                <p className="text-xs text-gray-400">
                  {templates[0]?.description || 'Start your focused work session'}
                </p>
              </div>
              <div className="text-2xl group-hover:scale-110 transition-transform">
                ▶️
              </div>
            </div>
          </button>

          {/* Quick Action Templates */}
          <div className="grid grid-cols-1 gap-3">
            {templates.slice(1, 3).map((template, index) => (
              <button
                key={template.id}
                onClick={() => handleStartFocus(template)}
                className={`bg-white/5 hover:bg-white/10 border ${config.border} rounded-lg p-4 text-left 
                           transition-all duration-200 hover:scale-102 group`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {template.duration}min • {template.icon}
                    </p>
                  </div>
                  <div className={`text-xs ${config.accent} font-medium`}>
                    Quick Start
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Show More Templates */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`w-full text-sm ${config.accent} hover:text-white transition-colors text-center py-2`}
          >
            {showTemplates ? 'Show Less' : `See All ${allTemplates.length} Templates`} 
          </button>

          {/* Expanded Template Grid */}
          {showTemplates && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {allTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleStartFocus(template)}
                  className={`bg-white/5 hover:bg-white/10 border ${config.border} rounded-lg p-3 text-left 
                             transition-all duration-200 hover:scale-102`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{template.icon}</span>
                      <h4 className="font-medium text-white text-sm">{template.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400">
                      {template.duration}min • {template.category.replace('_', ' ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button className={`text-sm ${config.accent} hover:text-white transition-colors`}>
            View Progress
          </button>
          <span className="text-gray-500">•</span>
          <button className={`text-sm ${config.accent} hover:text-white transition-colors`}>
            {config.secondaryAction}
          </button>
          <span className="text-gray-500">•</span>
          <button className={`text-sm ${config.accent} hover:text-white transition-colors`}>
            Settings
          </button>
        </div>
      </div>

      {/* Personality-specific background patterns */}
      <div className="absolute inset-0 opacity-5">
        {config.layout === 'systematic' && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent 
                          transform rotate-45 scale-150" />
        )}
        {config.layout === 'creative-chaos' && (
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
          </div>
        )}
        {config.layout === 'artistic' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        )}
      </div>
    </div>
  );
};

// Character state display component
const PersonalityCharacterState = ({ personalityType }) => {
  const personality = personalityType.toUpperCase();
  const context = getUserContext();
  
  // Personality-specific character expressions
  const getCharacterExpression = () => {
    const expressions = {
      INTJ: {
        focused: '🏗️ Strategic mode activated',
        motivated: '⚡ System optimization in progress',
        celebrating: '🎯 Architecture complete',
        resting: '📚 Analyzing patterns'
      },
      ENFP: {
        focused: '🌟 Creative energy flowing!',
        motivated: '🚀 Possibilities expanding',
        celebrating: '🎉 Magic created!',
        resting: '💫 Inspiration gathering'
      },
      ISFJ: {
        focused: '💝 Caring work in progress',
        motivated: '🌸 Gentle strength building',
        celebrating: '✨ Hearts supported',
        resting: '🕊️ Peaceful reflection'
      },
      ESTP: {
        focused: '💥 Action mode engaged!',
        motivated: '⚡ Energy building momentum',
        celebrating: '🏆 Victory achieved!',
        resting: '🔥 Recharging for action'
      }
    };
    
    if (context.todayMinutes >= 90) return expressions[personality]?.celebrating || '🎉 Great work!';
    if (context.streak >= 3) return expressions[personality]?.motivated || '⚡ Building momentum';
    if (context.todayMinutes > 0) return expressions[personality]?.focused || '🎯 In focus mode';
    return expressions[personality]?.resting || '💭 Ready to begin';
  };

  return (
    <div className="text-center py-4">
      <div className="text-sm text-gray-400 mb-2">Your Character</div>
      <div className="text-lg text-white font-medium">
        {getCharacterExpression()}
      </div>
    </div>
  );
};

// Main Hero Launchpad component
const HeroLaunchpad = ({ onStartFocus }) => {
  const personalityType = getPersonalityType();
  
  return (
    <div className="space-y-6">
      <PersonalityHeroCore 
        personalityType={personalityType}
        onStartFocus={onStartFocus}
      />
      <PersonalityCharacterState personalityType={personalityType} />
    </div>
  );
};

export default HeroLaunchpad;
export { PersonalityHeroCore, PersonalityCharacterState };
