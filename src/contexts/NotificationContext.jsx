"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Notification types with default styles
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  INFO: 'info',
  NUDGE: 'nudge',
  PEER_ACTIVITY: 'peer_activity',
  ACHIEVEMENT: 'achievement'
};

// Enhanced notification styles with better contrast
const NOTIFICATION_STYLES = {
  success: {
    background: 'var(--color-notification-success)',
    border: '2px solid var(--color-forest-strong)',
    boxShadow: '0 4px 0 var(--color-forest-strong)',
    textColor: 'rgb(21, 128, 61)',  // Darker green for better contrast
    icon: '✅'
  },
  error: {
    background: 'var(--color-notification-error)',
    border: '2px solid rgb(239, 68, 68)',
    boxShadow: '0 4px 0 rgb(239, 68, 68)',
    textColor: 'rgb(153, 27, 27)',  // Darker red for contrast
    icon: '❌'
  },
  warning: {
    background: 'var(--color-notification-warning)',
    border: '2px solid rgb(217, 119, 6)',
    boxShadow: '0 4px 0 rgb(217, 119, 6)',
    textColor: 'rgb(120, 53, 15)',  // Darker amber for contrast
    icon: '⚠️'
  },
  info: {
    background: 'var(--color-notification-info)',
    border: '2px solid var(--color-blue-400)',
    boxShadow: '0 4px 0 var(--color-blue-400)',
    textColor: 'rgb(29, 78, 216)',   // Darker blue for contrast
    icon: 'ℹ️'
  },
  nudge: {
    background: 'var(--color-notification-nudge)',
    border: '2px solid var(--color-purple-400)',
    boxShadow: '0 4px 0 var(--color-purple-400)',
    textColor: 'rgb(124, 58, 237)',  // Darker purple for contrast
    icon: '👋'
  },
  peer_activity: {
    background: 'var(--color-cyan-200)',
    border: '2px solid var(--color-green-900)',
    boxShadow: '0 4px 0 var(--color-green-900)',
    textColor: 'var(--color-green-900)',  // This one was already good
    icon: '🤝'
  },
  achievement: {
    background: 'var(--color-notification-achievement)',
    border: '2px solid rgb(217, 119, 6)',
    boxShadow: '0 4px 0 rgb(217, 119, 6)',
    textColor: 'rgb(120, 53, 15)',   // Darker amber for contrast
    icon: '🏆'
  }
};

// Reducer for managing notifications
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: []
      };
    
    default:
      return state;
  }
}

// Initial state
const initialState = {
  notifications: []
};

// Context
const NotificationContext = createContext();

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const style = NOTIFICATION_STYLES[notification.type] || NOTIFICATION_STYLES.info;
    
    const newNotification = {
      id,
      title: notification.title,
      message: notification.message,
      type: notification.type || NOTIFICATION_TYPES.INFO,
      duration: notification.duration || 5000,
      persistent: notification.persistent || false,
      actionable: notification.actionable || false,
      onClick: notification.onClick,
      onAction: notification.onAction,
      actionText: notification.actionText,
      avatar: notification.avatar,
      timestamp: Date.now(),
      style,
      ...notification
    };

    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: newNotification
    });

    // Auto-remove non-persistent notifications
    if (!newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({
      type: NOTIFICATION_ACTIONS.CLEAR_ALL
    });
  }, []);

  // Nudge-specific helper
  const sendNudge = useCallback((peer, nudgeType, message) => {
    const nudgeMessages = {
      challenge: `🎯 ${peer.name} challenged you to beat their focus streak!`,
      inspire: `✨ ${peer.name} believes in your potential - time to shine!`,
      support: `🤗 ${peer.name} is here to support your goals today`,
      energize: `⚡ ${peer.name} is boosting your energy - let's go!`,
      motivate: `🚀 ${peer.name} sees your vision - make it happen!`,
      encourage: `💪 ${peer.name} is cheering you on - you've got this!`,
      appreciate: `🙏 ${peer.name} appreciates your dedication`,
      celebrate: `🎉 ${peer.name} is celebrating your progress!`,
      focus: `🎯 ${peer.name} suggests a focused session together`,
      care: `💝 ${peer.name} cares about your wellbeing - take care!`,
      organize: `📋 ${peer.name} shared a productivity tip with you`,
      guide: `🧭 ${peer.name} offers guidance when you need it`,
      spark: `✨ ${peer.name} sparked a new idea for you!`,
      connect: `🔗 ${peer.name} wants to connect and collaborate`,
      boost: `🚀 ${peer.name} gave you a productivity boost!`,
      rally: `📣 ${peer.name} is rallying the team - join the energy!`
    };

    return addNotification({
      type: NOTIFICATION_TYPES.NUDGE,
      title: `${nudgeType.charAt(0).toUpperCase() + nudgeType.slice(1)} from ${peer.name}`,
      message: message || nudgeMessages[nudgeType] || `${peer.name} sent you a ${nudgeType}!`,
      avatar: peer.avatar,
      actionable: true,
      actionText: 'Nudge Back',
      onAction: () => {
        // Send nudge back to peer
        addNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          title: 'Nudge Sent!',
          message: `You nudged ${peer.name} back`,
          duration: 3000
        });
      },
      duration: 8000
    });
  }, [addNotification]);

  // Peer activity helper
  const notifyPeerActivity = useCallback((peer, activity) => {
    const activityMessages = {
      started_session: `${peer.name} started a focus session`,
      completed_session: `${peer.name} completed a focus session! 🎉`,
      on_break: `${peer.name} is taking a well-deserved break`,
      streak_milestone: `${peer.name} hit a new streak milestone! 🔥`,
      joined: `${peer.name} joined your focus group`,
      achievement: `${peer.name} unlocked a new achievement! 🏆`
    };

    return addNotification({
      type: NOTIFICATION_TYPES.PEER_ACTIVITY,
      title: 'Peer Update',
      message: activityMessages[activity] || `${peer.name} ${activity}`,
      avatar: peer.avatar,
      duration: 4000
    });
  }, [addNotification]);

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
    sendNudge,
    notifyPeerActivity
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook for using notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
