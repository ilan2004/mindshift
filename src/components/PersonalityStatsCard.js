"use client";

import { useState, useEffect } from 'react';

const PERSONALITY_STATS = {
  INTJ: { focusPower: 9, socialEnergy: 3, planningSkill: 9, adaptability: 4, deepThinking: 10 },
  INTP: { focusPower: 7, socialEnergy: 3, planningSkill: 4, adaptability: 8, deepThinking: 10 },
  ENTJ: { focusPower: 8, socialEnergy: 8, planningSkill: 10, adaptability: 6, deepThinking: 7 },
  ENTP: { focusPower: 6, socialEnergy: 9, planningSkill: 4, adaptability: 9, deepThinking: 8 },
  INFJ: { focusPower: 8, socialEnergy: 4, planningSkill: 7, adaptability: 5, deepThinking: 9 },
  INFP: { focusPower: 6, socialEnergy: 4, planningSkill: 3, adaptability: 8, deepThinking: 8 },
  ENFJ: { focusPower: 7, socialEnergy: 9, planningSkill: 8, adaptability: 7, deepThinking: 6 },
  ENFP: { focusPower: 5, socialEnergy: 10, planningSkill: 3, adaptability: 10, deepThinking: 6 },
  ISTJ: { focusPower: 8, socialEnergy: 3, planningSkill: 10, adaptability: 2, deepThinking: 6 },
  ISFJ: { focusPower: 6, socialEnergy: 6, planningSkill: 8, adaptability: 4, deepThinking: 5 },
  ESTJ: { focusPower: 7, socialEnergy: 7, planningSkill: 10, adaptability: 3, deepThinking: 5 },
  ESFJ: { focusPower: 6, socialEnergy: 9, planningSkill: 8, adaptability: 5, deepThinking: 4 },
  ISTP: { focusPower: 7, socialEnergy: 2, planningSkill: 4, adaptability: 9, deepThinking: 7 },
  ISFP: { focusPower: 5, socialEnergy: 4, planningSkill: 3, adaptability: 8, deepThinking: 6 },
  ESTP: { focusPower: 4, socialEnergy: 9, planningSkill: 2, adaptability: 10, deepThinking: 3 },
  ESFP: { focusPower: 3, socialEnergy: 10, planningSkill: 2, adaptability: 9, deepThinking: 3 }
};

const STAT_LABELS = {
  focusPower: { label: "Focus Power", icon: "🎯" },
  socialEnergy: { label: "Social Energy", icon: "⚡" },
  planningSkill: { label: "Planning Skill", icon: "📋" },
  adaptability: { label: "Adaptability", icon: "🔄" },
  deepThinking: { label: "Deep Thinking", icon: "🧠" }
};

export default function PersonalityStatsCard({ personalityType }) {
  const [animatedStats, setAnimatedStats] = useState({});
  const stats = PERSONALITY_STATS[personalityType] || {};

  useEffect(() => {
    // Animate stats on mount
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 300);

    return () => clearTimeout(timer);
  }, [personalityType]);

  return (
    <div className="retro-console rounded-xl p-4">
      <div className="text-center mb-4">
        <div className="font-tanker text-lg text-green tracking-wide">
          ⚔️ PERSONALITY STATS ⚔️
        </div>
        <div className="text-sm text-neutral-600 mt-1">
          {personalityType} Character Build
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(STAT_LABELS).map(([statKey, { label, icon }]) => {
          const value = stats[statKey] || 0;
          const animatedValue = animatedStats[statKey] || 0;
          
          return (
            <div key={statKey} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm">{icon}</span>
                <span className="text-sm font-semibold text-neutral-800">{label}</span>
              </div>
              
              <div className="flex-1 flex items-center gap-2">
                <div className="stat-bar flex-1">
                  <div 
                    className="stat-bar__fill"
                    style={{ width: `${(animatedValue / 10) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-neutral-600 min-w-[30px]">
                  {value}/10
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Score */}
      <div className="mt-4 pt-3 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-800">Overall Power</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => {
              const totalScore = Object.values(stats).reduce((sum, val) => sum + val, 0);
              const overallRating = Math.ceil(totalScore / 10);
              return (
                <span 
                  key={i} 
                  className={`text-lg ${i < overallRating ? 'text-yellow-500' : 'text-neutral-300'}`}
                >
                  ⭐
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
