"use client";

import React, { useState } from 'react';
import { usePersonalityColors, getPersonalityColors, getPersonalityDataAttributes } from '@/utils/personalityColors';

const PERSONALITY_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', // Analysts
  'INFJ', 'INFP', 'ENFJ', 'ENFP', // Diplomats  
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', // Sentinels
  'ISTP', 'ISFP', 'ESTP', 'ESFP'  // Explorers
];

const GENDERS = [
  { value: null, label: 'Neutral' },
  { value: 'female', label: 'Feminine' },
  { value: 'male', label: 'Masculine' }
];

export default function PersonalityColorDemo() {
  const [selectedType, setSelectedType] = useState('ENFP');
  const [selectedGender, setSelectedGender] = useState(null);

  const { colors, css, dataAttributes, cluster } = usePersonalityColors(selectedType, selectedGender);

  const ColorSwatch = ({ color, label, size = 'medium' }) => {
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    };

    return (
      <div className="flex flex-col items-center gap-2">
        <div 
          className={`${sizeClasses[size]} rounded-lg border-2 border-green-900`}
          style={{ 
            background: color,
            boxShadow: '0 2px 0 var(--color-green-900)'
          }}
        />
        <span className="text-xs font-medium text-neutral-700">{label}</span>
      </div>
    );
  };

  const SampleCard = ({ title, children, ...props }) => (
    <div
      className="rounded-xl p-4 border-2"
      style={{
        background: colors.light,
        borderColor: colors.primary,
        boxShadow: `0 4px 0 ${colors.primary}`
      }}
      {...dataAttributes}
      {...props}
    >
      <h4 className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
        {title}
      </h4>
      {children}
    </div>
  );

  return (
    <div 
      className="rounded-xl p-6 max-w-4xl mx-auto"
      style={{
        background: 'var(--surface)',
        border: '2px solid var(--color-green-900)',
        boxShadow: '0 4px 0 var(--color-green-900)'
      }}
    >
      <div className="mb-6">
        <h2 
          className="text-xl font-bold text-neutral-800 mb-2"
          style={{ fontFamily: 'Tanker, sans-serif' }}
        >
          🎨 Personality Color System Demo
        </h2>
        <p className="text-sm text-neutral-600">
          Explore how colors adapt based on MBTI personality type and gender preferences.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Personality Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-lg border-2 border-green-900 px-3 py-2 text-sm bg-white"
          >
            <optgroup label="🧠 Analysts (NT)">
              {PERSONALITY_TYPES.slice(0, 4).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </optgroup>
            <optgroup label="💚 Diplomats (NF)">
              {PERSONALITY_TYPES.slice(4, 8).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </optgroup>
            <optgroup label="🛡️ Sentinels (SJ)">
              {PERSONALITY_TYPES.slice(8, 12).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </optgroup>
            <optgroup label="⚡ Explorers (SP)">
              {PERSONALITY_TYPES.slice(12, 16).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Gender Preference
          </label>
          <select
            value={selectedGender || ''}
            onChange={(e) => setSelectedGender(e.target.value || null)}
            className="w-full rounded-lg border-2 border-green-900 px-3 py-2 text-sm bg-white"
          >
            {GENDERS.map(gender => (
              <option key={gender.value || 'neutral'} value={gender.value || ''}>
                {gender.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Selection Info */}
      <div 
        className="rounded-lg p-4 mb-6"
        style={{ 
          background: colors.light,
          border: `1px solid ${colors.primary}`
        }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>
            {selectedType} {selectedGender ? `(${selectedGender})` : '(Neutral)'} - {cluster.charAt(0).toUpperCase() + cluster.slice(1)}
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            {cluster === 'analyst' && '🧠 Strategic, Logical, Independent'}
            {cluster === 'diplomat' && '💚 Idealistic, Empathetic, Authentic'}
            {cluster === 'sentinel' && '🛡️ Practical, Reliable, Organized'}
            {cluster === 'explorer' && '⚡ Spontaneous, Energetic, Adaptable'}
          </p>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-semibold mb-4">Color Palette</h3>
          <div className="flex justify-between items-center">
            <ColorSwatch color={colors.primary} label="Primary" size="large" />
            <ColorSwatch color={colors.secondary} label="Secondary" />
            <ColorSwatch color={colors.accent} label="Accent" />
            <ColorSwatch color={colors.base} label="Base" />
            <ColorSwatch color={colors.light} label="Light" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">CSS Variables</h3>
          <div className="bg-neutral-100 rounded-lg p-3 text-xs font-mono space-y-1">
            <div>--primary-color: {colors.primary}</div>
            <div>--secondary-color: {colors.secondary}</div>
            <div>--accent-color: {colors.accent}</div>
            <div>--background-color: {colors.light}</div>
          </div>
        </div>
      </div>

      {/* Sample Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SampleCard title="Notification Preview">
          <div 
            className="rounded-lg p-3 text-sm"
            style={{
              background: colors.light,
              border: `1px solid ${colors.accent}`,
              color: colors.primary
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>🎯</span>
              <span className="font-medium">Nudge from Peer</span>
            </div>
            <p className="text-xs" style={{ color: colors.accent }}>
              You've got this! Time to focus and achieve your goals.
            </p>
          </div>
        </SampleCard>

        <SampleCard title="Focus Card Preview">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: colors.accent }}>
                Deep Work Session
              </div>
              <div className="text-xs text-neutral-600">25 minutes remaining</div>
            </div>
            <button
              className="nav-pill text-xs px-3 py-1 font-medium"
              style={{
                background: colors.accent,
                color: 'white'
              }}
            >
              Focus
            </button>
          </div>
        </SampleCard>

        <SampleCard title="Peer Status Preview">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: colors.accent, color: 'white' }}
            >
              AZ
            </div>
            <div>
              <div className="text-sm font-medium">Alex Zhang</div>
              <div className="text-xs" style={{ color: colors.accent }}>Focusing • 12m left</div>
            </div>
          </div>
        </SampleCard>

        <SampleCard title="Progress Indicator">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Today's Focus</span>
              <span>120m / 180m</span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ background: colors.light }}
            >
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  background: colors.accent,
                  width: '67%'
                }}
              />
            </div>
          </div>
        </SampleCard>
      </div>

      {/* Gender Comparison */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-4">Gender Variants Comparison</h3>
        <div className="grid grid-cols-3 gap-4">
          {GENDERS.map(gender => {
            const genderColors = getPersonalityColors(selectedType, gender.value);
            return (
              <div 
                key={gender.value || 'neutral'}
                className="rounded-lg p-3 border-2"
                style={{
                  background: genderColors.light,
                  borderColor: genderColors.primary,
                  boxShadow: `0 2px 0 ${genderColors.primary}`
                }}
              >
                <div className="text-center mb-3">
                  <h4 className="text-sm font-medium" style={{ color: genderColors.primary }}>
                    {gender.label}
                  </h4>
                </div>
                <div className="flex justify-center gap-2">
                  <ColorSwatch color={genderColors.primary} label="" size="small" />
                  <ColorSwatch color={genderColors.accent} label="" size="small" />
                  <ColorSwatch color={genderColors.secondary} label="" size="small" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="rounded-lg p-4" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <h3 className="text-sm font-semibold mb-2">💡 How to Use:</h3>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Import: <code>import {'{ usePersonalityColors }'} from '@/utils/personalityColors'</code></li>
          <li>• In component: <code>const {'{ colors, css, dataAttributes }'} = usePersonalityColors(mbtiType, gender)</code></li>
          <li>• Apply CSS: <code>style={'{css}'}</code> and <code>{'{ ...dataAttributes }'}</code></li>
          <li>• Colors automatically adapt based on personality cluster and gender preference</li>
          <li>• All colors are eye-friendly and maintain proper contrast ratios</li>
        </ul>
      </div>
    </div>
  );
}
