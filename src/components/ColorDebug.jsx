"use client";

import { useEffect, useState } from 'react';

export default function ColorDebug() {
  const [colors, setColors] = useState({});
  const [personality, setPersonality] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      setColors({
        'mbti-primary': computedStyle.getPropertyValue('--mbti-primary').trim(),
        'mbti-text-primary': computedStyle.getPropertyValue('--mbti-text-primary').trim(),
        'mbti-bg-pattern': computedStyle.getPropertyValue('--mbti-bg-pattern').trim(),
        'mbti-surface': computedStyle.getPropertyValue('--mbti-surface').trim(),
      });

      // Get personality and gender from localStorage
      try {
        setPersonality(localStorage.getItem('mindshift_personality_type') || 'None');
        const genderValue = localStorage.getItem('ms_gender');
        setGender(genderValue === 'W' ? 'Female' : genderValue === 'M' ? 'Male' : 'None');
      } catch {}
    };

    updateColors();
    
    // Listen for theme changes
    window.addEventListener('theme-changed', updateColors);
    window.addEventListener('personality-changed', updateColors);
    
    return () => {
      window.removeEventListener('theme-changed', updateColors);
      window.removeEventListener('personality-changed', updateColors);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      padding: '10px',
      border: '2px solid #ccc',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>🎨 Color Debug</h4>
      <div><strong>Personality:</strong> {personality}</div>
      <div><strong>Gender:</strong> {gender}</div>
      <div style={{ marginTop: '8px' }}>
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '4px' }}>
            <strong>--{key}:</strong>
            <div style={{ 
              background: value || '#f0f0f0', 
              width: '20px', 
              height: '20px', 
              display: 'inline-block', 
              marginLeft: '8px',
              border: '1px solid #ccc'
            }}></div>
            <span style={{ marginLeft: '8px', fontSize: '10px' }}>{value || 'undefined'}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        Logo should use: <span style={{ color: `var(--mbti-text-primary)` }}>--mbti-text-primary</span>
      </div>
      <div style={{ marginTop: '8px' }}>
        <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>🧠 Analysts (NT)</h5>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {['INTJ', 'INTP', 'ENTJ', 'ENTP'].map(type => [
            <button key={`${type}-M`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'M');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♂
            </button>,
            <button key={`${type}-W`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'W');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♀
            </button>
          ]).flat()}
        </div>
        
        <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>💚 Diplomats (NF)</h5>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {['INFJ', 'INFP', 'ENFJ', 'ENFP'].map(type => [
            <button key={`${type}-M`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'M');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♂
            </button>,
            <button key={`${type}-W`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'W');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♀
            </button>
          ]).flat()}
        </div>
        
        <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>🛡️ Sentinels (SJ)</h5>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].map(type => [
            <button key={`${type}-M`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'M');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♂
            </button>,
            <button key={`${type}-W`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'W');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♀
            </button>
          ]).flat()}
        </div>
        
        <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>⚡ Explorers (SP)</h5>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {['ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => [
            <button key={`${type}-M`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'M');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♂
            </button>,
            <button key={`${type}-W`}
              onClick={() => {
                localStorage.setItem('mindshift_personality_type', type);
                localStorage.setItem('ms_gender', 'W');
                window.location.reload();
              }}
              style={{ padding: '2px 4px', fontSize: '9px', cursor: 'pointer', margin: '1px' }}
            >
              {type}♀
            </button>
          ]).flat()}
        </div>
      </div>
    </div>
  );
}
