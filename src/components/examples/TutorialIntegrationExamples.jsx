/**
 * TUTORIAL INTEGRATION EXAMPLES
 * 
 * This file demonstrates how to integrate the tutorial system
 * with your existing MindShift components by adding data-tutorial
 * attributes and tutorial trigger buttons.
 */

"use client";

import { useTutorial } from '../../contexts/TutorialContext';
import { BookOpen, Target, HelpCircle } from 'lucide-react';

// ============================================================================
// EXAMPLE 1: Updated CharacterCard with tutorial integration
// ============================================================================

export function ExampleCharacterCardWithTutorial({ personalityType, title, size }) {
  const { startTutorial, completedTutorials } = useTutorial();
  
  return (
    <div 
      className="character-card-container"
      data-tutorial="personality-card" // Add this for tutorial targeting
    >
      {/* Existing CharacterCard content */}
      <div className="retro-console rounded-2xl p-6">
        <h2 className="font-tanker text-mbti-primary">Your Character Profile</h2>
        
        {/* Tutorial trigger button */}
        {!completedTutorials.has('personality_test') && (
          <button
            onClick={() => startTutorial('personality_test')}
            className="nav-pill nav-pill--cyan nav-pill--compact flex items-center gap-1 mt-3"
          >
            <BookOpen size={12} />
            Learn About Profiles
          </button>
        )}
        
        {/* Rest of your existing CharacterCard JSX */}
        <div className="personality-display">
          {personalityType && (
            <div className="nav-pill nav-pill--primary">
              {personalityType}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Updated FooterFocusBar with tutorial integration
// ============================================================================

export function ExampleFooterFocusBarWithTutorial() {
  const { startTutorial, completedTutorials } = useTutorial();
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50"
      data-tutorial="focus-bar" // Add this for tutorial targeting
    >
      <div className="retro-console m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="nav-pill nav-pill--primary">
              Start Focus Session
            </button>
            
            {/* Tutorial hint for new users */}
            {!completedTutorials.has('focus_sessions') && (
              <button
                onClick={() => startTutorial('focus_sessions')}
                className="nav-pill nav-pill--outline nav-pill--compact flex items-center gap-1"
                title="Learn about focus sessions"
              >
                <HelpCircle size={12} />
                How does this work?
              </button>
            )}
          </div>
          
          <div className="text-mbti-secondary text-sm">
            Ready to focus • 25:00
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Dashboard integration with multiple tutorial targets
// ============================================================================

export function ExampleDashboardWithTutorials() {
  const { startTutorial, completedTutorials, userPreferences } = useTutorial();
  
  const showTutorialHints = userPreferences.showTooltips;
  
  return (
    <div 
      className="dashboard-container space-y-6"
      data-tutorial="dashboard" // Add this for dashboard tutorial
    >
      {/* Header with onboarding trigger */}
      <div className="flex items-center justify-between">
        <h1 className="h1 font-tanker text-mbti-primary">Your Dashboard</h1>
        
        <div className="flex items-center gap-3">
          {/* Tutorial menu */}
          <div className="relative group">
            <button className="nav-icon-btn">
              <BookOpen className="nav-icon" />
            </button>
            
            {/* Tutorial dropdown */}
            <div className="absolute right-0 top-full mt-2 w-64 hidden group-hover:block">
              <div className="retro-console rounded-xl p-4">
                <h4 className="font-medium text-mbti-primary mb-3">Tutorials</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => startTutorial('onboarding')}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-mbti-primary/10 transition-colors"
                  >
                    📖 Getting Started
                  </button>
                  <button
                    onClick={() => startTutorial('focus_sessions')}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-mbti-primary/10 transition-colors"
                  >
                    🎯 Focus Sessions
                  </button>
                  <button
                    onClick={() => startTutorial('contracts')}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-mbti-primary/10 transition-colors"
                  >
                    🤝 Commitment Contracts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards with tutorial targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="component-surface rounded-xl p-4"
          data-tutorial="progress-graph" // Tutorial target for progress
        >
          <h3 className="font-medium text-mbti-primary mb-2">Focus Time</h3>
          <div className="text-2xl font-bold text-mbti-primary">2.5h</div>
          <p className="text-sm text-mbti-secondary">Today</p>
          
          {showTutorialHints && !completedTutorials.has('focus_sessions') && (
            <div className="mt-2">
              <button
                onClick={() => startTutorial('focus_sessions')}
                className="text-xs text-mbti-accent hover:underline"
              >
                Learn how focus tracking works →
              </button>
            </div>
          )}
        </div>

        <div 
          className="component-surface rounded-xl p-4"
          data-tutorial="contract-tracker" // Tutorial target for contracts
        >
          <h3 className="font-medium text-mbti-primary mb-2">Active Contracts</h3>
          <div className="text-2xl font-bold text-mbti-accent">3</div>
          <p className="text-sm text-mbti-secondary">In progress</p>
          
          {showTutorialHints && !completedTutorials.has('contracts') && (
            <div className="mt-2">
              <button
                onClick={() => startTutorial('contracts')}
                className="text-xs text-mbti-accent hover:underline"
              >
                What are contracts? →
              </button>
            </div>
          )}
        </div>

        <div 
          className="component-surface rounded-xl p-4"
          data-tutorial="badges" // Tutorial target for achievements
        >
          <h3 className="font-medium text-mbti-primary mb-2">Streak</h3>
          <div className="text-2xl font-bold text-mbti-primary">12</div>
          <p className="text-sm text-mbti-secondary">Days</p>
        </div>
      </div>

      {/* Leaderboard section */}
      <div 
        className="retro-console rounded-2xl p-6"
        data-tutorial="leaderboard" // Tutorial target for leaderboard
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="h2 font-tanker text-mbti-primary">Leaderboard</h2>
          
          {showTutorialHints && !completedTutorials.has('leaderboard') && (
            <button
              onClick={() => startTutorial('leaderboard')}
              className="nav-pill nav-pill--cyan nav-pill--compact flex items-center gap-1"
            >
              <Target size={12} />
              Tour Community Features
            </button>
          )}
        </div>
        
        {/* Leaderboard content */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-mbti-surface rounded-xl">
            <span className="font-medium">1. Alice (ENFJ)</span>
            <span className="text-mbti-accent">2,450 pts</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-mbti-surface rounded-xl">
            <span className="font-medium">2. You (INTJ)</span>
            <span className="text-mbti-accent">2,200 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Personality test flow with tutorial integration
// ============================================================================

export function ExamplePersonalityTestWithTutorial() {
  const { startTutorial, completedTutorials } = useTutorial();
  
  return (
    <div className="personality-test-container max-w-4xl mx-auto space-y-6">
      {/* Upload section */}
      <div 
        className="retro-console rounded-2xl p-8"
        data-tutorial="upload-zone" // Tutorial target
      >
        <h2 className="h2 font-tanker text-mbti-primary mb-4">
          Upload ChatGPT History
        </h2>
        
        <div className="border-2 border-dashed border-mbti-primary/30 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-mbti-primary font-medium mb-2">
            Drag & drop your ChatGPT export file here
          </p>
          <p className="text-sm text-mbti-secondary mb-4">
            Export your conversations from ChatGPT settings
          </p>
          
          <button className="nav-pill nav-pill--primary">
            Choose File
          </button>
          
          {/* Tutorial trigger for new users */}
          {!completedTutorials.has('personality_test') && (
            <div className="mt-4">
              <button
                onClick={() => startTutorial('personality_test')}
                className="text-sm text-mbti-accent hover:underline"
              >
                How does this work? Take the tutorial →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Questions section */}
      <div 
        className="retro-console rounded-2xl p-8"
        data-tutorial="questions-container" // Tutorial target
      >
        <h2 className="h2 font-tanker text-mbti-primary mb-4">
          Personalized Questions
        </h2>
        
        <div className="space-y-4">
          <div className="component-surface rounded-xl p-4">
            <p className="text-mbti-primary font-medium mb-2">
              Question 1 of 12
            </p>
            <p className="text-mbti-secondary mb-4">
              Based on your conversations, you often discuss creative projects. 
              When working on something new, do you prefer to...
            </p>
            
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-mbti-primary/20 hover:bg-mbti-primary/5 transition-colors">
                A) Plan every detail before starting
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-mbti-primary/20 hover:bg-mbti-primary/5 transition-colors">
                B) Jump in and figure it out as I go
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div 
        className="retro-console rounded-2xl p-8"
        data-tutorial="profile-result" // Tutorial target
      >
        <h2 className="h2 font-tanker text-mbti-primary mb-4">
          Your Profile Result
        </h2>
        
        <div className="text-center">
          <div className="nav-pill nav-pill--primary text-2xl font-tanker mb-4">
            INTJ - Analyst
          </div>
          <p className="text-mbti-secondary">
            Strategic planner who prefers deep, uninterrupted work
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TUTORIAL INTEGRATION INSTRUCTIONS
// ============================================================================

/**
 * TO INTEGRATE TUTORIALS INTO YOUR EXISTING COMPONENTS:
 * 
 * 1. ADD DATA ATTRIBUTES:
 *    Add data-tutorial="target-name" to elements you want to highlight
 *    Example: <div data-tutorial="personality-card">
 * 
 * 2. IMPORT THE HOOK:
 *    import { useTutorial } from '../contexts/TutorialContext';
 * 
 * 3. ADD TUTORIAL TRIGGERS:
 *    Use startTutorial(tutorialId) to manually start specific tutorials
 *    Example: <button onClick={() => startTutorial('onboarding')}>
 * 
 * 4. CONDITIONAL TUTORIAL HINTS:
 *    Show hints only for users who haven't completed tutorials
 *    Example: {!completedTutorials.has('tutorial_id') && <TutorialHint />}
 * 
 * 5. RESPECT USER PREFERENCES:
 *    Check userPreferences.showTooltips before showing hints
 *    Example: {userPreferences.showTooltips && <Hint />}
 */
