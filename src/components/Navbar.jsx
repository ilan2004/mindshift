"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SlideMenu from "./SlideMenu";
import { useTheme } from '@/contexts/ThemeContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, themeMode, personalityType, toggleTheme, getCSSVariables } = useTheme();
  
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

  // Navbar uses same background as body through CSS variables
  const getNavbarBorder = () => {
    if (!theme) return 'border-green';
    return `border-[${theme.colors.current.primary}]`;
  };

  return (
    <header 
      className={`sticky top-0 z-30 w-full border-b-2 ${getNavbarBorder()}`}
      style={{
        ...getCSSVariables(),
        background: 'var(--mbti-bg-pattern, var(--bg-default))',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 py-4 md:px-6">
        <div className="flex items-center">
          {/* Logo aligned left */}
          <div className="flex-1">
            <Link
              href="/"
              className="font-tanker font-semibold text-4xl md:text-5xl leading-none tracking-widest transition-colors"
              style={{ color: theme?.colors.current.text || 'var(--color-green-900)' }}
              aria-label="Go to Home"
            >
              MindShift
            </Link>
          </div>

          {/* Theme toggle and menu buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="nav-pill transition-all duration-200 hover:scale-105"
              onClick={toggleTheme}
              style={{
                background: 'var(--color-amber-400)',
                color: 'var(--color-green-900)',
                borderColor: 'var(--color-green-900)'
              }}
              title={`Switch to ${themeMode === 'personality' ? 'standard' : 'premium'} theme`}
            >
              {themeMode === 'personality' ? 'STD' : 'PRO'}
            </button>
            
            {/* Personality Type Badge (optional) */}
            {personalityType && (
              <div 
                className="nav-pill text-sm font-bold"
                style={{
                  background: 'var(--color-pink-200)',
                  color: 'var(--color-green-900)',
                  borderColor: 'var(--color-green-900)'
                }}
                title={theme?.name || personalityType}
              >
                {personalityType}
              </div>
            )}

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
