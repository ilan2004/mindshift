"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonalityGrid from '@/components/PersonalityGrid';

export default function AboutMainPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    // Check if user has a stored personality type
    if (typeof window !== 'undefined') {
      try {
        const storedType = localStorage.getItem('mindshift_personality_type');
        if (storedType && storedType.trim()) {
          // User has a type - redirect to their specific page
          router.replace(`/about/${storedType.toLowerCase()}`);
          return;
        }
      } catch (error) {
        console.error('Error reading stored personality type:', error);
      }
    }

    // No stored type - show type selection
    setShowTypeSelector(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-900 border-t-transparent rounded-full mx-auto mb-3"></div>
          <div className="text-sm text-neutral-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!showTypeSelector) {
    return null; // Will redirect in useEffect
  }

  return (
    <section 
      className="w-full min-h-screen" 
      style={{ 
        background: "var(--bg-default)", 
        color: "var(--text-default)" 
      }}
    >
      <div className="w-full px-4 md:px-6 py-6 flex flex-col items-center gap-8">
        
        {/* Header */}
        <div className="w-full max-w-4xl text-center reveal-on-scroll">
          <div className="font-tanker text-3xl md:text-4xl text-green tracking-widest mb-4">
            EXPLORE PERSONALITIES
          </div>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
            Choose your personality type to see detailed insights, focus recommendations, and growth tips.
          </p>
        </div>

        {/* Main Grid */}
        <div className="w-full max-w-6xl reveal-on-scroll">
          <div 
            className="rounded-xl p-6"
            style={{
              background: "var(--surface)",
              border: "2px solid var(--color-green-900)",
              boxShadow: "0 2px 0 var(--color-green-900)"
            }}
          >
            <h2 className="font-tanker text-xl text-green tracking-widest mb-6 text-center">
              SELECT YOUR PERSONALITY TYPE
            </h2>
            <PersonalityGrid currentType="" genderPreference="male" />
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full max-w-4xl reveal-on-scroll">
          <div 
            className="rounded-xl p-6"
            style={{
              background: "var(--surface)",
              border: "2px solid var(--color-green-900)",
              boxShadow: "0 2px 0 var(--color-green-900)"
            }}
          >
            <h3 className="font-tanker text-lg text-green tracking-wide mb-4 text-center">
              WHAT YOU&apos;LL DISCOVER
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">🎯</div>
                  <div>
                    <div className="font-semibold text-neutral-800">Personalized Focus Strategies</div>
                    <div className="text-sm text-neutral-600">Ideal session lengths, break patterns, and productivity templates tailored to your type</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">⚡</div>
                  <div>
                    <div className="font-semibold text-neutral-800">Strengths & Growth Areas</div>
                    <div className="text-sm text-neutral-600">Understand your natural advantages and areas for development</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">🤝</div>
                  <div>
                    <div className="font-semibold text-neutral-800">Personality Comparisons</div>
                    <div className="text-sm text-neutral-600">Compare different types to better understand yourself and others</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="nav-pill nav-pill--cyan text-xs px-2 py-1 h-auto">🚀</div>
                  <div>
                    <div className="font-semibold text-neutral-800">Instant Focus Sessions</div>
                    <div className="text-sm text-neutral-600">Start recommended focus sessions directly from your personality page</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-4">
            Don&apos;t know your type? Take our quick personality quiz.
          </p>
          <button 
            onClick={() => {
              // You could implement a quiz here or redirect to an external one
              // For now, we'll show an alert
              alert("Quiz feature coming soon! For now, select the type that feels most like you from the grid above.");
            }}
            className="nav-pill nav-pill--primary"
          >
            📝 Take Personality Quiz
          </button>
        </div>
      </div>
    </section>
  );
}
