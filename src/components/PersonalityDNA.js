"use client";

import { TRAIT_DESCRIPTIONS } from '@/lib/personalityData';

export default function PersonalityDNA({ personalityType }) {
  if (!personalityType || personalityType.length !== 4) return null;

  const traits = personalityType.split('');
  
  // Pair opposing traits
  const traitPairs = [
    { dominant: traits[0], recessive: traits[0] === 'E' ? 'I' : 'E', category: 'Energy' },
    { dominant: traits[1], recessive: traits[1] === 'N' ? 'S' : 'N', category: 'Information' },
    { dominant: traits[2], recessive: traits[2] === 'T' ? 'F' : 'T', category: 'Decisions' },
    { dominant: traits[3], recessive: traits[3] === 'J' ? 'P' : 'J', category: 'Structure' }
  ];

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

      <div className="space-y-4">
        {traitPairs.map((pair, index) => (
          <div key={index} className="space-y-2">
            {/* Category Label */}
            <div className="text-xs font-semibold text-neutral-600 text-center">
              {pair.category}
            </div>
            
            {/* DNA Strand Row */}
            <div className="dna-row">
              {/* Left Node (Dominant) */}
              <div className="flex items-center justify-end gap-2">
                <div className="text-xs text-neutral-700">
                  {TRAIT_DESCRIPTIONS[pair.dominant].name}
                </div>
                <div 
                  className="dna-node"
                  title={TRAIT_DESCRIPTIONS[pair.dominant].description}
                />
              </div>
              
              {/* Center Connector */}
              <div className="dna-connector" />
              
              {/* Right Node (Recessive) */}
              <div className="flex items-center gap-2">
                <div 
                  className="dna-node opacity-30"
                  title={TRAIT_DESCRIPTIONS[pair.recessive].description}
                />
                <div className="text-xs text-neutral-500">
                  {TRAIT_DESCRIPTIONS[pair.recessive].name}
                </div>
              </div>
            </div>
            
            {/* Rail connecting strands */}
            <div className="dna-rail" />
          </div>
        ))}
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
