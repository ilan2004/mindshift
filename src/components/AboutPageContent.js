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
import { getVideoPath } from '@/lib/assets';
import PersonalityGrid from '@/components/PersonalityGrid';
import PersonalityComparison from '@/components/PersonalityComparison';
import RetakeQuizModal from '@/components/RetakeQuizModal';
import PersonalityStatsCard from '@/components/PersonalityStatsCard';
import PersonalityEvolutionTree from '@/components/PersonalityEvolutionTree';
import PersonalityDNA from '@/components/PersonalityDNA';
import { usePersonalizationProfile, usePersonalizationActions } from '@/hooks/usePersonalizationProfile';

export default function AboutPageContent({ personalityData, isOwnType, userStoredType }) {
  const router = useRouter();
  const [genderPreference, setGenderPreference] = useState('male');
  const [showComparison, setShowComparison] = useState(false);
  const [showRetakeQuiz, setShowRetakeQuiz] = useState(false);
  const [comparisonType, setComparisonType] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  // Personalization system
  const { profile, idealSessionLength, guardrailsEnabled, setPersonalityType } = usePersonalizationProfile();
  const {
    enablePerfectionismGuard,
    enableBreakEnforcement, 
    enableRabbitHoleQuiz,
    setSessionPreference,
    addCommonBlockers
  } = usePersonalizationActions();

  useEffect(() => {
    // Load gender preference from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('Nudge_personality_gender_pref');
        if (stored === 'female') {
          setGenderPreference('female');
        }
      } catch {}
    }
    
    // Sync personality type with personalization system
    if (personalityData.type && (!profile?.personality_type || profile.personality_type !== personalityData.type)) {
      setPersonalityType(personalityData.type);
    }
  }, [personalityData.type, profile?.personality_type, setPersonalityType]);

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
        localStorage.setItem('Nudge_personality_gender_pref', newGender);
      } catch {}
    }
  };

  const handleStartFocus = (template) => {
    try {
      const duration = idealSessionLength || 25; // Use personalized duration
      const payload = { 
        template: template || 'work_sprint', 
        duration: duration,
        startedAt: Date.now() 
      };
      localStorage.setItem("Nudge_last_template", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("Nudge:focus:start_template", { detail: payload }));
      router.push('/');
    } catch {}
  };
  
  // Train strength handlers
  const handleTrainStrength = (strengthType) => {
    const strengthActions = {
      'Strategic Planning': () => {
        setSessionPreference(75, 15, 'reflective');
        handleStartFocus('strategic_planning');
      },
      'Deep Focus': () => {
        setSessionPreference(90, 20, 'reflective');
        handleStartFocus('deep_reading');
      },
      'Creative Problem Solving': () => {
        setSessionPreference(45, 10, 'physical');
        handleStartFocus('creative_sprint');
      },
      'Leadership': () => {
        setSessionPreference(60, 15, 'social');
        handleStartFocus('leadership_sprint');
      },
      'Organization': () => {
        setSessionPreference(50, 10, 'reflective');
        handleStartFocus('systematic_approach');
      },
      'Empathy': () => {
        setSessionPreference(40, 15, 'social');
        handleStartFocus('helping_others');
      },
      'Adaptability': () => {
        setSessionPreference(30, 5, 'physical');
        handleStartFocus('flexible_focus');
      },
      'Innovation': () => {
        setSessionPreference(35, 10, 'physical');
        handleStartFocus('innovation_time');
      }
    };
    
    const action = strengthActions[strengthType] || (() => handleStartFocus());
    action();
  };
  
  // Guard weakness handlers
  const handleGuardWeakness = (weaknessType) => {
    const weaknessGuards = {
      'perfectionism': () => {
        enablePerfectionismGuard();
        alert('✅ Perfectionism guard enabled! Sessions will auto-timebox to prevent overthinking.');
      },
      'overthinking': () => {
        enableRabbitHoleQuiz();
        alert('✅ Focus guard enabled! You\'ll get gentle check-ins if you drift off-topic.');
      },
      'procrastination': () => {
        addCommonBlockers(['social_media', 'notifications']);
        alert('✅ Procrastination guards enabled! Distracting sites will trigger focus quizzes.');
      },
      'burnout': () => {
        enableBreakEnforcement();
        alert('✅ Burnout prevention enabled! Mandatory breaks will be enforced after long sessions.');
      },
      'distraction': () => {
        addCommonBlockers(['social_media', 'notifications', 'overthinking']);
        enableRabbitHoleQuiz();
        alert('✅ Distraction shields activated! Multiple guards are now protecting your focus.');
      },
      'inconsistency': () => {
        enableBreakEnforcement();
        setSessionPreference(idealSessionLength, 10, 'reflective');
        alert('✅ Consistency helper enabled! Your sessions are now optimized for sustainable progress.');
      }
    };
    
    const guard = weaknessGuards[weaknessType] || (() => {
      enablePerfectionismGuard();
      alert('✅ Focus guard enabled to help with this challenge!');
    });
    
    guard();
  };

  const clusterInfo = getClusterInfo(personalityData.cluster);
  const clusterTypes = getClusterTypes(personalityData.cluster).filter(t => t.type !== personalityData.type);
  const imagePath = getImagePath(personalityData.type, genderPreference);
  const videoPath = getVideoPath(personalityData.type, genderPreference === 'female' ? 'W' : 'M');
  const hasVideo = videoPath !== null;

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
                  <div className="w-48 h-48 md:w-64 md:h-64 relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                    {/* Image Layer */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      showVideo && hasVideo && videoPath ? 'opacity-0' : 'opacity-100'
                    }`}>
                      <Image
                        src={imagePath}
                        alt={`${personalityData.type} character`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    
                    {/* Video Layer */}
                    {hasVideo && videoPath && (
                      <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                        showVideo ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <video
                          src={videoPath}
                          className="w-full h-full object-cover"
                          autoPlay={showVideo}
                          muted
                          playsInline
                          onPlay={() => setVideoPlaying(true)}
                          onEnded={() => {
                            setVideoPlaying(false);
                            setTimeout(() => setShowVideo(false), 300); // Delay for smooth transition
                          }}
                          onError={() => {
                            console.warn('Video failed to load:', videoPath);
                            setShowVideo(false);
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Video Play Button Overlay - Smaller Size */}
                    {hasVideo && !showVideo && !videoPlaying && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 hover:opacity-100 transition-all duration-300 group"
                        aria-label="Play character animation"
                      >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-200 border-2 border-white/50">
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            className="ml-0.5 text-green-900"
                          >
                            <path 
                              d="M8 5v14l11-7z" 
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                      </button>
                    )}
                    
                    {/* Video Status Indicator - Smaller and More Subtle */}
                    {hasVideo && (
                      <div className="absolute top-2 right-2">
                        <div className={`transition-all duration-300 ${
                          showVideo ? 'opacity-30' : 'opacity-70 hover:opacity-100'
                        }`}>
                          <div className="flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                            <div className={`w-2 h-2 rounded-full ${
                              videoPlaying ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                            }`}></div>
                            <span className="text-white text-xs font-medium">
                              {videoPlaying ? 'Playing' : 'Video'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Loading State for Video */}
                    {showVideo && !videoPlaying && hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
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
              <button 
                onClick={() => handleStartFocus()}
                className="nav-pill nav-pill--primary"
              >
                🚀 Start Focus Session
              </button>
              <button 
                onClick={() => setShowRetakeQuiz(true)}
                className={`nav-pill ${isOwnType ? 'nav-pill--cyan' : 'nav-pill--outline'}`}
              >
                🔄 {isOwnType ? 'Retake Test' : 'Take Test'}
              </button>
              <button 
                onClick={() => {
                  if (!showComparison) {
                    setShowComparison(true);
                    // Scroll to comparison section after component renders
                    setTimeout(() => {
                      const comparisonElement = document.getElementById('personality-comparison');
                      if (comparisonElement) {
                        comparisonElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start',
                          inline: 'nearest'
                        });
                      }
                    }, 100); // Small delay to ensure component is rendered
                  } else {
                    setShowComparison(false);
                  }
                }}
                className={`nav-pill ${showComparison ? 'nav-pill--primary' : ''}`}
              >
                ⚖️ {showComparison ? 'Hide Comparison' : 'Compare Types'}
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
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                  ⚠️ Watch Out For
                </h3>
                <ul className="space-y-2">
                  {personalityData.watchOut.map((warning, index) => {
                    // Extract key weakness type from warning text for mapping
                    const weaknessType = warning.toLowerCase().includes('perfectionism') ? 'perfectionism' :
                                       warning.toLowerCase().includes('overthink') ? 'overthinking' :
                                       warning.toLowerCase().includes('procrastin') ? 'procrastination' :
                                       warning.toLowerCase().includes('burnout') ? 'burnout' :
                                       warning.toLowerCase().includes('distract') ? 'distraction' :
                                       'inconsistency';
                    
                    return (
                      <li key={index} className="flex items-center gap-2 text-sm text-neutral-700 p-2 rounded-lg border border-neutral-200">
                        <div className="nav-pill nav-pill--amber text-xs px-2 py-1 h-auto">
                          !
                        </div>
                        <span className="flex-1">{warning}</span>
                        <button 
                          onClick={() => handleGuardWeakness(weaknessType)}
                          className="nav-pill nav-pill--amber text-xs px-3 py-1"
                          title={`Enable protection against: ${warning}`}
                        >
                          🛡️ Guard Me
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Personalization Status */}
        {isOwnType && Object.keys(guardrailsEnabled).some(key => guardrailsEnabled[key]) && (
          <div className="w-full max-w-4xl reveal-on-scroll">
            <div className="retro-console rounded-xl p-4">
              <h3 className="font-tanker text-lg text-green tracking-wide mb-3 text-center">
                ⚙️ YOUR ACTIVE GUARDS ⚙️
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {guardrailsEnabled.perfectionism_timebox && (
                  <div className="nav-pill nav-pill--amber text-xs">
                    🛡️ Perfectionism Guard
                  </div>
                )}
                {guardrailsEnabled.rabbit_hole_quiz && (
                  <div className="nav-pill nav-pill--amber text-xs">
                    🛡️ Focus Guard
                  </div>
                )}
                {guardrailsEnabled.break_enforcement && (
                  <div className="nav-pill nav-pill--amber text-xs">
                    🛡️ Break Enforcer
                  </div>
                )}
                {guardrailsEnabled.distraction_blocking && (
                  <div className="nav-pill nav-pill--amber text-xs">
                    🛡️ Distraction Shield
                  </div>
                )}
              </div>
              <div className="text-xs text-neutral-600 text-center mt-2">
                💪 Optimized for {idealSessionLength}min sessions based on your {personalityData.type} profile
              </div>
            </div>
          </div>
        )}

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
          <div id="personality-comparison" className="w-full max-w-6xl reveal-on-scroll">
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
            <button 
              onClick={() => setShowRetakeQuiz(true)}
              className={`nav-pill ${isOwnType ? 'nav-pill--cyan' : 'nav-pill--outline'}`}
            >
              🔄 {isOwnType ? 'Retake Test' : 'Take Test'}
            </button>
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
