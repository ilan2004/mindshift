"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getPersonalityData, getAllTypes, getImagePath, getClusterInfo, TRAIT_DESCRIPTIONS } from '@/lib/personalityData';

export default function PersonalityComparison({ primaryType, onClose }) {
  const [secondaryType, setSecondaryType] = useState('');
  const [genderPref, setGenderPref] = useState('male');
  const [activeTab, setActiveTab] = useState('overview');
  
  const primaryData = getPersonalityData(primaryType);
  const secondaryData = secondaryType ? getPersonalityData(secondaryType) : null;
  const allTypes = getAllTypes();

  const available = allTypes.filter(t => t.type !== primaryType);
  
  // Calculate compatibility and differences
  const comparison = useMemo(() => {
    if (!secondaryData) return null;
    
    const primaryTraits = primaryData.traits;
    const secondaryTraits = secondaryData.traits;
    
    const sharedTraits = primaryTraits.filter(trait => secondaryTraits.includes(trait));
    const differences = [
      ...primaryTraits.filter(trait => !secondaryTraits.includes(trait)).map(t => ({ type: 'primary', trait: t })),
      ...secondaryTraits.filter(trait => !primaryTraits.includes(trait)).map(t => ({ type: 'secondary', trait: t }))
    ];
    
    const compatibilityScore = Math.round((sharedTraits.length / 4) * 100);
    
    return {
      sharedTraits,
      differences,
      compatibilityScore,
      sameCluster: primaryData.cluster === secondaryData.cluster
    };
  }, [primaryData, secondaryData]);

  return (
    <div 
      className="retro-console multi-border rounded-xl p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-tanker text-2xl text-green tracking-widest mb-2">
          ⚖️ PERSONALITY COMPARISON ⚖️
        </h2>
        <p className="text-sm text-neutral-600">Compare traits, strengths, and working styles</p>
      </div>

      {/* Type Selector */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <label className="block text-sm font-semibold text-neutral-800 mb-3">
            Compare <span className="text-green font-tanker">{primaryType}</span> with:
          </label>
          <div className="inline-block">
            <select
              value={secondaryType}
              onChange={(e) => setSecondaryType(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-green-900 bg-white text-neutral-800 font-medium min-w-[200px] focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
              style={{
                boxShadow: "0 2px 0 var(--color-green-900)"
              }}
            >
              <option value="">🔍 Select a type...</option>
              {available.map(t => (
                <option key={t.type} value={t.type}>
                  {t.type} - {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Gender Toggle */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setGenderPref('male')}
              className={`nav-pill ${genderPref === 'male' ? 'nav-pill--primary' : ''}`}
            >
              👨 Male
            </button>
            <button
              onClick={() => setGenderPref('female')}
              className={`nav-pill ${genderPref === 'female' ? 'nav-pill--primary' : ''}`}
            >
              👩 Female
            </button>
          </div>
        </div>
      </div>

      {!secondaryData && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <div className="text-lg text-neutral-600 mb-2">Choose a personality type to compare</div>
          <div className="text-sm text-neutral-500">Discover similarities, differences, and compatibility insights</div>
        </div>
      )}

      {secondaryData && (
        <div className="space-y-6">
          
          {/* Compatibility Overview */}
          <div className="retro-console rounded-xl p-4 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-900 mb-1">
                  {comparison.compatibilityScore}%
                </div>
                <div className="text-sm text-neutral-700">Trait Compatibility</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {comparison.sameCluster ? '🤝' : '🌟'}
                </div>
                <div className="text-sm text-neutral-700">
                  {comparison.sameCluster ? 'Same Cluster' : 'Different Clusters'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {comparison.sharedTraits.length}/4
                </div>
                <div className="text-sm text-neutral-700">Shared Traits</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-pill ${activeTab === 'overview' ? 'nav-pill--primary' : ''}`}
            >
              📋 Overview
            </button>
            <button
              onClick={() => setActiveTab('traits')}
              className={`nav-pill ${activeTab === 'traits' ? 'nav-pill--primary' : ''}`}
            >
              🧬 Traits
            </button>
            <button
              onClick={() => setActiveTab('work')}
              className={`nav-pill ${activeTab === 'work' ? 'nav-pill--primary' : ''}`}
            >
              💼 Work Style
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`nav-pill ${activeTab === 'growth' ? 'nav-pill--primary' : ''}`}
            >
              🌱 Growth
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Primary Type Card */}
              <div className="retro-console rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-xl overflow-hidden mx-auto mb-3">
                    <Image
                      src={getImagePath(primaryType, genderPref)}
                      alt={`${primaryType} character`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-tanker text-xl text-green mb-1">
                    {primaryType}
                  </h3>
                  <div className="text-sm text-neutral-600 mb-3">{primaryData.title}</div>
                  <div className="pill text-xs">{getClusterInfo(primaryData.cluster)?.name}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-tanker text-sm text-green tracking-wide mb-2">🎯 KEY HIGHLIGHTS</h4>
                    <ul className="space-y-1">
                      {primaryData.highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-neutral-700">
                          <span className="text-green-900 font-bold">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-tanker text-sm text-green tracking-wide mb-2">💪 STRENGTHS</h4>
                    <div className="flex flex-wrap gap-1">
                      {primaryData.strengths.map(s => (
                        <div key={s} className="pill text-xs">{s}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Type Card */}
              <div className="retro-console rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-xl overflow-hidden mx-auto mb-3">
                    <Image
                      src={getImagePath(secondaryType, genderPref)}
                      alt={`${secondaryType} character`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-tanker text-xl text-green mb-1">
                    {secondaryType}
                  </h3>
                  <div className="text-sm text-neutral-600 mb-3">{secondaryData.title}</div>
                  <div className="pill text-xs">{getClusterInfo(secondaryData.cluster)?.name}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-tanker text-sm text-green tracking-wide mb-2">🎯 KEY HIGHLIGHTS</h4>
                    <ul className="space-y-1">
                      {secondaryData.highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-neutral-700">
                          <span className="text-green-900 font-bold">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-tanker text-sm text-green tracking-wide mb-2">💪 STRENGTHS</h4>
                    <div className="flex flex-wrap gap-1">
                      {secondaryData.strengths.map(s => (
                        <div key={s} className="pill text-xs">{s}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traits' && (
            <div className="space-y-6">
              {/* Shared Traits */}
              <div className="retro-console rounded-xl p-6">
                <h3 className="font-tanker text-lg text-green tracking-wide mb-4 text-center">
                  🤝 SHARED TRAITS ({comparison.sharedTraits.length}/4)
                </h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {comparison.sharedTraits.map(trait => (
                    <div 
                      key={trait} 
                      className="pill nav-pill--cyan text-sm px-4 py-2"
                      title={`${TRAIT_DESCRIPTIONS[trait].name}: ${TRAIT_DESCRIPTIONS[trait].description}`}
                    >
                      <strong>{trait}</strong> {TRAIT_DESCRIPTIONS[trait].name}
                    </div>
                  ))}
                </div>
                {comparison.sharedTraits.length === 0 && (
                  <div className="text-center text-neutral-600 py-4">
                    No shared traits - completely opposite types!
                  </div>
                )}
              </div>

              {/* Different Traits */}
              <div className="retro-console rounded-xl p-6">
                <h3 className="font-tanker text-lg text-green tracking-wide mb-4 text-center">
                  ⚡ DIFFERENT TRAITS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 text-center">{primaryType}</h4>
                    <div className="space-y-2">
                      {comparison.differences.filter(d => d.type === 'primary').map(({ trait }) => (
                        <div 
                          key={trait} 
                          className="pill text-sm px-3 py-2 border border-blue-200 bg-blue-50"
                          title={`${TRAIT_DESCRIPTIONS[trait].name}: ${TRAIT_DESCRIPTIONS[trait].description}`}
                        >
                          <strong>{trait}</strong> {TRAIT_DESCRIPTIONS[trait].name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 text-center">{secondaryType}</h4>
                    <div className="space-y-2">
                      {comparison.differences.filter(d => d.type === 'secondary').map(({ trait }) => (
                        <div 
                          key={trait} 
                          className="pill text-sm px-3 py-2 border border-purple-200 bg-purple-50"
                          title={`${TRAIT_DESCRIPTIONS[trait].name}: ${TRAIT_DESCRIPTIONS[trait].description}`}
                        >
                          <strong>{trait}</strong> {TRAIT_DESCRIPTIONS[trait].name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'work' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="retro-console rounded-xl p-6">
                <h3 className="font-tanker text-lg text-green mb-4 text-center">{primaryType}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">🎯 Focus Style</h4>
                    <p className="text-sm text-neutral-700">{primaryData.focusStyle}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">⏰ Ideal Session</h4>
                    <p className="text-sm text-neutral-700">{primaryData.idealSessionLength}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">☕ Break Style</h4>
                    <p className="text-sm text-neutral-700">{primaryData.breakCadence}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">🚀 Best Templates</h4>
                    <div className="space-y-1">
                      {primaryData.bestTemplates.map(template => (
                        <div key={template} className="text-sm text-neutral-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="retro-console rounded-xl p-6">
                <h3 className="font-tanker text-lg text-green mb-4 text-center">{secondaryType}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">🎯 Focus Style</h4>
                    <p className="text-sm text-neutral-700">{secondaryData.focusStyle}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">⏰ Ideal Session</h4>
                    <p className="text-sm text-neutral-700">{secondaryData.idealSessionLength}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">☕ Break Style</h4>
                    <p className="text-sm text-neutral-700">{secondaryData.breakCadence}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">🚀 Best Templates</h4>
                    <div className="space-y-1">
                      {secondaryData.bestTemplates.map(template => (
                        <div key={template} className="text-sm text-neutral-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="retro-console rounded-xl p-6">
                <h3 className="font-tanker text-lg text-green mb-4 text-center">{primaryType}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      ✨ Growth Tips
                    </h4>
                    <ul className="space-y-2">
                      {primaryData.growthTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                          <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">✓</div>
                          <span className="flex-1">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      ⚠️ Watch Out For
                    </h4>
                    <ul className="space-y-2">
                      {primaryData.watchOut.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                          <div className="nav-pill nav-pill--amber text-xs px-2 py-1 h-auto">!</div>
                          <span className="flex-1">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="retro-console rounded-xl p-6">
                <h3 className="font-tanker text-lg text-green mb-4 text-center">{secondaryType}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      ✨ Growth Tips
                    </h4>
                    <ul className="space-y-2">
                      {secondaryData.growthTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                          <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">✓</div>
                          <span className="flex-1">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      ⚠️ Watch Out For
                    </h4>
                    <ul className="space-y-2">
                      {secondaryData.watchOut.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                          <div className="nav-pill nav-pill--amber text-xs px-2 py-1 h-auto">!</div>
                          <span className="flex-1">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compatibility Insights */}
          <div className="retro-console rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="font-tanker text-lg text-green tracking-wide mb-4 text-center">
              🤝 COMPATIBILITY INSIGHTS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                  💡 Collaboration Strengths
                </h4>
                <div className="text-sm text-neutral-700">
                  {comparison.compatibilityScore >= 75 ? (
                    "High compatibility! You share similar approaches to work and decision-making."
                  ) : comparison.compatibilityScore >= 50 ? (
                    "Good compatibility with some differences that can complement each other well."
                  ) : comparison.compatibilityScore >= 25 ? (
                    "Moderate compatibility - differences may create both challenges and opportunities."
                  ) : (
                    "Very different approaches - can lead to great innovation when both perspectives are valued."
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                  🎯 Focus Together
                </h4>
                <div className="text-sm text-neutral-700">
                  {comparison.sameCluster ? (
                    "Being in the same cluster means you'll likely have similar motivations and working styles."
                  ) : (
                    "Different clusters bring diverse perspectives - great for comprehensive problem-solving."
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
      
    </div>
  );
}
