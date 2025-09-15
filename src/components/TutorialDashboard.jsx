"use client";

import { useState } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import AnimatedCard from './AnimatedCard';
import { 
  Play, 
  CheckCircle, 
  SkipForward, 
  BookOpen, 
  Target, 
  Settings,
  RotateCcw,
  Star
} from 'lucide-react';

export default function TutorialDashboard({ className = "" }) {
  const {
    TUTORIAL_CONFIG,
    completedTutorials,
    skippedTutorials,
    startTutorial,
    restartTutorial,
    getTutorialProgress,
    updatePreferences,
    userPreferences,
    getAvailableTutorials
  } = useTutorial();

  const [showSettings, setShowSettings] = useState(false);

  const allTutorials = Object.values(TUTORIAL_CONFIG);
  const availableTutorials = getAvailableTutorials();
  const completedCount = completedTutorials.size;
  const totalCount = allTutorials.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <AnimatedCard className="retro-console rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="h2 font-tanker text-mbti-primary mb-2">
              Tutorial Center
            </h2>
            <p className="text-mbti-secondary text-sm">
              Learn Nudge's personality-aware productivity system
            </p>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="nav-icon-btn opacity-75 hover:opacity-100"
            aria-label="Tutorial Settings"
          >
            <Settings className="nav-icon" />
          </button>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-mbti-primary">Overall Progress</span>
            <span className="text-sm text-mbti-secondary">{completedCount}/{totalCount} completed</span>
          </div>
          <div className="stat-bar">
            <div 
              className="stat-bar__fill transition-all duration-500"
              style={{ 
                width: `${overallProgress}%`,
                background: `linear-gradient(90deg, var(--mbti-primary), var(--mbti-accent))`
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-mbti-primary">{completedCount}</div>
            <div className="text-xs text-mbti-secondary uppercase tracking-wide">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-mbti-accent">{availableTutorials.length}</div>
            <div className="text-xs text-mbti-secondary uppercase tracking-wide">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-mbti-secondary">{skippedTutorials.size}</div>
            <div className="text-xs text-mbti-secondary uppercase tracking-wide">Skipped</div>
          </div>
        </div>
      </AnimatedCard>

      {/* Settings Panel */}
      {showSettings && (
        <AnimatedCard className="retro-console rounded-2xl p-6">
          <h3 className="h3 font-tanker text-mbti-primary mb-4">Tutorial Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={userPreferences.showTooltips}
                onChange={(e) => updatePreferences({ showTooltips: e.target.checked })}
                className="w-4 h-4 text-mbti-primary rounded border-mbti-secondary focus:ring-mbti-primary"
              />
              <div>
                <div className="text-sm font-medium text-mbti-primary">Show Helpful Tooltips</div>
                <div className="text-xs text-mbti-secondary">Display context hints throughout the app</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={userPreferences.autoStart}
                onChange={(e) => updatePreferences({ autoStart: e.target.checked })}
                className="w-4 h-4 text-mbti-primary rounded border-mbti-secondary focus:ring-mbti-primary"
              />
              <div>
                <div className="text-sm font-medium text-mbti-primary">Auto-start Tutorials</div>
                <div className="text-xs text-mbti-secondary">Automatically begin tutorials for new features</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={userPreferences.pauseOnDistraction}
                onChange={(e) => updatePreferences({ pauseOnDistraction: e.target.checked })}
                className="w-4 h-4 text-mbti-primary rounded border-mbti-secondary focus:ring-mbti-primary"
              />
              <div>
                <div className="text-sm font-medium text-mbti-primary">Pause on Distraction</div>
                <div className="text-xs text-mbti-secondary">Pause tutorials when switching tabs or apps</div>
              </div>
            </label>
          </div>
        </AnimatedCard>
      )}

      {/* Available Tutorials */}
      {availableTutorials.length > 0 && (
        <div>
          <h3 className="h3 font-tanker text-mbti-primary mb-4">Available Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTutorials.map(tutorial => {
              const progress = getTutorialProgress(tutorial.id);
              return (
                <TutorialCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  progress={progress}
                  onStart={() => startTutorial(tutorial.id)}
                  status="available"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tutorials */}
      {completedCount > 0 && (
        <div>
          <h3 className="h3 font-tanker text-mbti-primary mb-4">Completed Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTutorials
              .filter(tutorial => completedTutorials.has(tutorial.id))
              .map(tutorial => {
                const progress = getTutorialProgress(tutorial.id);
                return (
                  <TutorialCard
                    key={tutorial.id}
                    tutorial={tutorial}
                    progress={progress}
                    onStart={() => restartTutorial(tutorial.id)}
                    status="completed"
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* Skipped Tutorials */}
      {skippedTutorials.size > 0 && (
        <div>
          <h3 className="h3 font-tanker text-mbti-primary mb-4 opacity-75">Skipped Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTutorials
              .filter(tutorial => skippedTutorials.has(tutorial.id))
              .map(tutorial => {
                const progress = getTutorialProgress(tutorial.id);
                return (
                  <TutorialCard
                    key={tutorial.id}
                    tutorial={tutorial}
                    progress={progress}
                    onStart={() => startTutorial(tutorial.id)}
                    status="skipped"
                  />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function TutorialCard({ tutorial, progress, onStart, status }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'skipped': return <SkipForward size={16} className="text-amber-500" />;
      case 'available': return tutorial.required ? <Star size={16} className="text-mbti-accent" /> : <BookOpen size={16} className="text-mbti-primary" />;
      default: return <Target size={16} className="text-mbti-primary" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'nav-pill--primary';
      case 'skipped': return 'nav-pill--amber';
      case 'available': return tutorial.required ? 'nav-pill--accent' : 'nav-pill--cyan';
      default: return 'nav-pill--outline';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'completed': return 'Restart';
      case 'skipped': return 'Try Again';
      case 'available': return 'Start';
      default: return 'Continue';
    }
  };

  return (
    <AnimatedCard className="component-surface rounded-xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className={`nav-pill ${getStatusColor()} text-xs font-bold uppercase tracking-wider`}>
            {tutorial.required ? 'Required' : 'Optional'}
          </div>
        </div>
        
        {progress.inProgress && (
          <div className="nav-pill nav-pill--outline text-xs">
            {progress.progress}% Complete
          </div>
        )}
      </div>

      <h4 className="font-tanker text-lg text-mbti-primary mb-2">
        {tutorial.title}
      </h4>
      
      <p className="text-sm text-mbti-secondary mb-4 leading-relaxed">
        {tutorial.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="text-xs text-mbti-secondary">
          {tutorial.steps.length} steps • {Math.ceil(tutorial.steps.length * 1.5)}min
        </div>
        
        <button
          onClick={onStart}
          className="nav-pill nav-pill--primary nav-pill--compact flex items-center gap-2"
        >
          {status === 'completed' ? <RotateCcw size={12} /> : <Play size={12} />}
          {getButtonText()}
        </button>
      </div>
    </AnimatedCard>
  );
}
