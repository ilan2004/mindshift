// Personalization Profile System
// Manages user preferences, learned behaviors, and personalization data

const STORAGE_KEY = 'mindshift_personalization_profile';

// Default personalization profile structure
export const DEFAULT_PROFILE = {
  // Basic info
  created_at: null,
  last_updated: null,
  personality_type: '',
  
  // Goals & motivation  
  goals: {
    primary: '',
    deadline: '',
    type: '', // academic, professional, personal, creative
    description: ''
  },
  
  // Energy & timing preferences
  energy_windows: [
    // { start: "09:00", end: "11:00", rating: "high", days: ["mon", "tue", "wed"] }
  ],
  peak_focus_time: '', // morning, afternoon, evening, night
  
  // Session preferences (learned + stated)
  session_preferences: {
    ideal_length: null, // minutes, learned from behavior
    preferred_break_duration: null, // minutes
    break_style: '', // physical, reflective, social, none
    environment: '', // quiet, coffee_shop, lofi, white_noise
    interruption_tolerance: 'medium' // low, medium, high
  },
  
  // Focus blockers & challenges
  focus_blockers: [], // ["social_media", "overthinking", "noise", "fatigue", "notifications"]
  focus_challenges: [], // specific challenges they've mentioned
  
  // Behavioral learning data
  behavioral_patterns: {
    avg_session_length: null,
    completion_rate_by_length: {}, // { "25": 0.8, "45": 0.9, "60": 0.7 }
    completion_rate_by_time: {}, // { "morning": 0.85, "afternoon": 0.6 }
    completion_rate_by_template: {}, // { "deep_reading": 0.9, "creative_sprint": 0.7 }
    streak_record: 0,
    total_sessions: 0,
    successful_sessions: 0
  },
  
  // Communication & coaching preferences
  communication: {
    tone_preference: 'encouraging', // encouraging, direct, playful, gentle, firm
    nudge_intensity: 'medium', // low, medium, high  
    coaching_style: 'supportive', // supportive, challenging, analytical, motivational
    notification_frequency: 'normal' // minimal, normal, frequent
  },
  
  // Personalization guardrails & features
  guardrails: {
    perfectionism_timebox: false, // auto-timebox to prevent perfectionism
    rabbit_hole_quiz: false, // quiz when switching contexts
    break_enforcement: false, // force breaks after long sessions
    distraction_blocking: false, // activate focus mode
    progress_check_ins: false, // periodic "staying on track?" prompts
    deadline_urgency_mode: false // special mode when approaching deadlines
  },
  
  // Template & feature preferences
  preferences: {
    gamification_level: 'medium', // low, medium, high
    ui_complexity: 'standard', // minimal, standard, detailed
    statistics_depth: 'summary', // minimal, summary, detailed
    social_features: true, // show leaderboards, peer comparison
    template_recommendations: true, // show AI recommendations
    personality_insights: true // show personality-based guidance
  },
  
  // External integrations
  integrations: {
    chatgpt_history_imported: false,
    chatgpt_insights: {}, // parsed insights from ChatGPT
    calendar_connected: false,
    analytics_consent: true
  },
  
  // Experimental & learning flags
  experiments: {
    adaptive_scheduling: false,
    personality_coaching: false,
    peer_matching: false
  }
};

// Profile management functions
export class PersonalizationProfile {
  
  // Initialize or load existing profile
  static load() {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return this.create();
      
      const profile = JSON.parse(stored);
      // Merge with defaults to handle schema updates
      return this.migrate(profile);
    } catch (error) {
      console.error('Error loading personalization profile:', error);
      return this.create();
    }
  }
  
  // Create new profile
  static create() {
    const profile = {
      ...DEFAULT_PROFILE,
      created_at: Date.now(),
      last_updated: Date.now()
    };
    
    this.save(profile);
    return profile;
  }
  
  // Save profile to localStorage
  static save(profile) {
    if (typeof window === 'undefined') return;
    
    try {
      const updatedProfile = {
        ...profile,
        last_updated: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      
      // Dispatch event for components to react
      window.dispatchEvent(new CustomEvent('personalization:updated', { 
        detail: updatedProfile 
      }));
      
      return updatedProfile;
    } catch (error) {
      console.error('Error saving personalization profile:', error);
      return profile;
    }
  }
  
  // Update specific section of profile
  static update(updates) {
    const current = this.load();
    const updated = this.deepMerge(current, updates);
    return this.save(updated);
  }
  
  // Update personality type and reset related preferences
  static setPersonalityType(type) {
    const current = this.load();
    const updated = {
      ...current,
      personality_type: type.toUpperCase(),
      // Reset behavioral patterns when personality changes
      behavioral_patterns: {
        ...DEFAULT_PROFILE.behavioral_patterns,
        total_sessions: current.behavioral_patterns.total_sessions || 0,
        successful_sessions: current.behavioral_patterns.successful_sessions || 0
      }
    };
    
    return this.save(updated);
  }
  
  // Record session completion data for learning
  static recordSession(sessionData) {
    const profile = this.load();
    const { duration, completed, template, started_time } = sessionData;
    
    // Update behavioral patterns
    const patterns = profile.behavioral_patterns;
    patterns.total_sessions = (patterns.total_sessions || 0) + 1;
    
    if (completed) {
      patterns.successful_sessions = (patterns.successful_sessions || 0) + 1;
      
      // Update completion rates by duration
      const durationKey = Math.round(duration / 5) * 5; // Round to nearest 5min
      patterns.completion_rate_by_length[durationKey] = 
        this.updateRate(patterns.completion_rate_by_length[durationKey], true);
      
      // Update completion rates by time of day
      const hour = new Date(started_time).getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      patterns.completion_rate_by_time[timeOfDay] = 
        this.updateRate(patterns.completion_rate_by_time[timeOfDay], true);
      
      // Update completion rates by template
      if (template) {
        patterns.completion_rate_by_template[template] = 
          this.updateRate(patterns.completion_rate_by_template[template], true);
      }
      
      // Update average session length (only for completed sessions)
      patterns.avg_session_length = patterns.avg_session_length 
        ? (patterns.avg_session_length + duration) / 2
        : duration;
    } else {
      // Record failed attempts for learning
      const durationKey = Math.round(duration / 5) * 5;
      patterns.completion_rate_by_length[durationKey] = 
        this.updateRate(patterns.completion_rate_by_length[durationKey], false);
    }
    
    return this.update({ behavioral_patterns: patterns });
  }
  
  // Helper to update success rates with exponential smoothing
  static updateRate(currentRate, success) {
    const alpha = 0.1; // Learning rate
    const newValue = success ? 1 : 0;
    return currentRate ? (1 - alpha) * currentRate + alpha * newValue : newValue;
  }
  
  // Get intelligent recommendations based on profile
  static getRecommendations(profile = null) {
    const p = profile || this.load();
    const recommendations = {};
    
    // Recommend ideal session length
    if (p.behavioral_patterns.avg_session_length) {
      recommendations.session_length = Math.round(p.behavioral_patterns.avg_session_length);
    } else {
      // Default based on personality type
      const type = p.personality_type;
      if (['INTJ', 'INTP', 'INFJ'].includes(type)) {
        recommendations.session_length = 60;
      } else if (['ESTP', 'ESFP', 'ENFP'].includes(type)) {
        recommendations.session_length = 25;
      } else {
        recommendations.session_length = 45;
      }
    }
    
    // Recommend best time to focus
    const timeRates = p.behavioral_patterns.completion_rate_by_time;
    if (Object.keys(timeRates).length > 0) {
      recommendations.best_time = Object.entries(timeRates)
        .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    // Recommend best templates
    const templateRates = p.behavioral_patterns.completion_rate_by_template;
    if (Object.keys(templateRates).length > 0) {
      recommendations.best_templates = Object.entries(templateRates)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([template]) => template);
    }
    
    return recommendations;
  }
  
  // Import ChatGPT insights
  static importChatGPTInsights(insights) {
    return this.update({
      integrations: {
        chatgpt_history_imported: true,
        chatgpt_insights: insights
      }
    });
  }
  
  // Migrate old profile schema to new one
  static migrate(profile) {
    // Ensure all required fields exist
    return this.deepMerge(DEFAULT_PROFILE, profile);
  }
  
  // Deep merge utility
  static deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  // Reset profile (keeping basic info)
  static reset() {
    const current = this.load();
    const reset = {
      ...DEFAULT_PROFILE,
      created_at: current.created_at,
      personality_type: current.personality_type,
      last_updated: Date.now()
    };
    
    return this.save(reset);
  }
  
  // Export profile for backup/analysis
  static export() {
    return this.load();
  }
  
  // Import profile from backup
  static import(profileData) {
    try {
      const migrated = this.migrate(profileData);
      return this.save(migrated);
    } catch (error) {
      console.error('Error importing profile:', error);
      return this.load();
    }
  }
}

// Convenience hooks for common operations
export const PersonalizationHooks = {
  
  // Quick access to current recommendations
  useRecommendations() {
    return PersonalizationProfile.getRecommendations();
  },
  
  // Quick access to current profile
  useProfile() {
    return PersonalizationProfile.load();
  },
  
  // Update specific preference
  updatePreference(key, value) {
    return PersonalizationProfile.update({
      preferences: { [key]: value }
    });
  },
  
  // Toggle guardrail
  toggleGuardrail(guardrail) {
    const profile = PersonalizationProfile.load();
    const current = profile.guardrails[guardrail] || false;
    return PersonalizationProfile.update({
      guardrails: { [guardrail]: !current }
    });
  },
  
  // Set communication preference
  setCommunicationStyle(style) {
    return PersonalizationProfile.update({
      communication: { tone_preference: style }
    });
  },
  
  // Add focus blocker
  addFocusBlocker(blocker) {
    const profile = PersonalizationProfile.load();
    const blockers = profile.focus_blockers || [];
    if (!blockers.includes(blocker)) {
      blockers.push(blocker);
      return PersonalizationProfile.update({ focus_blockers: blockers });
    }
    return profile;
  },
  
  // Set primary goal
  setGoal(goal, deadline = null, type = 'personal') {
    return PersonalizationProfile.update({
      goals: {
        primary: goal,
        deadline: deadline,
        type: type,
        description: ''
      }
    });
  }
};

export default PersonalizationProfile;
