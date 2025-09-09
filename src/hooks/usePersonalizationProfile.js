"use client";

import { useState, useEffect, useCallback } from 'react';
import PersonalizationProfile, { PersonalizationHooks } from '@/lib/personalizationProfile';

// Main hook for personalization profile
export function usePersonalizationProfile() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = () => {
      const profileData = PersonalizationProfile.load();
      const recs = PersonalizationProfile.getRecommendations(profileData);
      
      setProfile(profileData);
      setRecommendations(recs);
      setLoading(false);
    };

    loadProfile();

    // Listen for profile updates
    const handleUpdate = (event) => {
      const updatedProfile = event.detail;
      const updatedRecs = PersonalizationProfile.getRecommendations(updatedProfile);
      
      setProfile(updatedProfile);
      setRecommendations(updatedRecs);
    };

    window.addEventListener('personalization:updated', handleUpdate);
    return () => {
      window.removeEventListener('personalization:updated', handleUpdate);
    };
  }, []);

  // Update profile
  const updateProfile = useCallback((updates) => {
    const updated = PersonalizationProfile.update(updates);
    return updated;
  }, []);

  // Set personality type
  const setPersonalityType = useCallback((type) => {
    const updated = PersonalizationProfile.setPersonalityType(type);
    return updated;
  }, []);

  // Record session data
  const recordSession = useCallback((sessionData) => {
    const updated = PersonalizationProfile.recordSession(sessionData);
    return updated;
  }, []);

  // Toggle guardrail
  const toggleGuardrail = useCallback((guardrail) => {
    return PersonalizationHooks.toggleGuardrail(guardrail);
  }, []);

  // Set goal
  const setGoal = useCallback((goal, deadline, type) => {
    return PersonalizationHooks.setGoal(goal, deadline, type);
  }, []);

  // Add focus blocker
  const addFocusBlocker = useCallback((blocker) => {
    return PersonalizationHooks.addFocusBlocker(blocker);
  }, []);

  // Set communication style
  const setCommunicationStyle = useCallback((style) => {
    return PersonalizationHooks.setCommunicationStyle(style);
  }, []);

  // Import ChatGPT insights
  const importChatGPTInsights = useCallback((insights) => {
    return PersonalizationProfile.importChatGPTInsights(insights);
  }, []);

  return {
    profile,
    recommendations,
    loading,
    updateProfile,
    setPersonalityType,
    recordSession,
    toggleGuardrail,
    setGoal,
    addFocusBlocker,
    setCommunicationStyle,
    importChatGPTInsights,
    
    // Utility getters
    hasPersonalityType: profile?.personality_type?.length > 0,
    hasGoals: profile?.goals?.primary?.length > 0,
    hasBlockers: profile?.focus_blockers?.length > 0,
    sessionCount: profile?.behavioral_patterns?.total_sessions || 0,
    successRate: profile?.behavioral_patterns.total_sessions > 0 
      ? (profile.behavioral_patterns.successful_sessions / profile.behavioral_patterns.total_sessions) 
      : 0,
    
    // Preference getters
    idealSessionLength: recommendations?.session_length || 25,
    bestFocusTime: recommendations?.best_time || 'morning',
    bestTemplates: recommendations?.best_templates || [],
    
    // Guardrail status
    guardrailsEnabled: profile?.guardrails || {},
    communicationTone: profile?.communication?.tone_preference || 'encouraging'
  };
}

// Hook for session recording integration
export function useSessionTracking() {
  const { recordSession } = usePersonalizationProfile();

  const trackSessionStart = useCallback((template, duration) => {
    // Could track session starts if needed
    console.log('Session started:', { template, duration });
  }, []);

  const trackSessionComplete = useCallback((sessionData) => {
    const { template, duration, completed, started_at } = sessionData;
    
    recordSession({
      duration: duration / 60000, // Convert to minutes
      completed: completed,
      template: template,
      started_time: started_at
    });
    
    console.log('Session recorded:', sessionData);
  }, [recordSession]);

  return {
    trackSessionStart,
    trackSessionComplete
  };
}

// Hook for quick personalization actions
export function usePersonalizationActions() {
  const { 
    toggleGuardrail, 
    setGoal, 
    addFocusBlocker, 
    setCommunicationStyle,
    updateProfile 
  } = usePersonalizationProfile();

  // Quick setup actions
  const enablePerfectionismGuard = useCallback(() => {
    return toggleGuardrail('perfectionism_timebox');
  }, [toggleGuardrail]);

  const enableBreakEnforcement = useCallback(() => {
    return toggleGuardrail('break_enforcement');
  }, [toggleGuardrail]);

  const enableRabbitHoleQuiz = useCallback(() => {
    return toggleGuardrail('rabbit_hole_quiz');
  }, [toggleGuardrail]);

  const setQuickGoal = useCallback((goal) => {
    return setGoal(goal, null, 'personal');
  }, [setGoal]);

  const addCommonBlockers = useCallback((blockers) => {
    blockers.forEach(blocker => addFocusBlocker(blocker));
  }, [addFocusBlocker]);

  const setEnergyWindow = useCallback((start, end, rating = 'high') => {
    return updateProfile({
      energy_windows: [{ start, end, rating, days: ['mon', 'tue', 'wed', 'thu', 'fri'] }]
    });
  }, [updateProfile]);

  const setSessionPreference = useCallback((length, breakDuration, style) => {
    return updateProfile({
      session_preferences: {
        ideal_length: length,
        preferred_break_duration: breakDuration,
        break_style: style
      }
    });
  }, [updateProfile]);

  return {
    enablePerfectionismGuard,
    enableBreakEnforcement,
    enableRabbitHoleQuiz,
    setQuickGoal,
    addCommonBlockers,
    setEnergyWindow,
    setSessionPreference,
    setCommunicationStyle
  };
}

// Hook for recommendations and insights
export function usePersonalizationInsights() {
  const { profile, recommendations } = usePersonalizationProfile();

  const getPersonalizedGreeting = useCallback(() => {
    const type = profile?.personality_type;
    const tone = profile?.communication?.tone_preference || 'encouraging';
    const sessionCount = profile?.behavioral_patterns?.total_sessions || 0;
    
    if (!type) return "Ready to focus?";
    
    const typeGreetings = {
      encouraging: {
        INTJ: sessionCount > 10 ? "Time to architect your next breakthrough!" : "Ready to build something strategic?",
        ENFP: sessionCount > 10 ? "Let's turn that energy into amazing results!" : "Ready to explore and create?",
        ISTJ: sessionCount > 10 ? "Consistent progress leads to mastery!" : "Ready for another productive session?",
        ESTP: sessionCount > 10 ? "Action time - let's make it happen!" : "Ready for an energizing focus sprint?"
      },
      direct: {
        INTJ: "Focus time. Execute your plan.",
        ENFP: "Channel that energy. Start now.",
        ISTJ: "Time to deliver consistent results.",
        ESTP: "Less thinking, more doing."
      }
    };
    
    return typeGreetings[tone]?.[type] || "Time to focus!";
  }, [profile]);

  const getPersonalizedTip = useCallback(() => {
    const type = profile?.personality_type;
    const blockers = profile?.focus_blockers || [];
    const successRate = profile?.behavioral_patterns.total_sessions > 0 
      ? (profile?.behavioral_patterns.successful_sessions / profile?.behavioral_patterns.total_sessions) 
      : 0;
    
    if (blockers.includes('social_media') && type?.includes('E')) {
      return "Try putting your phone in another room - it helps your extroverted mind stay on track!";
    }
    
    if (successRate < 0.5 && type?.includes('P')) {
      return "Consider shorter sessions - your perceiving preference works well with flexible timing!";
    }
    
    return "You're building great focus habits - keep it up!";
  }, [profile]);

  return {
    getPersonalizedGreeting,
    getPersonalizedTip,
    recommendations,
    profile
  };
}

export default usePersonalizationProfile;
