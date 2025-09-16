"use client";

import { useState, useEffect } from 'react';
import { TRAIT_DESCRIPTIONS } from '@/lib/personalityData';

export default function PersonalityDNA({ personalityType }) {
  const [animatedPercentages, setAnimatedPercentages] = useState({});
  
  if (!personalityType || personalityType.length !== 4) return null;

  const traits = personalityType.split('');
  
  // Simulate realistic trait strength percentages based on personality type
  // In a real app, these would come from the actual quiz results
  const getTraitStrengths = (type) => {
    const strengths = {
      // Strong preferences (75-85%)
      INTJ: { E: 25, I: 75, N: 80, S: 20, T: 78, F: 22, J: 82, P: 18 },
      INTP: { E: 30, I: 70, N: 85, S: 15, T: 75, F: 25, J: 25, P: 75 },
      ENTJ: { E: 78, I: 22, N: 75, S: 25, T: 82, F: 18, J: 85, P: 15 },
      ENTP: { E: 80, I: 20, N: 82, S: 18, T: 72, F: 28, J: 20, P: 80 },
      INFJ: { E: 35, I: 65, N: 78, S: 22, T: 30, F: 70, J: 75, P: 25 },
      INFP: { E: 25, I: 75, N: 80, S: 20, T: 25, F: 75, J: 30, P: 70 },
      ENFJ: { E: 75, I: 25, N: 72, S: 28, T: 32, F: 68, J: 78, P: 22 },
      ENFP: { E: 82, I: 18, N: 85, S: 15, T: 28, F: 72, J: 22, P: 78 },
      ISTJ: { E: 20, I: 80, N: 25, S: 75, T: 70, F: 30, J: 85, P: 15 },
      ISFJ: { E: 30, I: 70, N: 35, S: 65, T: 25, F: 75, J: 78, P: 22 },
      ESTJ: { E: 75, I: 25, N: 30, S: 70, T: 75, F: 25, J: 82, P: 18 },
      ESFJ: { E: 78, I: 22, N: 32, S: 68, T: 28, F: 72, J: 80, P: 20 },
      ISTP: { E: 35, I: 65, N: 40, S: 60, T: 72, F: 28, J: 25, P: 75 },
      ISFP: { E: 25, I: 75, N: 45, S: 55, T: 30, F: 70, J: 28, P: 72 },
      ESTP: { E: 80, I: 20, N: 35, S: 65, T: 68, F: 32, J: 22, P: 78 },
      ESFP: { E: 85, I: 15, N: 38, S: 62, T: 25, F: 75, J: 20, P: 80 }
    };
    return strengths[type] || { E: 50, I: 50, N: 50, S: 50, T: 50, F: 50, J: 50, P: 50 };
  };
  
  const traitStrengths = getTraitStrengths(personalityType);
  
  // Pair opposing traits with their percentages
  const traitPairs = [
    { 
      dominant: traits[0], 
      recessive: traits[0] === 'E' ? 'I' : 'E', 
      category: 'Energy',
      dominantPercent: traitStrengths[traits[0]],
      recessivePercent: traitStrengths[traits[0] === 'E' ? 'I' : 'E']
    },
    { 
      dominant: traits[1], 
      recessive: traits[1] === 'N' ? 'S' : 'N', 
      category: 'Information',
      dominantPercent: traitStrengths[traits[1]],
      recessivePercent: traitStrengths[traits[1] === 'N' ? 'S' : 'N']
    },
    { 
      dominant: traits[2], 
      recessive: traits[2] === 'T' ? 'F' : 'T', 
      category: 'Decisions',
      dominantPercent: traitStrengths[traits[2]],
      recessivePercent: traitStrengths[traits[2] === 'T' ? 'F' : 'T']
    },
    { 
      dominant: traits[3], 
      recessive: traits[3] === 'J' ? 'P' : 'J', 
      category: 'Structure',
      dominantPercent: traitStrengths[traits[3]],
      recessivePercent: traitStrengths[traits[3] === 'J' ? 'P' : 'J']
    }
  ];
  
  // Animate percentages on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const animated = {};
      traitPairs.forEach((pair, index) => {
        animated[`${index}_dominant`] = pair.dominantPercent;
        animated[`${index}_recessive`] = pair.recessivePercent;
      });
      setAnimatedPercentages(animated);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [personalityType]);

  return (
    <div className="retro-console rounded-xl p-4">
      <div className="text-center mb-4">
        <div className="font-tanker text-lg text-green tracking-wide">
          🧬 PERSONALITY DNA 🧬
        </div>
        <div className="text-sm text-neutral-600 mt-1">
          Your {personalityType} Genetic Code
        </div>
      </div>

      <div className="space-y-5">
        {traitPairs.map((pair, index) => {
          const dominantAnimated = animatedPercentages[`${index}_dominant`] || 0;
          const recessiveAnimated = animatedPercentages[`${index}_recessive`] || 0;
          
          return (
            <div key={index} className="space-y-3">
              {/* Category Label */}
              <div className="text-xs font-semibold text-neutral-600 text-center">
                {pair.category}
              </div>
              
              {/* Progress Bar Visualization */}
              <div className="space-y-2">
                {/* Dominant Trait Bar */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-right text-green-700">
                    {TRAIT_DESCRIPTIONS[pair.dominant].name}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${dominantAnimated}%` }}
                      />
                    </div>
                    <div className="absolute right-0 top-3 text-xs font-bold text-green-600">
                      {pair.dominantPercent}%
                    </div>
                  </div>
                  <div className="text-lg">
                    {pair.dominant}
                  </div>
                </div>
                
                {/* Recessive Trait Bar */}
                <div className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-right text-gray-500">
                    {TRAIT_DESCRIPTIONS[pair.recessive].name}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${recessiveAnimated}%` }}
                      />
                    </div>
                    <div className="absolute right-0 top-3 text-xs font-bold text-gray-500">
                      {pair.recessivePercent}%
                    </div>
                  </div>
                  <div className="text-lg text-gray-400">
                    {pair.recessive}
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              {index < traitPairs.length - 1 && (
                <div className="border-t border-gray-200 pt-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* DNA Sequence Display */}
      <div className="mt-4 pt-3 border-t border-neutral-200">
        <div className="text-center">
          <div className="text-xs text-neutral-600 mb-1">DNA Sequence</div>
          <div className="font-mono text-lg font-bold text-green-900 tracking-wider">
            {traits.map((trait, i) => (
              <span key={i} className="mx-1">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Genetic Compatibility Hint */}
      <div className="mt-3 p-2 rounded-lg border border-neutral-200">
        <div className="text-xs text-neutral-700 text-center">
          💡 <strong>Compatibility Tip:</strong> Types with 2-3 shared traits often work well together
        </div>
      </div>
    </div>
  );
}
