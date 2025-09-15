// MBTI Color and Theme System
// Unified personality-based visual theming system with theme toggle support

// Core MBTI group color palettes
const MBTI_GROUP_PALETTES = {
  // Analysts (NT) - Cool, Tech-forward, System-focused
  NT: {
    primary: { light: '#3B82F6', dark: '#60A5FA' }, // Blue
    secondary: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple  
    accent: { light: '#06B6D4', dark: '#67E8F9' }, // Cyan
    background: { 
      light: 'from-slate-50 to-blue-50', 
      dark: 'from-slate-900 to-blue-900' 
    },
    surface: { 
      light: 'bg-white/80 border-slate-200', 
      dark: 'bg-slate-800/80 border-slate-600' 
    },
    text: { 
      primary: { light: 'text-slate-900', dark: 'text-slate-100' },
      secondary: { light: 'text-slate-600', dark: 'text-slate-400' },
      accent: { light: 'text-blue-600', dark: 'text-blue-400' }
    }
  },

  // Diplomats (NF) - Warm, Meaningful, Growth-focused
  NF: {
    primary: { light: '#EC4899', dark: '#F472B6' }, // Pink
    secondary: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple
    accent: { light: '#10B981', dark: '#34D399' }, // Emerald
    background: { 
      light: 'from-purple-50 to-pink-50', 
      dark: 'from-purple-900 to-pink-900' 
    },
    surface: { 
      light: 'bg-white/80 border-purple-200', 
      dark: 'bg-purple-800/80 border-purple-600' 
    },
    text: { 
      primary: { light: 'text-purple-900', dark: 'text-purple-100' },
      secondary: { light: 'text-purple-600', dark: 'text-purple-400' },
      accent: { light: 'text-pink-600', dark: 'text-pink-400' }
    }
  },

  // Sentinels (SJ) - Stable, Reliable, Service-focused
  SJ: {
    primary: { light: '#DC2626', dark: '#EF4444' }, // Red
    secondary: { light: '#D97706', dark: '#F59E0B' }, // Amber
    accent: { light: '#059669', dark: '#10B981' }, // Emerald
    background: { 
      light: 'from-red-50 to-orange-50', 
      dark: 'from-red-900 to-orange-900' 
    },
    surface: { 
      light: 'bg-white/80 border-red-200', 
      dark: 'bg-red-800/80 border-red-600' 
    },
    text: { 
      primary: { light: 'text-red-900', dark: 'text-red-100' },
      secondary: { light: 'text-red-600', dark: 'text-red-400' },
      accent: { light: 'text-orange-600', dark: 'text-orange-400' }
    }
  },

  // Explorers (SP) - Dynamic, Action-focused, Experiential
  SP: {
    primary: { light: '#F59E0B', dark: '#FBBF24' }, // Amber
    secondary: { light: '#EF4444', dark: '#F87171' }, // Red
    accent: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple
    background: { 
      light: 'from-yellow-50 to-orange-50', 
      dark: 'from-yellow-900 to-orange-900' 
    },
    surface: { 
      light: 'bg-white/80 border-yellow-200', 
      dark: 'bg-yellow-800/80 border-yellow-600' 
    },
    text: { 
      primary: { light: 'text-yellow-900', dark: 'text-yellow-100' },
      secondary: { light: 'text-yellow-700', dark: 'text-yellow-400' },
      accent: { light: 'text-orange-600', dark: 'text-orange-400' }
    }
  }
};

// Individual personality type themes using your existing color palette
export const MBTI_THEMES = {
  // ========== ANALYSTS (NT) ==========
  INTJ: {
    group: 'NT',
    name: 'The Architect',
    colors: {
      primary: { light: 'rgb(200, 140, 253)', dark: 'rgb(200, 140, 253)' }, // --color-purple-400
      secondary: { light: 'rgb(88, 154, 240)', dark: 'rgb(88, 154, 240)' }, // --color-blue-400
      accent: { light: 'rgb(174, 251, 255)', dark: 'rgb(174, 251, 255)' }, // --color-cyan-200
      background: { 
        light: 'from-purple-400 via-blue-400 to-cyan-200', 
        dark: 'from-purple-400 via-blue-400 to-cyan-200' 
      },
      surface: { 
        light: 'rgb(249, 248, 244)', // --color-cream
        dark: 'rgb(249, 248, 244)' 
      },
      progress: { light: 'from-purple-400 to-blue-400', dark: 'from-purple-400 to-blue-400' },
      icon: '🏗️',
      personality: 'Strategic • Systematic • Visionary'
    }
  },

  INTP: {
    group: 'NT',
    name: 'The Thinker',
    colors: {
      primary: { light: 'rgb(174, 251, 255)', dark: 'rgb(174, 251, 255)' }, // --color-cyan-200
      secondary: { light: 'rgb(88, 154, 240)', dark: 'rgb(88, 154, 240)' }, // --color-blue-400
      accent: { light: 'rgb(137, 169, 161)', dark: 'rgb(137, 169, 161)' }, // --color-teal-300
      background: { 
        light: 'from-cyan-200 via-blue-400 to-teal-300', 
        dark: 'from-cyan-200 via-blue-400 to-teal-300' 
      },
      surface: { 
        light: 'rgb(249, 248, 244)', // --color-cream
        dark: 'rgb(249, 248, 244)' 
      },
      progress: { light: 'from-cyan-200 to-blue-400', dark: 'from-cyan-200 to-blue-400' },
      icon: '🔍',
      personality: 'Curious • Analytical • Theoretical'
    }
  },

  ENTJ: {
    group: 'NT',
    name: 'The Commander',
    colors: {
      primary: { light: '#DC2626', dark: '#EF4444' }, // Red
      secondary: { light: '#F59E0B', dark: '#FBBF24' }, // Amber
      accent: { light: '#EA580C', dark: '#FB923C' }, // Orange
      background: { 
        light: 'from-red-50 via-orange-50 to-yellow-50', 
        dark: 'from-red-900 via-orange-900 to-yellow-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-red-50/90 border-red-200', 
        dark: 'bg-gradient-to-br from-red-900/90 to-orange-900/50 border-orange-500/30' 
      },
      progress: { light: 'from-red-500 to-orange-500', dark: 'from-red-400 to-orange-400' },
      icon: '👑',
      personality: 'Leadership • Strategic • Results-driven'
    }
  },

  ENTP: {
    group: 'NT',
    name: 'The Debater',
    colors: {
      primary: { light: '#EC4899', dark: '#F472B6' }, // Pink
      secondary: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple
      accent: { light: '#D946EF', dark: '#E879F9' }, // Fuchsia
      background: { 
        light: 'from-purple-50 via-pink-50 to-rose-50', 
        dark: 'from-purple-900 via-pink-900 to-rose-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-purple-50/90 border-purple-200', 
        dark: 'bg-gradient-to-br from-purple-800/90 to-pink-900/50 border-pink-500/30' 
      },
      progress: { light: 'from-purple-500 to-pink-500', dark: 'from-purple-400 to-pink-400' },
      icon: '💡',
      personality: 'Innovative • Versatile • Energetic'
    }
  },

  // ========== DIPLOMATS (NF) ==========
  INFJ: {
    group: 'NF',
    name: 'The Advocate',
    colors: {
      primary: { light: '#6366F1', dark: '#818CF8' }, // Indigo
      secondary: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple
      accent: { light: '#06B6D4', dark: '#67E8F9' }, // Cyan
      background: { 
        light: 'from-indigo-50 via-purple-50 to-violet-50', 
        dark: 'from-indigo-900 via-purple-900 to-violet-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-indigo-50/90 border-indigo-200', 
        dark: 'bg-gradient-to-br from-indigo-900/90 to-purple-900/50 border-indigo-500/30' 
      },
      progress: { light: 'from-indigo-500 to-purple-500', dark: 'from-indigo-400 to-purple-300' },
      icon: '🔮',
      personality: 'Visionary • Meaningful • Insightful'
    }
  },

  INFP: {
    group: 'NF',
    name: 'The Mediator',
    colors: {
      primary: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple
      secondary: { light: '#EC4899', dark: '#F472B6' }, // Pink
      accent: { light: '#D946EF', dark: '#E879F9' }, // Fuchsia
      background: { 
        light: 'from-purple-50 via-pink-50 to-rose-50', 
        dark: 'from-purple-900 via-pink-900 to-rose-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-purple-50/90 border-purple-200', 
        dark: 'bg-gradient-to-br from-purple-900/90 to-pink-900/50 border-purple-500/30' 
      },
      progress: { light: 'from-purple-500 to-pink-500', dark: 'from-purple-300 to-pink-300' },
      icon: '🎨',
      personality: 'Authentic • Creative • Values-driven'
    }
  },

  ENFJ: {
    group: 'NF',
    name: 'The Protagonist',
    colors: {
      primary: { light: '#10B981', dark: '#34D399' }, // Emerald
      secondary: { light: '#059669', dark: '#10B981' }, // Green
      accent: { light: '#14B8A6', dark: '#5EEAD4' }, // Teal
      background: { 
        light: 'from-emerald-50 via-teal-50 to-green-50', 
        dark: 'from-emerald-900 via-teal-900 to-green-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-emerald-50/90 border-emerald-200', 
        dark: 'bg-gradient-to-br from-green-900/90 to-teal-900/50 border-teal-500/30' 
      },
      progress: { light: 'from-emerald-500 to-teal-500', dark: 'from-green-400 to-teal-400' },
      icon: '🤝',
      personality: 'Inspirational • People-focused • Growth-oriented'
    }
  },

  ENFP: {
    group: 'NF',
    name: 'The Campaigner',
    colors: {
      primary: { light: '#F59E0B', dark: '#FBBF24' }, // Amber
      secondary: { light: '#EAB308', dark: '#FDE047' }, // Yellow
      accent: { light: '#F97316', dark: '#FB923C' }, // Orange
      background: { 
        light: 'from-amber-50 via-yellow-50 to-orange-50', 
        dark: 'from-amber-900 via-yellow-900 to-orange-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-amber-50/90 border-amber-200', 
        dark: 'bg-gradient-to-br from-orange-900/90 to-yellow-900/50 border-yellow-500/30' 
      },
      progress: { light: 'from-amber-500 to-orange-500', dark: 'from-orange-400 to-yellow-400' },
      icon: '🌟',
      personality: 'Enthusiastic • Creative • People-oriented'
    }
  },

  // ========== SENTINELS (SJ) ==========
  ISTJ: {
    group: 'SJ',
    name: 'The Logistician',
    colors: {
      primary: { light: '#1D4ED8', dark: '#3B82F6' }, // Blue
      secondary: { light: '#374151', dark: '#6B7280' }, // Gray
      accent: { light: '#0F172A', dark: '#475569' }, // Slate
      background: { 
        light: 'from-blue-50 via-slate-50 to-gray-50', 
        dark: 'from-blue-900 via-slate-900 to-gray-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-blue-50/90 border-blue-200', 
        dark: 'bg-gradient-to-br from-gray-800/90 to-blue-900/50 border-blue-500/30' 
      },
      progress: { light: 'from-blue-500 to-slate-500', dark: 'from-blue-500 to-blue-400' },
      icon: '📋',
      personality: 'Methodical • Reliable • Organized'
    }
  },

  ISFJ: {
    group: 'SJ',
    name: 'The Protector',
    colors: {
      primary: { light: '#F43F5E', dark: '#FB7185' }, // Rose
      secondary: { light: '#EC4899', dark: '#F472B6' }, // Pink
      accent: { light: '#BE185D', dark: '#EC4899' }, // Pink-600
      background: { 
        light: 'from-rose-50 via-pink-50 to-red-50', 
        dark: 'from-rose-900 via-pink-900 to-red-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-rose-50/90 border-rose-200', 
        dark: 'bg-gradient-to-br from-rose-900/90 to-pink-900/50 border-rose-500/30' 
      },
      progress: { light: 'from-rose-500 to-pink-500', dark: 'from-rose-400 to-pink-400' },
      icon: '💝',
      personality: 'Caring • Supportive • Gentle'
    }
  },

  ESTJ: {
    group: 'SJ',
    name: 'The Executive',
    colors: {
      primary: { light: '#DC2626', dark: '#EF4444' }, // Red
      secondary: { light: '#D97706', dark: '#F59E0B' }, // Amber
      accent: { light: '#EA580C', dark: '#FB923C' }, // Orange
      background: { 
        light: 'from-red-50 via-amber-50 to-yellow-50', 
        dark: 'from-red-900 via-amber-900 to-yellow-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-red-50/90 border-red-200', 
        dark: 'bg-gradient-to-br from-red-900/90 to-yellow-900/50 border-red-500/30' 
      },
      progress: { light: 'from-red-500 to-amber-500', dark: 'from-red-500 to-yellow-500' },
      icon: '💼',
      personality: 'Executive • Results-driven • Organized'
    }
  },

  ESFJ: {
    group: 'SJ',
    name: 'The Consul',
    colors: {
      primary: { light: '#EC4899', dark: '#F472B6' }, // Pink
      secondary: { light: '#F43F5E', dark: '#FB7185' }, // Rose
      accent: { light: '#BE185D', dark: '#EC4899' }, // Pink-600
      background: { 
        light: 'from-pink-50 via-rose-50 to-red-50', 
        dark: 'from-pink-900 via-rose-900 to-red-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-pink-50/90 border-pink-200', 
        dark: 'bg-gradient-to-br from-pink-900/90 to-rose-900/50 border-pink-500/30' 
      },
      progress: { light: 'from-pink-500 to-rose-500', dark: 'from-pink-400 to-rose-400' },
      icon: '🌈',
      personality: 'Harmonious • People-focused • Supportive'
    }
  },

  // ========== EXPLORERS (SP) ==========
  ISTP: {
    group: 'SP',
    name: 'The Virtuoso',
    colors: {
      primary: { light: '#059669', dark: '#10B981' }, // Emerald
      secondary: { light: '#374151', dark: '#6B7280' }, // Gray
      accent: { light: '#0D9488', dark: '#14B8A6' }, // Teal
      background: { 
        light: 'from-emerald-50 via-gray-50 to-slate-50', 
        dark: 'from-emerald-900 via-gray-900 to-slate-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-emerald-50/90 border-emerald-200', 
        dark: 'bg-gradient-to-br from-gray-900/90 to-green-900/50 border-green-500/30' 
      },
      progress: { light: 'from-emerald-500 to-gray-500', dark: 'from-gray-400 to-green-400' },
      icon: '🔨',
      personality: 'Practical • Hands-on • Adaptable'
    }
  },

  ISFP: {
    group: 'SP',
    name: 'The Adventurer',
    colors: {
      primary: { light: '#8B5CF6', dark: '#A78BFA' }, // Purple
      secondary: { light: '#059669', dark: '#34D399' }, // Emerald
      accent: { light: '#0D9488', dark: '#5EEAD4' }, // Teal
      background: { 
        light: 'from-purple-50 via-emerald-50 to-teal-50', 
        dark: 'from-purple-900 via-emerald-900 to-teal-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-purple-50/90 border-purple-200', 
        dark: 'bg-gradient-to-br from-purple-900/90 to-green-900/50 border-purple-500/30' 
      },
      progress: { light: 'from-purple-500 to-emerald-500', dark: 'from-purple-300 to-green-300' },
      icon: '🎨',
      personality: 'Artistic • Gentle • Values-driven'
    }
  },

  ESTP: {
    group: 'SP',
    name: 'The Entrepreneur',
    colors: {
      primary: { light: '#EA580C', dark: '#FB923C' }, // Orange
      secondary: { light: '#DC2626', dark: '#EF4444' }, // Red
      accent: { light: '#D97706', dark: '#FBBF24' }, // Amber
      background: { 
        light: 'from-orange-50 via-red-50 to-yellow-50', 
        dark: 'from-orange-900 via-red-900 to-yellow-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-orange-50/90 border-orange-200', 
        dark: 'bg-gradient-to-br from-orange-900/90 to-red-900/50 border-orange-500/30' 
      },
      progress: { light: 'from-orange-500 to-red-500', dark: 'from-orange-400 to-red-400' },
      icon: '💥',
      personality: 'Dynamic • Action-oriented • Energetic'
    }
  },

  ESFP: {
    group: 'SP',
    name: 'The Entertainer',
    colors: {
      primary: { light: '#EAB308', dark: '#FDE047' }, // Yellow
      secondary: { light: '#EC4899', dark: '#F472B6' }, // Pink
      accent: { light: '#F97316', dark: '#FB923C' }, // Orange
      background: { 
        light: 'from-yellow-50 via-pink-50 to-orange-50', 
        dark: 'from-yellow-900 via-pink-900 to-orange-900' 
      },
      surface: { 
        light: 'bg-gradient-to-br from-white/90 to-yellow-50/90 border-yellow-200', 
        dark: 'bg-gradient-to-br from-yellow-900/90 to-pink-900/50 border-yellow-500/30' 
      },
      progress: { light: 'from-yellow-500 to-pink-500', dark: 'from-yellow-400 to-pink-400' },
      icon: '🌟',
      personality: 'Joyful • People-focused • Spontaneous'
    }
  }
};

// Get personality type from localStorage
function getPersonalityType() {
  try {
    const profile = JSON.parse(localStorage.getItem('Nudge_user_profile') || '{}');
    return profile.personalityType || 'INFP';
  } catch {
    return 'INFP';
  }
}

// Get current theme preference (light/dark)
export function getThemePreference() {
  try {
    return localStorage.getItem('Nudge_theme') || 'dark';
  } catch {
    return 'dark';
  }
}

// Set theme preference
export function setThemePreference(theme) {
  try {
    localStorage.setItem('Nudge_theme', theme);
    // Apply theme to document
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch {
    console.warn('Could not save theme preference');
  }
}

// Get current personality theme
export function getCurrentPersonalityTheme() {
  const personalityType = getPersonalityType();
  const themePreference = getThemePreference();
  const theme = MBTI_THEMES[personalityType] || MBTI_THEMES.INFP;
  
  return {
    ...theme,
    currentMode: themePreference,
    colors: {
      ...theme.colors,
      // Add current mode colors for easy access
      current: {
        primary: theme.colors.primary[themePreference],
        secondary: theme.colors.secondary[themePreference], 
        accent: theme.colors.accent[themePreference],
        background: theme.colors.background[themePreference],
        surface: theme.colors.surface[themePreference],
        progress: theme.colors.progress[themePreference],
        text: MBTI_GROUP_PALETTES[theme.group].text.primary[themePreference]
      }
    }
  };
}

// Get theme styles for specific personality type
export function getPersonalityThemeStyles(personalityType, mode = null) {
  const themeMode = mode || getThemePreference();
  const theme = MBTI_THEMES[personalityType] || MBTI_THEMES.INFP;
  
  return {
    // Background gradients
    pageBackground: `bg-gradient-to-br ${theme.colors.background[themeMode]}`,
    cardBackground: theme.colors.surface[themeMode],
    
    // Progress bars
    progressBackground: `bg-gradient-to-r ${theme.colors.progress[themeMode]}`,
    
    // Text colors
    textPrimary: MBTI_GROUP_PALETTES[theme.group].text.primary[themeMode],
    textSecondary: MBTI_GROUP_PALETTES[theme.group].text.secondary[themeMode],
    textAccent: MBTI_GROUP_PALETTES[theme.group].text.accent[themeMode],
    
    // Interactive elements
    buttonPrimary: `bg-gradient-to-r from-${theme.colors.primary[themeMode]} to-${theme.colors.secondary[themeMode]}`,
    buttonSecondary: theme.colors.surface[themeMode],
    
    // Borders and dividers
    border: `border-${theme.colors.primary[themeMode]}/20`,
    divider: `border-${theme.colors.primary[themeMode]}/10`
  };
}

// Generate CSS variables for current personality theme
export function generatePersonalityThemeCSS(personalityType, mode = null) {
  const themeMode = mode || getThemePreference();
  const theme = MBTI_THEMES[personalityType] || MBTI_THEMES.INFP;
  const groupPalette = MBTI_GROUP_PALETTES[theme.group];
  
  return `
    :root {
      /* Personality-specific colors */
      --mbti-primary: ${theme.colors.primary[themeMode]};
      --mbti-secondary: ${theme.colors.secondary[themeMode]};
      --mbti-accent: ${theme.colors.accent[themeMode]};
      
      /* Group-based text colors */
      --mbti-text-primary: ${groupPalette.text.primary[themeMode]};
      --mbti-text-secondary: ${groupPalette.text.secondary[themeMode]};
      --mbti-text-accent: ${groupPalette.text.accent[themeMode]};
      
      /* Background patterns */
      --mbti-bg-pattern: ${theme.colors.background[themeMode]};
      --mbti-surface: ${theme.colors.surface[themeMode]};
      --mbti-progress: ${theme.colors.progress[themeMode]};
      
      /* Personality metadata */
      --mbti-type: "${personalityType}";
      --mbti-name: "${theme.name}";
      --mbti-group: "${theme.group}";
      --mbti-icon: "${theme.icon}";
    }
  `;
}

// Apply personality theme to document
export function applyPersonalityTheme(personalityType = null) {
  const personality = personalityType || getPersonalityType();
  const css = generatePersonalityThemeCSS(personality);
  
  // Remove existing personality theme
  const existingStyle = document.getElementById('mbti-theme');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add new personality theme
  const style = document.createElement('style');
  style.id = 'mbti-theme';
  style.textContent = css;
  document.head.appendChild(style);
  
  // Add personality class to body for additional styling
  document.body.classList.remove(...Object.keys(MBTI_THEMES).map(type => `mbti-${type.toLowerCase()}`));
  document.body.classList.add(`mbti-${personality.toLowerCase()}`);
  document.body.classList.add(`mbti-group-${MBTI_THEMES[personality]?.group.toLowerCase()}`);
}

// Theme utilities for components
export const themeUtils = {
  // Get personality group (NT, NF, SJ, SP)
  getPersonalityGroup: (personalityType) => {
    return MBTI_THEMES[personalityType]?.group || 'NF';
  },
  
  // Check if current theme is light mode
  isLightMode: () => {
    return getThemePreference() === 'light';
  },
  
  // Toggle between light and dark mode
  toggleTheme: () => {
    const currentTheme = getThemePreference();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setThemePreference(newTheme);
    applyPersonalityTheme(); // Reapply with new mode
    return newTheme;
  },
  
  // Get contrast color for readability
  getContrastColor: (backgroundColor) => {
    // Simple contrast calculation - in real app, use proper color contrast lib
    return backgroundColor.includes('50') || backgroundColor.includes('100') ? 'text-gray-900' : 'text-white';
  },
  
  // Get personality-specific gradient classes
  getGradientClass: (personalityType, type = 'background') => {
    const theme = MBTI_THEMES[personalityType];
    const mode = getThemePreference();
    
    if (!theme) return 'bg-gradient-to-br from-purple-900 to-pink-900';
    
    switch (type) {
      case 'background':
        return `bg-gradient-to-br ${theme.colors.background[mode]}`;
      case 'card':
        return theme.colors.surface[mode];
      case 'progress':
        return `bg-gradient-to-r ${theme.colors.progress[mode]}`;
      default:
        return `bg-gradient-to-br ${theme.colors.background[mode]}`;
    }
  }
};

// Initialize theme system
export function initializeThemeSystem() {
  // Apply initial theme based on system preference if not set
  const savedTheme = getThemePreference();
  if (!localStorage.getItem('Nudge_theme')) {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemePreference(systemPrefersDark ? 'dark' : 'light');
  }
  
  // Apply personality theme
  applyPersonalityTheme();
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('Nudge_theme_user_set')) {
      setThemePreference(e.matches ? 'dark' : 'light');
      applyPersonalityTheme();
    }
  });
}

// Export everything for easy access
const mbtiThemesOld = {
  MBTI_THEMES,
  MBTI_GROUP_PALETTES,
  getCurrentPersonalityTheme,
  getPersonalityThemeStyles,
  applyPersonalityTheme,
  themeUtils,
  initializeThemeSystem
};

export default mbtiThemesOld;
