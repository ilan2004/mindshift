// MBTI Color and Theme System using existing color palette only
// All colors map to your defined CSS variables

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
      background: { 
        light: 'var(--color-purple-400)', 
        dark: 'var(--color-purple-400)' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'var(--color-purple-400)', dark: 'var(--color-purple-400)' },
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
      background: { 
        light: 'var(--color-cyan-200)', 
        dark: 'var(--color-cyan-200)' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'var(--color-cyan-200)', dark: 'var(--color-cyan-200)' },
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
      background: { 
        light: 'from-orange-500 via-amber-400 to-yellow-200', 
        dark: 'from-orange-500 via-amber-400 to-yellow-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-orange-500 to-amber-400', dark: 'from-orange-500 to-amber-400' },
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
      background: { 
        light: 'from-pink-500 via-purple-400 to-lilac-300', 
        dark: 'from-pink-500 via-purple-400 to-lilac-300' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-pink-500 to-purple-400', dark: 'from-pink-500 to-purple-400' },
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
      background: { 
        light: 'from-purple-400 via-lilac-300 to-pink-200', 
        dark: 'from-purple-400 via-lilac-300 to-pink-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-purple-400 to-lilac-300', dark: 'from-purple-400 to-lilac-300' },
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
      background: { 
        light: 'from-lilac-300 via-pink-200 to-pink-500', 
        dark: 'from-lilac-300 via-pink-200 to-pink-500' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-lilac-300 to-pink-200', dark: 'from-lilac-300 to-pink-200' },
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
      background: { 
        light: 'from-teal-300 via-mint-500 to-lime-300', 
        dark: 'from-teal-300 via-mint-500 to-lime-300' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-teal-300 to-mint-500', dark: 'from-teal-300 to-mint-500' },
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
      background: { 
        light: 'from-yellow-200 via-amber-400 to-orange-500', 
        dark: 'from-yellow-200 via-amber-400 to-orange-500' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-yellow-200 to-amber-400', dark: 'from-yellow-200 to-amber-400' },
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
      background: { 
        light: 'from-blue-400 via-teal-300 to-cyan-200', 
        dark: 'from-blue-400 via-teal-300 to-cyan-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-blue-400 to-teal-300', dark: 'from-blue-400 to-teal-300' },
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
      background: { 
        light: 'from-pink-200 via-pink-500 to-lilac-300', 
        dark: 'from-pink-200 via-pink-500 to-lilac-300' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-pink-200 to-pink-500', dark: 'from-pink-200 to-pink-500' },
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
      background: { 
        light: 'from-orange-500 via-amber-400 to-yellow-200', 
        dark: 'from-orange-500 via-amber-400 to-yellow-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-orange-500 to-amber-400', dark: 'from-orange-500 to-amber-400' },
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
      background: { 
        light: 'from-pink-500 via-pink-200 to-lilac-300', 
        dark: 'from-pink-500 via-pink-200 to-lilac-300' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-pink-500 to-pink-200', dark: 'from-pink-500 to-pink-200' },
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
      background: { 
        light: 'from-teal-300 via-mint-500 to-cyan-200', 
        dark: 'from-teal-300 via-mint-500 to-cyan-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-teal-300 to-mint-500', dark: 'from-teal-300 to-mint-500' },
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
      background: { 
        light: 'from-lilac-300 via-purple-400 to-pink-200', 
        dark: 'from-lilac-300 via-purple-400 to-pink-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-lilac-300 to-purple-400', dark: 'from-lilac-300 to-purple-400' },
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
      background: { 
        light: 'from-orange-500 via-amber-400 to-yellow-200', 
        dark: 'from-orange-500 via-amber-400 to-yellow-200' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-orange-500 to-amber-400', dark: 'from-orange-500 to-amber-400' },
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
      background: { 
        light: 'from-yellow-200 via-lime-300 to-amber-400', 
        dark: 'from-yellow-200 via-lime-300 to-amber-400' 
      },
      surface: { 
        light: 'var(--color-cream)',
        dark: 'var(--color-cream)' 
      },
      progress: { light: 'from-yellow-200 to-lime-300', dark: 'from-yellow-200 to-lime-300' },
      icon: '🌟',
      personality: 'Joyful • People-focused • Spontaneous'
    }
  }
};

// Helper function to create CSS gradients from Tailwind-style color strings
function createGradientFromString(gradientString) {
  // Convert Tailwind gradient format to CSS gradient
  // Example: "from-purple-400 via-blue-400 to-cyan-200" -> proper CSS gradient
  const colorMap = {
    'mint-500': 'var(--color-mint-500)',
    'green-900': 'var(--color-green-900)',
    'lilac-300': 'var(--color-lilac-300)',
    'orange-500': 'var(--color-orange-500)',
    'amber-400': 'var(--color-amber-400)',
    'cyan-200': 'var(--color-cyan-200)',
    'blue-400': 'var(--color-blue-400)',
    'purple-400': 'var(--color-purple-400)',
    'pink-200': 'var(--color-pink-200)',
    'pink-500': 'var(--color-pink-500)',
    'yellow-200': 'var(--color-yellow-200)',
    'lime-300': 'var(--color-lime-300)',
    'teal-300': 'var(--color-teal-300)',
  };
  
  // Parse the gradient string
  const parts = gradientString.split(' ');
  const colors = [];
  
  for (const part of parts) {
    if (part.startsWith('from-')) {
      const colorName = part.replace('from-', '');
      colors.push(colorMap[colorName] || `var(--color-${colorName})`);
    } else if (part.startsWith('via-')) {
      const colorName = part.replace('via-', '');
      colors.push(colorMap[colorName] || `var(--color-${colorName})`);
    } else if (part.startsWith('to-')) {
      const colorName = part.replace('to-', '');
      colors.push(colorMap[colorName] || `var(--color-${colorName})`);
    }
  }
  
  return `linear-gradient(to bottom right, ${colors.join(', ')})`;
}

// Get personality type from localStorage
function getPersonalityType() {
  try {
    return localStorage.getItem('mindshift_personality_type') || 'INFP';
  } catch {
    return 'INFP';
  }
}

// Get current theme preference (personality vs mint)
export function getThemePreference() {
  try {
    return localStorage.getItem('mindshift_theme_mode') || 'personality';
  } catch {
    return 'personality';
  }
}

// Set theme preference (personality vs mint)
export function setThemePreference(mode) {
  try {
    localStorage.setItem('mindshift_theme_mode', mode);
  } catch {
    console.warn('Could not save theme preference');
  }
}

// Get current theme (either personality-based or mint default)
export function getCurrentPersonalityTheme() {
  const personalityType = getPersonalityType();
  const themeMode = getThemePreference();
  
  if (themeMode === 'mint') {
    // Return mint theme
    return {
      name: 'MindShift Default',
      group: 'default',
      currentMode: 'mint',
      colors: {
        primary: { light: 'var(--color-mint-500)', dark: 'var(--color-mint-500)' },
        secondary: { light: 'var(--color-green-900)', dark: 'var(--color-green-900)' },
        accent: { light: 'var(--color-pink-500)', dark: 'var(--color-pink-500)' },
        background: { light: 'from-mint-500 to-teal-300', dark: 'from-mint-500 to-teal-300' },
        surface: { light: 'var(--color-cream)', dark: 'var(--color-cream)' },
        progress: { light: 'from-mint-500 to-green-900', dark: 'from-mint-500 to-green-900' },
        current: {
          primary: 'var(--color-mint-500)',
          secondary: 'var(--color-green-900)',
          accent: 'var(--color-pink-500)',
          background: 'from-mint-500 to-teal-300',
          surface: 'var(--color-cream)',
          progress: 'from-mint-500 to-green-900',
          text: 'var(--color-green-900)'
        }
      },
      icon: '🧠',
      personality: 'Default • Focused • Productive'
    };
  }
  
  // Return personality theme
  const theme = MBTI_THEMES[personalityType] || MBTI_THEMES.INFP;
  
  return {
    ...theme,
    currentMode: 'personality',
    colors: {
      ...theme.colors,
      current: {
        primary: theme.colors.primary.light,
        secondary: theme.colors.secondary.light,
        accent: theme.colors.accent.light,
        background: theme.colors.background.light,
        surface: theme.colors.surface.light,
        progress: theme.colors.progress.light,
        text: 'var(--color-green-900)'
      }
    }
  };
}

// Apply personality theme to document
export function applyPersonalityTheme(personalityType = null) {
  const personality = personalityType || getPersonalityType();
  const theme = MBTI_THEMES[personality] || MBTI_THEMES.INFP;
  
  // Apply CSS variables
  const root = document.documentElement;
  root.style.setProperty('--mbti-primary', theme.colors.primary.light);
  root.style.setProperty('--mbti-secondary', theme.colors.secondary.light);
  root.style.setProperty('--mbti-accent', theme.colors.accent.light);
  root.style.setProperty('--mbti-text-primary', 'var(--color-green-900)');
  root.style.setProperty('--mbti-surface', theme.colors.surface.light);
  root.style.setProperty('--mbti-progress', theme.colors.progress.light);
  
  // Create proper gradient from the background definition
  const bgGradient = createGradientFromString(theme.colors.background.light);
  root.style.setProperty('--mbti-bg-pattern', bgGradient);
  
  // Add personality class to body
  document.body.classList.remove(...Object.keys(MBTI_THEMES).map(type => `mbti-${type.toLowerCase()}`));
  document.body.classList.add(`mbti-${personality.toLowerCase()}`);
}

// Apply mint theme
export function applyMintTheme() {
  const root = document.documentElement;
  root.style.setProperty('--mbti-primary', 'var(--color-mint-500)');
  root.style.setProperty('--mbti-secondary', 'var(--color-green-900)');
  root.style.setProperty('--mbti-accent', 'var(--color-pink-500)');
  root.style.setProperty('--mbti-text-primary', 'var(--color-green-900)');
  root.style.setProperty('--mbti-surface', 'var(--color-cream)');
  root.style.setProperty('--mbti-progress', 'var(--color-green-900)');
  root.style.setProperty('--mbti-bg-pattern', 'linear-gradient(to bottom right, var(--color-mint-500), var(--color-teal-300))');
  
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
  
  // Get gradient class for personality type
  getGradientClass: (personalityType, type = 'background') => {
    const themeMode = getThemePreference();
    
    if (themeMode === 'mint') {
      return 'bg-gradient-to-br from-mint-500 to-teal-300';
    }
    
    const theme = MBTI_THEMES[personalityType];
    if (!theme) return 'bg-gradient-to-br from-mint-500 to-teal-300';
    
    switch (type) {
      case 'background':
        return `bg-gradient-to-br ${theme.colors.background.light}`;
      case 'card':
        return theme.colors.surface.light;
      case 'progress':
        return `bg-gradient-to-r ${theme.colors.progress.light}`;
      default:
        return `bg-gradient-to-br ${theme.colors.background.light}`;
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

const mbtiThemesComplex = {
  MBTI_THEMES,
  getCurrentPersonalityTheme,
  applyPersonalityTheme,
  applyMintTheme,
  themeUtils,
  initializeThemeSystem
};

export default mbtiThemesComplex;
