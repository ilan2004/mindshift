"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { 
  getCurrentPersonalityTheme, 
  themeUtils, 
  applyPersonalityTheme,
  applyMintTheme,
  initializeThemeSystem 
} from '@/lib/mbtiThemes';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [themeMode, setThemeMode] = useState('dark');
  const [personalityType, setPersonalityType] = useState('');
  const [ready, setReady] = useState(false);

  // Initialize theme system before paint to avoid mismatch/flash
  useLayoutEffect(() => {
    try {
      // Check if theme was already initialized by the inline script
      const wasPreInitialized = typeof window !== 'undefined' && window.__THEME_INITIALIZED__;
      
      if (!wasPreInitialized) {
        // Apply theme to DOM first only if not pre-initialized
        initializeThemeSystem();
      }
      
      // Always sync React state with applied theme
      const currentTheme = getCurrentPersonalityTheme();
      const personality = getPersonalityType();
      setTheme(currentTheme);
      setThemeMode(currentTheme.currentMode);
      setPersonalityType(personality);
      
      // Always ensure CSS variables are applied to document root
      const root = document.documentElement;
      const cssVars = {
        '--mbti-primary': currentTheme.colors.current.primary,
        '--mbti-secondary': currentTheme.colors.current.secondary,
        '--mbti-accent': currentTheme.colors.current.accent,
        '--mbti-text-primary': currentTheme.colors.current.text,
        '--mbti-bg-pattern': currentTheme.colors.current.background,
        '--mbti-surface': currentTheme.colors.current.surface,
        '--mbti-progress': currentTheme.colors.current.progress,
      };
      
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme state and ensure DOM sync
  const updateTheme = () => {
    const currentTheme = getCurrentPersonalityTheme();
    const personality = getPersonalityType();
    
    setTheme(currentTheme);
    setThemeMode(currentTheme.currentMode);
    setPersonalityType(personality);
    
    // Always ensure CSS variables are applied to DOM
    const root = document.documentElement;
    const cssVars = {
      '--mbti-primary': currentTheme.colors.current.primary,
      '--mbti-secondary': currentTheme.colors.current.secondary,
      '--mbti-accent': currentTheme.colors.current.accent,
      '--mbti-text-primary': currentTheme.colors.current.text,
      '--mbti-bg-pattern': currentTheme.colors.current.background,
      '--mbti-surface': currentTheme.colors.current.surface,
      '--mbti-progress': currentTheme.colors.current.progress,
    };
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  // Listen for personality updates from test completion
  useEffect(() => {
    const handlePersonalityUpdate = (event) => {
      const { personalityType } = event.detail || {};
      if (personalityType) {
        // Apply the new personality theme immediately
        applyPersonalityTheme(personalityType);
        updateTheme();
        
        // Inline refreshTheme no longer used to avoid race conditions
        
        // Dispatch theme changed event for other components
        window.dispatchEvent(new CustomEvent('theme-changed', {
          detail: { mode: 'personality', theme: getCurrentPersonalityTheme() }
        }));
      }
    };

    window.addEventListener('personality-updated', handlePersonalityUpdate);
    return () => window.removeEventListener('personality-updated', handlePersonalityUpdate);
  }, []);

  // Get personality type from localStorage
  const getPersonalityType = () => {
    try {
      return localStorage.getItem("Nudge_personality_type") || "INFP";
    } catch {
      return "INFP";
    }
  };

  // Toggle between personality theme and mint theme
  const toggleTheme = () => {
    // Let utilities update localStorage and DOM CSS variables
    const newMode = themeUtils.toggleTheme();

    // Do not call window.refreshTheme to avoid double application

    // Sync React state with the applied theme
    const currentTheme = getCurrentPersonalityTheme();
    const personality = getPersonalityType();
    setThemeMode(newMode);
    setPersonalityType(personality);
    setTheme(currentTheme);

    // Notify any listeners (optional)
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { mode: newMode, theme: currentTheme }
    }));
  };

  // Apply theme for specific personality type
  const applyThemeForPersonality = (personality) => {
    applyPersonalityTheme(personality);
    updateTheme();
    setPersonalityType(personality);
    
    // Inline refreshTheme no longer used to avoid race conditions
    
    // Dispatch event for components to re-render
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('personality-changed', { 
        detail: { personality, theme: getCurrentPersonalityTheme() } 
      }));
    });
  };

  // Get CSS variables for current theme
  const getCSSVariables = () => {
    if (!theme) return {};
    
    return {
      '--mbti-primary': theme.colors.current.primary,
      '--mbti-secondary': theme.colors.current.secondary,
      '--mbti-accent': theme.colors.current.accent,
      '--mbti-text-primary': theme.colors.current.text,
      '--mbti-bg-pattern': theme.colors.current.background,
      '--mbti-surface': theme.colors.current.surface,
      '--mbti-progress': theme.colors.current.progress,
    };
  };

  const value = {
    theme,
    themeMode,
    personalityType,
    isMintMode: themeMode === 'mint',
    isPersonalityMode: themeMode === 'personality',
    toggleTheme,
    applyThemeForPersonality,
    updateTheme,
    getCSSVariables,
    // Utility functions
    getGradientClass: themeUtils.getGradientClass,
    getPersonalityGroup: themeUtils.getPersonalityGroup,
  };

  return (
    <ThemeContext.Provider value={value}>
      {/* Use suppressHydrationWarning to prevent SSR/client mismatch while theme loads */}
      <div suppressHydrationWarning={!ready} style={ready ? {} : { visibility: 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
