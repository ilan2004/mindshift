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
      initializeThemeSystem();
      // Immediately compute and apply theme state
      updateTheme();
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme state
  const updateTheme = () => {
    const currentTheme = getCurrentPersonalityTheme();
    const personality = getPersonalityType();
    setTheme(currentTheme);
    setThemeMode(currentTheme.currentMode);
    setPersonalityType(personality);
  };

  // Get personality type from localStorage
  const getPersonalityType = () => {
    try {
      return localStorage.getItem("mindshift_personality_type") || "INFP";
    } catch {
      return "INFP";
    }
  };

  // Toggle between personality theme and mint theme
  const toggleTheme = () => {
    const newMode = themeUtils.toggleTheme();
    setThemeMode(newMode);
    updateTheme();
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { mode: newMode, theme } 
    }));
  };

  // Apply theme for specific personality type
  const applyThemeForPersonality = (personality) => {
    applyPersonalityTheme(personality);
    updateTheme();
    setPersonalityType(personality);
    
    window.dispatchEvent(new CustomEvent('personality-changed', { 
      detail: { personality, theme: getCurrentPersonalityTheme() } 
    }));
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
      {/* Optionally gate rendering until theme ready to prevent flash */}
      {ready ? children : null}
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
