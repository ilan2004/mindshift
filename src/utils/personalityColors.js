/**
 * 🎨 Nudge Personality Color Utilities
 * Dynamic color selection based on MBTI personality and gender
 */

// MBTI Type to Cluster mapping
export const getPersonalityCluster = (mbtiType) => {
  if (!mbtiType) return 'diplomat'; // Default fallback
  const type = mbtiType.toUpperCase();
  
  // Analysts (NT) - Strategic, logical
  if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(type)) return 'analyst';
  
  // Diplomats (NF) - Idealistic, empathetic  
  if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(type)) return 'diplomat';
  
  // Sentinels (SJ) - Practical, reliable
  if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(type)) return 'sentinel';
  
  // Explorers (SP) - Spontaneous, energetic
  if (['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(type)) return 'explorer';
  
  return 'diplomat'; // Default
};

// Get personality colors for a given MBTI type and gender
export const getPersonalityColors = (mbtiType, gender = null) => {
  const cluster = getPersonalityCluster(mbtiType);
  const isfeminine = gender === 'female' || gender === 'F' || gender === 'W';
  const isMasculine = gender === 'male' || gender === 'M';
  
  const colorMap = {
    analyst: {
      base: 'var(--color-analyst-base)',
      light: 'var(--color-analyst-light)',
      accent: 'var(--color-analyst-accent)',
      strong: 'var(--color-analyst-strong)',
      feminine: {
        primary: 'var(--color-analyst-fem-primary)',
        secondary: 'var(--color-analyst-fem-secondary)',
        accent: 'var(--color-analyst-fem-accent)'
      },
      masculine: {
        primary: 'var(--color-analyst-masc-primary)',
        secondary: 'var(--color-analyst-masc-secondary)',
        accent: 'var(--color-analyst-masc-accent)'
      }
    },
    diplomat: {
      base: 'var(--color-diplomat-base)',
      light: 'var(--color-diplomat-light)',
      accent: 'var(--color-diplomat-accent)',
      strong: 'var(--color-diplomat-strong)',
      feminine: {
        primary: 'var(--color-diplomat-fem-primary)',
        secondary: 'var(--color-diplomat-fem-secondary)',
        accent: 'var(--color-diplomat-fem-accent)'
      },
      masculine: {
        primary: 'var(--color-diplomat-masc-primary)',
        secondary: 'var(--color-diplomat-masc-secondary)',
        accent: 'var(--color-diplomat-masc-accent)'
      }
    },
    sentinel: {
      base: 'var(--color-sentinel-base)',
      light: 'var(--color-sentinel-light)',
      accent: 'var(--color-sentinel-accent)',
      strong: 'var(--color-sentinel-strong)',
      feminine: {
        primary: 'var(--color-sentinel-fem-primary)',
        secondary: 'var(--color-sentinel-fem-secondary)',
        accent: 'var(--color-sentinel-fem-accent)'
      },
      masculine: {
        primary: 'var(--color-sentinel-masc-primary)',
        secondary: 'var(--color-sentinel-masc-secondary)',
        accent: 'var(--color-sentinel-masc-accent)'
      }
    },
    explorer: {
      base: 'var(--color-explorer-base)',
      light: 'var(--color-explorer-light)',
      accent: 'var(--color-explorer-accent)',
      strong: 'var(--color-explorer-strong)',
      feminine: {
        primary: 'var(--color-explorer-fem-primary)',
        secondary: 'var(--color-explorer-fem-secondary)',
        accent: 'var(--color-explorer-fem-accent)'
      },
      masculine: {
        primary: 'var(--color-explorer-masc-primary)',
        secondary: 'var(--color-explorer-masc-secondary)',
        accent: 'var(--color-explorer-masc-accent)'
      }
    }
  };
  
  const colors = colorMap[cluster];
  
  // Return gender-specific colors if specified
  if (isfeminine) {
    return {
      primary: colors.feminine.primary,
      secondary: colors.feminine.secondary,
      accent: colors.feminine.accent,
      base: colors.base,
      light: colors.light,
      cluster
    };
  }
  
  if (isMasculine) {
    return {
      primary: colors.masculine.primary,
      secondary: colors.masculine.secondary,
      accent: colors.masculine.accent,
      base: colors.base,
      light: colors.light,
      cluster
    };
  }
  
  // Return neutral colors
  return {
    primary: colors.base,
    secondary: colors.light,
    accent: colors.accent,
    base: colors.base,
    light: colors.light,
    cluster
  };
};

// Generate CSS custom properties for a component
export const generatePersonalityCSS = (mbtiType, gender = null) => {
  const colors = getPersonalityColors(mbtiType, gender);
  
  return {
    '--primary-color': colors.primary,
    '--secondary-color': colors.secondary,
    '--accent-color': colors.accent,
    '--background-color': colors.light,
    '--cluster-color': colors.base
  };
};

// Generate data attributes for CSS selectors
export const getPersonalityDataAttributes = (mbtiType, gender = null) => {
  const cluster = getPersonalityCluster(mbtiType);
  const genderAttr = gender === 'female' || gender === 'F' || gender === 'W' 
    ? 'female' 
    : gender === 'male' || gender === 'M' 
    ? 'male' 
    : null;
    
  return {
    'data-personality': cluster.toUpperCase(),
    'data-personality-type': mbtiType?.toUpperCase(),
    ...(genderAttr && { 'data-gender': genderAttr })
  };
};

// Get notification colors based on type
export const getNotificationColors = (type) => {
  const colorMap = {
    success: {
      background: 'var(--color-notification-success)',
      border: 'var(--color-forest-strong)',
      text: 'var(--color-forest-strong)',
      icon: '✅'
    },
    error: {
      background: 'var(--color-notification-error)',
      border: 'rgb(239, 68, 68)',
      text: 'rgb(127, 29, 29)',
      icon: '❌'
    },
    warning: {
      background: 'var(--color-notification-warning)',
      border: 'rgb(217, 119, 6)',
      text: 'rgb(146, 64, 14)',
      icon: '⚠️'
    },
    info: {
      background: 'var(--color-notification-info)',
      border: 'var(--color-blue-400)',
      text: 'var(--color-blue-400)',
      icon: 'ℹ️'
    },
    nudge: {
      background: 'var(--color-notification-nudge)',
      border: 'var(--color-purple-400)',
      text: 'var(--color-purple-400)',
      icon: '👋'
    },
    peer_activity: {
      background: 'var(--color-cyan-200)',
      border: 'var(--color-green-900)',
      text: 'var(--color-green-900)',
      icon: '🤝'
    },
    achievement: {
      background: 'var(--color-notification-achievement)',
      border: 'rgb(217, 119, 6)',
      text: 'rgb(146, 64, 14)',
      icon: '🏆'
    }
  };
  
  return colorMap[type] || colorMap.info;
};

// Get peer status colors
export const getPeerStatusColor = (status) => {
  const colorMap = {
    online: 'var(--color-peer-online)',
    focusing: 'var(--color-peer-online)',
    busy: 'var(--color-peer-busy)',
    break: 'var(--color-peer-away)',
    away: 'var(--color-peer-away)',
    offline: 'var(--color-peer-offline)',
    idle: 'var(--color-peer-offline)'
  };
  
  return colorMap[status?.toLowerCase()] || colorMap.offline;
};

// Get focus session colors
export const getFocusColors = (state) => {
  const colorMap = {
    active: 'var(--color-focus-active)',
    paused: 'var(--color-focus-paused)',
    break: 'var(--color-focus-break)',
    complete: 'var(--color-focus-complete)',
    idle: 'var(--color-teal-300)'
  };
  
  return colorMap[state?.toLowerCase()] || colorMap.idle;
};

// Get streak level colors
export const getStreakColor = (streak) => {
  if (streak >= 100) return 'var(--color-streak-diamond)';
  if (streak >= 50) return 'var(--color-streak-platinum)';
  if (streak >= 21) return 'var(--color-streak-gold)';
  if (streak >= 7) return 'var(--color-streak-silver)';
  if (streak >= 3) return 'var(--color-streak-bronze)';
  return 'var(--color-teal-300)';
};

// Apply personality-aware styling to a component
export const withPersonalityColors = (Component) => {
  return function PersonalityColoredComponent({ mbtiType, gender, style = {}, ...props }) {
    const personalityStyle = mbtiType 
      ? generatePersonalityCSS(mbtiType, gender)
      : {};
    
    const dataAttributes = mbtiType 
      ? getPersonalityDataAttributes(mbtiType, gender)
      : {};
    
    return (
      <Component
        style={{ ...personalityStyle, ...style }}
        {...dataAttributes}
        {...props}
      />
    );
  };
};

// Hook for using personality colors in components
export const usePersonalityColors = (mbtiType, gender = null) => {
  return {
    colors: getPersonalityColors(mbtiType, gender),
    css: generatePersonalityCSS(mbtiType, gender),
    dataAttributes: getPersonalityDataAttributes(mbtiType, gender),
    cluster: getPersonalityCluster(mbtiType)
  };
};

// Default export with all utilities
const personalityColorUtils = {
  getPersonalityCluster,
  getPersonalityColors,
  generatePersonalityCSS,
  getPersonalityDataAttributes,
  getNotificationColors,
  getPeerStatusColor,
  getFocusColors,
  getStreakColor,
  withPersonalityColors,
  usePersonalityColors
};

export default personalityColorUtils;
