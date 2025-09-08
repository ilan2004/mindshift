"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { MBTI_THEMES } from '@/lib/mbtiThemes';

export default function ThemeDebug() {
  const { 
    theme, 
    themeMode, 
    personalityType, 
    toggleTheme, 
    applyThemeForPersonality,
    getCSSVariables 
  } = useTheme();

  const personalityTypes = Object.keys(MBTI_THEMES);

  if (!theme) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p>Theme loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 p-4 bg-white rounded-lg shadow-lg border max-w-xs">
      <h3 className="font-bold text-sm mb-2">Theme Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Current:</strong> {personalityType} ({themeMode})
        </div>
        
        <div>
          <strong>Theme:</strong> {theme?.name}
        </div>
        
        <div className="flex gap-1">
          <div 
            className="w-4 h-4 rounded border"
            style={{ background: theme?.colors.current.primary }}
            title="Primary"
          />
          <div 
            className="w-4 h-4 rounded border"
            style={{ background: theme?.colors.current.secondary }}
            title="Secondary"
          />
          <div 
            className="w-4 h-4 rounded border"
            style={{ background: theme?.colors.current.accent }}
            title="Accent"
          />
        </div>

        <button 
          onClick={toggleTheme}
          className="w-full text-xs px-2 py-1 bg-blue-500 text-white rounded"
        >
          {themeMode === 'personality' ? 'Switch to Mint' : 'Switch to Personality'}
        </button>

        <details>
          <summary className="cursor-pointer text-xs">Change Personality</summary>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {personalityTypes.slice(0, 8).map(type => (
              <button
                key={type}
                onClick={() => applyThemeForPersonality(type)}
                className={`text-xs px-1 py-0.5 rounded ${
                  type === personalityType ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {personalityTypes.slice(8).map(type => (
              <button
                key={type}
                onClick={() => applyThemeForPersonality(type)}
                className={`text-xs px-1 py-0.5 rounded ${
                  type === personalityType ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
