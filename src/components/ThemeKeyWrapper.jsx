"use client";

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeKeyWrapper({ children }) {
  const { themeKey } = useTheme();
  
  return (
    <div key={themeKey} className="theme-wrapper">
      {children}
    </div>
  );
}
