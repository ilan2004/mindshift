"use client";

import React from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '@/contexts/NotificationContext';

export default function NotificationDemo() {
  const { addNotification, sendNudge, notifyPeerActivity } = useNotifications();

  // Mock peer data
  const mockPeer = {
    id: 101,
    name: 'Alex Chen',
    personality: 'ENFP',
    avatar: '🎯'
  };

  const demoNotifications = [
    {
      title: 'Test Basic Notification',
      action: () => addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Hello MindShift!',
        message: 'This is a basic info notification with the box-shadow UI style.'
      })
    },
    {
      title: 'Test Success Notification', 
      action: () => addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Goal Achieved! 🎉',
        message: 'You completed your focus session successfully!',
        actionable: true,
        actionText: 'View Stats',
        onAction: () => console.log('Stats viewed!')
      })
    },
    {
      title: 'Test Error Notification',
      action: () => addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Connection Lost',
        message: 'Unable to sync your focus data. Retrying...',
        persistent: true,
        actionText: 'Retry Now'
      })
    },
    {
      title: 'Test Achievement',
      action: () => addNotification({
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        title: '🏆 New Achievement Unlocked!',
        message: 'Focus Warrior - Complete 10 focus sessions in a day',
        duration: 8000
      })
    },
    {
      title: 'Send Challenge Nudge',
      action: () => sendNudge(mockPeer, 'challenge', '🎯 Alex challenged you to beat their 5-hour focus streak!')
    },
    {
      title: 'Send Inspire Nudge',
      action: () => sendNudge(mockPeer, 'inspire', '✨ Alex believes you can achieve your goals today!')
    },
    {
      title: 'Peer Activity - Started Session',
      action: () => notifyPeerActivity(mockPeer, 'started_session')
    },
    {
      title: 'Peer Activity - Streak Milestone',
      action: () => notifyPeerActivity(mockPeer, 'streak_milestone')
    }
  ];

  return (
    <div 
      className="rounded-xl p-6 max-w-2xl mx-auto"
      style={{
        background: 'var(--surface)',
        border: '2px solid var(--color-green-900)',
        boxShadow: '0 4px 0 var(--color-green-900)'
      }}
    >
      <div className="mb-4">
        <h2 
          className="text-xl font-bold text-neutral-800 mb-2"
          style={{ fontFamily: 'Tanker, sans-serif' }}
        >
          🔔 Notification System Demo
        </h2>
        <p className="text-sm text-neutral-600">
          Test the MindShift notification system with different types of alerts, nudges, and peer activities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {demoNotifications.map((demo, index) => (
          <button
            key={index}
            onClick={demo.action}
            className="nav-pill text-xs px-4 py-3 font-medium text-left hover:scale-105 transition-transform"
            style={{
              background: 'var(--color-cyan-200)',
              color: 'var(--color-green-900)',
              border: '2px solid var(--color-green-900)',
              boxShadow: '0 2px 0 var(--color-green-900)'
            }}
          >
            {demo.title}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <h3 className="text-sm font-semibold mb-2">💡 Features:</h3>
        <ul className="text-xs text-neutral-600 space-y-1">
          <li>• Box-shadow UI styling matching MindShift design</li>
          <li>• Smooth animations and hover effects</li>
          <li>• Auto-dismiss with progress bar</li>
          <li>• Actionable notifications with callbacks</li>
          <li>• Personality-aware nudge messaging</li>
          <li>• Subtle sound effects (toggle in bottom-left)</li>
          <li>• Peer activity simulation</li>
        </ul>
      </div>
    </div>
  );
}
