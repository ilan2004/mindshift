# 🔔 MindShift Notification System

## Overview

The MindShift notification system provides real-time peer nudges, activity updates, and system alerts with a sleek box-shadow UI that matches the app's design language.

## Features

### ✨ Core Functionality
- **Snackbar notifications** with MindShift's signature box-shadow styling
- **Auto-dismiss with progress bar** (configurable duration)
- **Actionable notifications** with callback functions
- **Sound effects** (toggleable by user)
- **Smooth animations** and hover effects
- **Multiple notification types** (success, error, warning, info, nudge, peer_activity, achievement)

### 🤝 Peer Interaction System
- **Personality-aware nudge messaging** - Different message styles based on MBTI compatibility
- **16 different nudge types**: challenge, inspire, support, energize, motivate, encourage, etc.
- **Real-time peer activity notifications** - Session starts, completions, streak milestones
- **Simulated peer responses** - Mock responses to create engaging social interaction

### 🎨 UI Design
- **Box-shadow styling** matching MindShift design system
- **Personality-based color coding** for different notification types  
- **Avatar support** for peer notifications
- **Progress bar** for auto-dismiss timing
- **Hover effects** and smooth transitions

## Components

### 1. NotificationContext (`/contexts/NotificationContext.jsx`)
- Global state management for notifications
- Helper functions for different notification types
- Auto-cleanup and duration management

### 2. NotificationSnackbar (`/components/NotificationSnackbar.jsx`)
- Individual notification component with animations
- Action button handling
- Progress bar and auto-dismiss logic

### 3. NotificationManager (`/components/NotificationManager.jsx`)
- App-level notification provider
- Sound effect system
- Sound toggle control (bottom-left corner)

### 4. Enhanced PeerStatusPanel (`/components/PeerStatusPanel.jsx`)
- Clickable nudge buttons for each peer
- Personality-compatible peer matching
- Simulated peer activity updates

## Usage

### Basic Notification
```javascript
import { useNotifications, NOTIFICATION_TYPES } from '@/contexts/NotificationContext';

const { addNotification } = useNotifications();

addNotification({
  type: NOTIFICATION_TYPES.SUCCESS,
  title: 'Goal Achieved! 🎉',
  message: 'You completed your focus session successfully!',
  duration: 5000
});
```

### Peer Nudge
```javascript
const { sendNudge } = useNotifications();

const peer = {
  id: 101,
  name: 'Alex Chen',
  personality: 'ENFP',
  avatar: '🎯'
};

sendNudge(peer, 'challenge', 'Custom challenge message!');
```

### Actionable Notification
```javascript
addNotification({
  type: NOTIFICATION_TYPES.INFO,
  title: 'New Feature Available',
  message: 'Try the new focus templates!',
  actionable: true,
  actionText: 'Explore Now',
  onAction: () => {
    // Handle action
    console.log('User clicked action button');
  }
});
```

## Notification Types

| Type | Color Scheme | Use Case |
|------|--------------|----------|
| `success` | Green | Completed tasks, achievements |
| `error` | Red | Connection issues, failures |
| `warning` | Amber | Cautions, important notices |
| `info` | Blue | General information |
| `nudge` | Purple | Peer nudges and challenges |
| `peer_activity` | Cyan | Peer status updates |
| `achievement` | Yellow | Unlocked badges, milestones |

## Personality-Aware Nudges

The system uses MBTI personality compatibility to generate appropriate nudge messages:

### Nudge Types by Personality Cluster
- **Analyst → Analyst**: "Challenge" (competitive)
- **Analyst → Diplomat**: "Inspire" (vision-based)
- **Diplomat → Diplomat**: "Encourage" (emotional support)
- **Sentinel → Analyst**: "Focus" (structure-based)
- **Explorer → Explorer**: "Rally" (high-energy group)

### Example Nudge Messages
- **Challenge**: "🎯 Alex challenged you to beat their focus streak!"
- **Inspire**: "✨ Alex believes in your potential - time to shine!"
- **Support**: "🤗 Alex is here to support your goals today"
- **Energize**: "⚡ Alex is boosting your energy - let's go!"

## Sound System

- **Configurable sound effects** for different notification types
- **User toggle control** (bottom-left sound button)
- **Web Audio API** with graceful fallbacks
- **Different frequencies** for different notification types:
  - Nudges: 800Hz (attention-grabbing)
  - Success: 600Hz (pleasant)
  - Peer Activity: 500Hz (subtle)
  - Achievements: 700Hz (celebratory)

## Integration

The notification system is integrated at the app root level:

```jsx
// src/app/layout.js
import NotificationManager from "../components/NotificationManager";

export default function RootLayout({ children }) {
  return (
    <NotificationManager>
      {/* Your app content */}
      {children}
    </NotificationManager>
  );
}
```

## Testing

Use the **NotificationDemo component** (temporarily in "More For You" section) to test all notification types and peer interactions.

## Future Enhancements

1. **Backend Integration** - Replace mock peer data with real user connections
2. **Push Notifications** - Browser/mobile push notifications
3. **Custom Sounds** - User-uploadable notification sounds
4. **Rich Media** - Image and GIF support in notifications
5. **Notification History** - Persistent notification log
6. **Smart Timing** - AI-powered optimal notification timing

## Implementation Status

✅ **Completed**
- Notification context and provider
- Snackbar component with MindShift styling
- Peer nudge functionality 
- Sound effects system
- PeerStatusPanel integration
- Demo component for testing

❌ **Not Implemented**
- Backend API integration
- Real peer data
- Persistent notification history
- Mobile push notifications
