// MBTI Color and Theme System using existing color palette only
// All colors are SINGLE, PLAIN colors - no gradients

// Individual personality type themes using ONLY your existing color palette
export const MBTI_THEMES = {
  // ========== ANALYSTS (NT) ==========
  INTJ: {
    group: 'NT',
    name: 'The Architect',
    colors: {
      primary: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      secondary: { light: 'var(--color-blue-400)', dark: 'var(--color-blue-400)' },
      accent: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
      background: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🏗️',
      personality: 'Strategic • Systematic • Visionary'
    }
  },

  INTP: {
    group: 'NT',
    name: 'The Thinker',
    colors: {
      primary: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
      secondary: { light: 'var(--color-blue-400)', dark: 'var(--color-blue-400)' },
      accent: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      background: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🔍',
      personality: 'Curious • Analytical • Theoretical'
    }
  },

  ENTJ: {
    group: 'NT',
    name: 'The Commander',
    colors: {
      primary: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      secondary: { light: 'var(--color-amber-400)', dark: 'var(--color-amber-400)' },
      accent: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      background: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      text: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      icon: '👑',
      personality: 'Leadership • Strategic • Results-driven'
    }
  },

  ENTP: {
    group: 'NT',
    name: 'The Debater',
    colors: {
      primary: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      secondary: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      accent: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      background: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      text: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      icon: '💡',
      personality: 'Innovative • Versatile • Energetic'
    }
  },

  // ========== DIPLOMATS (NF) ==========
  INFJ: {
    group: 'NF',
    name: 'The Advocate',
    colors: {
      primary: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      secondary: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      accent: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      background: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🔮',
      personality: 'Visionary • Meaningful • Insightful'
    }
  },

  INFP: {
    group: 'NF',
    name: 'The Mediator',
    colors: {
      primary: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      secondary: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      accent: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      background: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🎨',
      personality: 'Authentic • Creative • Values-driven'
    }
  },

  ENFJ: {
    group: 'NF',
    name: 'The Protagonist',
    colors: {
      primary: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      secondary: { light: 'var(--color-mint-500)', dark: 'var(--color-mint-500)' },
      accent: { light: 'var(--color-lime-300)', dark: 'var(--color-lime-300)' },
      background: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🤝',
      personality: 'Inspirational • People-focused • Growth-oriented'
    }
  },

  ENFP: {
    group: 'NF',
    name: 'The Campaigner',
    colors: {
      primary: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      secondary: { light: 'var(--color-amber-400)', dark: 'var(--color-amber-400)' },
      accent: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      background: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🌟',
      personality: 'Enthusiastic • Creative • People-oriented'
    }
  },

  // ========== SENTINELS (SJ) ==========
  ISTJ: {
    group: 'SJ',
    name: 'The Logistician',
    colors: {
      primary: { light: 'var(--color-blue-400)', dark: 'var(--color-blue-400)' },
      secondary: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      accent: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
      background: { light: 'var(--color-blue-400)', dark: 'var(--color-blue-400)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-blue-400)', dark: 'var(--color-blue-400)' },
      text: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      icon: '📋',
      personality: 'Methodical • Reliable • Organized'
    }
  },

  ISFJ: {
    group: 'SJ',
    name: 'The Protector',
    colors: {
      primary: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      secondary: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      accent: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      background: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '💝',
      personality: 'Caring • Supportive • Gentle'
    }
  },

  ESTJ: {
    group: 'SJ',
    name: 'The Executive',
    colors: {
      primary: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      secondary: { light: 'var(--color-amber-400)', dark: 'var(--color-amber-400)' },
      accent: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      background: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      text: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      icon: '💼',
      personality: 'Executive • Results-driven • Organized'
    }
  },

  ESFJ: {
    group: 'SJ',
    name: 'The Consul',
    colors: {
      primary: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      secondary: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      accent: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      background: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
      text: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      icon: '🌈',
      personality: 'Harmonious • People-focused • Supportive'
    }
  },

  // ========== EXPLORERS (SP) ==========
  ISTP: {
    group: 'SP',
    name: 'The Virtuoso',
    colors: {
      primary: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      secondary: { light: 'var(--color-mint-500)', dark: 'var(--color-mint-500)' },
      accent: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
      background: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-teal-300)', dark: 'var(--color-teal-300)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🔨',
      personality: 'Practical • Hands-on • Adaptable'
    }
  },

  ISFP: {
    group: 'SP',
    name: 'The Adventurer',
    colors: {
      primary: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      secondary: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
      accent: { light: 'var(--color-pink-200)', dark: 'var(--color-pink-200)' },
      background: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-lilac-300)', dark: 'var(--color-lilac-300)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🎨',
      personality: 'Artistic • Gentle • Values-driven'
    }
  },

  ESTP: {
    group: 'SP',
    name: 'The Entrepreneur',
    colors: {
      primary: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      secondary: { light: 'var(--color-amber-400)', dark: 'var(--color-amber-400)' },
      accent: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      background: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-orange-500)', dark: 'var(--color-orange-500)' },
      text: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      icon: '💥',
      personality: 'Dynamic • Action-oriented • Energetic'
    }
  },

  ESFP: {
    group: 'SP',
    name: 'The Entertainer',
    colors: {
      primary: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      secondary: { light: 'var(--color-lime-300)', dark: 'var(--color-lime-300)' },
      accent: { light: 'var(--color-amber-400)', dark: 'var(--color-amber-400)' },
      background: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
      progress: { light: 'var(--color-yellow-200)', dark: 'var(--color-yellow-200)' },
      text: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
      icon: '🌟',
      personality: 'Joyful • People-focused • Spontaneous'
    }
  }
};

// Get personality type from localStorage
function getPersonalityType() {
  try {
    return localStorage.getItem('Nudge_personality_type') || 'INFP';
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

// Get gender-aware colors for personality type
function getGenderAwareColors(personalityType, gender) {
  if (!gender || !personalityType) {
    // Fallback to original theme colors
    const theme = MBTI_THEMES[personalityType] || MBTI_THEMES.INFP;
    return theme.colors;
  }

  const type = personalityType.toUpperCase();
  const group = MBTI_THEMES[type]?.group || 'NF';
  const isFeminine = gender === 'female';
  const suffix = isFeminine ? '-fem' : '-masc';
  
  // Map personality groups to color variables
  const groupColorMap = {
    'NT': 'analyst',  // Analysts
    'NF': 'diplomat', // Diplomats 
    'SJ': 'sentinel', // Sentinels
    'SP': 'explorer'  // Explorers
  };
  
  const colorGroup = groupColorMap[group] || 'diplomat';
  
  const bgColorVar = `var(--color-${colorGroup}${suffix}-primary)`;
  
  // Optimized text colors for each personality + gender combination
  const textColorMap = {
    // Analysts
    'analyst-fem': 'rgb(91, 33, 182)',    // Deep purple on soft lavender
    'analyst-masc': 'rgb(76, 29, 149)',   // Deep purple on rich lavender
    
    // Diplomats  
    'diplomat-fem': 'rgb(154, 52, 18)',   // Warm terracotta on soft peach
    'diplomat-masc': 'rgb(154, 52, 18)',  // Terracotta on warm apricot
    
    // Sentinels
    'sentinel-fem': 'rgb(101, 67, 33)',   // Deep chocolate brown on warm cream
    'sentinel-masc': 'rgb(45, 69, 28)',   // Very deep forest green on light sage
    
    // Explorers
    'explorer-fem': 'rgb(161, 98, 7)',    // Golden brown on soft yellow
    'explorer-masc': 'rgb(153, 27, 27)',  // Deep crimson on warm salmon
  };
  
  const textColorKey = `${colorGroup}${suffix}`;
  const textColor = textColorMap[textColorKey] || 'var(--color-green-900)';
  
  return {
    primary: { 
      light: bgColorVar, 
      dark: bgColorVar 
    },
    secondary: { 
      light: `var(--color-${colorGroup}${suffix}-secondary)`, 
      dark: `var(--color-${colorGroup}${suffix}-secondary)` 
    },
    accent: { 
      light: `var(--color-${colorGroup}${suffix}-accent)`, 
      dark: `var(--color-${colorGroup}${suffix}-accent)` 
    },
    background: { 
      light: bgColorVar, 
      dark: bgColorVar 
    },
    surface: { 
      light: 'var(--color-cream)', 
      dark: 'var(--color-cream)' 
    },
    progress: { 
      light: bgColorVar, 
      dark: bgColorVar 
    },
    text: { 
      light: textColor, 
      dark: textColor 
    }
  };
}

// Get current theme preference (personality vs mint)
export function getThemePreference() {
  try {
    return localStorage.getItem('Nudge_theme_mode') || 'personality';
  } catch {
    return 'personality';
  }
}

// Set theme preference (personality vs mint)
export function setThemePreference(mode) {
  try {
    localStorage.setItem('Nudge_theme_mode', mode);
  } catch {
    console.warn('Could not save theme preference');
  }
}

// Get current theme (either personality-based or mint default)
export function getCurrentPersonalityTheme() {
  const personalityType = getPersonalityType();
  const gender = getGender();
  const themeMode = getThemePreference();
  
  if (themeMode === 'mint') {
    // Return mint theme
    return {
      name: 'Nudge Default',
      group: 'default',
      currentMode: 'mint',
      colors: {
        primary: { light: 'var(--color-mint-500)', dark: 'var(--color-mint-500)' },
        secondary: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
        accent: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
        background: { light: 'var(--color-mint-500)', dark: 'var(--color-mint-500)' },
        surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
        progress: { light: 'var(--color-mint-500)', dark: 'var(--color-mint-500)' },
        current: {
          primary: 'var(--color-mint-500)',
          secondary: 'var(--color-green-900)',
          accent: 'var(--color-pink-500)',
          background: 'var(--color-mint-500)',
          surface: 'var(--color-cream)',
          progress: 'var(--color-mint-500)',
          text: 'var(--color-green-900)'
        }
      },
      icon: '🧠',
      personality: 'Default • Focused • Productive'
    };
  }
  
  // Return personality theme with gender-aware colors
  const theme = MBTI_THEMES[personalityType] || MBTI_THEMES.INFP;
  const colors = getGenderAwareColors(personalityType, gender);
  
  return {
    ...theme,
    currentMode: 'personality',
    colors: {
      ...colors,
      current: {
        primary: colors.primary.light,
        secondary: colors.secondary.light,
        accent: colors.accent.light,
        background: colors.background.light,
        surface: colors.surface.light,
        progress: colors.progress.light,
        text: colors.text.light
      }
    }
  };
}

// Apply personality theme to document
export function applyPersonalityTheme(personalityType = null) {
  const personality = personalityType || getPersonalityType();
  const gender = getGender();
  const colors = getGenderAwareColors(personality, gender);
  
  // Apply CSS variables - using gender-aware colors
  const root = document.documentElement;
  root.style.setProperty('--mbti-primary', colors.primary.light);
  root.style.setProperty('--mbti-secondary', colors.secondary.light);
  root.style.setProperty('--mbti-accent', colors.accent.light);
  root.style.setProperty('--mbti-text-primary', colors.text.light);
  root.style.setProperty('--mbti-surface', colors.surface.light);
  root.style.setProperty('--mbti-progress', colors.progress.light);
  root.style.setProperty('--mbti-bg-pattern', colors.background.light);
  
  // Add personality and gender classes to body
  document.body.classList.remove(...Object.keys(MBTI_THEMES).map(type => `mbti-${type.toLowerCase()}`));
  document.body.classList.remove('mbti-feminine', 'mbti-masculine');
  document.body.classList.add(`mbti-${personality.toLowerCase()}`);
  if (gender) {
    document.body.classList.add(`mbti-${gender === 'female' ? 'feminine' : 'masculine'}`);
  }
}

// Apply mint theme
export function applyMintTheme() {
  const root = document.documentElement;
  root.style.setProperty('--mbti-primary', 'var(--color-mint-500)');
  root.style.setProperty('--mbti-secondary', 'var(--color-green-900)');
  root.style.setProperty('--mbti-accent', 'var(--color-pink-500)');
  root.style.setProperty('--mbti-text-primary', 'var(--color-green-900)');
  root.style.setProperty('--mbti-surface', 'var(--color-cream)');
  root.style.setProperty('--mbti-progress', 'var(--color-mint-500)');
  root.style.setProperty('--mbti-bg-pattern', 'var(--color-mint-500)');
  
  // Remove personality classes
  document.body.classList.remove(...Object.keys(MBTI_THEMES).map(type => `mbti-${type.toLowerCase()}`));
  document.body.classList.add('mbti-default');
}

// Theme utilities
export const themeUtils = {
  // Toggle between personality theme and mint theme
  toggleTheme: () => {
    const currentMode = getThemePreference();
    const newMode = currentMode === 'personality' ? 'mint' : 'personality';
    setThemePreference(newMode);
    
    if (newMode === 'mint') {
      applyMintTheme();
    } else {
      applyPersonalityTheme();
    }
    
    return newMode;
  },
  
  // Get personality group
  getPersonalityGroup: (personalityType) => {
    return MBTI_THEMES[personalityType]?.group || 'NF';
  },
  
  // Get background class for personality type - single color only
  getGradientClass: (personalityType, type = 'background') => {
    const themeMode = getThemePreference();
    
    if (themeMode === 'mint') {
      return 'bg-mint';
    }
    
    const theme = MBTI_THEMES[personalityType];
    if (!theme) return 'bg-mint';
    
    // Return single color classes - no gradients
    switch (type) {
      case 'background':
        return 'bg-mbti-primary';
      case 'card':
        return 'bg-mbti-surface';
      case 'progress':
        return 'bg-mbti-primary';
      default:
        return 'bg-mbti-primary';
    }
  }
};

// Initialize theme system
export function initializeThemeSystem() {
  // Apply initial theme
  const themeMode = getThemePreference();
  if (themeMode === 'mint') {
    applyMintTheme();
  } else {
    applyPersonalityTheme();
  }
}

const mbtiThemes = {
  MBTI_THEMES,
  getCurrentPersonalityTheme,
  applyPersonalityTheme,
  applyMintTheme,
  themeUtils,
  initializeThemeSystem
};

export default mbtiThemes;
