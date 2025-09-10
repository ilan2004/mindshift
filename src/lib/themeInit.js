// Theme initialization script that runs BEFORE React hydration
// This prevents FOUC (Flash of Unstyled Content) by applying theme immediately

// This script should be inlined in the HTML head to block rendering until theme is applied
(function() {
  'use strict';
  
  // Get personality type from localStorage
  function getPersonalityType() {
    try {
      return localStorage.getItem('mindshift_personality_type') || 'INFP';
    } catch {
      return 'INFP';
    }
  }

  // Get gender from localStorage  
  function getGender() {
    try {
      const gender = localStorage.getItem('ms_gender');
      return gender === 'W' ? 'female' : gender === 'M' ? 'male' : null;
    } catch {
      return null;
    }
  }

  // Get theme preference
  function getThemePreference() {
    try {
      return localStorage.getItem('mindshift_theme_mode') || 'personality';
    } catch {
      return 'personality';
    }
  }

  // MBTI color definitions (simplified for initialization)
  const MBTI_COLORS = {
    'INTJ': { primary: 'var(--color-purple-400)', text: 'var(--color-green-900)' },
    'INTP': { primary: 'var(--color-cyan-200)', text: 'var(--color-green-900)' },
    'ENTJ': { primary: 'var(--color-orange-500)', text: 'var(--color-cream)' },
    'ENTP': { primary: 'var(--color-pink-500)', text: 'var(--color-cream)' },
    'INFJ': { primary: 'var(--color-purple-400)', text: 'var(--color-green-900)' },
    'INFP': { primary: 'var(--color-lilac-300)', text: 'var(--color-green-900)' },
    'ENFJ': { primary: 'var(--color-teal-300)', text: 'var(--color-green-900)' },
    'ENFP': { primary: 'var(--color-yellow-200)', text: 'var(--color-green-900)' },
    'ISTJ': { primary: 'var(--color-blue-400)', text: 'var(--color-cream)' },
    'ISFJ': { primary: 'var(--color-pink-200)', text: 'var(--color-green-900)' },
    'ESTJ': { primary: 'var(--color-orange-500)', text: 'var(--color-cream)' },
    'ESFJ': { primary: 'var(--color-pink-500)', text: 'var(--color-cream)' },
    'ISTP': { primary: 'var(--color-teal-300)', text: 'var(--color-green-900)' },
    'ISFP': { primary: 'var(--color-lilac-300)', text: 'var(--color-green-900)' },
    'ESTP': { primary: 'var(--color-orange-500)', text: 'var(--color-cream)' },
    'ESFP': { primary: 'var(--color-yellow-200)', text: 'var(--color-green-900)' }
  };

  // Gender-aware color mappings
  function getGenderAwareColors(personalityType, gender) {
    if (!gender) {
      const colors = MBTI_COLORS[personalityType] || MBTI_COLORS['INFP'];
      return colors;
    }

    const type = personalityType.toUpperCase();
    const groups = {
      'INTJ': 'analyst', 'INTP': 'analyst', 'ENTJ': 'analyst', 'ENTP': 'analyst',
      'INFJ': 'diplomat', 'INFP': 'diplomat', 'ENFJ': 'diplomat', 'ENFP': 'diplomat',
      'ISTJ': 'sentinel', 'ISFJ': 'sentinel', 'ESTJ': 'sentinel', 'ESFJ': 'sentinel',
      'ISTP': 'explorer', 'ISFP': 'explorer', 'ESTP': 'explorer', 'ESFP': 'explorer'
    };
    
    const group = groups[type] || 'diplomat';
    const suffix = gender === 'female' ? '-fem' : '-masc';
    
    const textColors = {
      'analyst-fem': 'rgb(91, 33, 182)',
      'analyst-masc': 'rgb(76, 29, 149)',
      'diplomat-fem': 'rgb(154, 52, 18)',
      'diplomat-masc': 'rgb(154, 52, 18)',
      'sentinel-fem': 'rgb(101, 67, 33)',
      'sentinel-masc': 'rgb(45, 69, 28)',
      'explorer-fem': 'rgb(161, 98, 7)',
      'explorer-masc': 'rgb(153, 27, 27)'
    };

    return {
      primary: `var(--color-${group}${suffix}-primary)`,
      text: textColors[`${group}${suffix}`] || 'var(--color-green-900)'
    };
  }

  // Apply theme immediately to prevent FOUC
  function applyImmediateTheme() {
    const themeMode = getThemePreference();
    const root = document.documentElement;
    const body = document.body;
    
    if (themeMode === 'mint') {
      // Apply mint theme
      root.style.setProperty('--mbti-primary', 'var(--color-mint-500)');
      root.style.setProperty('--mbti-secondary', 'var(--color-green-900)');
      root.style.setProperty('--mbti-accent', 'var(--color-pink-500)');
      root.style.setProperty('--mbti-text-primary', 'var(--color-green-900)');
      root.style.setProperty('--mbti-surface', 'var(--color-cream)');
      root.style.setProperty('--mbti-progress', 'var(--color-mint-500)');
      root.style.setProperty('--mbti-bg-pattern', 'var(--color-mint-500)');
      
      // Add body class
      body.className = body.className.replace(/mbti-\w+/g, '') + ' mbti-default';
    } else {
      // Apply personality theme
      const personalityType = getPersonalityType();
      const gender = getGender();
      const colors = getGenderAwareColors(personalityType, gender);
      
      root.style.setProperty('--mbti-primary', colors.primary);
      root.style.setProperty('--mbti-secondary', colors.primary);
      root.style.setProperty('--mbti-accent', colors.primary);
      root.style.setProperty('--mbti-text-primary', colors.text);
      root.style.setProperty('--mbti-surface', 'var(--color-cream)');
      root.style.setProperty('--mbti-progress', colors.primary);
      root.style.setProperty('--mbti-bg-pattern', colors.primary);
      
      // Add body classes
      body.className = body.className.replace(/mbti-\w+/g, '') + ` mbti-${personalityType.toLowerCase()}`;
      if (gender) {
        body.className += ` mbti-${gender === 'female' ? 'feminine' : 'masculine'}`;
      }
    }
  }

  // Apply theme immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyImmediateTheme);
  } else {
    applyImmediateTheme();
  }

  // Mark that theme has been initialized
  window.__THEME_INITIALIZED__ = true;
})();
