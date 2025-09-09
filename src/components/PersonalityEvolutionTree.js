"use client";

import { useState, useEffect } from 'react';

// Mock progression data - in real app, this would come from user's actual progress
const EVOLUTION_STAGES = {
  INTJ: [
    { level: 1, title: "Strategic Novice", requirements: "Complete first focus session", unlocked: true, current: true },
    { level: 2, title: "System Builder", requirements: "Complete 10 deep reading sessions", unlocked: false },
    { level: 3, title: "Master Planner", requirements: "Maintain 7-day focus streak", unlocked: false },
    { level: 4, title: "Visionary Architect", requirements: "Complete 50 total sessions", unlocked: false },
    { level: 5, title: "Strategic Mastermind", requirements: "Achieve 90% session completion rate", unlocked: false }
  ],
  ENFP: [
    { level: 1, title: "Enthusiastic Starter", requirements: "Complete first focus session", unlocked: true, current: true },
    { level: 2, title: "Creative Connector", requirements: "Try 5 different templates", unlocked: false },
    { level: 3, title: "Inspiring Motivator", requirements: "Complete 20 social productivity sessions", unlocked: false },
    { level: 4, title: "Innovation Catalyst", requirements: "Maintain consistent variety in sessions", unlocked: false },
    { level: 5, title: "Limitless Visionary", requirements: "Inspire 10 others to start focusing", unlocked: false }
  ]
  // Add more types as needed
};

const DEFAULT_STAGES = [
  { level: 1, title: "Focus Apprentice", requirements: "Complete first focus session", unlocked: true, current: true },
  { level: 2, title: "Productivity Explorer", requirements: "Complete 10 sessions", unlocked: false },
  { level: 3, title: "Focus Warrior", requirements: "Maintain 5-day streak", unlocked: false },
  { level: 4, title: "Mastery Seeker", requirements: "Complete 30 sessions", unlocked: false },
  { level: 5, title: "Focus Grandmaster", requirements: "Achieve consistent excellence", unlocked: false }
];

export default function PersonalityEvolutionTree({ personalityType }) {
  const [currentStage, setCurrentStage] = useState(1);
  const stages = EVOLUTION_STAGES[personalityType] || DEFAULT_STAGES;

  useEffect(() => {
    // Mock: read progress from localStorage or API
    // For now, assume user is at stage 1
    setCurrentStage(1);
  }, [personalityType]);

  return (
    <div className="retro-console multi-border rounded-xl p-4">
      <div className="text-center mb-4">
        <div className="font-tanker text-lg text-green tracking-wide">
          🌳 EVOLUTION PATH 🌳
        </div>
        <div className="text-sm text-neutral-600 mt-1">
          Your {personalityType} Growth Journey
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isUnlocked = stage.unlocked;
          const isCurrent = stage.current;
          const isCompleted = currentStage > stage.level;
          
          return (
            <div key={stage.level} className="flex items-start gap-3">
              
              {/* Level Badge */}
              <div 
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold`}
                style={{
                  background: isCompleted ? 'var(--color-green-900)' :
                             isCurrent ? 'var(--color-mint-500)' :
                             isUnlocked ? 'var(--color-amber-400)' :
                             '#e5e7eb',
                  color: isCompleted ? 'white' :
                         isCurrent ? 'var(--color-green-900)' :
                         isUnlocked ? 'var(--color-green-900)' :
                         '#6b7280',
                  borderColor: isUnlocked ? 'var(--color-green-900)' : '#d1d5db'
                }}
              >
                {isCompleted ? '✓' : stage.level}
              </div>

              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div 
                  className="absolute left-7 mt-8 w-0.5 h-6"
                  style={{
                    background: isUnlocked ? 'var(--color-green-900)' : '#d1d5db'
                  }}
                />
              )}

              {/* Stage Info */}
              <div className="flex-1">
                <div className={`font-semibold text-sm ${
                  isUnlocked ? 'text-neutral-800' : 'text-neutral-500'
                }`}>
                  {stage.title}
                  {isCurrent && <span className="ml-2 pill text-xs">Current</span>}
                </div>
                <div className={`text-xs mt-1 ${
                  isUnlocked ? 'text-neutral-600' : 'text-neutral-400'
                }`}>
                  {stage.requirements}
                </div>
                
                {/* Progress indicator for current stage */}
                {isCurrent && (
                  <div className="mt-2">
                    <div className="stat-bar">
                      <div 
                        className="stat-bar__fill"
                        style={{ width: '30%' }} // Mock progress
                      />
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">Progress: 30%</div>
                  </div>
                )}
                
                {/* Next milestone hint */}
                {isCurrent && index < stages.length - 1 && (
                  <div className="mt-2 p-2 rounded-lg border border-neutral-200">
                    <div className="text-xs text-neutral-700">
                      <strong>Next:</strong> {stages[index + 1].title}
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Icon */}
              <div className="flex-shrink-0 text-lg">
                {isCompleted ? '🏆' : isCurrent ? '⚡' : isUnlocked ? '🎯' : '🔒'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-4 pt-3 border-t border-neutral-200 text-center">
        <button className="nav-pill nav-pill--primary">
          🚀 Continue Journey
        </button>
      </div>
    </div>
  );
}
