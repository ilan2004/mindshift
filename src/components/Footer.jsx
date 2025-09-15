"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const [email, setEmail] = useState("");
  const { getCSSVariables, themeMode, personalityType } = useTheme();
  const cssVars = getCSSVariables();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    // Here you would typically handle the newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail("");
    
    // Show a success message (you could add a toast notification here)
    alert('Thanks for subscribing! We\'ll keep you updated on your focus journey.');
  };

  const currentYear = new Date().getFullYear();

  // Get personality-specific motivational text
  const getMotivationalText = () => {
    if (themeMode === 'mint') return "Stay focused, stay productive";
    
    switch (personalityType) {
      case 'INTJ': case 'INTP': case 'ENTJ': case 'ENTP':
        return "Think deeper, achieve more";
      case 'INFJ': case 'INFP': case 'ENFJ': case 'ENFP':
        return "Find meaning in every moment";
      case 'ISTJ': case 'ISFJ': case 'ESTJ': case 'ESFJ':
        return "Build lasting productive habits";
      case 'ISTP': case 'ISFP': case 'ESTP': case 'ESFP':
        return "Live fully, focus freely";
      default:
        return "Transform your potential into progress";
    }
  };

  return (
    <footer 
      className="w-full mt-12 mb-8 md:mb-12"
      style={{
        ...cssVars,
        background: 'var(--mbti-bg-pattern)',
        color: 'var(--mbti-text-primary)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Single unified footer card */}
        <div 
          className="rounded-xl p-6 md:p-8"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--color-green-900)',
            boxShadow: '0 3px 0 var(--color-green-900)',
          }}
        >
        
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 
                  className="font-tanker text-3xl md:text-4xl tracking-widest leading-none"
                  style={{ color: 'var(--color-green-900)' }}
                >
                  Nudge
                </h2>
                <p className="text-sm mt-2 opacity-80" style={{ color: 'var(--color-green-900)' }}>
                  {getMotivationalText()}
                </p>
              </div>
              
              {/* Newsletter Subscription - now inline with the main card */}
              <div className="mb-6">
                <h3 className="font-tanker text-lg tracking-wider mb-2" style={{ color: 'var(--color-green-900)' }}>
                  FOCUS UPDATES
                </h3>
                <p className="text-sm opacity-80 mb-3" style={{ color: 'var(--color-green-900)' }}>
                  Get productivity tips tailored to your personality
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 rounded-lg border-2 outline-none text-sm"
                    style={{
                      background: 'var(--mbti-bg-pattern)',
                      border: '2px solid var(--color-green-900)',
                      boxShadow: '0 2px 0 var(--color-green-900)',
                      color: 'var(--mbti-text-primary)',
                    }}
                  />
                  <button
                    type="submit"
                    className="nav-pill nav-pill--primary text-sm"
                    disabled={!email.trim()}
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>
          
            {/* Quick Links */}
            <div>
              <h3 className="font-tanker text-lg tracking-wider mb-4" style={{ color: 'var(--color-green-900)' }}>
                EXPLORE
              </h3>
              <nav className="space-y-2">
                {[
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/leaderboard', label: 'Leaderboard' },
                  { href: '/game', label: 'Focus Game' },
                  { href: '/profile', label: 'Profile' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm opacity-80 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-green-900)' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="font-tanker text-lg tracking-wider mb-4" style={{ color: 'var(--color-green-900)' }}>
                RESOURCES
              </h3>
              <nav className="space-y-2">
                {[
                  { href: '#', label: 'Help Center' },
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Contact Us' },
                ].map((link, index) => (
                  <Link
                    key={`resource-${index}-${link.label}`}
                    href={link.href}
                    className="block text-sm opacity-80 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-green-900)' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        
          {/* Bottom Section */}
          <div className="border-t-2 pt-6" style={{ borderColor: 'var(--color-green-900)', opacity: '0.3' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Copyright */}
              <div className="text-sm opacity-70" style={{ color: 'var(--color-green-900)' }}>
                © {currentYear} Nudge. Built for focused minds.
              </div>
              
              {/* Social Links / Actions */}
              <div className="flex items-center gap-3">
                <button
                  className="nav-pill nav-pill--compact"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  title="Back to top"
                >
                  ↑ Top
                </button>
                
                <div className="flex gap-2">
                  {/* Social media placeholders - replace with actual links */}
                  {['📧', '🐦', '📱'].map((emoji, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:scale-105 transition-transform"
                      style={{
                        background: 'var(--color-green-900)',
                        color: 'var(--color-cream)',
                      }}
                      title={`Connect with us ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        
          {/* Easter Egg - Personality Badge */}
          {personalityType && themeMode === 'personality' && (
            <div className="flex justify-center mt-6">
              <div 
                className="nav-pill nav-pill--compact opacity-50 hover:opacity-100 transition-opacity"
                title={`Currently themed for ${personalityType} personality`}
              >
                🧠 {personalityType} Mode
              </div>
            </div>
          )}
          
        </div>
      </div>
    </footer>
  );
}
