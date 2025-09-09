"use client";

import { useState } from 'react';
import Image from 'next/image';
import { getPersonalityData, getAllTypes, getImagePath } from '@/lib/personalityData';

export default function PersonalityComparison({ primaryType, onClose }) {
  const [secondaryType, setSecondaryType] = useState('');
  const [genderPref, setGenderPref] = useState('male');
  
  const primaryData = getPersonalityData(primaryType);
  const secondaryData = secondaryType ? getPersonalityData(secondaryType) : null;
  const allTypes = getAllTypes();

  const available = allTypes.filter(t => t.type !== primaryType);

  return (
    <div 
      className="rounded-xl p-6"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 2px 0 var(--color-green-900)"
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-tanker text-xl text-green tracking-widest">
          COMPARE PERSONALITIES
        </h2>
        <button onClick={onClose} className="nav-pill">
          ✕ Close
        </button>
      </div>

      {/* Type Selector */}
      <div className="mb-6 text-center">
        <label className="block text-sm font-semibold text-neutral-800 mb-2">
          Compare {primaryType} with:
        </label>
        <select
          value={secondaryType}
          onChange={(e) => setSecondaryType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-800"
        >
          <option value="">Select a type...</option>
          {available.map(t => (
            <option key={t.type} value={t.type}>
              {t.type} - {t.title}
            </option>
          ))}
        </select>
      </div>

      {!secondaryData && (
        <div className="text-center text-neutral-600 py-8">
          Select a personality type to start comparing
        </div>
      )}

      {secondaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Primary Type */}
          <div>
            <div className="text-center mb-4">
              <div className="w-32 h-32 relative rounded-xl overflow-hidden mx-auto mb-2">
                <Image
                  src={getImagePath(primaryType, genderPref)}
                  alt={`${primaryType} character`}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-tanker text-lg text-green">
                {primaryType}
              </h3>
              <div className="text-sm text-neutral-600">{primaryData.title}</div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Strengths</h4>
                <div className="flex flex-wrap gap-1">
                  {primaryData.strengths.map(s => (
                    <div key={s} className="pill text-xs">{s}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Focus Style</h4>
                <p className="text-sm text-neutral-700">{primaryData.focusStyle}</p>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Ideal Session</h4>
                <p className="text-sm text-neutral-700">{primaryData.idealSessionLength}</p>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Best Templates</h4>
                <div className="space-y-1">
                  {primaryData.bestTemplates.map(template => (
                    <div key={template} className="text-sm text-neutral-700">
                      • {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Type */}
          <div>
            <div className="text-center mb-4">
              <div className="w-32 h-32 relative rounded-xl overflow-hidden mx-auto mb-2">
                <Image
                  src={getImagePath(secondaryType, genderPref)}
                  alt={`${secondaryType} character`}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-tanker text-lg text-green">
                {secondaryType}
              </h3>
              <div className="text-sm text-neutral-600">{secondaryData.title}</div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Strengths</h4>
                <div className="flex flex-wrap gap-1">
                  {secondaryData.strengths.map(s => (
                    <div key={s} className="pill text-xs">{s}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Focus Style</h4>
                <p className="text-sm text-neutral-700">{secondaryData.focusStyle}</p>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Ideal Session</h4>
                <p className="text-sm text-neutral-700">{secondaryData.idealSessionLength}</p>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Best Templates</h4>
                <div className="space-y-1">
                  {secondaryData.bestTemplates.map(template => (
                    <div key={template} className="text-sm text-neutral-700">
                      • {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gender Toggle */}
      <div className="flex justify-center mt-6 pt-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <button
            onClick={() => setGenderPref('male')}
            className={`nav-pill ${genderPref === 'male' ? 'nav-pill--primary' : ''}`}
          >
            👨 Male
          </button>
          <button
            onClick={() => setGenderPref('female')}
            className={`nav-pill ${genderPref === 'female' ? 'nav-pill--primary' : ''}`}
          >
            👩 Female
          </button>
        </div>
      </div>
    </div>
  );
}
