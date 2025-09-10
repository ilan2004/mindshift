"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TutorialContext = createContext();

// Tutorial configuration - defines all available tutorials
const TUTORIAL_CONFIG = {
  onboarding: {
    id: 'onboarding',
    title: 'Welcome to Nudge',
    description: 'Learn the basics of personality-aware productivity',
    priority: 1,
    required: true,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Nudge',
        content: 'Nudge uses AI + personality profiling to create a personalized productivity system that works with your unique mindset.',
        target: null, // No specific target, just modal
        position: 'center'
      },
      {
        id: 'personality-intro',
        title: 'Your Personality Profile',
        content: 'First, we\'ll analyze your ChatGPT history to create personalized questions that reveal your productivity style.',
        target: '[data-tutorial="personality-card"]',
        position: 'center'
      },
      {
        id: 'focus-system',
        title: 'Focus Sessions',
        content: 'Start personalized focus sessions with profile-driven nudges when you visit distraction sites. The focus bar at the bottom helps you manage your productivity sessions.',
        target: '[data-tutorial="focus-bar"]',
        position: 'center'
      },
      {
        id: 'dashboard-overview',
        title: 'Your Dashboard',
        content: 'Track your progress, streaks, and achievements all in one place.',
        target: '[data-tutorial="dashboard"]',
        position: 'center'
      }
    ]
  },
  
  personality_test: {
    id: 'personality_test',
    title: 'Personality Assessment',
    description: 'Understand how the personality test works',
    priority: 2,
    required: true,
    steps: [
      {
        id: 'upload-history',
        title: 'Upload ChatGPT History',
        content: 'Upload your ChatGPT conversation history (exported as JSON) to generate personalized questions.',
        target: '[data-tutorial="upload-zone"]',
        position: 'center'
      },
      {
        id: 'ai-questions',
        title: 'AI-Generated Questions',
        content: 'Our AI creates 10-15 contextual questions based on your actual conversation patterns.',
        target: '[data-tutorial="questions-container"]',
        position: 'center'
      },
      {
        id: 'profile-results',
        title: 'Your Profile Type',
        content: 'Get your personalized profile (Analyst, Explorer, Diplomat, Sentinel) with tailored productivity strategies.',
        target: '[data-tutorial="profile-result"]',
        position: 'center'
      }
    ]
  },

  focus_sessions: {
    id: 'focus_sessions',
    title: 'Focus Sessions Guide',
    description: 'Master the focus session system',
    priority: 3,
    required: false,
    steps: [
      {
        id: 'session-templates',
        title: 'Session Templates',
        content: 'Choose from personality-specific templates or create custom sessions tailored to your work style.',
        target: '[data-tutorial="session-templates"]',
        position: 'center'
      },
      {
        id: 'distraction-blocking',
        title: 'Smart Blocking',
        content: 'When you visit distracting sites, you\'ll see personalized nudges based on your personality profile.',
        target: '[data-tutorial="blocking-demo"]',
        position: 'center'
      },
      {
        id: 'progress-tracking',
        title: 'Track Progress',
        content: 'Monitor your focus time, streaks, and productivity patterns over time.',
        target: '[data-tutorial="progress-graph"]',
        position: 'center'
      }
    ]
  },

  contracts: {
    id: 'contracts',
    title: 'Commitment Contracts',
    description: 'Learn about accountability systems',
    priority: 4,
    required: false,
    steps: [
      {
        id: 'contract-types',
        title: 'Contract Types',
        content: 'Choose from financial stakes, peer accountability, or streak-based commitments to stay motivated.',
        target: '[data-tutorial="contract-options"]',
        position: 'center'
      },
      {
        id: 'peer-accountability',
        title: 'Peer Accountability',
        content: 'Connect with friends or colleagues for mutual accountability and shared productivity goals.',
        target: '[data-tutorial="peer-panel"]',
        position: 'center'
      },
      {
        id: 'contract-tracking',
        title: 'Track Contracts',
        content: 'Monitor your active contracts, success rates, and accountability progress.',
        target: '[data-tutorial="contract-tracker"]',
        position: 'center'
      }
    ]
  },

  peer_accountability: {
    id: 'peer_accountability',
    title: 'Peer Accountability System',
    description: 'Social productivity through peer connections',
    priority: 5,
    required: false,
    steps: [
      {
        id: 'peer-panel-intro',
        title: 'Peer Accountability & Social Productivity',
        content: 'Connect with personality-compatible peers for mutual accountability and motivation. See real-time status updates, send encouraging nudges, and build a supportive productivity community together.',
        target: '[data-tutorial="peer-panel"]',
        position: 'center'
      }
    ]
  },

  leaderboard: {
    id: 'leaderboard',
    title: 'Community & Competition',
    description: 'Engage with the Nudge community',
    priority: 5,
    required: false,
    steps: [
      {
        id: 'leaderboard-basics',
        title: 'Productivity Leaderboard',
        content: 'See how your productivity compares with other users and find motivation in friendly competition.',
        target: '[data-tutorial="leaderboard"]',
        position: 'center'
      },
      {
        id: 'achievements',
        title: 'Badges & Achievements',
        content: 'Unlock badges for consistency, milestones, and special achievements.',
        target: '[data-tutorial="badges"]',
        position: 'center'
      }
    ]
  },

  community_challenges: {
    id: 'community_challenges',
    title: 'Personality-Tailored Challenges',
    description: 'Join challenges designed for your personality type',
    priority: 6,
    required: false,
    steps: [
      {
        id: 'challenge-intro',
        title: 'Personality-Tailored Community Challenges',
        content: 'Discover challenges specifically designed for your personality type, alongside universal challenges. These motivation-driven activities help you collaborate with like-minded peers and boost your productivity through social engagement.',
        target: '[data-tutorial="challenges"]',
        position: 'center'
      },
      {
        id: 'personality-specific',
        title: 'Your Personality Challenges',
        content: 'The challenges marked with ✨ are tailored to your specific personality type, using language and goals that resonate with how you naturally work and stay motivated.',
        target: '[data-tutorial="challenges"]',
        position: 'center'
      },
      {
        id: 'join-participate',
        title: 'Join & Collaborate',
        content: 'Click to join challenges that interest you. You can see how many others are participating, track your progress, and leave at any time. Use these challenges to build accountability with your productivity community.',
        target: '[data-tutorial="challenges"]',
        position: 'center'
      }
    ]
  },

  productivity_tracking: {
    id: 'productivity_tracking',
    title: 'Personality-Aware Progress Analytics',
    description: 'Track your productivity patterns with personality insights',
    priority: 7,
    required: false,
    steps: [
      {
        id: 'progress-overview',
        title: 'Your Productivity Analytics Dashboard',
        content: 'This graph shows your 7-day focus session history with personality-specific insights. The title and messaging adapt to your personality type, helping you understand your unique productivity patterns.',
        target: '[data-tutorial="productivity-analytics"]',
        position: 'center'
      },
      {
        id: 'personality-patterns',
        title: 'Personality-Based Productivity Patterns',
        content: 'Your graph shows realistic productivity patterns based on your personality type. For example, Analysts tend to show consistent high performance, while Explorers might have variable bursts of activity.',
        target: '[data-tutorial="productivity-analytics"]',
        position: 'center'
      },
      {
        id: 'insights-tracking',
        title: 'Track Your Peak Performance',
        content: 'Use the summary stats to identify your total focus time, daily averages, and best performance days. This helps you recognize your optimal productivity patterns and plan future sessions accordingly.',
        target: '[data-tutorial="productivity-analytics"]',
        position: 'center'
      }
    ]
  }
};

export function TutorialProvider({ children }) {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState(new Set());
  const [skippedTutorials, setSkippedTutorials] = useState(new Set());
  const [userPreferences, setUserPreferences] = useState({
    showTooltips: true,
    autoStart: true,
    pauseOnDistraction: true
  });
  const [profileDismissed, setProfileDismissed] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mindshift_tutorial_state');
      if (saved) {
        const state = JSON.parse(saved);
        setCompletedTutorials(new Set(state.completed || []));
        setSkippedTutorials(new Set(state.skipped || []));
        setUserPreferences({ ...userPreferences, ...state.preferences });
      }
    } catch (error) {
      console.warn('Failed to load tutorial state:', error);
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback(() => {
    try {
      const state = {
        completed: Array.from(completedTutorials),
        skipped: Array.from(skippedTutorials),
        preferences: userPreferences
      };
      localStorage.setItem('mindshift_tutorial_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save tutorial state:', error);
    }
  }, [completedTutorials, skippedTutorials, userPreferences]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // Check if user should see onboarding tutorial on first visit
  useEffect(() => {
    // Only check for profile dismissal if it hasn't been set yet
    if (!profileDismissed) {
      const profileSeen = localStorage.getItem('mindshift_profile_seen');
      if (profileSeen === 'true') {
        setProfileDismissed(true);
      }
    }
  }, [profileDismissed]);
  
  useEffect(() => {
    if (userPreferences.autoStart && 
        profileDismissed && 
        !completedTutorials.has('onboarding') && 
        !skippedTutorials.has('onboarding')) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        startTutorial('onboarding');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userPreferences.autoStart, profileDismissed, completedTutorials, skippedTutorials]);

  const startTutorial = useCallback((tutorialId) => {
    const tutorial = TUTORIAL_CONFIG[tutorialId];
    if (!tutorial) {
      console.warn(`Tutorial "${tutorialId}" not found`);
      return;
    }

    setCurrentTutorial(tutorial);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTutorial) return;
    
    if (currentStep < currentTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  }, [currentTutorial, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    if (!currentTutorial) return;
    
    setSkippedTutorials(prev => new Set([...prev, currentTutorial.id]));
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
  }, [currentTutorial]);

  const completeTutorial = useCallback(() => {
    if (!currentTutorial) return;
    
    setCompletedTutorials(prev => new Set([...prev, currentTutorial.id]));
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
  }, [currentTutorial]);

  const restartTutorial = useCallback((tutorialId) => {
    setCompletedTutorials(prev => {
      const newSet = new Set(prev);
      newSet.delete(tutorialId);
      return newSet;
    });
    setSkippedTutorials(prev => {
      const newSet = new Set(prev);
      newSet.delete(tutorialId);
      return newSet;
    });
    startTutorial(tutorialId);
  }, [startTutorial]);

  const updatePreferences = useCallback((newPrefs) => {
    setUserPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);
  
  const markProfileDismissed = useCallback(() => {
    setProfileDismissed(true);
  }, []);

  const getAvailableTutorials = useCallback(() => {
    return Object.values(TUTORIAL_CONFIG)
      .filter(tutorial => !completedTutorials.has(tutorial.id))
      .sort((a, b) => a.priority - b.priority);
  }, [completedTutorials]);

  const getTutorialProgress = useCallback((tutorialId) => {
    const tutorial = TUTORIAL_CONFIG[tutorialId];
    if (!tutorial) return { completed: false, progress: 0 };
    
    if (completedTutorials.has(tutorialId)) {
      return { completed: true, progress: 100 };
    }
    
    if (currentTutorial?.id === tutorialId && isActive) {
      const progress = Math.round(((currentStep + 1) / tutorial.steps.length) * 100);
      return { completed: false, progress, inProgress: true };
    }
    
    return { completed: false, progress: 0 };
  }, [completedTutorials, currentTutorial, currentStep, isActive]);

  const value = {
    // Current state
    currentTutorial,
    currentStep,
    isActive,
    completedTutorials,
    skippedTutorials,
    userPreferences,
    
    // Tutorial configuration
    TUTORIAL_CONFIG,
    
    // Actions
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    restartTutorial,
    updatePreferences,
    markProfileDismissed,
    
    // Utilities
    getAvailableTutorials,
    getTutorialProgress,
    
    // Current step data
    currentStepData: currentTutorial?.steps[currentStep] || null,
    isFirstStep: currentStep === 0,
    isLastStep: currentTutorial ? currentStep === currentTutorial.steps.length - 1 : false,
    totalSteps: currentTutorial?.steps.length || 0
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

export default TutorialContext;
