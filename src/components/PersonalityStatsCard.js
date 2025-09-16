"use client";

import { useState, useEffect, useMemo } from 'react';

const PERSONALITY_STATS = {
  // ANALYSTS - Strategic thinkers focused on competence
  INTJ: { focusPower: 9, socialEnergy: 3, planningSkill: 8, adaptability: 4, deepThinking: 10 }, // Strong: Focus, Planning, Deep Thinking | Weak: Social, Adaptability
  INTP: { focusPower: 8, socialEnergy: 2, planningSkill: 4, adaptability: 7, deepThinking: 10 }, // Strong: Deep Thinking, Focus, Adaptability | Weak: Social, Planning
  ENTJ: { focusPower: 8, socialEnergy: 8, planningSkill: 10, adaptability: 5, deepThinking: 7 }, // Strong: Planning, Focus, Social | Weak: Adaptability | Average: Deep Thinking
  ENTP: { focusPower: 6, socialEnergy: 9, planningSkill: 3, adaptability: 9, deepThinking: 8 }, // Strong: Social, Adaptability, Deep Thinking | Weak: Planning | Average: Focus
  
  // DIPLOMATS - People-focused idealists
  INFJ: { focusPower: 8, socialEnergy: 4, planningSkill: 7, adaptability: 5, deepThinking: 9 }, // Strong: Deep Thinking, Focus, Planning | Weak: Social | Average: Adaptability
  INFP: { focusPower: 7, socialEnergy: 4, planningSkill: 3, adaptability: 8, deepThinking: 8 }, // Strong: Deep Thinking, Adaptability, Focus | Weak: Planning, Social
  ENFJ: { focusPower: 7, socialEnergy: 9, planningSkill: 8, adaptability: 7, deepThinking: 6 }, // Strong: Social, Planning, Adaptability | Weak: Deep Thinking | Average: Focus
  ENFP: { focusPower: 5, socialEnergy: 10, planningSkill: 3, adaptability: 9, deepThinking: 7 }, // Strong: Social, Adaptability, Deep Thinking | Weak: Planning | Average: Focus
  
  // ACHIEVERS/SENTINELS - Reliable and structured
  ISTJ: { focusPower: 8, socialEnergy: 3, planningSkill: 9, adaptability: 3, deepThinking: 6 }, // Strong: Focus, Planning | Weak: Social, Adaptability | Average: Deep Thinking
  ISFJ: { focusPower: 7, socialEnergy: 6, planningSkill: 8, adaptability: 4, deepThinking: 5 }, // Strong: Planning, Focus | Weak: Adaptability | Average: Social, Deep Thinking
  ESTJ: { focusPower: 8, socialEnergy: 7, planningSkill: 9, adaptability: 4, deepThinking: 5 }, // Strong: Planning, Focus, Social | Weak: Adaptability | Average: Deep Thinking
  ESFJ: { focusPower: 6, socialEnergy: 9, planningSkill: 8, adaptability: 5, deepThinking: 4 }, // Strong: Social, Planning | Weak: Deep Thinking | Average: Focus, Adaptability
  
  // EXPLORERS - Flexible and action-oriented
  ISTP: { focusPower: 7, socialEnergy: 3, planningSkill: 4, adaptability: 9, deepThinking: 7 }, // Strong: Adaptability, Focus, Deep Thinking | Weak: Social, Planning
  ISFP: { focusPower: 6, socialEnergy: 4, planningSkill: 3, adaptability: 8, deepThinking: 7 }, // Strong: Adaptability, Deep Thinking | Weak: Planning, Social | Average: Focus
  ESTP: { focusPower: 5, socialEnergy: 9, planningSkill: 3, adaptability: 10, deepThinking: 4 }, // Strong: Social, Adaptability | Weak: Planning, Deep Thinking | Average: Focus
  ESFP: { focusPower: 4, socialEnergy: 10, planningSkill: 3, adaptability: 9, deepThinking: 4 }  // Strong: Social, Adaptability | Weak: Focus, Planning, Deep Thinking
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
  const stats = useMemo(() => PERSONALITY_STATS[personalityType] || {}, [personalityType]);

  useEffect(() => {
    // Animate stats on mount
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 300);

    return () => clearTimeout(timer);
  }, [personalityType, stats]);

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
          
          // Determine stat strength level for color coding
          const getStatLevel = (val) => {
            if (val >= 8) return 'strong';   // 8-10: Strong (green)
            if (val >= 6) return 'average';  // 6-7: Average (blue)
            return 'weak';                   // 2-5: Weak (orange)
          };
          
          const statLevel = getStatLevel(value);
          const barColor = statLevel === 'strong' ? '#059669' :  // green-600
                          statLevel === 'average' ? '#2563eb' : // blue-600  
                          '#ea580c'; // orange-600
          
          return (
            <div key={statKey} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm">{icon}</span>
                <span className="text-sm font-semibold text-neutral-800">{label}</span>
              </div>
              
              <div className="flex-1 flex items-center gap-2">
                <div className="stat-bar flex-1">
                  <div 
                    className="stat-bar__fill transition-all duration-1000"
                    style={{ 
                      width: `${(animatedValue / 10) * 100}%`,
                      backgroundColor: barColor
                    }}
                  />
                </div>
                <div className={`text-xs font-bold min-w-[30px] ${
                  statLevel === 'strong' ? 'text-green-600' :
                  statLevel === 'average' ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {value}/10
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-neutral-200">
        <div className="text-xs text-neutral-600 mb-3 text-center">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-green-600"></div>
              <span>Strong (8-10)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-blue-600"></div>
              <span>Average (6-7)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-orange-600"></div>
              <span>Growth Area (2-5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
