"use client";

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeKeyWrapper({ children }) {
  const { themeKey, getCSSVariables } = useTheme();
  
  return (
    <div 
      key={themeKey} 
      className="theme-wrapper"
      style={getCSSVariables()}
    >
      {children}
    </div>
  );
}
