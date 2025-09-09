"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  getPersonalityData, 
  getClusterTypes, 
  getClusterInfo, 
  getAllTypes, 
  getImagePath,
  TRAIT_DESCRIPTIONS 
} from '@/lib/personalityData';
import PersonalityGrid from '@/components/PersonalityGrid';
import PersonalityComparison from '@/components/PersonalityComparison';
import RetakeQuizModal from '@/components/RetakeQuizModal';
import PersonalityStatsCard from '@/components/PersonalityStatsCard';
import PersonalityEvolutionTree from '@/components/PersonalityEvolutionTree';
import PersonalityDNA from '@/components/PersonalityDNA';

export default function AboutPageContent({ personalityData, isOwnType, userStoredType }) {
  const router = useRouter();
  const [genderPreference, setGenderPreference] = useState('male');
  const [showComparison, setShowComparison] = useState(false);
  const [showRetakeQuiz, setShowRetakeQuiz] = useState(false);
  const [comparisonType, setComparisonType] = useState('');

  useEffect(() => {
    // Load gender preference from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mindshift_personality_gender_pref');
        if (stored === 'female') {
          setGenderPreference('female');
        }
      } catch {}
    }
  }, []);

  // ScrollTrigger animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal-on-scroll").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [personalityData]);

  const handleGenderToggle = () => {
    const newGender = genderPreference === 'male' ? 'female' : 'male';
    setGenderPreference(newGender);
    
    // Save preference
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mindshift_personality_gender_pref', newGender);
      } catch {}
    }
  };

  const handleStartFocus = (template) => {
    try {
      const payload = { 
        template: template || 'work_sprint', 
        duration: 25,
        startedAt: Date.now() 
      };
      localStorage.setItem("mindshift_last_template", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("mindshift:focus:start_template", { detail: payload }));
      router.push('/');
    } catch {}
  };

  const clusterInfo = getClusterInfo(personalityData.cluster);
  const clusterTypes = getClusterTypes(personalityData.cluster).filter(t => t.type !== personalityData.type);
  const imagePath = getImagePath(personalityData.type, genderPreference);

  return (
    <section className="w-full min-h-screen" >
      <div className="w-full px-4 md:px-6 py-6 flex flex-col items-center gap-8">
        
        {/* Hero Section - Your Personality */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <div className="retro-console multi-border rounded-xl p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="font-tanker text-2xl md:text-3xl text-green tracking-widest mb-2">
                {isOwnType ? 'YOUR PERSONALITY' : `ABOUT ${personalityData.type}`}
              </div>
              <div className="text-lg font-semibold text-neutral-800">
                {personalityData.title}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
              
              {/* Left: Character Image & Controls */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-48 h-48 md:w-64 md:h-64 relative rounded-2xl overflow-hidden">
                    <Image
                      src={imagePath}
                      alt={`${personalityData.type} character`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                
                {/* Gender Toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleGenderToggle}
                    className={`nav-pill ${genderPreference === 'male' ? 'nav-pill--primary' : ''}`}
                  >
                    👨 Male
                  </button>
                  <button
                    onClick={handleGenderToggle}
                    className={`nav-pill ${genderPreference === 'female' ? 'nav-pill--primary' : ''}`}
                  >
                    👩 Female
                  </button>
                </div>

                {/* MBTI Traits */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {personalityData.traits.map((trait) => (
                    <div
                      key={trait}
                      className="pill text-sm"
                      title={`${TRAIT_DESCRIPTIONS[trait].name}: ${TRAIT_DESCRIPTIONS[trait].description}`}
                    >
                      <strong>{trait}</strong> {TRAIT_DESCRIPTIONS[trait].name.slice(0, 4)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Personality Details */}
              <div className="space-y-4">
                {/* Highlights */}
                <div>
                  <h3 className="font-tanker text-lg text-green tracking-wide mb-3">KEY HIGHLIGHTS</h3>
                  <ul className="space-y-2">
                    {personalityData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                        <span className="text-green-900 font-bold">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="font-tanker text-lg text-green tracking-wide mb-3">STRENGTHS</h3>
                  <div className="flex flex-wrap gap-2">
                    {personalityData.strengths.map((strength) => (
                      <div key={strength} className="pill text-sm">
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mt-6 pt-6 border-t border-neutral-200">
              {isOwnType && (
                <button 
                  onClick={() => setShowRetakeQuiz(true)}
                  className="nav-pill nav-pill--outline"
                >
                  🔄 Retake Quiz
                </button>
              )}
              <button 
                onClick={() => handleStartFocus()}
                className="nav-pill nav-pill--primary"
              >
                🚀 Start Focus Session
              </button>
              <button 
                onClick={() => setShowComparison(!showComparison)}
                className="nav-pill"
              >
                ⚖️ Compare Types
              </button>
              <Link href="#explore" className="nav-pill">
                🔍 Explore All Types
              </Link>
            </div>
          </div>
        </div>

        {/* Focus & Productivity Section */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <div className="retro-console rounded-xl p-6">
            <h2 className="font-tanker text-xl text-green tracking-widest mb-4 text-center">
              FOCUS & PRODUCTIVITY
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">Your Focus Style</h3>
                <p className="text-sm text-neutral-700 mb-3">{personalityData.focusStyle}</p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Ideal Session:</strong> {personalityData.idealSessionLength}</div>
                  <div><strong>Break Style:</strong> {personalityData.breakCadence}</div>
                  <div><strong>Motivation:</strong> {personalityData.motivation}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">Recommended Templates</h3>
                <div className="space-y-2">
                  {personalityData.bestTemplates.map((template) => (
                    <button
                      key={template}
                      onClick={() => handleStartFocus(template)}
                      className="block w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-green-900 transition-colors text-sm"
                    >
                      🎯 {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Tips */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <div className="retro-console rounded-xl p-6">
            <h2 className="font-tanker text-xl text-green tracking-widest mb-4 text-center">
              GROWTH & AWARENESS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                  ✨ Do More Of This
                </h3>
                <ul className="space-y-2">
                  {personalityData.growthTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                      <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">
                        ✓
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                  ⚠️ Watch Out For
                </h3>
                <ul className="space-y-2">
                  {personalityData.watchOut.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                      <div className="nav-pill nav-pill--amber text-xs px-2 py-1 h-auto">
                        !
                      </div>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Gaming-Style Stats & DNA Section */}
        <div className="w-full max-w-6xl reveal-on-scroll">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Personality Stats Card */}
            <div>
              <PersonalityStatsCard personalityType={personalityData.type} />
            </div>
            
            {/* Personality DNA */}
            <div>
              <PersonalityDNA personalityType={personalityData.type} />
            </div>
            
            {/* Evolution Tree */}
            <div>
              <PersonalityEvolutionTree personalityType={personalityData.type} />
            </div>
          </div>
        </div>

        {/* Cluster Context */}
        {clusterInfo && (
          <div className="w-full max-w-4xl reveal-on-scroll">
            <div className="retro-console rounded-xl p-6">
              <h2 className="font-tanker text-xl text-green tracking-widest mb-4 text-center">
                PEOPLE LIKE YOU
              </h2>
              
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 pill">
                  <span className="font-semibold">{clusterInfo.name}</span>
                </div>
                <p className="text-sm text-neutral-600 mt-2">{clusterInfo.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clusterTypes.slice(0, 2).map((otherType) => (
                  <Link
                    key={otherType.type}
                    href={`/about/${otherType.type.toLowerCase()}`}
                    className="block p-4 rounded-lg border border-neutral-200 hover:border-green-900 transition-all hover:transform hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                        <Image
                          src={getImagePath(otherType.type, genderPreference)}
                          alt={`${otherType.type} character`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-800">{otherType.type}</div>
                        <div className="text-sm text-neutral-600">{otherType.title}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Tool */}
        {showComparison && (
          <div className="w-full max-w-6xl reveal-on-scroll">
            <PersonalityComparison 
              primaryType={personalityData.type}
              onClose={() => setShowComparison(false)}
            />
          </div>
        )}

        {/* Personality Grid Explorer */}
        <div id="explore" className="w-full max-w-6xl reveal-on-scroll">
          <div className="retro-console multi-border rounded-xl p-6">
            <h2 className="font-tanker text-xl text-green tracking-widest mb-6 text-center">
              EXPLORE ALL PERSONALITIES
            </h2>
            <PersonalityGrid 
              currentType={personalityData.type}
              genderPreference={genderPreference}
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="w-full max-w-4xl reveal-on-scroll text-center">
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => handleStartFocus()}
              className="nav-pill nav-pill--primary"
            >
              🚀 Start Focusing Now
            </button>
            {isOwnType && (
              <button 
                onClick={() => setShowRetakeQuiz(true)}
                className="nav-pill nav-pill--outline"
              >
                🔄 Retake Personality Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRetakeQuiz && (
        <RetakeQuizModal onClose={() => setShowRetakeQuiz(false)} />
      )}
    </section>
  );
}
