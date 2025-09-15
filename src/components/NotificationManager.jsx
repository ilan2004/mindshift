"use client";

import React from 'react';
import { NotificationContainer } from './NotificationSnackbar';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationContext from '@/contexts/NotificationContext';

// Sound effects for different notification types
const playNotificationSound = (type) => {
  // Only play sounds if user hasn't disabled them
  if (typeof window !== 'undefined' && !localStorage.getItem('Nudge_sounds_disabled')) {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      let frequency;
      let duration = 200;
      
      // Different sounds for different notification types
      switch (type) {
        case 'nudge':
          frequency = 800; // Higher pitch for nudges
          duration = 300;
          break;
        case 'success':
          frequency = 600; // Pleasant mid tone
          break;
        case 'peer_activity':
          frequency = 500; // Lower, less intrusive
          break;
        case 'achievement':
          frequency = 700; // Celebratory
          duration = 400;
          break;
        case 'error':
          frequency = 300; // Lower, more serious
          break;
        default:
          frequency = 550; // Default neutral tone
      }
      
      // Create a simple beep sound
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = 'sine';
      
      // Gentle fade in/out
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration/1000);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration/1000);
    } catch (error) {
      // Silently fail if audio context isn't available
      console.debug('Audio not available for notifications');
    }
  }
};

// Enhanced notification container with sound effects
function NotificationContainerWithSound() {
  const [lastNotificationCount, setLastNotificationCount] = React.useState(0);
  
  // We'll need to access the notifications to play sounds
  // This is a simple implementation - in a more complex app you might use a different approach
  React.useEffect(() => {
    // Listen for notification events
    const handleNotificationAdded = (event) => {
      const { type } = event.detail;
      playNotificationSound(type);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('Nudge:notification:added', handleNotificationAdded);
      return () => {
        window.removeEventListener('Nudge:notification:added', handleNotificationAdded);
      };
    }
  }, []);
  
  return <NotificationContainer />;
}

// Main notification manager component
export default function NotificationManager({ children }) {
  return (
    <NotificationProvider>
      {children}
      <NotificationContainerWithSound />
      <NotificationSoundController />
    </NotificationProvider>
  );
}

// Sound controller component for managing notification sounds
function NotificationSoundController() {
  const [soundsEnabled, setSoundsEnabled] = React.useState(true);
  
  React.useEffect(() => {
    // Read sound preference from localStorage
    const disabled = localStorage.getItem('Nudge_sounds_disabled') === 'true';
    setSoundsEnabled(!disabled);
  }, []);
  
  const toggleSounds = () => {
    const newState = !soundsEnabled;
    setSoundsEnabled(newState);
    if (newState) {
      localStorage.removeItem('Nudge_sounds_disabled');
      // Play a test sound
      playNotificationSound('success');
    } else {
      localStorage.setItem('Nudge_sounds_disabled', 'true');
    }
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={toggleSounds}
        className="nav-pill text-xs px-3 py-2 opacity-50 hover:opacity-100 transition-opacity"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--color-green-900)',
          boxShadow: '0 2px 0 var(--color-green-900)',
          color: 'var(--color-green-900)'
        }}
        title={soundsEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
      >
        {soundsEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

// Enhanced notification hook that automatically triggers sound
export function useNotificationsWithSound() {
  const notifications = React.useContext(NotificationContext);
  
  const addNotificationWithSound = React.useCallback((notification) => {
    const id = notifications.addNotification(notification);
    
    // Dispatch event for sound playing
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('Nudge:notification:added', {
        detail: { type: notification.type }
      }));
    }
    
    return id;
  }, [notifications]);
  
  return {
    ...notifications,
    addNotification: addNotificationWithSound
  };
}
