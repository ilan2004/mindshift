"use client";

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationSnackbar({ notification, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const handleAction = () => {
    if (notification.onAction) {
      notification.onAction();
    }
    handleClose();
  };

  // Calculate time elapsed for timestamp display
  const getTimeElapsed = () => {
    const now = Date.now();
    const elapsed = now - notification.timestamp;
    const seconds = Math.floor(elapsed / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div
      className={`
        notification-snackbar
        ${isVisible ? 'notification-enter' : 'notification-enter-from'}
        ${isExiting ? 'notification-exit' : ''}
      `}
      style={{
        background: notification.style.background,
        border: notification.style.border,
        boxShadow: notification.style.boxShadow,
        color: notification.style.textColor,
        transform: isVisible && !isExiting ? 'translateX(0) scale(1)' : isExiting ? 'translateX(100%) scale(0.95)' : 'translateX(100%) scale(0.95)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onClick={notification.onClick}
    >
      {/* Main content area */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Avatar or icon */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
                 style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              {notification.avatar}
            </div>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center text-lg">
              {notification.style.icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 
              className="text-sm font-semibold truncate"
              style={{ fontFamily: "Tanker, sans-serif" }}
            >
              {notification.title}
            </h4>
            <span className="text-xs opacity-70 flex-shrink-0">
              {getTimeElapsed()}
            </span>
          </div>
          
          <p className="text-xs leading-relaxed mb-2 opacity-90">
            {notification.message}
          </p>

          {/* Action buttons */}
          {(notification.actionable || notification.actionText) && (
            <div className="flex items-center gap-2 mt-2">
              {notification.actionText && notification.onAction && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction();
                  }}
                  className="nav-pill text-xs px-3 py-1 font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {notification.actionText}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span className="text-xs">×</span>
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {!notification.persistent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 opacity-30">
          <div 
            className="h-full bg-current notification-progress"
            style={{
              animation: `progress ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        .notification-snackbar {
          position: relative;
          width: 100%;
          max-width: 400px;
          padding: 12px 16px;
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
        }

        .notification-snackbar:hover {
          transform: translateX(-4px) scale(1.02) !important;
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .notification-progress {
          width: 100%;
        }

        /* Smooth animations */
        .notification-enter-from {
          transform: translateX(100%) scale(0.95);
          opacity: 0;
        }

        .notification-enter {
          transform: translateX(0) scale(1);
          opacity: 1;
        }

        .notification-exit {
          transform: translateX(100%) scale(0.95);
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

// Container for multiple notifications
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationSnackbar
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}
