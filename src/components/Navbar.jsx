"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SlideMenu from "./SlideMenu";
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Palette } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { themeMode, toggleTheme, getCSSVariables } = useTheme();
  
  // Close menu on route change/hash change
  useEffect(() => {
    const close = () => setIsMenuOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
    };
  }, []);
  
  // Force navbar to re-render when theme changes to ensure color sync
  useEffect(() => {
    const handleThemeChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('theme-changed', handleThemeChange);
    window.addEventListener('personality-changed', handleThemeChange);
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
      window.removeEventListener('personality-changed', handleThemeChange);
    };
  }, []);

  // Get current CSS variables and force refresh
  const cssVars = getCSSVariables();
  
  return (
    <header 
      key={`navbar-${forceUpdate}-${themeMode}`}
      className="sticky top-0 z-30 w-full border-b-2"
      style={{
        ...cssVars,
        background: 'var(--mbti-bg-pattern, var(--bg-default))',
        borderColor: 'var(--mbti-primary)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center">
          {/* Logo aligned left */}
          <div className="flex-1">
            <Link
              href="/"
              className="transition-colors"
              style={{ color: 'var(--mbti-text-primary)' }}
              aria-label="Go to Home"
            >
              <div className="font-tanker font-semibold text-3xl sm:text-4xl md:text-5xl leading-none tracking-widest">
                Nudge
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 mt-1 tracking-wide font-normal">
                Gentle Guidance. Better Habits.
              </div>
            </Link>
          </div>

          {/* Theme toggle and menu buttons */}
          <div className="flex items-center gap-3 md:gap-3 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="nav-pill nav-pill--compact transition-all duration-200 hover:scale-105 flex items-center justify-center"
              onClick={toggleTheme}
              style={{
                background: 'var(--color-amber-400)',
                color: 'var(--color-green-900)',
                borderColor: 'var(--color-green-900)'
              }}
              title={`Switch to ${themeMode === 'personality' ? 'standard' : 'personality'} theme`}
            >
              {themeMode === 'personality' ? <Sun size={16} /> : <Palette size={16} />}
            </button>
            
            {/* Menu button */}
            <button
              type="button"
              className="nav-pill transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--color-mint-500)',
                color: 'var(--color-green-900)',
                borderColor: 'var(--color-green-900)'
              }}
              aria-controls="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              Menu
            </button>
          </div>

          {/* Slide Menu */}
          <SlideMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
          />
        </div>
      </nav>
    </header>
  );
}
